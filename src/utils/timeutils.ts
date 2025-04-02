import moment from "moment-timezone";

function formatSecondsToHours(seconds: number) {
  const duration = moment.duration(seconds * 1000);

  const hours = Math.floor(duration.asHours());

  const formatted = `${hours} ${hours === 1 ? "time" : "timer"}`;

  return formatted;
}

function timeAgo(lastSeen: Date) {
  const lastSeenTime = moment.tz(lastSeen, "Europe/Oslo");

  return lastSeenTime.fromNow();
}

export const calculateSessionTime = (
  sessionDuration: number, // Current duration calculated by the backend
  lastSeen?: Date,
) => {
  if (!lastSeen) return "";

  // Convert milliseconds to hours, minutes, and seconds
  const hours = Math.floor(sessionDuration / 3600); // 1 hour = 3600000 ms
  const minutes = Math.floor((sessionDuration % 3600) / 60); // 1 minute = 60000 ms
  const seconds = Math.floor(sessionDuration % 60); // 1 second = 1000 ms

  return hours > 0
    ? `${hours} t ${minutes} min`
    : `${minutes} min ${seconds} s`;
};

export { formatSecondsToHours, timeAgo };
