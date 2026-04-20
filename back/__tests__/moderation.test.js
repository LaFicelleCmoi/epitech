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

async function setupOwnerAndMember() {
  const owner = await createUserAndLogin(app);
  const srv = (await request(app).post('/servers').set('Authorization', `Bearer ${owner.token}`).send({ name: 'S' })).body.data;
  const invite = (await request(app).get(`/servers/${srv.id}/inviteCode`).set('Authorization', `Bearer ${owner.token}`)).body.data.inviteCode;

  const member = await createUserAndLogin(app);
  await request(app).post('/servers/join').set('Authorization', `Bearer ${member.token}`).send({ inviteCode: invite });

  return { owner, member, srv };
}

describe('Moderation - Kick', () => {
  it('owner can kick a member', async () => {
    const { owner, member, srv } = await setupOwnerAndMember();
    const res = await request(app)
      .delete(`/moderation/${srv.id}/kick/${member.user.id}`)
      .set('Authorization', `Bearer ${owner.token}`);
    expect(res.status).toBe(200);
  });

  it('kicked member can rejoin with invite code', async () => {
    const { owner, member, srv } = await setupOwnerAndMember();
    await request(app).delete(`/moderation/${srv.id}/kick/${member.user.id}`).set('Authorization', `Bearer ${owner.token}`);
    const invite = (await request(app).get(`/servers/${srv.id}/inviteCode`).set('Authorization', `Bearer ${owner.token}`)).body.data.inviteCode;
    const res = await request(app).post('/servers/join').set('Authorization', `Bearer ${member.token}`).send({ inviteCode: invite });
    expect(res.status).toBe(200);
  });

  it('non-admin cannot kick', async () => {
    const { member, srv } = await setupOwnerAndMember();
    const intruder = await createUserAndLogin(app);
    const res = await request(app)
      .delete(`/moderation/${srv.id}/kick/${member.user.id}`)
      .set('Authorization', `Bearer ${intruder.token}`);
    expect([403, 401].includes(res.status)).toBe(true);
  });
});

describe('Moderation - Permanent Ban', () => {
  it('owner can permanently ban a member', async () => {
    const { owner, member, srv } = await setupOwnerAndMember();
    const res = await request(app)
      .post(`/moderation/${srv.id}/ban/${member.user.id}`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ reason: 'Spam' });
    expect(res.status).toBe(200);
    expect(res.body.data.is_permanent).toBe(true);
  });

  it('banned user cannot rejoin', async () => {
    const { owner, member, srv } = await setupOwnerAndMember();
    await request(app).post(`/moderation/${srv.id}/ban/${member.user.id}`).set('Authorization', `Bearer ${owner.token}`).send({ reason: 'x' });
    const invite = (await request(app).get(`/servers/${srv.id}/inviteCode`).set('Authorization', `Bearer ${owner.token}`)).body.data.inviteCode;
    const res = await request(app).post('/servers/join').set('Authorization', `Bearer ${member.token}`).send({ inviteCode: invite });
    expect(res.status).toBe(403);
  });
});

describe('Moderation - Temporary Ban', () => {
  it('owner can temporarily ban with duration', async () => {
    const { owner, member, srv } = await setupOwnerAndMember();
    const res = await request(app)
      .post(`/moderation/${srv.id}/tempban/${member.user.id}`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ duration: 60, reason: 'cool down' });
    expect(res.status).toBe(200);
    expect(res.body.data.is_permanent).toBe(false);
    expect(res.body.data.expires_at).toBeDefined();
  });

  it('rejects tempban without duration', async () => {
    const { owner, member, srv } = await setupOwnerAndMember();
    const res = await request(app)
      .post(`/moderation/${srv.id}/tempban/${member.user.id}`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({});
    expect(res.status).toBe(400);
  });
});

describe('Moderation - Unban & list', () => {
  it('owner can unban a user', async () => {
    const { owner, member, srv } = await setupOwnerAndMember();
    await request(app).post(`/moderation/${srv.id}/ban/${member.user.id}`).set('Authorization', `Bearer ${owner.token}`).send({});
    const res = await request(app)
      .delete(`/moderation/${srv.id}/unban/${member.user.id}`)
      .set('Authorization', `Bearer ${owner.token}`);
    expect(res.status).toBe(200);
  });

  it('lists all bans of a server', async () => {
    const { owner, member, srv } = await setupOwnerAndMember();
    await request(app).post(`/moderation/${srv.id}/ban/${member.user.id}`).set('Authorization', `Bearer ${owner.token}`).send({ reason: 'r' });
    const res = await request(app)
      .get(`/moderation/${srv.id}/bans`)
      .set('Authorization', `Bearer ${owner.token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
  });
});
