import request from 'supertest';
import app from '../app';

describe('Health endpoints', () => {
  it('GET / should return API status', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.name).toBe('Character Matters API');
  });

  it('GET /api/health should return health payload', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body).toHaveProperty('dbState');
  });
});
