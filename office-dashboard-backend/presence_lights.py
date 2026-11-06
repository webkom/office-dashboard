import json
import os
import threading
import time

import paho.mqtt.client as mqtt

POLL_S = 30
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


def _env(name, default=""):
    # Straight from the environment (Coolify, or .env locally): app.config
    # parses values as JSON, which would turn a password like 123456 into a
    # number
    return os.environ.get(f"APP_{name}", default).strip()


def start(app, get_office_times):
    """Switches the office strip over MQTT, so it works without any browser on
    the office network. Does nothing unless APP_MQTT_HOST is set."""

    host = _env("MQTT_HOST")
    topic = _env("WLED_MQTT_TOPIC")
    if not host or not topic:
        return

    # Encrypted unless turned off: the backend reaches the broker over the
    # internet. (The strip itself can't do this, so it uses plain 1883.)
    tls = _env("MQTT_TLS", "true").lower() not in ("0", "false", "no")
    client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2, client_id="office-dashboard-backend")
    if tls:
        client.tls_set()  # checks the broker's certificate against the system's
    if _env("MQTT_USER"):
        client.username_pw_set(_env("MQTT_USER"), _env("MQTT_PASSWORD") or None)
    client.on_connect = lambda c, u, flags, reason, props: print(f"MQTT: {reason}")
    client.connect_async(host, int(_env("MQTT_PORT") or (8883 if tls else 1883)))
    print(f"MQTT: connecting to {host} ({'encrypted' if tls else 'plain'}), topic {topic}")
    client.loop_start()  # keeps reconnecting on its own

    def send(command):
        # WLED takes its JSON API on <device topic>/api
        state = {"on": command == "on", "transition": 20}
        client.publish(f"{topic}/api", json.dumps(state), qos=1)
        print(f"Office lights {command}: " + ("someone checked in" if command == "on" else "nobody checked in"))

    def watch():
        switch = PresenceSwitch(LEAVE_GRACE_S)
        while True:
            office_times, fresh = get_office_times(app)
            if fresh and office_times:
                present = any(t.get("is_active") for t in office_times)
                command = switch.update(present, time.monotonic())
                if command:
                    send(command)
            time.sleep(POLL_S)

    threading.Thread(target=watch, daemon=True, name="presence-lights").start()
