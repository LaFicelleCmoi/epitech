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

async function setup() {
  const { token } = await createUserAndLogin(app);
  const srv = (await request(app).post('/servers').set('Authorization', `Bearer ${token}`).send({ name: 'S' })).body.data;
  const ch = (await request(app).post(`/servers/${srv.id}/channels`).set('Authorization', `Bearer ${token}`).send({ name: 'c' })).body.data;
  return { token, srv, ch };
}

describe('Messages', () => {
  it('creates a message via REST', async () => {
    const { token, ch } = await setup();
    const res = await request(app)
      .post('/message')
      .set('Authorization', `Bearer ${token}`)
      .send({ channelId: ch.id, content: 'Hello world' });
    expect(res.status).toBe(201);
    expect(res.body.data.content).toBe('Hello world');
  });

  it('lists messages in a channel', async () => {
    const { token, ch } = await setup();
    await request(app).post('/message').set('Authorization', `Bearer ${token}`).send({ channelId: ch.id, content: 'msg1' });
    await request(app).post('/message').set('Authorization', `Bearer ${token}`).send({ channelId: ch.id, content: 'msg2' });
    const res = await request(app).get(`/message/channel/${ch.id}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(2);
  });

  it('edits own message', async () => {
    const { token, ch } = await setup();
    const post = await request(app).post('/message').set('Authorization', `Bearer ${token}`).send({ channelId: ch.id, content: 'old' });
    const msgId = post.body.data._id;
    const res = await request(app)
      .put(`/message/${msgId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'new content' });
    expect(res.status).toBe(200);
    expect(res.body.data.content).toBe('new content');
    expect(res.body.data.edited).toBe(true);
  });

  it('rejects edit with empty content', async () => {
    const { token, ch } = await setup();
    const post = await request(app).post('/message').set('Authorization', `Bearer ${token}`).send({ channelId: ch.id, content: 'x' });
    const res = await request(app)
      .put(`/message/${post.body.data._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ content: '   ' });
    expect(res.status).toBe(400);
  });

  it('deletes own message', async () => {
    const { token, ch } = await setup();
    const post = await request(app).post('/message').set('Authorization', `Bearer ${token}`).send({ channelId: ch.id, content: 'bye' });
    const res = await request(app)
      .delete(`/message/${post.body.data._id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  it('adds a reaction to a message', async () => {
    const { token, ch } = await setup();
    const post = await request(app).post('/message').set('Authorization', `Bearer ${token}`).send({ channelId: ch.id, content: 'react me' });
    const res = await request(app)
      .post(`/message/${post.body.data._id}/reactions`)
      .set('Authorization', `Bearer ${token}`)
      .send({ emoji: '👍' });
    expect(res.status).toBe(200);
    expect(res.body.data.reactions.length).toBe(1);
    expect(res.body.data.reactions[0].emoji).toBe('👍');
  });

  it('removes a reaction', async () => {
    const { token, ch } = await setup();
    const post = await request(app).post('/message').set('Authorization', `Bearer ${token}`).send({ channelId: ch.id, content: 'x' });
    await request(app).post(`/message/${post.body.data._id}/reactions`).set('Authorization', `Bearer ${token}`).send({ emoji: '❤️' });
    const res = await request(app)
      .delete(`/message/${post.body.data._id}/reactions`)
      .set('Authorization', `Bearer ${token}`)
      .send({ emoji: '❤️' });
    expect(res.status).toBe(200);
    expect(res.body.data.reactions.length).toBe(0);
  });
});
