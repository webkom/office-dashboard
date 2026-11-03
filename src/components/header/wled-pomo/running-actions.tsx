import React from "react";
import { useWledPomo } from "app/hooks/use-wled-pomo.hook";
import Row from "./row";
import styles from "./wled-pomo.module.css";

type Pomo = ReturnType<typeof useWledPomo>;

const timeOfDay = (ms: number) =>
  new Date(ms).toLocaleTimeString("nb-NO", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

const RunningActions: React.FC<{ pomo: Pomo }> = ({ pomo }) => {
  const { status, config } = pomo;

  const nextIsLong = Boolean(
    config.longBreakMs && status.cycle % config.longBreakEvery === 0,
  );
  const next =
    status.phase === "work" ? (nextIsLong ? "lang pause" : "pause") : "jobb";
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
          {status.blueLeds}/{status.ledCount}
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
        <Row
          index={4}
          hotkey="q"
          danger
          onClick={() => void pomo.stopSession()}
        >
          <span className={styles["action"]}>Stopp for alle</span>
        </Row>
      </ul>
    </>
  );
};

export default RunningActions;
