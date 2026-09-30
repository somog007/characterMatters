import { requestMfaCode, verifyMfaCode } from '../controllers/mfaController';
import type { AuthRequest } from '../middleware/auth';
import type { Response } from 'express';

describe('MFA production behavior', () => {
  it.each([requestMfaCode, verifyMfaCode])('fails closed in production', async (handler) => {
    const previousNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
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
      process.env.NODE_ENV = previousNodeEnv;
    }
  });
});