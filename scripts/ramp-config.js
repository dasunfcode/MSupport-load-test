
export const rampStages = [
  { duration: '1s', target: 2 },
  { duration: '2s', target: 5 },
  { duration: '2s', target: 10 },
  { duration: '1s', target: 0 },
];

// export const rampStages = [
//   { duration: '10m', target: 2 },   // slow start, 20 total VUs
//   { duration: '10m', target: 5 },   // ramp-up, 50 total VUs
//   { duration: '15m', target: 10 },  // ramp to peak, 100 total VUs
//   { duration: '20m', target: 10 },  // hold peak, 100 total VUs
//   { duration: '5m', target: 0 },    // ramp down
// ];