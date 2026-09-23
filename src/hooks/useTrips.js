/**
 * useTrips — manages shuttle trip availability data (mock layer)
 */
import { useState, useCallback } from 'react';
import tripsData from '../mock/trips.js';
import { format } from 'date-fns';

let store = [...tripsData];

export function useTrips() {
  const [trips, setTrips] = useState(store);

  const refresh = useCallback(() => setTrips([...store]), []);

  /** Filter trips by routeId and date string (yyyy-MM-dd) */
  const getTripsForRoute = useCallback((routeId, date) => {
    return store
      .filter(t => t.routeId === routeId && t.date === date && t.status === 'SCHEDULED' && t.availableSeats > 0)
      .sort((a, b) => a.departureTime.localeCompare(b.departureTime));
  }, []);

  const getAllTrips = useCallback(() => [...store], []);

  const getTrip = useCallback((id) => store.find(t => t.id === id), []);

  /** Decrements available seats when a booking is made */
  const reserveSeat = useCallback((tripId) => {
    const trip = store.find(t => t.id === tripId);
    if (!trip || trip.availableSeats <= 0) throw new Error('No seats available');
    store = store.map(t => t.id === tripId ? { ...t, availableSeats: t.availableSeats - 1 } : t);
    refresh();
  }, [refresh]);

  /** Increments available seats when a booking is cancelled */
  const releaseSeat = useCallback((tripId) => {
    store = store.map(t => t.id === tripId ? { ...t, availableSeats: Math.min(t.availableSeats + 1, t.totalSeats) } : t);
    refresh();
  }, [refresh]);

  const updateTrip = useCallback((id, data) => {
    store = store.map(t => t.id === id ? { ...t, ...data } : t);
    refresh();
  }, [refresh]);

  return {
    trips,
    getTripsForRoute,
    getAllTrips,
    getTrip,
    reserveSeat,
    releaseSeat,
    updateTrip,
  };
}
