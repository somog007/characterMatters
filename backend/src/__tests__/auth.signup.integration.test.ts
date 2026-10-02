const mockPrisma = {
  user: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  emailVerificationToken: {
    create: jest.fn(),
    deleteMany: jest.fn(),
    findUnique: jest.fn(),
  },
  $transaction: jest.fn(),
};

jest.mock('../config/prisma', () => ({
  __esModule: true,
  default: mockPrisma,
}));

jest.mock('../utils/email', () => ({
  enqueueVerificationEmail: jest.fn(),
}));

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import app from '../app';
import prisma from '../config/prisma';
import { env } from '../config/env';
import { enqueueVerificationEmail } from '../utils/email';

const db = prisma as unknown as typeof mockPrisma;
const enqueueEmail = enqueueVerificationEmail as jest.MockedFunction<typeof enqueueVerificationEmail>;

describe('Signup and email verification', () => {
  const user = {
    id: 'new-user',
    fullName: 'New User',
    email: 'new@example.com',
    role: 'USER',
    status: 'active',
    emailVerified: false,
    passwordHash: '',
  };

  beforeAll(() => {
    env.JWT_SECRET = 'integration-test-secret-that-is-at-least-32-characters';
  });

  beforeEach(async () => {
    user.passwordHash = await bcrypt.hash('a-strong-password', 4);
    db.user.findFirst.mockResolvedValue(null);
    db.user.create.mockResolvedValue(user);
    db.user.update.mockResolvedValue({ ...user, emailVerified: true });
    db.emailVerificationToken.create.mockResolvedValue({});
    db.emailVerificationToken.deleteMany.mockResolvedValue({ count: 1 });
    db.emailVerificationToken.findUnique.mockResolvedValue({
      userId: user.id,
      expiresAt: new Date(Date.now() + 60_000),
    });
    db.$transaction.mockImplementation((operation: (client: typeof mockPrisma) => unknown) =>
      operation(mockPrisma)
    );
    enqueueEmail.mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('creates the account and verification token atomically, then queues email separately', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ name: user.fullName, email: user.email, password: 'a-strong-password' });

    expect(response.status).toBe(201);
    expect(response.body.emailVerificationRequired).toBe(true);
    expect(response.body.verificationEmailQueued).toBe(true);
    expect(db.$transaction).toHaveBeenCalledTimes(1);
    expect(db.user.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ emailVerified: false }),
    }));
    expect(db.emailVerificationToken.create).toHaveBeenCalledTimes(1);
    expect(enqueueEmail).toHaveBeenCalledWith(user.email, user.fullName, expect.stringContaining('#token='));
    expect(response.headers['set-cookie']).toBeUndefined();
  });

  it('returns a clear conflict when the email already exists', async () => {
    db.user.findFirst.mockResolvedValueOnce(user);

    const response = await request(app)
      .post('/api/auth/register')
      .send({ name: user.fullName, email: user.email, password: 'a-strong-password' });

    expect(response.status).toBe(409);
    expect(response.body.message).toContain('already exists');
    expect(db.$transaction).not.toHaveBeenCalled();
  });

  it('returns success when the verification email queue is unavailable', async () => {
    enqueueEmail.mockRejectedValueOnce(new Error('SendGrid unavailable'));

    const response = await request(app)
      .post('/api/auth/register')
      .send({ name: user.fullName, email: user.email, password: 'a-strong-password' });

    expect(response.status).toBe(201);
    expect(response.body.emailVerificationRequired).toBe(true);
    expect(response.body.verificationEmailQueued).toBe(false);
  });

  it('turns a unique-constraint race into a conflict instead of a server error', async () => {
    db.$transaction.mockRejectedValueOnce(Object.assign(new Error('Duplicate email'), { code: 'P2002' }));

    const response = await request(app)
      .post('/api/auth/register')
      .send({ name: user.fullName, email: user.email, password: 'a-strong-password' });

    expect(response.status).toBe(409);
    expect(response.body.message).toContain('already exists');
  });

  it('does not allow an unverified account to log in', async () => {
    db.user.findFirst.mockResolvedValueOnce(user);

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: user.email, password: 'a-strong-password' });

    expect(response.status).toBe(403);
    expect(response.body.code).toBe('EMAIL_VERIFICATION_REQUIRED');
    expect(response.headers['set-cookie']).toBeUndefined();
  });

  it('marks an account verified and consumes its token', async () => {
    const response = await request(app)
      .post('/api/auth/verify-email')
      .send({ token: 'a'.repeat(43) });

    expect(response.status).toBe(200);
    expect(response.body.message).toMatch(/verified/i);
    expect(db.user.update).toHaveBeenCalledWith({
      where: { id: user.id },
      data: { emailVerified: true },
    });
    expect(db.emailVerificationToken.deleteMany).toHaveBeenCalledWith({
      where: { userId: user.id },
    });
  });

  it('returns 401 for an expired or invalid JWT', async () => {
    const expiredToken = jwt.sign({ userId: user.id }, env.JWT_SECRET!, { expiresIn: '-1s' });
    const expired = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${expiredToken}`);
    const invalid = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer not-a-valid-token');

    expect(expired.status).toBe(401);
    expect(invalid.status).toBe(401);
    expect(db.user.findUnique).not.toHaveBeenCalled();
  });

  it('returns the same resend response for an unknown account and queues for an unverified account', async () => {
    db.user.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(user);

    const unknown = await request(app)
      .post('/api/auth/resend-verification')
      .send({ email: 'unknown@example.com' });
    expect(unknown.status).toBe(200);
    expect(enqueueEmail).not.toHaveBeenCalled();

    const resend = await request(app)
      .post('/api/auth/resend-verification')
      .send({ email: user.email });
    expect(resend.status).toBe(200);
    expect(enqueueEmail).toHaveBeenCalledTimes(1);
  });
});
