jest.mock('../middleware/auth', () => ({
  auth: (req: any, _res: any, next: any) => {
    req.user = { _id: '507f1f77bcf86cd799439011', role: 'free-user', name: 'User' };
    next();
  },
  adminAuth: (req: any, res: any, next: any) => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin rights required.' });
    }
    next();
  },
}));

import request from 'supertest';
import app from '../app';

describe('Gallery forbidden + validation integration', () => {
  it('POST /api/gallery returns 403 for non-admin', async () => {
    const res = await request(app)
      .post('/api/gallery')
      .field('title', 'Event')
      .field('mediaType', 'image');

    expect(res.status).toBe(403);
  });
});
