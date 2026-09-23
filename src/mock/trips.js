import { format, addDays, addHours, parseISO } from 'date-fns';

const today = format(new Date(), 'yyyy-MM-dd');
const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');
const yesterday = format(addDays(new Date(), -1), 'yyyy-MM-dd');

// Trips: a specific run of a route at a particular datetime with a driver
const trips = [
  // Today - Route r1 - Academic Core Shuttle
  { id: 't1', routeId: 'r1', driverId: 'd1', date: today, departureTime: '07:00', totalSeats: 20, availableSeats: 8,  status: 'SCHEDULED' },
  { id: 't2', routeId: 'r1', driverId: 'd2', date: today, departureTime: '09:00', totalSeats: 20, availableSeats: 15, status: 'SCHEDULED' },
  { id: 't3', routeId: 'r1', driverId: 'd1', date: today, departureTime: '11:00', totalSeats: 20, availableSeats: 3,  status: 'SCHEDULED' },
  { id: 't4', routeId: 'r1', driverId: 'd3', date: today, departureTime: '14:00', totalSeats: 20, availableSeats: 18, status: 'SCHEDULED' },

  // Today - Route r2 - Hostel & Sports Express
  { id: 't5', routeId: 'r2', driverId: 'd4', date: today, departureTime: '06:30', totalSeats: 15, availableSeats: 10, status: 'SCHEDULED' },
  { id: 't6', routeId: 'r2', driverId: 'd2', date: today, departureTime: '08:30', totalSeats: 15, availableSeats: 7,  status: 'SCHEDULED' },
  { id: 't7', routeId: 'r2', driverId: 'd6', date: today, departureTime: '16:30', totalSeats: 15, availableSeats: 14, status: 'SCHEDULED' },

  // Today - Route r3 - Admin & Law Loop
  { id: 't8', routeId: 'r3', driverId: 'd2', date: today, departureTime: '08:00', totalSeats: 18, availableSeats: 12, status: 'SCHEDULED' },
  { id: 't9', routeId: 'r3', driverId: 'd3', date: today, departureTime: '15:00', totalSeats: 18, availableSeats: 18, status: 'SCHEDULED' },

  // Yesterday - completed
  { id: 't10', routeId: 'r1', driverId: 'd2', date: yesterday, departureTime: '07:00', totalSeats: 20, availableSeats: 0,  status: 'COMPLETED' },
  { id: 't11', routeId: 'r2', driverId: 'd4', date: yesterday, departureTime: '09:00', totalSeats: 15, availableSeats: 0,  status: 'COMPLETED' },

  // Tomorrow
  { id: 't12', routeId: 'r1', driverId: 'd1', date: tomorrow, departureTime: '07:00', totalSeats: 20, availableSeats: 20, status: 'SCHEDULED' },
  { id: 't13', routeId: 'r2', driverId: 'd2', date: tomorrow, departureTime: '08:30', totalSeats: 15, availableSeats: 15, status: 'SCHEDULED' },
  { id: 't14', routeId: 'r3', driverId: 'd3', date: tomorrow, departureTime: '09:00', totalSeats: 18, availableSeats: 18, status: 'SCHEDULED' },
];

export default trips;
