import { describe, expect, it } from 'bun:test';
import request from 'supertest';
import { app } from '../src/app';

describe('health check', () => {
  it('reports ok', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});
