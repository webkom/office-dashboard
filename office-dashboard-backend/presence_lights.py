import json
import math
import os
import threading
import time

import requests

from wled_protocol import (
    DAY_FADE,
    FIREWORKS_PAYLOAD,
    GREEN,
    LIGHT_PRESETS,
    OFFICE_PRESET,
    OFFICE_WHITE,
    THEME_SEGMENTS,
    WHITE,
    band_payload,
    encode_note,
    encode_tag,
    fallback_look_for,
    first_segment,
    frame_for,
    is_expired,
    is_pomo_state,
    mode_of,
    note_of,
    office_look_of,
    oslo_now,
    painter_of,
    phase_colours,
    preset_of,
    preset_of_id,
    preset_payload,
    restore_from,
    session_at,
    session_on_strip,
    solid_payload,
    tag_payload,
    theme_frame_for,
    theme_patch_for,
    with_tag,
)

POLL_S = 30
IDLE_STRIP_POLL_S = 5.0
POMO_STRIP_POLL_S = 1.0
LEASE_MS = 12_000
RENEW_MS = 6_000
FLASH_STEP_S = 0.16
FLASH_WINDOW_MS = 1500
SWEEP_S = 1.4
SWEEP_STEPS = 25
CELEBRATION_S = 3.0
SWEEP_GREEN = [30, 230, 90]
MERGE_REPOS = ("lego", "lego-webapp")
BACKEND_PAINTER_ID = "srv"

# Kept for backwards compatibility with callers/tests importing these constants
OFFICE_LOOK_PRESET = OFFICE_PRESET
EXTRA_SEGS_OFF = [{"id": i, "stop": 0} for i in range(1, THEME_SEGMENTS)]
FALLBACK_LOOK = fallback_look_for(900)
# A phone dropping off the wifi for a moment shouldn't turn the lights off
LEAVE_GRACE_S = 5 * 60


class PresenceSwitch:
    """Turns the lights off once the office has been empty for a while, and on
    when someone comes back after that. Only changes count, so lights someone
    sets by hand while nobody is checked in stay the way they are."""

    def __init__(self, grace_s=LEAVE_GRACE_S):
        self.grace_s = grace_s
        self.was = None
        self.empty_since = None
        # Empty for longer than the grace, and the lights were turned off
        self.away = False

    def update(self, present: bool, now: float):
        """Returns "on", "off" or None"""
        was, self.was = self.was, present
        if present:
            self.empty_since = None
            if self.away:
                self.away = False
                return "on"
            return None
        # Also when we start with the office already empty, e.g. after a deploy
        if was is None or was:
            self.empty_since = now
        elif self.empty_since is not None and now - self.empty_since >= self.grace_s:
            self.empty_since = None
            self.away = True
            return "off"
        return None


def _evening_part(dt) -> str:
    return "evening" if (dt.hour >= 20 or dt.hour < 6) else "day"


def _birthday_today(member: dict, now_dt) -> bool:
    bday = member.get("birthday") or ""
    if not bday or not member.get("active"):
        return False
    parts = bday.split("-")
    if len(parts) < 3:
        return False
    try:
        return int(parts[1]) == now_dt.month and int(parts[2]) == now_dt.day
    except ValueError:
        return False


