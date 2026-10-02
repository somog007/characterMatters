import sgMail from '@sendgrid/mail';
import { Client } from '@sendgrid/client';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character] as string);

export const createEmailDispatchToken = (email: string, name: string, verificationUrl: string) => {
  if (!env.JWT_SECRET) {
    throw new Error('JWT_SECRET must be configured');
  }
  return jwt.sign(
    { email, name, verificationUrl },
    env.JWT_SECRET,
    { expiresIn: '10m', audience: 'email-verification-dispatch' }
  );
};

export const sendVerificationEmail = async (
  email: string,
  name: string,
  verificationUrl: string
) => {
  if (!env.SENDGRID_API_KEY || !env.SENDGRID_FROM_EMAIL) {
    throw new Error('SENDGRID_API_KEY and SENDGRID_FROM_EMAIL are required to send verification email');
  }

  const sendGridClient = new Client();
  sendGridClient.setApiKey(env.SENDGRID_API_KEY);
  if (env.SENDGRID_DATA_RESIDENCY === 'eu') {
    sendGridClient.setDataResidency('eu');
  }
  sgMail.setClient(sendGridClient);

  const safeName = escapeHtml(name);
  const safeVerificationUrl = escapeHtml(verificationUrl);
  await sgMail.send({
    to: email,
    from: env.SENDGRID_FROM_EMAIL,
    subject: 'Verify your Character Matters account',
    text: `Hello ${name}, verify your email address: ${verificationUrl}`,
    html: `
      <p>Hello ${safeName},</p>
      <p>Verify your email address to finish creating your Character Matters account.</p>
      <p><a href="${safeVerificationUrl}">Verify my email address</a></p>
      <p>This link expires in 24 hours. If you did not create an account, you can ignore this email.</p>
    `,
  });
};

export const enqueueVerificationEmail = async (
  email: string,
  name: string,
  verificationUrl: string
) => {
  if (env.NODE_ENV !== 'production') {
    await sendVerificationEmail(email, name, verificationUrl);
    return;
  }

  const dispatchToken = createEmailDispatchToken(email, name, verificationUrl);
  const canonicalHost = new URL(env.SITE_URL);
  if (!canonicalHost.hostname.startsWith('www.')) {
    canonicalHost.hostname = `www.${canonicalHost.hostname}`;
  }
  const dispatchUrl = new URL('/.netlify/functions/send-verification-background', canonicalHost);
  const response = await fetch(dispatchUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dispatchToken }),
    signal: AbortSignal.timeout(3_000),
  });

  if (!response.ok) {
    throw new Error(`Verification email background function returned HTTP ${response.status}`);
  }
};
