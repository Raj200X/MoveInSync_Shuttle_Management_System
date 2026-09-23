import { format, addDays } from 'date-fns';

const today = format(new Date(), 'yyyy-MM-dd');
const yesterday = format(addDays(new Date(), -1), 'yyyy-MM-dd');
const twoDaysAgo = format(addDays(new Date(), -2), 'yyyy-MM-dd');
const threeDaysAgo = format(addDays(new Date(), -3), 'yyyy-MM-dd');
const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');

const bookings = [
  // u1 (Raj Kumar) bookings
  { id: 'b1', userId: 'u1', employeeName: 'Raj Kumar', tripId: 't1',  routeId: 'r1', seatNumber: 5,  status: 'ACCEPTED', bookedAt: `${today}T06:30:00`, date: today, departureTime: '07:00', pickupTime: '', plannedDropTime: '07:20', actualDropTime: '', routeName: 'Academic Core Shuttle' },
  { id: 'b2', userId: 'u1', employeeName: 'Raj Kumar', tripId: 't6',  routeId: 'r2', seatNumber: 3,  status: 'WAITING', bookedAt: `${today}T07:45:00`, date: today, departureTime: '08:30', pickupTime: '', plannedDropTime: '08:45', actualDropTime: '', routeName: 'Hostel & Sports Express' },
  { id: 'b3', userId: 'u1', employeeName: 'Raj Kumar', tripId: 't12', routeId: 'r1', seatNumber: 8,  status: 'DECLINED', bookedAt: `${today}T08:00:00`, date: tomorrow, departureTime: '07:00', pickupTime: '', plannedDropTime: '07:20', actualDropTime: '', routeName: 'Academic Core Shuttle' },
  { id: 'b4', userId: 'u1', employeeName: 'Raj Kumar', tripId: 't10', routeId: 'r1', seatNumber: 12, status: 'NO_SHOW', bookedAt: `${yesterday}T06:00:00`, date: yesterday, departureTime: '07:00', pickupTime: '07:03', plannedDropTime: '07:20', actualDropTime: '07:22', routeName: 'Academic Core Shuttle' },
  { id: 'b5', userId: 'u1', employeeName: 'Raj Kumar', tripId: 't11', routeId: 'r2', seatNumber: 6,  status: 'COMPLETED', bookedAt: `${twoDaysAgo}T08:00:00`, date: twoDaysAgo, departureTime: '09:00', pickupTime: '09:01', plannedDropTime: '09:15', actualDropTime: '09:14', routeName: 'Hostel & Sports Express' },

  // u2 (Priya Sharma) bookings
  { id: 'b6', userId: 'u2', employeeName: 'Priya Sharma', tripId: 't8',  routeId: 'r3', seatNumber: 2,  status: 'ACCEPTED', bookedAt: `${today}T07:00:00`, date: today, departureTime: '08:00', pickupTime: '', plannedDropTime: '08:25', actualDropTime: '', routeName: 'Admin & Law Loop' },
  { id: 'b7', userId: 'u2', employeeName: 'Priya Sharma', tripId: 't10', routeId: 'r1', seatNumber: 7,  status: 'COMPLETED', bookedAt: `${yesterday}T06:00:00`, date: yesterday, departureTime: '07:00', pickupTime: '07:05', plannedDropTime: '07:20', actualDropTime: '07:24', routeName: 'Academic Core Shuttle' },
  { id: 'b8', userId: 'u2', employeeName: 'Priya Sharma', tripId: 't13', routeId: 'r2', seatNumber: 4,  status: 'WAITING', bookedAt: `${today}T10:00:00`, date: tomorrow, departureTime: '08:30', pickupTime: '', plannedDropTime: '08:45', actualDropTime: '', routeName: 'Hostel & Sports Express' },
];

export default bookings;
