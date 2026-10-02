import { randomUUID } from 'node:crypto';

const configuredSiteUrl = new URL(
  process.env.SMOKE_TEST_SITE_URL || 'https://www.charactermattersng.org'
);
if (configuredSiteUrl.hostname.toLowerCase() === 'charactermattersng.org') {
  configuredSiteUrl.hostname = 'www.charactermattersng.org';
}
const siteUrl = configuredSiteUrl.toString().replace(/\/$/, '');
const loginEmail = process.env.SMOKE_TEST_EMAIL;
const loginPassword = process.env.SMOKE_TEST_PASSWORD;

if (!loginEmail || !loginPassword) {
  console.error('Set SMOKE_TEST_EMAIL and SMOKE_TEST_PASSWORD to a verified test account before running.');
  process.exit(1);
}

const fail = (message) => {
  console.error(`FAIL: ${message}`);
  process.exitCode = 1;
};

const request = async (path, body) => {
  const response = await fetch(`${siteUrl}/api/auth/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(8_000),
  });
  let responseBody = {};
  try {
    responseBody = await response.json();
  } catch {
    throw new Error(`${path} returned a non-JSON response (${response.status})`);
  }
  return { response, body: responseBody };
};

const [localPart, domain] = loginEmail.split('@');
if (!localPart || !domain) {
  console.error('SMOKE_TEST_EMAIL must be a valid email address.');
  process.exit(1);
}
const signupEmail = `${localPart}+auth-smoke-${Date.now()}@${domain}`;
const signupBody = {
  name: 'Character Matters Auth Smoke Test',
  email: signupEmail,
  password: `${randomUUID()}-Aa1`,
};

try {
  console.log(`Testing auth endpoints at ${siteUrl}`);

  const signup = await request('register', signupBody);
  if (signup.response.status !== 201 || signup.body.emailVerificationRequired !== true) {
    fail(`Signup expected 201 with email verification required; received ${signup.response.status}.`);
  } else {
    console.log('PASS: signup creates a pending account');
  }

  const duplicate = await request('register', signupBody);
  if (duplicate.response.status !== 409) {
    fail(`Duplicate signup expected 409; received ${duplicate.response.status}.`);
  } else {
    console.log('PASS: duplicate signup returns 409');
  }

  const unverifiedLogin = await request('login', {
    email: signupEmail,
    password: signupBody.password,
  });
  if (unverifiedLogin.response.status !== 403
    || unverifiedLogin.body.code !== 'EMAIL_VERIFICATION_REQUIRED') {
    fail(`Unverified login expected 403 EMAIL_VERIFICATION_REQUIRED; received ${unverifiedLogin.response.status}.`);
  } else {
    console.log('PASS: login is blocked until email verification');
  }

  const login = await request('login', { email: loginEmail, password: loginPassword });
  if (login.response.status !== 200 || !login.body.user) {
    fail(`Verified login expected 200; received ${login.response.status}.`);
  } else {
    console.log('PASS: verified account can log in');
  }

  const badPassword = await request('login', {
    email: loginEmail,
    password: `${loginPassword}-incorrect`,
  });
  if (badPassword.response.status !== 400) {
    fail(`Incorrect password expected 400; received ${badPassword.response.status}.`);
  } else {
    console.log('PASS: incorrect password is rejected');
  }

  console.log(`The signup check created an unverified test account: ${signupEmail}`);
} catch (error) {
  fail(error instanceof Error ? error.message : 'Unexpected request failure');
}
