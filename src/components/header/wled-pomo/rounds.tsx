import React from "react";
import {
  PHASE_NAME,
  PomoConfig,
  PomoStatus,
} from "app/hooks/use-pomodoro.hook";
import styles from "./wled-pomo.module.css";

const lengthText = (ms: number) =>
  ms < 60_000
    ? `${Math.round(ms / 1000)} sek`
    : `${Math.round(ms / 60_000)} min`;

const Rounds: React.FC<{ status: PomoStatus; config: PomoConfig }> = ({
  status,
  config,
}) => {
  const { next } = status;
  // Always rendered, so the header doesn't jump when a session starts
  if (!status.isRunning || !next)
    return <span className={styles["rounds"]} aria-hidden />;

  const every = config.longBreakMs ? config.longBreakEvery : null;
  const isWork = status.phase === "work";
  const inSet = every ? (status.cycle - 1) % every : 0;
  const done = status.roundsDone;

  return (
    <span className={`${styles["rounds"]} ${styles["rounds-live"]}`}>
      {every && (
        <span className={styles["dots"]} aria-hidden>
          {Array.from({ length: every }, (_, i) => (
            <span
              key={i}
              className={[
                styles["round-dot"],
                (i < inSet || (!isWork && i === inSet)) && styles["dot-done"],
                isWork && i === inSet && styles["dot-now"],
              ]
                .filter(Boolean)
                .join(" ")}
            />
          ))}
        </span>
      )}
      {done > 0 && (
        <span>
          {done} {done === 1 ? "runde" : "runder"}
        </span>
      )}
      <span className={styles["rounds-next"]}>
        neste: {PHASE_NAME[next.phase]} {lengthText(next.ms)}
      </span>
    </span>
  );
};

export default Rounds;
