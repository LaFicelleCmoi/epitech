import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import app from '../app.js';
import pool from '../Config/DataBase.js';
import { ensureBansTable } from '../Models/BanModel.js';
import { ensureFriendsTable } from '../Models/FriendModel.js';
import { cleanDatabase, closeConnections, createUserAndLogin } from './helpers.js';

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

describe('Conversations (DM)', () => {
  it('creates or retrieves a conversation between two users', async () => {
    const a = await createUserAndLogin(app);
    const b = await createUserAndLogin(app);
    const res = await request(app)
      .post('/conversations')
      .set('Authorization', `Bearer ${a.token}`)
      .send({ targetUserId: b.user.id });
    expect(res.status).toBe(200);
    expect(res.body.data.participants).toContain(a.user.id);
    expect(res.body.data.participants).toContain(b.user.id);
  });

  it('returns the same conversation when called twice', async () => {
    const a = await createUserAndLogin(app);
    const b = await createUserAndLogin(app);
    const r1 = await request(app).post('/conversations').set('Authorization', `Bearer ${a.token}`).send({ targetUserId: b.user.id });
    const r2 = await request(app).post('/conversations').set('Authorization', `Bearer ${b.token}`).send({ targetUserId: a.user.id });
    expect(r1.body.data._id).toBe(r2.body.data._id);
  });

  it('rejects conversation with self', async () => {
    const a = await createUserAndLogin(app);
    const res = await request(app)
      .post('/conversations')
      .set('Authorization', `Bearer ${a.token}`)
      .send({ targetUserId: a.user.id });
    expect(res.status).toBe(400);
  });

  it('lists my conversations', async () => {
    const a = await createUserAndLogin(app);
    const b = await createUserAndLogin(app);
    await request(app).post('/conversations').set('Authorization', `Bearer ${a.token}`).send({ targetUserId: b.user.id });
    const res = await request(app).get('/conversations').set('Authorization', `Bearer ${a.token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
  });

  it('sends and retrieves a message in a conversation', async () => {
    const a = await createUserAndLogin(app);
    const b = await createUserAndLogin(app);
    const conv = (await request(app).post('/conversations').set('Authorization', `Bearer ${a.token}`).send({ targetUserId: b.user.id })).body.data;
    await request(app)
      .post(`/conversations/${conv._id}/messages`)
      .set('Authorization', `Bearer ${a.token}`)
      .send({ content: 'Hi!' });
    const res = await request(app).get(`/conversations/${conv._id}/messages`).set('Authorization', `Bearer ${a.token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].content).toBe('Hi!');
  });

  it('denies access to messages of other conversations', async () => {
    const a = await createUserAndLogin(app);
    const b = await createUserAndLogin(app);
    const intruder = await createUserAndLogin(app);
    const conv = (await request(app).post('/conversations').set('Authorization', `Bearer ${a.token}`).send({ targetUserId: b.user.id })).body.data;
    const res = await request(app).get(`/conversations/${conv._id}/messages`).set('Authorization', `Bearer ${intruder.token}`);
    expect(res.status).toBe(403);
  });
});
