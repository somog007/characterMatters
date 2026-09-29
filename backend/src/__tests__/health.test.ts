import request from 'supertest';
import app from '../app';
import prisma from '../config/prisma';

jest.mock('../config/prisma', () => ({
  __esModule: true,
  default: { $queryRaw: jest.fn() },
}));

const mockPrisma = prisma as unknown as { $queryRaw: jest.Mock };

describe('Health endpoints', () => {
  it('GET / should return API status', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.name).toBe('Character Matters API');
  });

  it('GET /api/health reports healthy when the database responds', async () => {
    mockPrisma.$queryRaw.mockResolvedValueOnce([{ '?column?': 1 }]);
    const res = await request(app).get('/api/health');
    expect(res.body).toHaveProperty('database');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.database).toBe('connected');
  });

  it('GET /api/health reports unhealthy when the database is unavailable', async () => {
    mockPrisma.$queryRaw.mockRejectedValueOnce(new Error('Database unavailable'));
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(503);
    expect(res.body.status).toBe('error');
    expect(res.body.database).toBe('error');
  });
});
