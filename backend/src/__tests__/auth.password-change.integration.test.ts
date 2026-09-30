const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
};

jest.mock('../config/prisma', () => ({
  __esModule: true,
  default: mockPrisma,
}));

import bcrypt from 'bcryptjs';
import request from 'supertest';
import app from '../app';
import { AuthChangePasswordSchema, AuthRegisterSchema } from '../middleware/validation';

describe('First-login password change', () => {
  const temporaryPassword = 'temporary-password';
  let user: Record<string, any>;

  beforeAll(() => {
    process.env.JWT_SECRET = 'integration-test-secret-that-is-at-least-32-characters';
  });

  beforeEach(async () => {
    user = {
      id: 'user-1',
      email: 'provisioned@example.com',
      fullName: 'Provisioned User',
      passwordHash: await bcrypt.hash(temporaryPassword, 4),
      role: 'USER',
      status: 'must_change_password',
    };
    mockPrisma.user.findUnique.mockResolvedValue(user);
    mockPrisma.user.update.mockImplementation(async ({ data }: { data: Record<string, unknown> }) => ({
      ...user,
      ...data,
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('requires strong passwords within bcrypt byte limits at registration and change', () => {
    const validPassword = 'a-strong-password';
    const userData = { name: 'Test User', email: 'test@example.com', password: validPassword };

    expect(AuthRegisterSchema.safeParse(userData).success).toBe(true);
    expect(AuthRegisterSchema.safeParse({ ...userData, password: 'short' }).success).toBe(false);
    expect(AuthRegisterSchema.safeParse({ ...userData, password: 'a'.repeat(73) }).success).toBe(false);
    expect(AuthChangePasswordSchema.safeParse({
      currentPassword: 'old-password',
      newPassword: validPassword,
    }).success).toBe(true);
  });

  it('restricts the temporary login token until password change succeeds', async () => {
    const agent = request.agent(app);
    const csrf = await agent.get('/api/auth/csrf');
    const missingCsrf = await agent
      .post('/api/auth/login')
      .send({ email: user.email, password: temporaryPassword });
    expect(missingCsrf.status).toBe(403);

    const login = await agent
      .post('/api/auth/login')
      .set('X-CSRF-Token', csrf.body.csrfToken)
      .send({ email: user.email, password: temporaryPassword });

    expect(login.status).toBe(200);
    expect(login.body.mustChangePassword).toBe(true);
    expect(login.body.token).toBeUndefined();
    const setCookie = login.headers['set-cookie'];
    const temporaryCookies = (Array.isArray(setCookie) ? setCookie : [setCookie])
      .map((cookie) => cookie.split(';')[0])
      .join('; ');

    const blocked = await agent.get('/api/auth/me');
    expect(blocked.status).toBe(403);

    const changed = await agent
      .put('/api/auth/password')
      .set('X-CSRF-Token', login.body.csrfToken)
      .send({ currentPassword: temporaryPassword, newPassword: 'a-strong-new-password' });

    expect(changed.status).toBe(200);
    expect(changed.body.mustChangePassword).toBe(false);
    const reusedTemporarySession = await request(app)
      .get('/api/auth/me')
      .set('Cookie', temporaryCookies);
    expect(reusedTemporarySession.status).toBe(403);
    expect(mockPrisma.user.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: user.id },
      data: expect.objectContaining({ status: 'active' }),
    }));
  });

  it('rejects a wrong temporary password and weak replacement passwords', async () => {
    const agent = request.agent(app);
    const csrf = await agent.get('/api/auth/csrf');
    const login = await agent
      .post('/api/auth/login')
      .set('X-CSRF-Token', csrf.body.csrfToken)
      .send({ email: user.email, password: temporaryPassword });

    const wrongCurrentPassword = await agent
      .put('/api/auth/password')
      .set('X-CSRF-Token', login.body.csrfToken)
      .send({ currentPassword: 'incorrect-password', newPassword: 'a-strong-new-password' });
    expect(wrongCurrentPassword.status).toBe(400);

    const weakNewPassword = await agent
      .put('/api/auth/password')
      .set('X-CSRF-Token', login.body.csrfToken)
      .send({ currentPassword: temporaryPassword, newPassword: 'short' });
    expect(weakNewPassword.status).toBe(400);
    expect(mockPrisma.user.update).not.toHaveBeenCalled();
  });
});