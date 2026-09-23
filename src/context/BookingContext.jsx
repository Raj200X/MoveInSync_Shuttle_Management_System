import { createContext, useContext, useState, useCallback } from 'react';
import bookingsData from '../mock/bookings.js';
import usersData from '../mock/users.json';
import { useTrips } from '../hooks/useTrips';

const BookingContext = createContext(null);

export function BookingProvider({ children }) {
  const [bookings, setBookings] = useState([...bookingsData]);
  const { reserveSeat, releaseSeat, getTrip } = useTrips();

  const getMyBookings = useCallback((userId) =>
    bookings.filter(b => b.userId === userId),
    [bookings]
  );

  const createBooking = useCallback((userId, trip, route) => {
    reserveSeat(trip.id);
    const user = usersData.find(u => u.id === userId);
    const newBooking = {
      id: `b${Date.now()}`,
      userId,
      employeeName: user ? user.name : 'Thompson',
      tripId: trip.id,
      routeId: trip.routeId,
      seatNumber: Math.floor(Math.random() * (trip.totalSeats - 1)) + 1,
      status: 'CONFIRMED',
      bookedAt: new Date().toISOString(),
      date: trip.date,
      departureTime: trip.departureTime,
      routeName: route.name,
    };
    setBookings(prev => [...prev, newBooking]);
    return newBooking;
  }, [reserveSeat]);

  const cancelBooking = useCallback((bookingId) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;
    releaseSeat(booking.tripId);
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'CANCELLED' } : b));
  }, [bookings, releaseSeat]);

  const getAllBookings = useCallback(() => bookings, [bookings]);

  return (
    <BookingContext.Provider value={{ bookings, getMyBookings, createBooking, cancelBooking, getAllBookings }}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBookings() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error('useBookings must be used within BookingProvider');
  return ctx;
}