def start(app, get_office_times, get_public_members=None):
    """Runs the office strip controller over HTTP on the local office network.
    Does nothing unless APP_WLED_URL is set. Returns an `on_merge(repo, number)`
    callback for GitHub merge webhooks."""

    # Straight from the environment, like the rest of Coolify's settings
    url = os.environ.get("APP_WLED_URL", "").strip().rstrip("/")
    if not url:
        return lambda _repo, _number: None
    print(f"Office lights: switching {url}")

    wled_lock = threading.RLock()
    state_cache = {"led_count": 900}

    def get_si():
        res = requests.get(f"{url}/json/si", timeout=4)
        res.raise_for_status()
        data = res.json()
        count = ((data.get("info") or {}).get("leds") or {}).get("count")
        if isinstance(count, int) and count > 0:
            state_cache["led_count"] = count
        return data

    def get_presets():
        try:
            res = requests.get(f"{url}/presets.json", timeout=4)
            res.raise_for_status()
            return res.json()
        except requests.RequestException:
            return None

    def post(payload):
        res = requests.post(f"{url}/json/state", json={"v": False, **payload}, timeout=4)
        res.raise_for_status()

    def pomodoro_running_state():
        data = get_si()
        return data.get("state") or {}

    def end_pomodoro():
        """Ends a pomodoro the way the dashboards do, by bringing back the
        office look. Left running, a dashboard would keep painting it, and its
        end would turn the lights back on."""
        with wled_lock:
            state = pomodoro_running_state()
            if not is_pomo_state(state):
                return
            was_off = state.get("on") is False
            led_count = state_cache["led_count"]
            post({"transition": 0, "ps": OFFICE_LOOK_PRESET})
            time.sleep(1.5)  # WLED loads a preset a moment later
            after = pomodoro_running_state()
            if is_pomo_state(after):
                post(fallback_look_for(led_count))
            else:
                post({
                    "transition": 0,
                    "seg": [
                        {
                            "id": 0,
                            "start": 0,
                            "stop": led_count,
                            "frz": False,
                            "rev": False,
                            "n": (first_segment(after) or {}).get("n", ""),
                        },
                        *EXTRA_SEGS_OFF,
                    ],
                })
            if was_off:
                post({"on": False, "transition": 0})
            print("Office lights: ended the pomodoro")

    def send_presence(command, first_try):
        try:
            with wled_lock:
                led_count = state_cache["led_count"]
                if command == "off":
                    end_pomodoro()
                    post({
                        "on": False,
                        "transition": 20,
                        "seg": [
                            {"id": 0, "start": 0, "stop": led_count, "frz": False},
                            *EXTRA_SEGS_OFF,
                        ],
                    })
                else:
                    post({"on": True, "transition": 20})
        except requests.RequestException as e:
            if first_try:
                print(f"Office lights: couldn't reach the strip ({type(e).__name__}), trying again")
            return False
        print(f"Office lights {command}: " + ("someone checked in" if command == "on" else "nobody checked in"))
        return True

    def play_birthday(handle: str, today_key: str):
        key = f"b:{handle}:{today_key}"
        try:
            with wled_lock:
                data = get_si()
                before = data.get("state") or {}
                if is_pomo_state(before):
                    return
                note = note_of(before)
                if not note.birthday or note.playing or (note.event or "").split("~", 1)[0] == key:
                    return
                note.playing = True
                note.event = key
                post({"transition": 0, "seg": [{"id": 0, "n": encode_note(note)}]})
                post(FIREWORKS_PAYLOAD)
                time.sleep(CELEBRATION_S)
                note.playing = False
                post(restore_from(before, encode_note(note)))
        except requests.RequestException as e:
            print(f"Office lights birthday failed ({type(e).__name__})")

    def play_merge_sweep(repo: str, number: int):
        key = f"p:{repo}#{number}"
        try:
            with wled_lock:
                data = get_si()
                state = data.get("state") or {}
                if is_pomo_state(state) or state.get("on") is False:
                    return
                note = note_of(state)
                if not note.merges or note.playing or (note.event or "").split("~", 1)[0] == key:
                    return
                led_count = state_cache["led_count"]
                seg0 = first_segment(state) or {}
                matched = preset_of(state)
                base_col = (
                    matched[1]["col"]
                    if matched
                    else ((seg0.get("col") or [OFFICE_WHITE])[0][:3] if seg0.get("col") else OFFICE_WHITE)
                )
                note.playing = True
                note.event = key
                post({"transition": 0, "seg": [{"id": 0, "n": encode_note(note)}]})

                width = round(led_count * 0.12)
                started = time.monotonic()
                while True:
                    elapsed = time.monotonic() - started
                    t = min(1.0, elapsed / SWEEP_S)
                    eased = (1 - math.cos(math.pi * t)) / 2
                    at = -width / 2 + (led_count + width) * eased
                    post(band_payload(led_count, base_col, SWEEP_GREEN, at, width))
                    if t >= 1.0:
                        break
                    time.sleep(0.02)

                note.playing = False
                post({"transition": 0, "seg": [{"id": 0, "frz": False, "n": encode_note(note)}]})
        except requests.RequestException as e:
            print(f"Office lights merge sweep failed ({type(e).__name__})")

    def on_merge(repo: str, number: int):
        if repo in MERGE_REPOS:
            threading.Thread(
                target=play_merge_sweep,
                args=(repo, number),
                daemon=True,
                name="wled-merge",
            ).start()

    def watch_presence():
        switch = PresenceSwitch(LEAVE_GRACE_S)
        # Kept until the strip has it, in case it was off the network
        pending, tries = None, 0
        last_active: dict[str, bool] | None = None

        while True:
            office_times, fresh = get_office_times(app)
            if fresh and office_times is not None:
                present = any(t.get("is_active") for t in office_times)
                command = switch.update(present, time.monotonic())
                if command:
                    pending, tries = command, 0

                active_map = {
                    str(t.get("github_name") or "").lower(): bool(t.get("is_active"))
                    for t in office_times
                }
                if last_active is not None and get_public_members is not None:
                    members, m_fresh = get_public_members(app)
                    if m_fresh and members:
                        now_dt = oslo_now()
                        today_key = f"{now_dt.month}-{now_dt.day}"
                        for member in members:
                            handle = str(member.get("github") or "").lower()
                            if (
                                handle
                                and _birthday_today(member, now_dt)
                                and active_map.get(handle)
                                and last_active.get(handle) is False
                            ):
                                play_birthday(handle, today_key)
                last_active = active_map

            if pending:
                tries += 1
                if send_presence(pending, first_try=tries == 1):
                    pending = None
            time.sleep(POLL_S)

    def watch_strip():
        observed_painter: tuple[str, int, float] | None = None
        office_look: dict[str, Any] | None = None
        last_painted_key: str | None = None
        solid_setup_key: str | None = None
        theme_snapshot = None
        last_phase_id: str | None = None
        last_evening_part: str | None = None
        last_day_checked: str | None = None

        def reset_pomo_cache():
            nonlocal observed_painter, office_look, last_painted_key, solid_setup_key, theme_snapshot, last_phase_id
            observed_painter = None
            office_look = None
            last_painted_key = None
            solid_setup_key = None
            theme_snapshot = None
            last_phase_id = None

        while True:
            sleep_s = IDLE_STRIP_POLL_S
            try:
                with wled_lock:
                    data = get_si()
                    state = data.get("state") or {}
                    led_count = state_cache["led_count"]
                    on_strip = session_on_strip(state)

                    if on_strip is not None:
                        sleep_s = POMO_STRIP_POLL_S
                        now_ms = int(time.time() * 1000)
                        if is_expired(on_strip, now_ms):
                            end_pomodoro()
                            reset_pomo_cache()
                        else:
                            painter = painter_of(state)
                            now_mono = time.monotonic()
                            if not painter or painter[0] == BACKEND_PAINTER_ID:
                                observed_painter = None
                            elif (
                                observed_painter is None
                                or observed_painter[0] != painter[0]
                                or observed_painter[1] != painter[1]
                            ):
                                observed_painter = (painter[0], painter[1], now_mono)

                            mine = painter is not None and painter[0] == BACKEND_PAINTER_ID and painter[1] > now_ms
                            remote_stale = (
                                painter is None
                                or (
                                    painter[0] != BACKEND_PAINTER_ID
                                    and painter[1] <= now_ms
                                    and observed_painter is not None
                                    and (now_mono - observed_painter[2]) >= (LEASE_MS / 1000.0)
                                )
                            )

                            tag = (first_segment(state) or {}).get("n")
                            if mine and (painter[1] - now_ms) < RENEW_MS:
                                tag = encode_tag(on_strip, BACKEND_PAINTER_ID, now_ms + LEASE_MS)
                                post(tag_payload(tag))
                            elif not mine and remote_stale:
                                tag = encode_tag(on_strip, BACKEND_PAINTER_ID, now_ms + LEASE_MS)
                                post(tag_payload(tag))
                                mine = True
                                solid_setup_key = None
                                theme_snapshot = None
                                last_painted_key = None

                            if mine and tag:
                                cur_session, _ = session_at(on_strip, now_ms)
                                phase_id = f"{cur_session.cycle}:{cur_session.phase}"
                                if (
                                    last_phase_id is not None
                                    and last_phase_id != phase_id
                                    and cur_session.ends_at is not None
                                ):
                                    dur_ms = (
                                        cur_session.config.work_ms
                                        if cur_session.phase == "work"
                                        else (
                                            cur_session.config.long_break_ms or cur_session.config.break_ms
                                            if cur_session.phase == "long-break"
                                            else cur_session.config.break_ms
                                        )
                                    )
                                    age_ms = now_ms - (cur_session.ends_at - dur_ms)
                                    if 0 <= age_ms <= FLASH_WINDOW_MS:
                                        colour = phase_colours(cur_session.phase)[1]
                                        for k, col in enumerate([WHITE, colour, WHITE, colour, WHITE, colour]):
                                            t0 = time.monotonic()
                                            payload = solid_payload(led_count, col, full_setup=(k == 0))
                                            post(with_tag(payload, tag) if k == 0 else payload)
                                            rem = FLASH_STEP_S - (time.monotonic() - t0)
                                            if rem > 0:
                                                time.sleep(rem)
                                        solid_setup_key = None
                                        theme_snapshot = None
                                        last_painted_key = None
                                last_phase_id = phase_id

                                cur_mode = mode_of(cur_session.config, cur_session.phase)
                                active_segs = [
                                    s for s in (state.get("seg") or [])
                                    if (s.get("stop") or 0) > (s.get("start") or 0)
                                ]
                                if cur_mode != "theme":
                                    theme_snapshot = None
                                    setup_key = f"{led_count}:{phase_id}:{cur_mode}"
                                    if (
                                        solid_setup_key != setup_key
                                        or any(s.get("id", 0) > 0 for s in active_segs)
                                        or (first_segment(state) or {}).get("fx") != 0
                                    ):
                                        full_frame = frame_for(on_strip, now_ms, led_count, full_setup=True)
                                        post(with_tag(full_frame, tag))
                                        solid_setup_key = setup_key
                                        last_painted_key = json.dumps(
                                            frame_for(on_strip, now_ms, led_count, full_setup=False),
                                            sort_keys=True,
                                        )
                                    else:
                                        frame = frame_for(on_strip, now_ms, led_count, full_setup=False)
                                        key = json.dumps(frame, sort_keys=True)
                                        if key != last_painted_key:
                                            post(frame)
                                            last_painted_key = key
                                else:
                                    solid_setup_key = None
                                    last_painted_key = None
                                    if office_look is None:
                                        office_look = office_look_of(get_presets())
                                    expected = min(THEME_SEGMENTS, max(1, led_count))
                                    if len(active_segs) != expected:
                                        theme_snapshot = None
                                    frame = theme_frame_for(on_strip, now_ms, led_count, office_look)
                                    patch, next_snap, needs_tag = theme_patch_for(
                                        theme_snapshot, led_count, frame
                                    )
                                    if patch is not None:
                                        post(with_tag(patch, tag) if needs_tag else patch)
                                    theme_snapshot = next_snap
                    else:
                        reset_pomo_cache()
                        note = note_of(state)
                        if not is_pomo_state(state) and not note.playing and note.evening:
                            now_dt = oslo_now()
                            part = _evening_part(now_dt)
                            day_key = f"{now_dt.year}-{now_dt.month}-{now_dt.day}:{part}"
                            kveld = preset_of_id("evening")
                            is_kveld = (first_segment(state) or {}).get("fx") == kveld["fx"]
                            is_off = state.get("on") is False

                            def apply_look(preset_dict, day_look_val):
                                payload = preset_payload(preset_dict, DAY_FADE)
                                note.day_look = day_look_val
                                payload["seg"] = [{**payload["seg"][0], "n": encode_note(note)}]
                                if is_off:
                                    payload = {**payload, "on": False, "transition": 0}
                                post(payload)

                            if part == "evening":
                                if last_day_checked != day_key and last_evening_part != "evening":
                                    if not is_kveld:
                                        matched = preset_of(state)
                                        apply_look(kveld, matched[0] if matched else None)
                                    last_evening_part = "evening"
                                    last_day_checked = day_key
                            else:
                                if is_kveld or (last_evening_part == "evening" and note.day_look is not None):
                                    if is_kveld:
                                        idx = note.day_look
                                        day_preset = (
                                            LIGHT_PRESETS[idx]
                                            if idx is not None and 0 <= idx < len(LIGHT_PRESETS)
                                            else preset_of_id("white")
                                        )
                                        apply_look(day_preset, None)
                                    last_evening_part = "day"
                                    last_day_checked = day_key
                                elif last_evening_part is None:
                                    last_evening_part = "day"
            except requests.RequestException:
                pass
            time.sleep(sleep_s)

    threading.Thread(target=watch_presence, daemon=True, name="presence-lights").start()
    threading.Thread(target=watch_strip, daemon=True, name="wled-controller").start()
    return on_merge
