"""Pure-Python WLED Pomodoro, note, preset, and payload helpers.

Mirrors src/utils/pomo-session.ts, wled-names.ts, wled-payloads.ts, and
light-presets.ts so the backend can drive the strip autonomously when no
dashboard browser is open.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
import json
import math
from typing import Any

try:
    from zoneinfo import ZoneInfo, ZoneInfoNotFoundError
except ImportError:  # pragma: no cover
    ZoneInfo = None  # type: ignore[assignment]
    ZoneInfoNotFoundError = Exception  # type: ignore[misc,assignment]

POMO_PREFIX = "Pomodoro"
VERSION = "1"
MAX_SESSION_MS = 8 * 60 * 60 * 1000
THEME_SEGMENTS = 16
OFFICE_PRESET = 250
DAY_FADE = 600

Rgb = list[int]

RED: Rgb = [255, 0, 0]
BLUE: Rgb = [0, 0, 255]
GREEN: Rgb = [0, 255, 60]
WHITE: Rgb = [255, 255, 255]
YELLOW: Rgb = [255, 190, 0]
BLACK: Rgb = [0, 0, 0]
OFFICE_WHITE: Rgb = [255, 244, 230]

PHASE_CODE = {"work": "w", "break": "b", "long-break": "l"}
CODE_PHASE = {v: k for k, v in PHASE_CODE.items()}

MODES_CODE = {
    "bar/bar": "b",
    "quarters/quarters": "q",
    "solid/solid": "s",
    "bar/quarters": "c",
    "bar/solid": "d",
    "quarters/bar": "r",
    "quarters/solid": "t",
    "solid/bar": "u",
    "solid/quarters": "v",
    "theme/theme": "h",
    "bar/theme": "f",
    "quarters/theme": "g",
    "solid/theme": "i",
    "theme/bar": "j",
    "theme/quarters": "k",
    "theme/solid": "m",
}
CODE_MODES = {v: tuple(k.split("/")) for k, v in MODES_CODE.items()}

LOOK_SETTINGS = ["sx", "ix", "c1", "c2", "c3", "o1", "o2", "o3"]
FALLBACK_OFFICE_LOOK: dict[str, Any] = {"fx": 80, "sx": 90, "ix": 170}
NO_EXTRA_SEGS = [{"id": i, "stop": 0} for i in range(1, THEME_SEGMENTS)]

SETTING_CODE = {"birthday": "b", "merges": "p", "evening": "k"}

LIGHT_PRESETS: list[dict[str, Any]] = [
    {"id": "white", "name": "Hvit", "bri": 230, "fx": 0, "col": OFFICE_WHITE},
    {"id": "focus", "name": "Fokus", "bri": 150, "fx": 38, "col": [40, 200, 160], "pal": 50, "sx": 24, "ix": 96},
    {"id": "evening", "name": "Kveld", "bri": 70, "fx": 88, "col": [255, 110, 30], "sx": 96, "ix": 224},
    {
        "id": "christmas",
        "name": "Jul",
        "bri": 200,
        "fx": 80,
        "col": [255, 0, 0],
        "more": [[255, 150, 70], [0, 220, 35]],
        "pal": 5,
        "sx": 90,
        "ix": 170,
    },
    {"id": "music", "name": "Musikk", "bri": 200, "fx": 156, "col": [255, 0, 200], "pal": 6, "sx": 128, "ix": 128},
]

_DIGITS = "0123456789abcdefghijklmnopqrstuvwxyz"


def to_base36(n: int) -> str:
    if n <= 0:
        return "0"
    out = []
    while n:
        n, rem = divmod(n, 36)
        out.append(_DIGITS[rem])
    return "".join(reversed(out))


def sec36(ms: int) -> str:
    return to_base36(max(0, int(ms // 1000)))


def from_sec36(s: str) -> int:
    return int(s, 36) * 1000


def _last_sunday(year: int, month: int) -> int:
    if month == 12:
        last_day = datetime(year + 1, 1, 1, tzinfo=timezone.utc) - timedelta(days=1)
    else:
        last_day = datetime(year, month + 1, 1, tzinfo=timezone.utc) - timedelta(days=1)
    offset = (last_day.weekday() + 1) % 7
    return last_day.day - offset


def oslo_now(utc_now: datetime | None = None) -> datetime:
    """Return current time in Europe/Oslo, falling back to CET/CEST rules."""
    dt = utc_now or datetime.now(timezone.utc)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    if ZoneInfo is not None:
        try:
            return dt.astimezone(ZoneInfo("Europe/Oslo"))
        except ZoneInfoNotFoundError:
            pass
    utc = dt.astimezone(timezone.utc)
    march_sun = datetime(utc.year, 3, _last_sunday(utc.year, 3), 1, 0, tzinfo=timezone.utc)
    oct_sun = datetime(utc.year, 10, _last_sunday(utc.year, 10), 1, 0, tzinfo=timezone.utc)
    offset_h = 2 if march_sun <= utc < oct_sun else 1
    return utc.astimezone(timezone(timedelta(hours=offset_h)))


@dataclass
class SessionConfig:
    work_ms: int
    break_ms: int
    long_break_ms: int | None
    long_break_every: int
    work_mode: str
    break_mode: str


@dataclass
class Session:
    config: SessionConfig
    started_at: int
    phase: str
    cycle: int
    ends_at: int | None
    paused_left_ms: int | None


@dataclass
class Note:
    birthday: bool = True
    merges: bool = True
    evening: bool = True
    day_look: int | None = None
    event: str | None = None
    playing: bool = False


def first_segment(state: dict[str, Any] | None) -> dict[str, Any] | None:
    if not state:
        return None
    for seg in state.get("seg") or []:
        if seg.get("id") == 0:
            return seg
    return None


def name_of(state: dict[str, Any] | None) -> str:
    seg = first_segment(state)
    return str(seg.get("n") or "") if seg else ""


def is_pomo_state(state: dict[str, Any] | None) -> bool:
    if not state:
        return False
    return any(str(seg.get("n") or "").startswith(POMO_PREFIX) for seg in (state.get("seg") or []))


def encode_session(s: Session) -> str:
    c = s.config
    end = f"p{sec36(s.paused_left_ms or 0)}" if s.ends_at is None else sec36(s.ends_at)
    mode_code = MODES_CODE[f"{c.work_mode}/{c.break_mode}"]
    return ":".join([
        POMO_PREFIX,
        VERSION,
        sec36(s.started_at),
        PHASE_CODE[s.phase] + to_base36(s.cycle),
        end,
        mode_code + to_base36(c.long_break_every),
        sec36(c.work_ms),
        sec36(c.break_ms),
        sec36(c.long_break_ms) if c.long_break_ms else "",
    ])


def decode_session(name: str | None) -> Session | None:
    if not name:
        return None
    parts = name.split(":")
    if len(parts) != 9 or parts[0] != POMO_PREFIX or parts[1] != VERSION:
        return None
    _, _, start, phase_cycle, end, mode_every, work, brk, long_brk = parts
    if not phase_cycle or not mode_every:
        return None
    phase = CODE_PHASE.get(phase_cycle[0])
    modes = CODE_MODES.get(mode_every[0])
    if not phase or not modes:
        return None
    try:
        paused = end.startswith("p")
        work_ms = from_sec36(work)
        break_ms = from_sec36(brk)
        long_break_ms = from_sec36(long_brk) if long_brk else None
        long_break_every = int(mode_every[1:], 36)
        started_at = from_sec36(start)
        cycle = int(phase_cycle[1:], 36)
        ends_at = None if paused else from_sec36(end)
        paused_left_ms = from_sec36(end[1:]) if paused else None
    except ValueError:
        return None
    if work_ms < 1000 or break_ms < 1000 or long_break_every < 1:
        return None
    return Session(
        config=SessionConfig(
            work_ms=work_ms,
            break_ms=break_ms,
            long_break_ms=long_break_ms,
            long_break_every=long_break_every,
            work_mode=modes[0],
            break_mode=modes[1],
        ),
        started_at=started_at,
        phase=phase,
        cycle=cycle,
        ends_at=ends_at,
        paused_left_ms=paused_left_ms,
    )


def session_on_strip(state: dict[str, Any] | None) -> Session | None:
    return decode_session(name_of(state).split("|", 1)[0])


def painter_of(state: dict[str, Any] | None) -> tuple[str, int] | None:
    n = name_of(state)
    if "|" not in n:
        return None
    tail = n.rsplit("|", 1)[1]
    if "." not in tail:
        return None
    pid, until_36 = tail.split(".", 1)
    if not pid or not until_36:
        return None
    try:
        return pid, int(until_36, 36) * 1000
    except ValueError:
        return None


def encode_tag(s: Session, painter_id: str, until_ms: int) -> str:
    return f"{encode_session(s)}|{painter_id}.{to_base36(max(0, int(until_ms // 1000)))}"


def duration_of(c: SessionConfig, phase: str) -> int:
    if phase == "work":
        return c.work_ms
    if phase == "long-break":
        return c.long_break_ms if c.long_break_ms is not None else c.break_ms
    return c.break_ms


def mode_of(c: SessionConfig, phase: str) -> str:
    return c.work_mode if phase == "work" else c.break_mode


def next_phase(s: Session, at_ms: int) -> Session:
    c = s.config
    if s.phase != "work":
        phase = "work"
    elif c.long_break_ms and s.cycle % c.long_break_every == 0:
        phase = "long-break"
    else:
        phase = "break"
    return Session(
        config=c,
        started_at=s.started_at,
        phase=phase,
        cycle=s.cycle + 1 if phase == "work" else s.cycle,
        ends_at=at_ms + duration_of(c, phase),
        paused_left_ms=None,
    )


def session_at(s: Session, now_ms: int) -> tuple[Session, bool]:
    cur = s
    rolled = False
    for _ in range(10_000):
        if cur.ends_at is None or cur.ends_at > now_ms:
            break
        cur = next_phase(cur, cur.ends_at)
        rolled = True
    return cur, rolled


def remaining_of(s: Session, now_ms: int) -> int:
    return (s.paused_left_ms or 0) if s.ends_at is None else s.ends_at - now_ms


def is_expired(s: Session, now_ms: int) -> bool:
    return now_ms - s.started_at > MAX_SESSION_MS


def shown_progress(progress: float, mode: str) -> float:
    if progress >= 1:
        return 1.0
    if mode == "quarters":
        return math.floor(progress * 4) / 4
    if mode == "solid":
        return 0.0
    return progress


def phase_colours(phase: str) -> tuple[Rgb, Rgb]:
    return (GREEN, RED) if phase == "work" else (GREEN, BLUE)


def _progress_at(stored: Session, now_ms: int) -> tuple[Session, float]:
    session, _ = session_at(stored, now_ms)
    duration = max(1, duration_of(session.config, session.phase))
    left = remaining_of(session, now_ms)
    progress = min(1.0, max(0.0, (duration - left) / duration))
    return session, progress


def _ranges(parts: list[tuple[int, int, Rgb]]) -> list[Any]:
    out: list[Any] = []
    for frm, to, col in parts:
        if to > frm:
            out.extend([frm, to, col])
    return out


def progress_payload(
    led_count: int,
    filled: int,
    marker_at: int | None,
    fill: Rgb = BLUE,
    rest: Rgb = RED,
) -> dict[str, Any]:
    width = max(12, round(led_count * 0.03))
    tip = None if marker_at is None else max(0, min(led_count - width, marker_at - width // 2))
    parts: list[tuple[int, int, Rgb]] = []
    for a, b, col in ((0, filled, fill), (filled, led_count, rest)):
        if tip is None or b <= tip or a >= tip + width:
            parts.append((a, b, col))
        else:
            parts.append((a, tip, col))
            parts.append((tip + width, b, col))
    if tip is not None:
        parts.append((tip, tip + width, YELLOW))
    return {"transition": 0, "seg": [{"id": 0, "i": _ranges(parts)}]}


def frame_for(stored: Session, now_ms: int, led_count: int, full_setup: bool = True) -> dict[str, Any]:
    session, progress = _progress_at(stored, now_ms)
    shown = shown_progress(progress, mode_of(session.config, session.phase))
    filled = round(shown * led_count)
    raw = round(progress * led_count)
    fill, rest = phase_colours(session.phase)
    payload = progress_payload(
        led_count,
        filled,
        raw if session.ends_at is None else None,
        fill,
        rest,
    )
    if not full_setup:
        return payload
    seg0 = {**payload["seg"][0], "start": 0, "stop": led_count, "fx": 0, "rev": False}
    return {**payload, "seg": [seg0, *NO_EXTRA_SEGS]}


def dim_rgb(c: Rgb, factor: float = 0.12) -> Rgb:
    return [round(c[0] * factor), round(c[1] * factor), round(c[2] * factor)]


def office_look_of(presets: Any) -> dict[str, Any]:
    if isinstance(presets, dict):
        preset = presets.get(str(OFFICE_PRESET)) or presets.get(OFFICE_PRESET)
        if isinstance(preset, dict) and isinstance(preset.get("seg"), list):
            for seg in preset["seg"]:
                if isinstance(seg, dict) and isinstance(seg.get("fx"), (int, float)):
                    return seg
    return dict(FALLBACK_OFFICE_LOOK)


def theme_frame_for(
    stored: Session,
    now_ms: int,
    led_count: int,
    look: dict[str, Any],
    segment_count: int = THEME_SEGMENTS,
) -> dict[str, Any]:
    session, progress = _progress_at(stored, now_ms)
    count = max(1, min(segment_count, max(1, led_count)))
    eaten = count if progress >= 1 else math.floor(progress * count)
    fx = look.get("fx", 0)
    moving = FALLBACK_OFFICE_LOOK if fx in (0, 156) else look
    motion = {k: moving[k] for k in LOOK_SETTINGS if moving.get(k) is not None}
    fill, rest = phase_colours(session.phase)

    segs = []
    for seg_id in range(count):
        col = fill if seg_id < eaten else rest
        segs.append({
            "id": seg_id,
            "start": round((seg_id * led_count) / count),
            "stop": round(((seg_id + 1) * led_count) / count),
            "rev": False,
            "on": True,
            "frz": False,
            "bri": 255,
            **motion,
            "fx": moving["fx"],
            "pal": 2,
            "col": [col, dim_rgb(col), BLACK],
        })
    return {"transition": 0, "seg": segs}


def theme_patch_for(
    prev_snapshot: tuple[str, list[tuple[int, ...]]] | None,
    led_count: int,
    frame: dict[str, Any],
) -> tuple[dict[str, Any] | None, tuple[str, list[tuple[int, ...]]], bool]:
    first = frame["seg"][0]
    setup_key = json.dumps(
        {
            "ledCount": led_count,
            "count": len(frame["seg"]),
            "fx": first["fx"],
            "motion": [first.get(k) for k in LOOK_SETTINGS],
        },
        sort_keys=True,
    )
    colors = [tuple(s["col"][0]) for s in frame["seg"]]
    snapshot = (setup_key, colors)
    if not prev_snapshot or prev_snapshot[0] != setup_key or len(prev_snapshot[1]) != len(colors):
        return frame, snapshot, True
    changed = [
        {"id": s["id"], "col": s["col"]}
        for idx, s in enumerate(frame["seg"])
        if colors[idx] != prev_snapshot[1][idx]
    ]
    if not changed:
        return None, snapshot, False
    return {"transition": 0, "seg": changed}, snapshot, False


def with_tag(payload: dict[str, Any], tag: str) -> dict[str, Any]:
    return {
        **payload,
        "seg": [
            {**s, "n": tag} if s.get("id") == 0 else s
            for s in payload["seg"]
        ],
    }


def tag_payload(tag: str) -> dict[str, Any]:
    return {"transition": 0, "seg": [{"id": 0, "n": tag}]}


def solid_payload(led_count: int, col: Rgb, full_setup: bool = True) -> dict[str, Any]:
    if full_setup:
        return {
            "transition": 0,
            "seg": [
                {"id": 0, "start": 0, "stop": led_count, "fx": 0, "rev": False, "i": [0, led_count, col]},
                *NO_EXTRA_SEGS,
            ],
        }
    return {"transition": 0, "seg": [{"id": 0, "i": [0, led_count, col]}]}


def band_payload(led_count: int, base_col: Rgb, col: Rgb, at: float, width: int) -> dict[str, Any]:
    a = max(0, min(led_count, round(at - width / 2)))
    b = max(0, min(led_count, round(at + width / 2)))
    return {
        "transition": 0,
        "seg": [{"id": 0, "i": _ranges([(0, a, base_col), (a, b, col), (b, led_count, base_col)])}],
    }


def fallback_look_for(led_count: int) -> dict[str, Any]:
    return {
        "on": True,
        "bri": 230,
        "transition": 0,
        "seg": [
            {
                "id": 0,
                "start": 0,
                "stop": led_count,
                "on": True,
                "frz": False,
                "rev": False,
                "fx": 0,
                "col": [OFFICE_WHITE],
                "n": "",
            },
            *NO_EXTRA_SEGS,
        ],
    }


FIREWORKS_PAYLOAD: dict[str, Any] = {
    "on": True,
    "bri": 200,
    "transition": 5,
    "seg": [{"id": 0, "frz": False, "fx": 89, "pal": 6, "sx": 150, "ix": 150}],
}


def restore_from(before: dict[str, Any] | None, note: str) -> dict[str, Any]:
    seg0 = dict(first_segment(before) or {})
    seg0.pop("len", None)
    seg0["id"] = 0
    seg0["frz"] = False
    seg0["n"] = note
    out: dict[str, Any] = {"on": True, "seg": [seg0]}
    if before and before.get("bri") is not None:
        out["bri"] = before["bri"]
    return out


def note_of(state: dict[str, Any] | None) -> Note:
    n = name_of(state)
    if not n.startswith("Lys"):
        return Note()
    if len(n) < 4 or n[3] not in (":", "!"):
        return Note()
    playing = n[3] == "!"
    rest = n[4:]
    event = None
    if ":" in rest:
        head, event = rest.split(":", 1)
    else:
        head = rest
    day_look = None
    if "@" in head:
        flags, day_str = head.split("@", 1)
        if day_str.isdigit():
            day_look = int(day_str)
    else:
        flags = head
    if not flags.isalpha() and flags != "":
        return Note()
    return Note(
        birthday="b" in flags,
        merges="p" in flags,
        evening="k" in flags,
        day_look=day_look,
        event=event or None,
        playing=playing,
    )


def encode_note(note: Note) -> str:
    flags = "".join(
        code
        for key, code in SETTING_CODE.items()
        if getattr(note, key)
    )
    day = f"@{note.day_look}" if note.day_look is not None else ""
    event = f":{note.event}" if note.event else ""
    mark = "!" if note.playing else ":"
    return f"Lys{mark}{flags}{day}{event}"[:64]


def preset_of_id(preset_id: str) -> dict[str, Any]:
    for p in LIGHT_PRESETS:
        if p["id"] == preset_id:
            return p
    return LIGHT_PRESETS[0]


def preset_of(state: dict[str, Any] | None) -> tuple[int, dict[str, Any]] | None:
    seg = first_segment(state)
    if not seg:
        return None
    fx = seg.get("fx")
    col = (seg.get("col") or [None])[0]
    for idx, p in enumerate(LIGHT_PRESETS):
        if p["fx"] == fx and (p["fx"] != 0 or (isinstance(col, list) and col[:3] == p["col"])):
            return idx, p
    return None


def preset_payload(p: dict[str, Any], transition: int = 7) -> dict[str, Any]:
    return {
        "on": True,
        "bri": p["bri"],
        "transition": transition,
        "seg": [
            {
                "id": 0,
                "frz": False,
                "fx": p["fx"],
                "col": [p["col"], *p.get("more", [])],
                "pal": p.get("pal", 0),
                "sx": p.get("sx", 128),
                "ix": p.get("ix", 128),
            }
        ],
    }
