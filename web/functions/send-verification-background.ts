import jwt from 'jsonwebtoken';
import { env } from '../../backend/src/config/env';
import { logger } from '../../backend/src/middleware/logger';
import { sendVerificationEmail } from '../../backend/src/utils/email';

interface BackgroundEvent {
  body?: string | null;
}

interface BackgroundContext {
  callbackWaitsForEmptyEventLoop?: boolean;
}

interface DispatchClaims extends jwt.JwtPayload {
  email: string;
  name: string;
  verificationUrl: string;
}

export const handler = async (event: BackgroundEvent, _context: BackgroundContext) => {
  try {
    const body: unknown = JSON.parse(event.body ?? '{}');
    if (!body || typeof body !== 'object' || !('dispatchToken' in body)
      || typeof body.dispatchToken !== 'string') {
      return { statusCode: 400, body: 'Invalid request' };
    }

    if (!env.JWT_SECRET) {
      throw new Error('JWT_SECRET must be configured');
    }
    const claims = jwt.verify(body.dispatchToken, env.JWT_SECRET, {
      audience: 'email-verification-dispatch',
    }) as DispatchClaims;
    if (
      typeof claims.email !== 'string'
      || typeof claims.name !== 'string'
      || typeof claims.verificationUrl !== 'string'
    ) {
      return { statusCode: 400, body: 'Invalid request' };
    }

    await sendVerificationEmail(claims.email, claims.name, claims.verificationUrl);
    logger.info({ message: 'Verification email sent', step: 'sendgrid_delivery' });
    return { statusCode: 200, body: 'Email sent' };
  } catch (error) {
    const errorMessage = error instanceof Error
      ? error.message.replace(env.SENDGRID_API_KEY ?? '', '[REDACTED_SENDGRID_API_KEY]')
      : undefined;
    const stack = error instanceof Error
      ? error.stack
        ?.replace(error.message, errorMessage ?? '[REDACTED_ERROR]')
        .replace(env.SENDGRID_API_KEY ?? '', '[REDACTED_SENDGRID_API_KEY]')
      : undefined;
    logger.error({
      message: 'Verification email delivery failed',
      errorType: error instanceof Error ? error.name : 'UnknownError',
      ...(errorMessage ? { errorMessage } : {}),
      ...(stack ? { stack } : {}),
      ...(
        typeof error === 'object'
        && error !== null
        && 'response' in error
        && error.response
        && typeof error.response === 'object'
        && 'body' in error.response
          ? { sendGridErrors: (error.response as { body?: { errors?: unknown } }).body?.errors }
          : {}
      ),
    });
    return { statusCode: 500, body: 'Email delivery failed' };
  }
};
