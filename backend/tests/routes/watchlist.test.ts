import { beforeAll, beforeEach, describe, expect, it } from 'bun:test';
import request from 'supertest';
import { app } from '../../src/app';
import { pool } from '../../src/db/client';
import { migrateTestDatabase } from '../support/database';

beforeAll(migrateTestDatabase);

beforeEach(async () => {
  await pool.query('TRUNCATE TABLE watchlist_items, sessions, users RESTART IDENTITY CASCADE');
});

describe('watchlist routes', () => {
  const credentials = { email: 'Test@Example.com', password: 'correct-horse-battery' };

  it('rejects all operations when not signed in', async () => {
    const list = await request(app).get('/api/watchlist');
    expect(list.status).toBe(401);

    const add = await request(app).post('/api/watchlist').send({ showId: 1 });
    expect(add.status).toBe(401);

    const remove = await request(app).delete('/api/watchlist/1');
    expect(remove.status).toBe(401);
  });

  it('starts empty for a new user', async () => {
    const agent = request.agent(app);
    await agent.post('/api/auth/signup').send(credentials);

    const res = await agent.get('/api/watchlist');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('adds a show to the watchlist', async () => {
    const agent = request.agent(app);
    await agent.post('/api/auth/signup').send(credentials);

    const add = await agent.post('/api/watchlist').send({ showId: 42 });
    expect(add.status).toBe(201);
    expect(add.body).toEqual({ showId: 42 });

    const list = await agent.get('/api/watchlist');
    expect(list.body).toEqual([42]);
  });

  it('is idempotent when adding the same show twice', async () => {
    const agent = request.agent(app);
    await agent.post('/api/auth/signup').send(credentials);

    await agent.post('/api/watchlist').send({ showId: 42 });
    const secondAdd = await agent.post('/api/watchlist').send({ showId: 42 });
    expect(secondAdd.status).toBe(201);

    const list = await agent.get('/api/watchlist');
    expect(list.body).toEqual([42]);
  });

  it('rejects adding an invalid show id', async () => {
    const agent = request.agent(app);
    await agent.post('/api/auth/signup').send(credentials);

    const res = await agent.post('/api/watchlist').send({ showId: 'not-a-number' });
    expect(res.status).toBe(400);
  });

  it('removes a show from the watchlist', async () => {
    const agent = request.agent(app);
    await agent.post('/api/auth/signup').send(credentials);
    await agent.post('/api/watchlist').send({ showId: 42 });

    const remove = await agent.delete('/api/watchlist/42');
    expect(remove.status).toBe(204);

    const list = await agent.get('/api/watchlist');
    expect(list.body).toEqual([]);
  });

  it('does not error when removing a show that is not in the watchlist', async () => {
    const agent = request.agent(app);
    await agent.post('/api/auth/signup').send(credentials);

    const remove = await agent.delete('/api/watchlist/999');
    expect(remove.status).toBe(204);
  });

  it("only returns the signed-in user's own watchlist", async () => {
    const agentOne = request.agent(app);
    await agentOne.post('/api/auth/signup').send(credentials);
    await agentOne.post('/api/watchlist').send({ showId: 1 });

    const agentTwo = request.agent(app);
    await agentTwo
      .post('/api/auth/signup')
      .send({ email: 'other@example.com', password: credentials.password });
    await agentTwo.post('/api/watchlist').send({ showId: 2 });

    const listOne = await agentOne.get('/api/watchlist');
    expect(listOne.body).toEqual([1]);

    const listTwo = await agentTwo.get('/api/watchlist');
    expect(listTwo.body).toEqual([2]);
  });
});
