/** A desktop notification, where the browser has been allowed to show them */
export function notify(title: string, body: string) {
  try {
    if (
      typeof Notification !== "undefined" &&
      Notification.permission === "granted"
    ) {
      new Notification(title, { body });
    }
  } catch {
    // Notifications are optional
  }
}
