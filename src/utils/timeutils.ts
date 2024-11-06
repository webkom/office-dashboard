import moment from "moment";

const TIMEZONE_ADJUSTMENT_OFFSET_MS = -3600000; //adjust for wrong timezones

function formatSecondsToDaysHours(seconds: number) {
  const duration = moment.duration(seconds * 1000);

  const days = Math.floor(duration.asDays());
  const hours = Math.floor(duration.asHours() % 24);

  const formatted = `${days > 0 ? days + (days > 1 ? " dager, " : " dag, ") : ""}${hours} ${hours === 1 ? "time" : "timer"}`;

  return formatted;
}

function lastTimeExist(lastTime: Date) {
  return lastTime !== undefined && lastTime !== null;
}

function timeAgo(lastSeen: Date) {
  moment.locale("no");
  const lastSeenTime = moment(lastSeen).add(TIMEZONE_ADJUSTMENT_OFFSET_MS);

  return lastSeenTime.fromNow();
}

function inSession(isActive: boolean) {
  return isActive;
}

function calculateSessionTime(startTime: Date) {
  // Might want to remove this if raspberry pi and presence happen to both have the same timezone
  const nowTime = moment(); // Current time

  // Parse the start time using Moment.js
  const startDate = moment(startTime).add(TIMEZONE_ADJUSTMENT_OFFSET_MS); //Adjust for wrong timezone

  // Calculate the difference in milliseconds
  const sessionDuration = nowTime.diff(startDate);

  // Convert milliseconds to hours, minutes, and seconds
  const hours = Math.floor(sessionDuration / 3600000); // 1 hour = 3600000 ms
  const minutes = Math.floor((sessionDuration % 3600000) / 60000); // 1 minute = 60000 ms
  const seconds = Math.floor((sessionDuration % 60000) / 1000); // 1 second = 1000 ms

  if (hours > 0) {
    return `${hours} t ${minutes} min`;
  } else {
    return `${minutes} min ${seconds} s`;
  }
}

export { calculateSessionTime };
export { formatSecondsToDaysHours };
export { lastTimeExist };
export { timeAgo };
export { inSession };
