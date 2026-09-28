import request from 'supertest';
import app from '../app';

describe('Public gallery listing', () => {
  it('GET /api/gallery is available without a token', async () => {
    const res = await request(app).get('/api/gallery');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('items');
  });
});
