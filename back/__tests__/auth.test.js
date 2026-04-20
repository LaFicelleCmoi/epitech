import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import app from '../app.js';
import { ensureBansTable } from '../Models/BanModel.js';
import { ensureFriendsTable } from '../Models/FriendModel.js';
import pool from '../Config/DataBase.js';
import { cleanDatabase, closeConnections, createUserAndLogin, randomEmail } from './helpers.js';

beforeAll(async () => {
  await ensureBansTable();
  await ensureFriendsTable();
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar TEXT`).catch(() => {});
});

beforeEach(async () => {
  await cleanDatabase();
});

afterAll(async () => {
  await closeConnections();
});

describe('Auth - Signup', () => {
  it('creates a new user with valid data', async () => {
    const res = await request(app).post('/auth/signup').send({
      name: 'Dupont',
      first_name: 'Alice',
      phone_number: '0612345678',
      mail: randomEmail(),
      password: 'Pass123',
    });
    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data.name).toBe('Dupont');
  });

  it('hashes the password (not stored in plain text)', async () => {
    const mail = randomEmail();
    await request(app).post('/auth/signup').send({
      name: 'X', first_name: 'Y', mail, password: 'MyPass',
    });
    const res = await pool.query('SELECT password FROM users WHERE mail = $1', [mail]);
    expect(res.rows[0].password).not.toBe('MyPass');
    expect(res.rows[0].password.length).toBeGreaterThan(20);
  });
});

describe('Auth - Login', () => {
  it('returns 400 when fields are missing', async () => {
    const res = await request(app).post('/auth/login').send({});
    expect(res.status).toBe(400);
  });

  it('returns 401 for unknown email', async () => {
    const res = await request(app).post('/auth/login').send({
      mail: 'unknown@test.com',
      password: 'whatever',
    });
    expect(res.status).toBe(401);
  });

  it('returns 401 for wrong password', async () => {
    const mail = randomEmail();
    await request(app).post('/auth/signup').send({
      name: 'A', first_name: 'B', mail, password: 'right',
    });
    const res = await request(app).post('/auth/login').send({
      mail, password: 'wrong',
    });
    expect(res.status).toBe(401);
  });

  it('returns a JWT token on success', async () => {
    const { token, user } = await createUserAndLogin(app);
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    expect(user).toHaveProperty('id');
  });
});

describe('Auth - /me GET', () => {
  it('returns 401 without token', async () => {
    const res = await request(app).get('/auth/me');
    expect(res.status).toBe(401);
  });

  it('returns user profile when authenticated', async () => {
    const { token } = await createUserAndLogin(app);
    const res = await request(app).get('/auth/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data).toHaveProperty('mail');
  });
});

describe('Auth - /me PUT (update profile)', () => {
  it('updates the first_name', async () => {
    const { token } = await createUserAndLogin(app);
    const res = await request(app)
      .put('/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ first_name: 'NewName' });
    expect(res.status).toBe(200);
    expect(res.body.data.first_name).toBe('NewName');
  });

  it('updates the avatar', async () => {
    const { token } = await createUserAndLogin(app);
    const res = await request(app)
      .put('/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ avatar: 'data:image/png;base64,xyz' });
    expect(res.status).toBe(200);
    expect(res.body.data.avatar).toBe('data:image/png;base64,xyz');
  });

  it('returns 401 without token', async () => {
    const res = await request(app).put('/auth/me').send({ first_name: 'X' });
    expect(res.status).toBe(401);
  });
});
