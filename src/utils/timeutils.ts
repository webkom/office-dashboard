import moment, { Moment } from "moment-timezone";
import "moment/dist/locale/nb";

function formatSecondsToHours(seconds: number) {
  const duration = moment.duration(seconds * 1000);

  const hours = Math.floor(duration.asHours());

  const formatted = `${hours} ${hours === 1 ? "time" : "timer"}`;

  return formatted;
}

function timeAgo(lastSeen: Date) {
  moment.locale("nb");
  const lastSeenTime = moment.tz(lastSeen, "Europe/Oslo");

  return lastSeenTime.fromNow();
}

export const calculateSessionTime = (
  sessionDuration: number, // Current duration calculated by the backend
  currentTime: Moment,
  lastSeen?: Date,
) => {
  if (!lastSeen) return "";

  // Convert lastSeen and currentTime to the same time zone
  const lastSeenDate = moment.utc(lastSeen).tz("Europe/Oslo");

  // Ensure time difference is calculated correctly
  const timeDiff = currentTime.diff(lastSeenDate.format(), "seconds");

  // Calculate the difference in seconds
  const updatedDuration = sessionDuration + timeDiff;

  // Convert milliseconds to hours, minutes, and seconds
  const hours = Math.floor(updatedDuration / 3600); // 1 hour = 3600000 ms
  const minutes = Math.floor((updatedDuration % 3600) / 60); // 1 minute = 60000 ms
  const seconds = Math.floor(updatedDuration % 60); // 1 second = 1000 ms

  return hours > 0
    ? `${hours} t ${minutes} min`
    : `${minutes} min ${seconds} s`;
};

export { formatSecondsToHours, timeAgo };
