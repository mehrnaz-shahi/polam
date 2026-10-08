import { isRunningInExpoGo } from "expo";
import { Platform } from "react-native";

const blockedInExpoGo = isRunningInExpoGo() && Platform.OS === "android";

async function notifications() {
  if (blockedInExpoGo) return null;
  try {
    return await import("expo-notifications");
  } catch {
    return null;
  }
}

export async function ensureNotifications() {
  const Notifications = await notifications();
  if (!Notifications) return false;
  const current = await Notifications.getPermissionsAsync();
  if (!current.granted) {
    const next = await Notifications.requestPermissionsAsync();
    return next.granted;
  }
  return true;
}

export async function scheduleLocalReminder(title: string, body: string, date: Date) {
  const Notifications = await notifications();
  if (!Notifications) return null;
  const allowed = await ensureNotifications();
  if (!allowed) return null;
  return Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date },
  });
}

export async function cancelLocalReminder(id: string) {
  const Notifications = await notifications();
  if (!Notifications) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch {
    // The scheduled notification may already be gone.
  }
}
