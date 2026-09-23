/**
 * useShifts — manages driver shift schedule data (mock layer)
 * Core business rule: no overlapping shifts for the same driver on the same date.
 */
import { useState, useCallback } from 'react';
import shiftsData from '../mock/shifts.js';
import { timeToMinutes, minutesToTime, doShiftsOverlap } from '../utils/timelineUtils';

let store = [...shiftsData];

export function useShifts() {
  const [shifts, setShifts] = useState(store);

  const refresh = useCallback(() => setShifts([...store]), []);

  /** Returns all shifts for a given date */
  const getShiftsForDate = useCallback((date) => {
    return store.filter(s => s.date === date);
  }, []);

  /** Returns shifts for a specific driver on a date */
  const getDriverShifts = useCallback((driverId, date) => {
    return store.filter(s => s.driverId === driverId && s.date === date);
  }, []);

  /**
   * Validates that a new shift doesn't overlap with existing shifts for the same driver.
   * Returns null if valid, or an error message string if there's a conflict.
   */
  const validateShift = useCallback((driverId, date, startTime, endTime, excludeId = null) => {
    const existing = store.filter(s => s.driverId === driverId && s.date === date && s.id !== excludeId);
    for (const s of existing) {
      if (doShiftsOverlap(startTime, endTime, s.startTime, s.endTime)) {
        return `Conflict with existing ${s.type.toLowerCase()} shift (${s.startTime}–${s.endTime})`;
      }
    }
    return null;
  }, []);

  const createShift = useCallback((data) => {
    const conflict = validateShift(data.driverId, data.date, data.startTime, data.endTime);
    if (conflict) throw new Error(conflict);
    const newShift = { id: `sh${Date.now()}`, ...data };
    store = [...store, newShift];
    refresh();
    return newShift;
  }, [validateShift, refresh]);

  const updateShift = useCallback((id, data) => {
    const existing = store.find(s => s.id === id);
    if (!existing) throw new Error('Shift not found');
    const merged = { ...existing, ...data };
    const conflict = validateShift(merged.driverId, merged.date, merged.startTime, merged.endTime, id);
    if (conflict) throw new Error(conflict);
    store = store.map(s => s.id === id ? merged : s);
    refresh();
  }, [validateShift, refresh]);

  const deleteShift = useCallback((id) => {
    store = store.filter(s => s.id !== id);
    refresh();
  }, [refresh]);

  return {
    shifts,
    getShiftsForDate,
    getDriverShifts,
    validateShift,
    createShift,
    updateShift,
    deleteShift,
  };
}
