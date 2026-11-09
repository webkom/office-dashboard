import React from "react";
import { PHASE_NAME, Pomodoro } from "app/hooks/use-pomodoro.hook";
import { RoomLights } from "app/hooks/use-room-lights.hook";
import { OFFICE_WHITE } from "app/utils/wled-payloads";
import { LightDimmer } from "./light-controls";
import lightStyles from "./light-controls.module.css";
import Row from "./row";
import styles from "./wled-pomo.module.css";

const timeOfDay = (ms: number) =>
  new Date(ms).toLocaleTimeString("nb-NO", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

const RunningActions: React.FC<{ pomo: Pomodoro; lights: RoomLights }> = ({
  pomo,
  lights,
}) => {
  const { status } = pomo;

  const next = status.next ? PHASE_NAME[status.next.phase] : "jobb";
  const statusText =
    status.phaseEndsAt === null
      ? "Space for å fortsette"
      : `${next.charAt(0).toUpperCase()}${next.slice(1)} kl. ${timeOfDay(status.phaseEndsAt)}`;

  return (
    <>
      <div className={styles["now"]}>
        <span className={styles["dot"]} />
        <span>{statusText}</span>
        <span className={styles["leds"]}>
          {status.filledLeds}/{status.ledCount}
        </span>
      </div>
      <ul className={styles["options"]}>
        <Row index={0} hotkey="space" onClick={pomo.togglePause}>
          <span className={styles["action"]}>
            {status.isPaused ? "Fortsett" : "Pause"}
          </span>
        </Row>
        <Row index={1} hotkey="s" onClick={pomo.skipPhase}>
          <span className={styles["action"]}>Hopp til {next}</span>
        </Row>
        <Row index={2} hotkey="r" onClick={pomo.restartPhase}>
          <span className={styles["action"]}>Start fasen på nytt</span>
        </Row>
        <li
          className={`${styles["option"]} ${styles["static"]}`}
          style={{ "--i": 3 } as React.CSSProperties}
        >
          <span className={styles["action"]}>Spol</span>
          <button
            type="button"
            className={styles["kbd"]}
            onClick={() => pomo.scrub(-1)}
            aria-label="Spol tilbake"
          >
            ←
          </button>
          <button
            type="button"
            className={styles["kbd"]}
            onClick={() => pomo.scrub(1)}
            aria-label="Spol fram"
          >
            →
          </button>
        </li>
        <li
          className={lightStyles["lights"]}
          style={
            {
              "--i": 4,
              "--light": `rgb(${OFFICE_WHITE.join(",")})`,
            } as React.CSSProperties
          }
          data-on={lights.status.isOn || undefined}
        >
          <LightDimmer lights={lights} />
        </li>
        <Row
          index={5}
          hotkey="q"
          danger
          onClick={() => void pomo.stopSession()}
        >
          <span className={styles["action"]}>Avslutt pomodoro-økt</span>
        </Row>
      </ul>
    </>
  );
};

export default RunningActions;
