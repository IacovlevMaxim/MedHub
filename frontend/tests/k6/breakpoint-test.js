import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.API_URL || 'http://localhost:5000';

export const options = {
  // Breakpoint test - gradually increase load until failure
  executor: 'ramping-arrival-rate',
  startRate: 1,
  timeUnit: '1s',
  preAllocatedVUs: 500,
  maxVUs: 1000,
  stages: [
    { target: 10, duration: '1m' },   // Ramp to 10 req/s
    { target: 100, duration: '1m' },  // Ramp to 100 req/s
    { target: 500, duration: '1m' },  // Ramp to 500 req/s
  ],
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(99)<2000'],
  },
};

export default function () {
  const payload = {
    identifier: 'a@a.co',
    password: 'Asdf123',
  };

  const response = http.post(
    `${BASE_URL}/api/Auth/login`,
    JSON.stringify(payload),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );

  check(response, {
    'status is 206': (r) => r.status === 206,
  });

  sleep(0.1);
}