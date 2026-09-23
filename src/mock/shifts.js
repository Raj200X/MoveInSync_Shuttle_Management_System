import { format, addDays } from 'date-fns';

const today = format(new Date(), 'yyyy-MM-dd');
const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');
const yesterday = format(addDays(new Date(), -1), 'yyyy-MM-dd');

// Shifts are per-driver per-date blocks
// type: DUTY | BREAK
const shifts = [
  // Today — Ramesh Kumar (d1)
  { id: 'sh1',  driverId: 'd1', date: today, startTime: '07:00', endTime: '10:00', type: 'DUTY' },
  { id: 'sh2',  driverId: 'd1', date: today, startTime: '10:00', endTime: '10:30', type: 'BREAK' },
  { id: 'sh3',  driverId: 'd1', date: today, startTime: '10:30', endTime: '14:00', type: 'DUTY' },

  // Today — Suresh Singh (d2)
  { id: 'sh4',  driverId: 'd2', date: today, startTime: '08:00', endTime: '12:00', type: 'DUTY' },
  { id: 'sh5',  driverId: 'd2', date: today, startTime: '12:00', endTime: '12:30', type: 'BREAK' },
  { id: 'sh6',  driverId: 'd2', date: today, startTime: '12:30', endTime: '16:00', type: 'DUTY' },

  // Today — Mahesh Yadav (d3)
  { id: 'sh7',  driverId: 'd3', date: today, startTime: '14:00', endTime: '20:00', type: 'DUTY' },
  { id: 'sh8',  driverId: 'd3', date: today, startTime: '17:00', endTime: '17:30', type: 'BREAK' },

  // Today — Dinesh Patel (d4)
  { id: 'sh9',  driverId: 'd4', date: today, startTime: '06:00', endTime: '10:00', type: 'DUTY' },

  // Today — Arun Mishra (d6)
  { id: 'sh10', driverId: 'd6', date: today, startTime: '16:00', endTime: '22:00', type: 'DUTY' },
  { id: 'sh11', driverId: 'd6', date: today, startTime: '19:00', endTime: '19:30', type: 'BREAK' },

  // Tomorrow — Ramesh Kumar (d1)
  { id: 'sh12', driverId: 'd1', date: tomorrow, startTime: '08:00', endTime: '14:00', type: 'DUTY' },
  { id: 'sh13', driverId: 'd1', date: tomorrow, startTime: '11:00', endTime: '11:30', type: 'BREAK' },

  // Yesterday — Suresh Singh (d2)
  { id: 'sh14', driverId: 'd2', date: yesterday, startTime: '07:00', endTime: '13:00', type: 'DUTY' },
];

export default shifts;
