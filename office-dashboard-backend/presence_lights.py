import json
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
        # Empty for longer than the grace, or empty when we started
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
        if was is None:
            self.away = True
        elif was:
            self.empty_since = now
        elif self.empty_since is not None and now - self.empty_since >= self.grace_s:
            self.empty_since = None
            self.away = True
            return "off"
        return None


def start(app, get_office_times):
    """Switches the office strip over MQTT, so it works without any browser on
    the office network. Does nothing unless APP_MQTT_HOST is set."""

    host = app.config.get("MQTT_HOST")
    topic = app.config.get("WLED_MQTT_TOPIC")
    if not host or not topic:
        return

    client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2, client_id="office-dashboard-backend")
    if app.config.get("MQTT_USER"):
        client.username_pw_set(app.config["MQTT_USER"], app.config.get("MQTT_PASSWORD"))
    client.connect_async(host, int(app.config.get("MQTT_PORT") or 1883))
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
