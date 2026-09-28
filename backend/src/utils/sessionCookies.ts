import crypto from 'crypto';
import { Response } from 'express';

export const ACCESS_COOKIE = 'cm_access';
export const CSRF_COOKIE = 'cm_csrf';

const cookieOptions = (httpOnly: boolean, maxAge: number) => ({
  httpOnly,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' as const : 'lax' as const,
  path: '/',
  maxAge,
});

export const issueSessionCookies = (res: Response, token: string, maxAge: number) => {
  const csrfToken = crypto.randomBytes(32).toString('hex');
  res.cookie(ACCESS_COOKIE, token, cookieOptions(true, maxAge));
  res.cookie(CSRF_COOKIE, csrfToken, cookieOptions(false, maxAge));
  return csrfToken;
};

export const issueCsrfCookie = (res: Response) => {
  const csrfToken = crypto.randomBytes(32).toString('hex');
  res.cookie(CSRF_COOKIE, csrfToken, cookieOptions(false, 7 * 24 * 60 * 60 * 1000));
  return csrfToken;
};

export const clearSessionCookies = (res: Response) => {
  const options = cookieOptions(true, 0);
  res.clearCookie(ACCESS_COOKIE, options);
  res.clearCookie(CSRF_COOKIE, { ...options, httpOnly: false });
};
