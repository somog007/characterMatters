jest.mock('../middleware/auth', () => ({
  auth: (req: any, _res: any, next: any) => {
    req.user = { _id: '507f1f77bcf86cd799439011', role: 'admin', name: 'Admin' };
    next();
  },
  adminAuth: (_req: any, _res: any, next: any) => next(),
}));

import request from 'supertest';
import app from '../app';

describe('Gallery validation integration', () => {
  it('POST /api/gallery returns 400 for invalid payload', async () => {
    const res = await request(app)
      .post('/api/gallery')
      .field('title', 'No')
      .field('mediaType', 'invalid-type');

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('validation');
  });
});
