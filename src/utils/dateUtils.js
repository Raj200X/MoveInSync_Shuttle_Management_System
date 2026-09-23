import { format, formatDistanceToNow, parseISO, isToday, isTomorrow, isYesterday, isPast } from 'date-fns';

export function formatDate(dateStr, pattern = 'MMM d, yyyy') {
  return format(parseISO(dateStr), pattern);
}

export function formatDateDisplay(dateStr) {
  const date = parseISO(dateStr + 'T00:00:00');
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'EEE, MMM d');
}

export function formatDateTime(isoStr, pattern = 'MMM d, h:mm a') {
  return format(parseISO(isoStr), pattern);
}

export function formatRelative(isoStr) {
  return formatDistanceToNow(parseISO(isoStr), { addSuffix: true });
}

export function isTripPast(dateStr, departureTime) {
  const tripDate = new Date(`${dateStr}T${departureTime}:00`);
  return isPast(tripDate);
}

export function getTodayString() {
  return format(new Date(), 'yyyy-MM-dd');
}

export function formatShortDate(dateStr) {
  return format(parseISO(dateStr + 'T00:00:00'), 'dd MMM yyyy');
}

export function getDayLabel(dateStr) {
  return format(parseISO(dateStr + 'T00:00:00'), 'EEEE');
}
