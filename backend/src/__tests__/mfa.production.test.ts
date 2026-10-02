import { requestMfaCode, verifyMfaCode } from '../controllers/mfaController';
import type { AuthRequest } from '../middleware/auth';
import type { Response } from 'express';
import { env } from '../config/env';

describe('MFA production behavior', () => {
  it.each([requestMfaCode, verifyMfaCode])('fails closed in production', async (handler) => {
    const previousNodeEnv = env.NODE_ENV;
    env.NODE_ENV = 'production';
    const response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as unknown as Response;
    const request = { user: { id: 'test-user' } } as AuthRequest;

    try {
      await handler(request, response);
      expect(response.status).toHaveBeenCalledWith(503);
      expect(response.json).toHaveBeenCalledWith({ message: 'MFA is not available' });
    } finally {
      env.NODE_ENV = previousNodeEnv;
    }
  });
});