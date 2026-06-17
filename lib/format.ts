import { format, formatDistanceToNowStrict, isValid } from 'date-fns';

function toDate(value: Date | string | number): Date {
  return value instanceof Date ? value : new Date(value);
}

export function formatDate(
  value: Date | string | number,
  pattern = 'MMM d, yyyy',
): string {
  const date = toDate(value);
  return isValid(date) ? format(date, pattern) : '—';
}

export function formatDateTime(value: Date | string | number): string {
  return formatDate(value, "MMM d, yyyy 'at' h:mm a");
}

export function formatRelative(value: Date | string | number): string {
  const date = toDate(value);
  if (!isValid(date)) return '—';
  return `${formatDistanceToNowStrict(date)} ago`;
}

/** "1h 30m", "45m", "2h" — for time-spent fields. */
export function formatMinutes(minutes: number): string {
  if (!minutes || minutes < 0) return '0m';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

export function formatHours(minutes: number): string {
  return `${(minutes / 60).toFixed(1)}h`;
}

/** Round to a whole-number percentage for display. */
export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}
