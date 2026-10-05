import { beforeEach, describe, expect, it } from 'bun:test';
import request from 'supertest';
import { app } from '../../src/app';
import { resetTestDatabase } from '../support/database';

beforeEach(resetTestDatabase);

describe('auth routes', () => {
  const credentials = { email: 'Test@Example.com', password: 'correct-horse-battery' };

  it('signs up a new user and sets a session cookie', async () => {
    const res = await request(app).post('/api/auth/signup').send(credentials);

    expect(res.status).toBe(201);
    expect(res.body.email).toBe('test@example.com');
    expect(res.headers['set-cookie']?.[0]).toMatch(/mazeflix_session=/);
  });

  it('rejects signup with an invalid payload', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ email: 'not-an-email', password: 'short' });

    expect(res.status).toBe(400);
  });

  it('rejects signup with a duplicate email', async () => {
    await request(app).post('/api/auth/signup').send(credentials);
    const res = await request(app).post('/api/auth/signup').send(credentials);

    expect(res.status).toBe(409);
  });

  it('signs in with correct credentials', async () => {
    await request(app).post('/api/auth/signup').send(credentials);
    const res = await request(app).post('/api/auth/signin').send(credentials);

    expect(res.status).toBe(200);
    expect(res.headers['set-cookie']?.[0]).toMatch(/mazeflix_session=/);
  });

  it('rejects signin with an invalid payload', async () => {
    const res = await request(app)
      .post('/api/auth/signin')
      .send({ email: 'not-an-email', password: 'short' });

    expect(res.status).toBe(401);
  });

  it('rejects signin with the wrong password', async () => {
    await request(app).post('/api/auth/signup').send(credentials);
    const res = await request(app)
      .post('/api/auth/signin')
      .send({ ...credentials, password: 'wrong-password' });

    expect(res.status).toBe(401);
  });

  it('returns the current user when signed in, and 401 otherwise', async () => {
    const agent = request.agent(app);
    await agent.post('/api/auth/signup').send(credentials);

    const me = await agent.get('/api/auth/me');
    expect(me.status).toBe(200);
    expect(me.body.email).toBe('test@example.com');

    const unauthenticated = await request(app).get('/api/auth/me');
    expect(unauthenticated.status).toBe(401);
  });

  it('rejects an unrecognized session cookie', async () => {
    const res = await request(app).get('/api/auth/me').set('Cookie', 'mazeflix_session=bogus');
    expect(res.status).toBe(401);
  });

  it('signs out and invalidates the session', async () => {
    const agent = request.agent(app);
    await agent.post('/api/auth/signup').send(credentials);

    const signOut = await agent.post('/api/auth/signout');
    expect(signOut.status).toBe(204);

    const me = await agent.get('/api/auth/me');
    expect(me.status).toBe(401);
  });
});
