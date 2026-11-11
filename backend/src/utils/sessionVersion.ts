import crypto from 'crypto';

/**
 * A short fingerprint of the user's current password hash, stored in the JWT.
 *
 * When the password changes, the fingerprint changes too, so every session
 * token issued before the change stops working (for example, a token stolen
 * before the user reset their password).
 */
export const sessionVersion = (passwordHash: string) =>
  crypto.createHash('sha256').update(passwordHash).digest('base64url').slice(0, 16);
