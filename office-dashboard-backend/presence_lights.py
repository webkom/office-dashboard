import os
import threading
import time

import requests

POLL_S = 30
# Where the dashboards keep the office look while a pomodoro runs
OFFICE_LOOK_PRESET = 250
# What the dashboards fall back to without it
FALLBACK_LOOK = {
    "bri": 230,
    "seg": [{"id": 0, "frz": False, "fx": 0, "col": [[255, 244, 230]], "n": ""}],
}
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


def start(app, get_office_times):
    """Switches the office strip, which shares the office network with the
    server the backend runs on. Does nothing unless APP_WLED_URL is set."""

    # Straight from the environment, like the rest of Coolify's settings
    url = os.environ.get("APP_WLED_URL", "").strip().rstrip("/")
    if not url:
        return
    print(f"Office lights: switching {url}")

    def post(state):
        requests.post(f"{url}/json/state", json=state, timeout=5).raise_for_status()

    def pomodoro_running():
        state = requests.get(f"{url}/json/state", timeout=5).json()
        return any(str(seg.get("n") or "").startswith("Pomodoro") for seg in state.get("seg", []))

    def end_pomodoro():
        """Ends a pomodoro the way the dashboards do, by bringing back the
        office look. Left running, a dashboard would keep painting it, and its
        end would turn the lights back on."""
        if not pomodoro_running():
            return
        post({"ps": OFFICE_LOOK_PRESET})
        time.sleep(1.5)  # WLED loads a preset a moment later
        if pomodoro_running():
            post(FALLBACK_LOOK)
        print("Office lights: ended the pomodoro")

    def send(command, first_try):
        try:
            if command == "off":
                end_pomodoro()
            post({"on": command == "on", "transition": 20})
        except requests.RequestException as e:
            if first_try:
                print(f"Office lights: couldn't reach the strip ({type(e).__name__}), trying again")
            return False
        print(f"Office lights {command}: " + ("someone checked in" if command == "on" else "nobody checked in"))
        return True

    def watch():
        switch = PresenceSwitch(LEAVE_GRACE_S)
        # Kept until the strip has it, in case it was off the network
        pending, tries = None, 0
        while True:
            office_times, fresh = get_office_times(app)
            if fresh and office_times:
                present = any(t.get("is_active") for t in office_times)
                command = switch.update(present, time.monotonic())
                if command:
                    pending, tries = command, 0
            if pending:
                tries += 1
                if send(pending, first_try=tries == 1):
                    pending = None
            time.sleep(POLL_S)

    threading.Thread(target=watch, daemon=True, name="presence-lights").start()
