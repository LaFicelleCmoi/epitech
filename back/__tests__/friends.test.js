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

describe('Friends', () => {
  it('sends a friend request by email', async () => {
    const a = await createUserAndLogin(app);
    const b = await createUserAndLogin(app);
    const res = await request(app)
      .post('/friends/request')
      .set('Authorization', `Bearer ${a.token}`)
      .send({ mail: b.mail });
    expect(res.status).toBe(201);
    expect(res.body.data.addressee_id).toBe(b.user.id);
  });

  it('cannot send request to self', async () => {
    const a = await createUserAndLogin(app);
    const res = await request(app)
      .post('/friends/request')
      .set('Authorization', `Bearer ${a.token}`)
      .send({ mail: a.mail });
    expect(res.status).toBe(400);
  });

  it('returns 404 when email does not exist', async () => {
    const a = await createUserAndLogin(app);
    const res = await request(app)
      .post('/friends/request')
      .set('Authorization', `Bearer ${a.token}`)
      .send({ mail: 'ghost@nowhere.tld' });
    expect(res.status).toBe(404);
  });

  it('lists pending incoming requests', async () => {
    const a = await createUserAndLogin(app);
    const b = await createUserAndLogin(app);
    await request(app).post('/friends/request').set('Authorization', `Bearer ${a.token}`).send({ mail: b.mail });
    const res = await request(app).get('/friends/pending').set('Authorization', `Bearer ${b.token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
  });

  it('lists sent pending requests', async () => {
    const a = await createUserAndLogin(app);
    const b = await createUserAndLogin(app);
    await request(app).post('/friends/request').set('Authorization', `Bearer ${a.token}`).send({ mail: b.mail });
    const res = await request(app).get('/friends/sent').set('Authorization', `Bearer ${a.token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
  });

  it('accepts a friend request', async () => {
    const a = await createUserAndLogin(app);
    const b = await createUserAndLogin(app);
    const req = await request(app).post('/friends/request').set('Authorization', `Bearer ${a.token}`).send({ mail: b.mail });
    const fid = req.body.data.id;
    const res = await request(app).post(`/friends/accept/${fid}`).set('Authorization', `Bearer ${b.token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('accepted');
  });

  it('lists accepted friends', async () => {
    const a = await createUserAndLogin(app);
    const b = await createUserAndLogin(app);
    const req = await request(app).post('/friends/request').set('Authorization', `Bearer ${a.token}`).send({ mail: b.mail });
    await request(app).post(`/friends/accept/${req.body.data.id}`).set('Authorization', `Bearer ${b.token}`);
    const res = await request(app).get('/friends').set('Authorization', `Bearer ${a.token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
  });

  it('removes a friend', async () => {
    const a = await createUserAndLogin(app);
    const b = await createUserAndLogin(app);
    const req = await request(app).post('/friends/request').set('Authorization', `Bearer ${a.token}`).send({ mail: b.mail });
    await request(app).post(`/friends/accept/${req.body.data.id}`).set('Authorization', `Bearer ${b.token}`);
    const res = await request(app).delete(`/friends/${req.body.data.id}`).set('Authorization', `Bearer ${a.token}`);
    expect(res.status).toBe(200);
  });

  it('rejects duplicate requests', async () => {
    const a = await createUserAndLogin(app);
    const b = await createUserAndLogin(app);
    await request(app).post('/friends/request').set('Authorization', `Bearer ${a.token}`).send({ mail: b.mail });
    const res = await request(app).post('/friends/request').set('Authorization', `Bearer ${a.token}`).send({ mail: b.mail });
    expect(res.status).toBe(409);
  });
});
