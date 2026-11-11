import type { Request } from 'express';

/**
 * The visitor's IP address.
 *
 * On Netlify, every request reaches the function through Netlify's edge, which
 * sets `x-nf-client-connection-ip` to the real client address (a client cannot
 * override it). Locally, Express's `req.ip` is used instead.
 */
export const getClientIp = (req: Request): string => {
  const netlifyIp = req.headers['x-nf-client-connection-ip'];
  if (typeof netlifyIp === 'string' && netlifyIp.trim()) return netlifyIp.trim();
  return req.ip || req.socket?.remoteAddress || '0.0.0.0';
};
