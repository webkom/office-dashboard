import moment, { Moment } from "moment";
import "moment/dist/locale/nb";

const TIMEZONE_ADJUSTMENT_OFFSET_MS = 3600000; //adjust for wrong timezones

function formatSecondsToHours(seconds: number) {
  const duration = moment.duration(seconds * 1000);

  const hours = Math.floor(duration.asHours());

  const formatted = `${hours} ${hours === 1 ? "time" : "timer"}`;

  return formatted;
}

function timeAgo(lastSeen: Date) {
  moment.locale("nb");
  const lastSeenTime = moment(lastSeen).add(TIMEZONE_ADJUSTMENT_OFFSET_MS);

  return lastSeenTime.fromNow();
}

export const calculateSessionTime = (
  sessionDuration: number, // Current duration calculated by the backend
  currentTime: Moment,
  lastSeen?: Date,
) => {
  if (!lastSeen) return "";

  // Might want to remove this if raspberry pi and presence happen to both have the same timezone
  const nowTime = currentTime; // Current time

  // Parse the start time using Moment.js
  const lastSeenDate = moment(lastSeen).add(TIMEZONE_ADJUSTMENT_OFFSET_MS); //Adjust for wrong timezone

  // Calculate the difference in seconds
  const updatedDuration = sessionDuration + nowTime.diff(lastSeenDate) / 1000;

  // Convert milliseconds to hours, minutes, and seconds
  const hours = Math.floor(updatedDuration / 3600); // 1 hour = 3600000 ms
  const minutes = Math.floor((updatedDuration % 3600) / 60); // 1 minute = 60000 ms
  const seconds = Math.floor(updatedDuration % 60); // 1 second = 1000 ms

  if (hours > 0) {
    return `${hours} t ${minutes} min`;
  } else {
    return `${minutes} min ${seconds} s`;
  }
};

export { formatSecondsToHours };
export { timeAgo };
