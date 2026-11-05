# Office Dashboard

![Node 22](https://img.shields.io/badge/node-22-green.svg)
![Python 3.11](https://img.shields.io/badge/python-3.11-blue.svg)

![Screenshot 2025-04-04 at 15 23 38](https://github.com/user-attachments/assets/1026ae8d-065e-4bbb-a0a5-0341847506e0)

The webkom office dashboard uses different data sources to display information about the office, its environment, and the members of the office.

## Setup

```bash
# Teminal 1
yarn # install depedencies (do this once)
yarn dev # run frontend

# Terminal 2
cd office-dashboard-backend

cp config.template.py config.py # Add environment variabes for backend (do this once)
python -m venv venv # create venv (do this once)
source venv/bin/activate # enter venv
pip install -r requirements.txt # install dependencies (do this once)
python main.py # run backend
```

### Backend

The frontend only talks to the backend, apart from the office LED strip, which is on the office network:

| Endpoint | What | Cached |
| --- | --- | --- |
| `GET /` | Members, GitHub stats, office times and brus | 50 s |
| `GET /presence` | Who is at the office | 15 s |
| `GET /uptime` | Status of Abakus' services, from UptimeRobot | 60 s |
| `GET /member/<github>` | One member's office statistics | – |
| `GET /merges` | Recently merged pull requests | – |
| `POST /github-webhook` | Called by GitHub | – |
| `/ws` | Websocket that pushes each merged pull request | – |

### Office lights

The backend turns the office LED strip off 5 minutes after the last person checks out, and on when someone checks in, over MQTT. That way it works without a browser on the office network.

1. In WLED, under Config → Sync Interfaces → MQTT, turn MQTT on with broker `mqtt.abakus.no`, port `1883` (WLED can't encrypt), the strip's own login, and a device topic such as `wled/kontor`.
2. Give the backend `APP_MQTT_HOST=mqtt.abakus.no`, its own login as `APP_MQTT_USER` and `APP_MQTT_PASSWORD`, and the same topic as `APP_WLED_MQTT_TOPIC`. It connects encrypted on port 8883.

Logins for the broker (emqx) are kept in `emqx/emqx-cfg.yaml` in [kubernetes-abakus](https://github.com/webkom/kubernetes-abakus).

The strip has to be able to reach the broker from the office network.

### Merged pull requests

The office LED strip shows a green wave when a pull request is merged in lego or lego-webapp. GitHub tells the backend through a webhook:

1. In the webkom organisation on GitHub, go to Settings → Webhooks → Add webhook.
2. Payload URL: `https://dashboard-backend.webkom.dev/github-webhook`, content type `application/json`, and a random secret.
3. Under "Let me select individual events", pick only "Pull requests".
4. Give the backend the same secret as `APP_GITHUB_WEBHOOK_SECRET`.

The backend pushes each merge to every open dashboard over the websocket at `/ws`. Whatever sits in front of the backend must let websockets through.

<details>
<summary>Archived docs</summary>

<img src="https://raw.githubusercontent.com/webkom/office-dashboard/assets/dashboard.png?raw=true" width="1920" /> <img src="https://raw.githubusercontent.com/webkom/office-dashboard/assets/dashboard_mobile.png?raw=true" height="585"/>

_<p align="center">laget med :beer: av webkom</p>_

## Data Sources

- #### Brus · [<img src="https://raw.githubusercontent.com/webkom/office-dashboard/assets/GitHub-Mark-32px.png?raw=true" width="16" /> GitHub](https://github.com/webkom/brus) · [:shipit: API](https://brus.abakus.no)

  Brus consits a record of transactions and the current balance of each of the members.

  The dashboard uses the [Brus API](https://brus.abakus.no) to display the amount of soda bottles and cans each member has bought over time.

- #### Environment · [<img src="https://raw.githubusercontent.com/webkom/office-dashboard/assets/GitHub-Mark-32px.png?raw=true" width="16" /> GitHub](https://github.com/webkom/environment-api) · [:shipit: API](https://environment-api.webkom.dev)

  Our office has a bunch of ESP32s with sensors (BME280 and CCS811) that record the environment data (temperature, pressure, humidity, eCO2 and TVOC). The sensor data is broadcast to our MQTT broker and gets recorded in InfluxDB with our Telegraf configuration.

  The dashboard uses the [Environment API](https://environment-api.webkom.dev) to retrieve the data stored in InfluxDB and displays it accordingly in the dashboard header.

- #### Kaffe · [<img src="https://raw.githubusercontent.com/webkom/office-dashboard/assets/GitHub-Mark-32px.png?raw=true" width="16" /> GitHub](https://github.com/webkom/kaffe-api) · [:shipit: API](https://kaffe-api.webkom.dev)

  Our office Moccamaster is connected to a TP-Link HS110, allowing us to measure the power usage of the Moccamaster. We have setup an Orange Pi Zero with a RFID card scanner application (written in Python) and a [script](https://github.com/webkom/kaffe-listener) (written in Elixir) that constantly listens to the power usage of the Moccamaster.
  Whenever a member scans their card (or anything with a RFID antenna) on the RFID reader, the RFID UID is broadcast over MQTT and stored in InfluxDB.
  Whenever coffee is brewed, the script estimates the volume by checking how long the brew took, and then sends a message to slack with who brewed and how much they brewed. The information about the brew is also broadcast back to MQTT for other consumers, where it is picked up by another script that stores the historical data in InfluxDB.

  The dashboard uses the [Kaffe API](https://kaffe-api.webkom.dev) to retrieve the data stored in InfluxDB and uses our [MaaS (Medlemmer as a Service)](https://github.com/webkom/medlemmer) to connect brew recordings (tagged with RFID UID) to a specific office member.

- #### Office door · [<img src="https://raw.githubusercontent.com/webkom/office-dashboard/assets/GitHub-Mark-32px.png?raw=true" width="16" /> GitHub](https://github.com/webkom/office-door-api) · [:shipit: API](https://office-door-api.webkom.dev)

  Our office door is setup with a simple ESP32, which resembles an open/closed switch. When the door is closed, there is a connection in the circuit, and if it's open, there's none. We broadcast this data to our MQTT broker, and have setup Telegraf to store this data in InfluxDB.
  The status is broadcast every 60 seconds if there is no change in the status. The ESP32 also uses a 4-digit 7-segment to display the amount of times the door has been opened, this counter is stored in memory via. ESP32 Preferences.

  The dashboard uses the [Office door API](https://office-door-api.webkom.dev) to retrieve the latest data stored in InfluxDB and displays the status of the door (open/closed) in the dashboard header.

- #### Office Chromecast · [<img src="https://raw.githubusercontent.com/webkom/office-dashboard/assets/GitHub-Mark-32px.png?raw=true" width="16" /> GitHub](https://github.com/webkom/office-chromecast-api) · [:shipit: API](https://office-chromecast-api.webkom.dev)

  We have an application running in our office _cloud_ (Orange PI Zeros running our [custom cloud script](https://github.com/webkom/CubeCometh)) that communicates with the Chromecast connected to our office TV and broadcasts the status of the Chromecast every 5 seconds to our MQTT broker. The data is then stored in InfluxDB via. Telegraf.
  If there is a song playing via. Spotify (or similiar) it is displayed accordingly on the dashboard (see the dashboard image above), the media banner is hidden if there is nothing playing on the Chromecast. The background and text colors of the media banner are generated based on the colors in the media image. Additionally, there's a simulated current duration that increases and syncs with the actual current time from Chromecast.

  The dashboard uses the [Office Chromecast API](https://office-chromecast-api.webkom.dev) to display the relevant media information.

- #### Presence · [<img src="https://raw.githubusercontent.com/webkom/office-dashboard/assets/GitHub-Mark-32px.png?raw=true" width="16" /> GitHub](https://github.com/webkom/presence-api) · [:shipit: API](https://presence.webkom.dev)

  Presence is an application that is also running in our office _cloud_ that constantly monitors the nearby WiFi and Bluetooth devices. It uses a set of whitelisted devices stored under each member in our [MaaS (Medlemmer as a Service)](https://github.com/webkom/medlemmer).
  Presence broadcasts (every 60 seconds) the list of (whitelisted) nearby devices to MQTT, which is then stored in InfluxDB via. Telegraf.

  The dashboard uses the [Presence API](https://presence.webkom.dev) to retrieve the data stored in InfluxDB and uses our [MaaS (Medlemmer as a Service)](https://github.com/webkom/medlemmer) to connect the devices to each member. It then calculates how long each member has been at the office since 06:00 AM, but also when the member was first seen (since 06:00 AM) and last seen at the office (as seen in the dashboard image above). The API also returns the name, avatar, GitHub username, Brus username and Slack username of each member.

- #### Palantir · [<img src="https://raw.githubusercontent.com/webkom/office-dashboard/assets/GitHub-Mark-32px.png?raw=true" width="16" /> GitHub](https://github.com/webkom/palantir) · [:shipit: API](https://palantir.webkom.dev)

  **Palantir** is the successor to the now-outdated **Presence**—ironically, it still runs on our beloved Raspberry Pi, *Presence*. Unlike Presence, Palantir does not rely on MQTT. Instead, it scans the local network to gather MAC addresses and cross-references them with entries in [MaaS (Medlemmer as a Service)](https://github.com/webkom/medlemmer).

  In addition to scanning the network, Palantir hosts its own API on the local network, which is consumed by the dashboard.

  The dashboard uses the [Palantir API](https://palantir.webkom.dev) to retrieve data such as:

  - `"current_session_duration"`
  - `"last_seen"`
  - `"is_active"`
  - `"total_time"`

  It calculates the current session time by comparing `"last_seen"` with the current time, provided `"is_active"` is `true`.

  A Webkom member simply needs to add their MAC address to [MaaS (Medlemmer as a Service)](https://github.com/webkom/medlemmer) to start tracking their time in the office!

</details>
