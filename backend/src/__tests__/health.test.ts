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

describe('Production CORS', () => {
  it('allows same-origin requests when FRONTEND_URL is not configured', async () => {
    const previousNodeEnv = process.env.NODE_ENV;
    const previousFrontendUrl = process.env.FRONTEND_URL;
    process.env.NODE_ENV = 'production';
    delete process.env.FRONTEND_URL;

    try {
      const res = await request(app)
        .get('/')
        .set('Host', 'charactermattersng.org')
        .set('Origin', 'http://charactermattersng.org');

      expect(res.status).toBe(200);
    } finally {
      process.env.NODE_ENV = previousNodeEnv;
      if (previousFrontendUrl === undefined) delete process.env.FRONTEND_URL;
      else process.env.FRONTEND_URL = previousFrontendUrl;
    }
  });

  it('does not allow localhost origins in production', async () => {
    const previousNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    try {
      const res = await request(app)
        .get('/')
        .set('Origin', 'http://localhost:3000');
      expect(res.headers['access-control-allow-origin']).toBeUndefined();
    } finally {
      process.env.NODE_ENV = previousNodeEnv;
    }
  });
});
