import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const loginFailureRate = new Rate('login_failures');
const appointmentCreationTime = new Trend('appointment_creation_duration');
const authErrors = new Counter('auth_errors');

// Base URL from environment or default
const BASE_URL = __ENV.API_URL || 'http://localhost:5000';

// Test configuration for finding max capacity
export const options = {
  stages: [
    // Warm up
    { duration: '10s', target: 10 },
    // Ramp up to find breaking point
    { duration: '1m', target: 100 },
    { duration: '1m', target: 300 },
    { duration: '1m', target: 500 },
    // Hold at max
    // Ramp down
    { duration: '20s', target: 0 },
  ],
  thresholds: {
    // HTTP errors should be less than 1%
    http_req_failed: ['rate<0.01'],
    // 95% of requests should be below 500ms
    http_req_duration: ['p(95)<500'],
    // 99% of requests should be below 1s
    'http_req_duration{type:api}': ['p(99)<1000'],
    // Login failures should be less than 5%
    login_failures: ['rate<0.05'],
  },
};

// Test data
const testUsers = [
  { email: 'user_406tbm@test.com', password: 'Test123!' },
  { email: 'user_r6bvdj@test.com', password: 'Test123!' },
  { email: 'user_crxob59@test.com', password: 'Test123!' },
  { email: 'user_oeq5xr@test.com', password: 'Test123!' },
  { email: 'user_js84fk@test.com', password: 'Test123!' },
];

// Helper function to get random user
function getRandomUser() {
  return testUsers[Math.floor(Math.random() * testUsers.length)];
}

// Helper function to register a new user
function registerUser() {
  const randomId = Math.random().toString(36).substring(7);
  const payload = {
    email: `user_${randomId}@test.com`,
    password: 'Test123!',
    username: randomId,
    fullName: 'User',
  };

  const response = http.post(
    `${BASE_URL}/api/Auth/register`,
    JSON.stringify(payload),
    {
      headers: { 'Content-Type': 'application/json' },
      tags: { type: 'api', endpoint: 'register' },
    }
  );

  const success = check(response, {
    'registration successful': (r) => r.status === 200 || r.status === 201,
    'got access token': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.accessToken !== undefined;
      } catch {
        return false;
      }
    },
  });

  if (!success) {
    authErrors.add(1);
  }

  return response;
}

// Helper function to login
function login(email, password) {
  const payload = {
    identifier: email,
    password: password,
  };

  const response = http.post(
    `${BASE_URL}/api/Auth/login`,
    JSON.stringify(payload),
    {
      headers: { 'Content-Type': 'application/json' },
      tags: { type: 'api', endpoint: 'login' },
    }
  );

  const success = check(response, {
    'login successful': (r) => r.status === 200,
    'got access token': (r) => {
      try {
        const body = JSON.parse(r.body);
        if(body.accessToken === undefined) {
            console.log("no accessToken", r);
        }
        return body.accessToken !== undefined;
      } catch {
        console.log("some error", r);
        return false;
      }
    },
  });

  loginFailureRate.add(!success);

  if (!success) {
    authErrors.add(1);
    return null;
  }

  try {
    return JSON.parse(response.body);
  } catch {
    return null;
  }
}

// Helper function to create appointment
function createAppointment(accessToken, userId) {
  const appointmentDate = new Date();
  appointmentDate.setDate(appointmentDate.getDate() + Math.floor(Math.random() * 30));
  
  const payload = {
    userId: userId,
    doctorName: 'Dr. Test Doctor',
    appointmentDateTime: appointmentDate.toISOString(),
    title: 'Cardiology - Regular Checkup',
    description: 'Load test appointment',
  };

  const startTime = new Date();
  const response = http.post(
    `${BASE_URL}/api/Appointment`,
    JSON.stringify(payload),
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      tags: { type: 'api', endpoint: 'create_appointment' },
    }
  );
  const duration = new Date() - startTime;
  appointmentCreationTime.add(duration);

  check(response, {
    'appointment created': (r) => r.status === 200 || r.status === 201,
  });

  return response;
}

// Helper function to fetch appointments
function fetchAppointments(accessToken, userId) {
  const response = http.get(
    `${BASE_URL}/api/Appointment/user/${userId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      tags: { type: 'api', endpoint: 'fetch_appointments' },
    }
  );

  check(response, {
    'appointments fetched': (r) => r.status === 200,
    'response is array': (r) => {
      try {
        const body = JSON.parse(r.body);
        return Array.isArray(body);
      } catch {
        return false;
      }
    },
  });

  return response;
}

// Helper function to decode JWT and get userId
function getUserIdFromToken(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = JSON.parse(encoding.b64decode(parts[1], 'rawurl', 's'));
    console.log("payload", payload);
    return payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
  } catch {
    return null;
  }
}

// Main test scenario
export default function () {
  // Scenario 1: New user registration and appointment creation (20%)
  if (Math.random() < 0.2) {
    const registerResponse = registerUser();
    
    if (registerResponse.status === 200 || registerResponse.status === 201) {
      try {
        const authData = JSON.parse(registerResponse.body);
        const userId = getUserIdFromToken(authData.accessToken);
        
        sleep(0.5);
        
        if (userId) {
        //   createAppointment(authData.accessToken, userId);
        //   sleep(1);
          fetchAppointments(authData.accessToken, userId);
        }
      } catch (e) {
        console.error('Error in registration flow:', e);
      }
    }
    
    sleep(Math.random() * 2 + 1);
    return;
  }

  // Scenario 2: Existing user login and interactions (80%)
  const user = getRandomUser();
  const authData = login(user.email, user.password);

  if (!authData || !authData.accessToken) {
    sleep(1);
    return;
  }

  const userId = getUserIdFromToken(authData.accessToken);
  if (!userId) {
    sleep(1);
    return;
  }

  sleep(Math.random() * 2);

  // Fetch appointments
  fetchAppointments(authData.accessToken, userId);
  sleep(Math.random() * 3);

  // 50% chance to create a new appointment
//   if (Math.random() < 0.5) {
//     createAppointment(authData.accessToken, userId);
//     sleep(Math.random() * 2);
//   }

  // 30% chance to fetch appointments again
//   if (Math.random() < 0.3) {
//     fetchAppointments(authData.accessToken, userId);
//   }

  sleep(Math.random() * 2 + 1);
}

// Setup function - runs once at the beginning
export function setup() {
  console.log('Starting load test...');
  console.log(`Target URL: ${BASE_URL}`);
  
  // You could pre-create test users here if needed
  return { timestamp: new Date().toISOString() };
}

// Teardown function - runs once at the end
export function teardown(data) {
  console.log('Load test completed at:', new Date().toISOString());
  console.log('Test started at:', data.timestamp);
}