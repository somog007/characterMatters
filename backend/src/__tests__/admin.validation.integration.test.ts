jest.mock('../middleware/auth', () => ({
  csrfProtection: (_req: any, _res: any, next: any) => next(),
  auth: (req: any, _res: any, next: any) => {
    req.user = { id: '507f1f77bcf86cd799439011', role: 'ADMIN', fullName: 'Admin' };
    next();
  },
  adminAuth: (_req: any, _res: any, next: any) => next(),
}));

import request from 'supertest';
import app from '../app';

describe('Admin validation integration', () => {
  it('PUT /api/admin/users/:userId/role returns 400 for invalid role', async () => {
    const res = await request(app)
      .put('/api/admin/users/507f1f77bcf86cd799439022/role')
      .send({ role: 'superadmin' });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Request body validation failed');
  });
});
