/**
 * timelineUtils.js
 * Pure functions for the Driver Availability Timeline component.
 * The timeline spans TIMELINE_START_HOUR to TIMELINE_END_HOUR.
 */

export const TIMELINE_START_HOUR = 6;   // 06:00
export const TIMELINE_END_HOUR   = 22;  // 22:00
export const TIMELINE_HOURS      = TIMELINE_END_HOUR - TIMELINE_START_HOUR; // 16 hours
export const HOUR_COL_WIDTH_PX   = 80;  // width of each 1-hour column in the grid
export const DRIVER_ROW_HEIGHT_PX = 52; // height of each driver row

/**
 * Convert "HH:MM" time string to total minutes from midnight.
 * e.g. "09:30" → 570
 */
export function timeToMinutes(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

/**
 * Convert total minutes from midnight to "HH:MM" string.
 * e.g. 570 → "09:30"
 */
export function minutesToTime(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Given a time string "HH:MM", return the left offset in pixels
 * relative to the start of the timeline (TIMELINE_START_HOUR).
 */
export function timeToPixelOffset(timeStr) {
  const totalMins = timeToMinutes(timeStr);
  const startMins = TIMELINE_START_HOUR * 60;
  const offsetMins = totalMins - startMins;
  return (offsetMins / 60) * HOUR_COL_WIDTH_PX;
}

/**
 * Given a start and end time string, return the width in pixels.
 */
export function shiftWidthPx(startTime, endTime) {
  const startMins = timeToMinutes(startTime);
  const endMins   = timeToMinutes(endTime);
  const durationMins = endMins - startMins;
  return (durationMins / 60) * HOUR_COL_WIDTH_PX;
}

/**
 * Given a pixel offset from the left of the timeline, snap to nearest
 * 30-minute interval and return as "HH:MM" string.
 */
export function pixelOffsetToTime(px) {
  const totalMins = TIMELINE_START_HOUR * 60 + (px / HOUR_COL_WIDTH_PX) * 60;
  const snapped = Math.round(totalMins / 30) * 30;
  return minutesToTime(Math.max(TIMELINE_START_HOUR * 60, Math.min(TIMELINE_END_HOUR * 60, snapped)));
}

/**
 * Check if two time ranges overlap.
 * Returns true if [startA, endA) overlaps with [startB, endB)
 */
export function doShiftsOverlap(startA, endA, startB, endB) {
  const sA = timeToMinutes(startA);
  const eA = timeToMinutes(endA);
  const sB = timeToMinutes(startB);
  const eB = timeToMinutes(endB);
  return sA < eB && eA > sB;
}

/**
 * Generate the array of hour labels for the timeline header.
 * e.g. ['06:00', '07:00', ..., '22:00']
 */
export function getTimelineHours() {
  const hours = [];
  for (let h = TIMELINE_START_HOUR; h <= TIMELINE_END_HOUR; h++) {
    hours.push(`${String(h).padStart(2, '0')}:00`);
  }
  return hours;
}

/**
 * Clamp a time string to the timeline boundaries.
 */
export function clampToTimeline(timeStr) {
  const mins = timeToMinutes(timeStr);
  const startMins = TIMELINE_START_HOUR * 60;
  const endMins   = TIMELINE_END_HOUR   * 60;
  return minutesToTime(Math.max(startMins, Math.min(endMins, mins)));
}

/**
 * Format time for display: "09:30" → "9:30 AM"
 */
export function formatTimeDisplay(timeStr) {
  if (!timeStr) return '—';
  const [h, m] = timeStr.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')} ${period}`;
}
