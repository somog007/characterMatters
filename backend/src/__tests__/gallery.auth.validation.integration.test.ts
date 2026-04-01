import request from 'supertest';
import app from '../app';

describe('Gallery auth and validation integration', () => {
  it('GET /api/gallery returns 401 without token', async () => {
    const res = await request(app).get('/api/gallery');
    expect(res.status).toBe(401);
  });
});
