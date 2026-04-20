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

async function createServer(app, token, name = 'Test Server') {
  const res = await request(app)
    .post('/servers')
    .set('Authorization', `Bearer ${token}`)
    .send({ name });
  return res.body.data;
}

describe('Servers CRUD', () => {
  it('creates a server (and makes user the owner)', async () => {
    const { token, user } = await createUserAndLogin(app);
    const res = await request(app)
      .post('/servers')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'My Server' });
    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('My Server');
    expect(res.body.data.owner).toBe(user.id);
  });

  it('lists user servers', async () => {
    const { token } = await createUserAndLogin(app);
    await createServer(app, token, 'Server A');
    await createServer(app, token, 'Server B');
    const res = await request(app)
      .get('/servers/members')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(2);
  });

  it('gets server by id', async () => {
    const { token } = await createUserAndLogin(app);
    const srv = await createServer(app, token);
    const res = await request(app)
      .get(`/servers/${srv.id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(srv.id);
  });

  it('returns invite code', async () => {
    const { token } = await createUserAndLogin(app);
    const srv = await createServer(app, token);
    const res = await request(app)
      .get(`/servers/${srv.id}/inviteCode`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.inviteCode).toBeDefined();
  });

  it('gets my role in server (owner)', async () => {
    const { token } = await createUserAndLogin(app);
    const srv = await createServer(app, token);
    const res = await request(app)
      .get(`/servers/${srv.id}/me`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.role).toBe('owner');
  });

  it('updates server name (owner only)', async () => {
    const { token } = await createUserAndLogin(app);
    const srv = await createServer(app, token);
    const res = await request(app)
      .put(`/servers/${srv.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'New Name' });
    expect(res.status).toBe(200);
  });

  it('deletes a server (owner only)', async () => {
    const { token } = await createUserAndLogin(app);
    const srv = await createServer(app, token);
    const res = await request(app)
      .delete(`/servers/${srv.id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });
});

describe('Servers - Join', () => {
  it('allows a user to join with invite code', async () => {
    const owner = await createUserAndLogin(app);
    const srv = await createServer(app, owner.token);
    const invite = await request(app)
      .get(`/servers/${srv.id}/inviteCode`)
      .set('Authorization', `Bearer ${owner.token}`);
    const code = invite.body.data.inviteCode;

    const user2 = await createUserAndLogin(app);
    const res = await request(app)
      .post('/servers/join')
      .set('Authorization', `Bearer ${user2.token}`)
      .send({ inviteCode: code });
    expect(res.status).toBe(200);
  });

  it('returns 404 for invalid invite code', async () => {
    const { token } = await createUserAndLogin(app);
    const res = await request(app)
      .post('/servers/join')
      .set('Authorization', `Bearer ${token}`)
      .send({ inviteCode: 'invalid' });
    expect(res.status).toBe(404);
  });
});

describe('Servers - Channels', () => {
  it('creates a channel in a server', async () => {
    const { token } = await createUserAndLogin(app);
    const srv = await createServer(app, token);
    const res = await request(app)
      .post(`/servers/${srv.id}/channels`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'general' });
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('general');
  });

  it('lists server channels', async () => {
    const { token } = await createUserAndLogin(app);
    const srv = await createServer(app, token);
    await request(app)
      .post(`/servers/${srv.id}/channels`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'general' });
    const res = await request(app)
      .get(`/servers/${srv.id}/channels`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });
});
