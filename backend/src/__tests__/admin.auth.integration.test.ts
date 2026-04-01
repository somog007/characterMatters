import request from 'supertest';
import app from '../app';

describe('Admin endpoints auth integration', () => {
  it('GET /api/admin/metrics returns 401 without token', async () => {
    const res = await request(app).get('/api/admin/metrics');
    expect(res.status).toBe(401);
  });
});
