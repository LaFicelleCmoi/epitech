import request from 'supertest';
import mongoose from 'mongoose';
import pool from '../Config/DataBase.js';

// Generate a random-ish email for test isolation
export const randomEmail = () => `test${Date.now()}${Math.random().toString(36).slice(2, 8)}@test.dev`;

// Helper: signup + login, returns { token, user }
export async function createUserAndLogin(app, overrides = {}) {
  const payload = {
    name: 'Test',
    first_name: 'User',
    phone_number: '0000000000',
    mail: randomEmail(),
    password: 'TestPass123',
    ...overrides,
  };

  await request(app).post('/auth/signup').send(payload);

  const loginRes = await request(app)
    .post('/auth/login')
    .send({ mail: payload.mail, password: payload.password });

  return {
    token: loginRes.body.accessToken,
    user: loginRes.body.user,
    mail: payload.mail,
    password: payload.password,
  };
}

// Clean DB between tests
export async function cleanDatabase() {
  try {
    await pool.query('TRUNCATE users, servers, users_servers, channels, bans, friendships CASCADE').catch(() => {});
    if (mongoose.connection.readyState === 1) {
      const collections = await mongoose.connection.db.collections();
      for (const c of collections) {
        await c.deleteMany({}).catch(() => {});
      }
    }
  } catch (err) {
    // tables may not exist yet on first run — ignore
  }
}

// Close DB connections after all tests
export async function closeConnections() {
  try {
    await mongoose.connection.close();
  } catch {}
  try {
    await pool.end();
  } catch {}
}
