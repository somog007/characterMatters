const mockPrisma = {
  user: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  subscription: {
    findUnique: jest.fn(),
    upsert: jest.fn(),
    update: jest.fn(),
  },
  paystackTransaction: {
    upsert: jest.fn(),
  },
  $transaction: jest.fn(),
};

jest.mock('../config/prisma', () => ({
  __esModule: true,
  default: mockPrisma,
}));

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import app from '../app';
import { env } from '../config/env';
import { sessionVersion } from '../utils/sessionVersion';

const SECRET = 'integration-test-secret-that-is-at-least-32-characters';
const PNG_DATA_URL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

describe('Subscriptions, profile pictures and session security', () => {
  let user: Record<string, any>;
  const fetchMock = jest.fn();
  const realFetch = global.fetch;

  const tokenFor = (passwordHash = user.passwordHash) =>
    jwt.sign({ userId: user.id, sv: sessionVersion(passwordHash) }, SECRET, { expiresIn: '1h' });
  const authed = (req: request.Test, token = tokenFor()) => req.set('Authorization', `Bearer ${token}`);
  const paystackReply = (status: number, body: unknown) =>
    Promise.resolve({ ok: status >= 200 && status < 300, status, json: async () => body });

  beforeAll(async () => {
    env.JWT_SECRET = SECRET;
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  afterAll(() => {
    global.fetch = realFetch;
  });

  beforeEach(async () => {
    env.PAYSTACK_SECRET_KEY = 'sk_test_example';
    user = {
      id: 'user-1',
      email: 'parent@example.com',
      fullName: 'Parent User',
      passwordHash: await bcrypt.hash('a-strong-password', 4),
      role: 'PARENT',
      status: 'active',
      emailVerified: true,
      avatar: null,
    };
    mockPrisma.user.findUnique.mockResolvedValue(user);
    mockPrisma.user.update.mockImplementation(async ({ data }: { data: Record<string, unknown> }) => ({ ...user, ...data }));
    mockPrisma.subscription.findUnique.mockResolvedValue(null);
    mockPrisma.subscription.upsert.mockResolvedValue({});
    mockPrisma.subscription.update.mockImplementation(async ({ data }: { data: Record<string, unknown> }) => ({
      userId: user.id,
      plan: 'package_6',
      ...data,
    }));
    mockPrisma.paystackTransaction.upsert.mockResolvedValue({});
    mockPrisma.$transaction.mockImplementation((operation: (client: typeof mockPrisma) => unknown) => operation(mockPrisma));
  });

  afterEach(() => {
    jest.clearAllMocks();
    fetchMock.mockReset();
  });

  describe('sessions', () => {
    it('rejects a token issued before the password changed', async () => {
      const oldToken = tokenFor(await bcrypt.hash('the-old-password', 4));
      const response = await authed(request(app).get('/api/auth/me'), oldToken);
      expect(response.status).toBe(401);
    });

    it('rejects a token without a session version', async () => {
      const legacyToken = jwt.sign({ userId: user.id }, SECRET, { expiresIn: '1h' });
      const response = await authed(request(app).get('/api/auth/me'), legacyToken);
      expect(response.status).toBe(401);
    });

    it('rejects a token signed with the "none" algorithm', async () => {
      const unsigned = jwt.sign({ userId: user.id, sv: sessionVersion(user.passwordHash) }, '', { algorithm: 'none' });
      const response = await authed(request(app).get('/api/auth/me'), unsigned);
      expect(response.status).toBe(401);
    });

    it('accepts a current token', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(user).mockResolvedValueOnce({ ...user, subscription: null });
      const response = await authed(request(app).get('/api/auth/me'));
      expect(response.status).toBe(200);
      expect(response.body.email).toBe(user.email);
    });
  });

  describe('profile picture', () => {
    it('saves a PNG data URL', async () => {
      const response = await authed(request(app).put('/api/auth/profile').send({ avatar: PNG_DATA_URL }));
      expect(response.status).toBe(200);
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: user.id },
        data: { avatar: PNG_DATA_URL },
      });
    });

    it('removes the picture when avatar is null', async () => {
      const response = await authed(request(app).put('/api/auth/profile').send({ avatar: null }));
      expect(response.status).toBe(200);
      expect(mockPrisma.user.update).toHaveBeenCalledWith({ where: { id: user.id }, data: { avatar: null } });
    });

    it.each([
      ['an SVG (can carry scripts)', 'data:image/svg+xml;base64,PHN2Zz48c2NyaXB0PmFsZXJ0KDEpPC9zY3JpcHQ+PC9zdmc+'],
      ['HTML disguised as a PNG', 'data:image/png;base64,PGh0bWw+PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0PjwvaHRtbD4='],
      ['a remote URL (tracking pixel)', 'https://attacker.example/pixel.png'],
      ['a javascript: URL', 'javascript:alert(1)'],
    ])('rejects %s', async (_label, avatar) => {
      const response = await authed(request(app).put('/api/auth/profile').send({ avatar }));
      expect(response.status).toBe(400);
      expect(mockPrisma.user.update).not.toHaveBeenCalled();
    });

    it('does not let a user change their own role', async () => {
      const response = await authed(request(app).put(`/api/users/${user.id}`).send({ role: 'ADMIN', name: 'Parent User' }));
      expect(response.status).toBe(200);
      expect(mockPrisma.user.update.mock.calls[0][0].data).not.toHaveProperty('role');
    });
  });

  describe('subscriptions', () => {
    it('returns null instead of an error when there is no subscription', async () => {
      const response = await authed(request(app).get('/api/subscriptions'));
      expect(response.status).toBe(200);
      expect(response.body).toBeNull();
    });

    it('starts a checkout at the server-side price, ignoring any amount the client sends', async () => {
      fetchMock.mockReturnValueOnce(paystackReply(200, {
        status: true,
        data: { authorization_url: 'https://checkout.paystack.com/abc', access_code: 'abc', reference: 'ps_new' },
      }));
      const response = await authed(
        request(app).post('/api/subscriptions/checkout/paystack').send({ planId: 'package_6', amount: 1 })
      );
      expect(response.status).toBe(200);
      expect(response.body.authorizationUrl).toBe('https://checkout.paystack.com/abc');
      const sent = JSON.parse(fetchMock.mock.calls[0][1].body);
      expect(sent.amount).toBe(150_000 * 100);
    });

    it('rejects an unknown plan', async () => {
      const response = await authed(request(app).post('/api/subscriptions/checkout/paystack').send({ planId: 'package_99' }));
      expect(response.status).toBe(400);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('lets a user retry after abandoning an earlier checkout', async () => {
      mockPrisma.subscription.findUnique.mockResolvedValue({
        userId: user.id, status: 'PENDING', plan: 'package_6', priceAmountNgn: 150000, providerReference: 'ps_old',
      });
      fetchMock
        .mockReturnValueOnce(paystackReply(200, { status: true, data: { status: 'abandoned', reference: 'ps_old' } }))
        .mockReturnValueOnce(paystackReply(200, {
          status: true,
          data: { authorization_url: 'https://checkout.paystack.com/new', access_code: 'x', reference: 'ps_new' },
        }));
      const response = await authed(request(app).post('/api/subscriptions/checkout/paystack').send({ planId: 'package_5' }));
      expect(response.status).toBe(200);
      expect(response.body.authorizationUrl).toBe('https://checkout.paystack.com/new');
    });

    it('activates an earlier checkout that was actually paid instead of charging again', async () => {
      mockPrisma.subscription.findUnique.mockResolvedValue({
        userId: user.id, status: 'PENDING', plan: 'package_6', priceAmountNgn: 150000, providerReference: 'ps_old',
      });
      fetchMock.mockReturnValueOnce(paystackReply(200, {
        status: true,
        data: {
          status: 'success', reference: 'ps_old', amount: 15_000_000, currency: 'NGN', paid_at: '2026-11-01T10:00:00Z',
          metadata: { userId: user.id, planId: 'package_6' },
        },
      }));
      const response = await authed(request(app).post('/api/subscriptions/checkout/paystack').send({ planId: 'package_6' }));
      expect(response.status).toBe(409);
      expect(response.body.subscription.status).toBe('ACTIVE');
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('explains that payments are unavailable when the Paystack key is missing', async () => {
      delete env.PAYSTACK_SECRET_KEY;
      const response = await authed(request(app).post('/api/subscriptions/checkout/paystack').send({ planId: 'package_6' }));
      expect(response.status).toBe(503);
      expect(response.body.message).toMatch(/not available/i);
    });

    it('reports a Paystack refusal as a provider error, not a crash', async () => {
      fetchMock.mockReturnValueOnce(paystackReply(401, { status: false, message: 'Invalid key' }));
      const response = await authed(request(app).post('/api/subscriptions/checkout/paystack').send({ planId: 'package_6' }));
      expect(response.status).toBe(502);
      expect(response.body.message).not.toMatch(/Invalid key/);
    });

    it('does not activate a payment for a smaller amount than the plan price', async () => {
      mockPrisma.subscription.findUnique.mockResolvedValue({
        userId: user.id, status: 'PENDING', plan: 'package_1', priceAmountNgn: 1200000, providerReference: 'ps_ref',
      });
      fetchMock.mockReturnValueOnce(paystackReply(200, {
        status: true,
        data: {
          status: 'success', reference: 'ps_ref', amount: 100, currency: 'NGN', paid_at: '2026-11-01T10:00:00Z',
          metadata: { userId: user.id, planId: 'package_1' },
        },
      }));
      const response = await authed(request(app).get('/api/subscriptions/checkout/paystack/verify?reference=ps_ref'));
      expect(response.status).toBe(400);
      expect(mockPrisma.subscription.update).not.toHaveBeenCalled();
    });

    it('rejects a malformed payment reference before calling Paystack', async () => {
      const response = await authed(request(app).get('/api/subscriptions/checkout/paystack/verify?reference=../../balance'));
      expect(response.status).toBe(400);
      expect(fetchMock).not.toHaveBeenCalled();
    });
  });
});
