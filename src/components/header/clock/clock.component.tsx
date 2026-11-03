import { useEffect, useState } from "react";

import styles from "./clock.module.css";

const getTimeString = () =>
  new Date().toLocaleTimeString("nb-NO", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
// Not CSS capitalize: that would uppercase every per-letter span
const getDayString = () => {
  const day = new Date().toLocaleDateString("nb-NO", { weekday: "long" });
  return day.charAt(0).toUpperCase() + day.slice(1);
};

// Keyed by value, so a changed digit remounts and rolls in
const Rolling = ({ text }: { text: string }) => (
  <span className={styles.rolling} aria-label={text}>
    {text.split("").map((char, i) => (
      <span key={`${i}-${char}`} className={styles.char} aria-hidden>
        {char}
      </span>
    ))}
  </span>
);

type Props = {
  override?: { label: string; time: string };
};

const Clock = ({ override }: Props) => {
  const [timeString, setTimeString] = useState(getTimeString());
  const [dayString, setDayString] = useState(getDayString());

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeString(getTimeString());
      setDayString(getDayString());
    }, 15000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  const isOverridden = Boolean(override);
  useEffect(() => {
    if (!isOverridden) {
      setTimeString(getTimeString());
      setDayString(getDayString());
    }
  }, [isOverridden]);

  return (
    <div className="g-flex-col g-flex-align-center g-text-center">
      <div className={`${styles.date} g-flex`}>
        <Rolling text={override?.label ?? dayString} />
      </div>
      <div className={`${styles.time} g-flex g-font-size-3`}>
        <Rolling text={override?.time ?? timeString} />
      </div>
    </div>
  );
};

export default Clock;
