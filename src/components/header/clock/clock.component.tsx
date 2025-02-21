import { useEffect, useState } from "react";

import styles from "./clock.module.css";

const getTimeString = () =>
  new Date().toLocaleTimeString("nb-NO", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
const getDayString = () =>
  new Date().toLocaleDateString("nb-NO", { weekday: "long" });

const Clock = () => {
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
  });

  return (
    <div className="g-flex-col g-flex-align-center g-text-center">
      <div className={`${styles.date} g-flex g-capitalize`}>{dayString}</div>
      <div className={`${styles.time} g-flex g-capitalize g-font-size-3`}>
        {timeString}
      </div>
    </div>
  );
};

export default Clock;
