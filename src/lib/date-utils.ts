import { format, isToday, isThisYear } from "date-fns";

/**
 * Format timestamp for messages with smart logic:
 * - Today: time only (e.g., "2:30 PM")
 * - Same year: month + date + time (e.g., "Jan 15, 2:30 PM")
 * - Different year: full date (e.g., "Jan 15, 2025, 2:30 PM")
 */
export function formatMessageTimestamp(timestamp: number): string {
  const date = new Date(timestamp);

  if (isToday(date)) {
    return format(date, "h:mm a");
  }

  if (isThisYear(date)) {
    return format(date, "MMM d, h:mm a");
  }

  return format(date, "MMM d, yyyy, h:mm a");
}

/**
 * Format last seen time for presence indicators
 */
export function formatLastSeen(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return format(date, "MMM d");
}
