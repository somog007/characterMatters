const mockPrisma = {
  user: { findFirst: jest.fn(), create: jest.fn() },
  emailVerificationToken: { create: jest.fn() },
  $transaction: jest.fn(),
};

jest.mock('../config/prisma', () => ({
  __esModule: true,
  default: mockPrisma,
}));

jest.mock('../utils/email', () => ({
  enqueueVerificationEmail: jest.fn().mockResolvedValue(undefined),
}));

import request from 'supertest';
import app from '../app';
import prisma from '../config/prisma';
import { env } from '../config/env';

const db = prisma as unknown as typeof mockPrisma;

// Kept apart from auth.signup.integration.test.ts so these requests do not
// share that file's signup rate-limit budget (5 per 15 minutes).
describe('Signup account types', () => {
  const user = { id: 'new-user', fullName: 'New User', email: 'new@example.com' };

  beforeAll(() => {
    env.JWT_SECRET = 'integration-test-secret-that-is-at-least-32-characters';
  });

  beforeEach(() => {
    db.user.findFirst.mockResolvedValue(null);
    db.user.create.mockResolvedValue(user);
    db.emailVerificationToken.create.mockResolvedValue({});
    db.$transaction.mockImplementation((operation: (client: typeof mockPrisma) => unknown) =>
      operation(mockPrisma)
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('registers parents with the PARENT role by default', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ name: user.fullName, email: user.email, password: 'a-strong-password' });

    expect(response.status).toBe(201);
    expect(db.user.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ role: 'PARENT', schoolName: null }),
    }));
  });

  it('registers schools with the SCHOOL_ADMIN role and school name', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: user.fullName,
        email: user.email,
        password: 'a-strong-password',
        accountType: 'SCHOOL',
        schoolName: '  Bright Future Academy ',
      });

    expect(response.status).toBe(201);
    expect(db.user.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ role: 'SCHOOL_ADMIN', schoolName: 'Bright Future Academy' }),
    }));
  });

  it('rejects school signups without a school name', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: user.fullName,
        email: user.email,
        password: 'a-strong-password',
        accountType: 'SCHOOL',
      });

    expect(response.status).toBe(400);
    expect(db.$transaction).not.toHaveBeenCalled();
  });

  it('does not let signups choose privileged roles', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: user.fullName,
        email: user.email,
        password: 'a-strong-password',
        accountType: 'ADMIN',
      });

    expect(response.status).toBe(400);
    expect(db.$transaction).not.toHaveBeenCalled();
  });
});
