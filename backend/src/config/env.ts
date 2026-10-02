import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const postgresConnectionString = z.string()
  .min(1)
  .refine(
    (value) => /^postgres(?:ql)?:\/\//i.test(value),
    'Must use a standard postgres:// or postgresql:// connection string for @prisma/adapter-pg'
  );

const environmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: postgresConnectionString.optional(),
  DATABASE_URL_POOLED: postgresConnectionString.optional(),
  DIRECT_URL: postgresConnectionString.optional(),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must contain at least 32 characters').optional(),
  JWT_EXPIRES_IN: z.enum(['15m', '1h', '6h', '12h', '1d', '7d', '30d']).default('7d'),
  SITE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  NEXT_PUBLIC_API_URL: z.string().refine(
    (value) => value.startsWith('/') || z.string().url().safeParse(value).success,
    'NEXT_PUBLIC_API_URL must be a relative path or absolute URL'
  ).optional(),
  API_URL: z.string().url().optional(),
  SENDGRID_API_KEY: z.string().startsWith('SG.').optional(),
  SENDGRID_FROM_EMAIL: z.string().email().optional(),
  SENDGRID_DATA_RESIDENCY: z.enum(['eu']).optional(),
  SENTRY_DSN: z.string().url().optional(),
  REDIS_URL: z.string().url().optional(),
  PORT: z.coerce.number().int().positive().optional(),
  PAYSTACK_SECRET_KEY: z.string().optional(),
  PAYSTACK_PUBLIC_KEY: z.string().optional(),
  PAYSTACK_CALLBACK_URL: z.string().url().optional(),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  CDN_SIGNING_SECRET: z.string().optional(),
  HLS_AES_128_MASTER_KEY: z.string().optional(),
  INITIAL_ADMIN_PASSWORD: z.string().optional(),
  INITIAL_WEAVERS_PASSWORD: z.string().optional(),
  NETLIFY: z.string().optional(),
  AWS_LAMBDA_FUNCTION_NAME: z.string().optional(),
  SERVERLESS: z.string().optional(),
  VERCEL: z.string().optional(),
}).superRefine((environment, context) => {
  const requiredInProduction = [
    ['DATABASE_URL', environment.DATABASE_URL || environment.DATABASE_URL_POOLED],
    ['JWT_SECRET', environment.JWT_SECRET],
    ['SITE_URL', environment.SITE_URL],
    ['SENDGRID_API_KEY', environment.SENDGRID_API_KEY],
    ['SENDGRID_FROM_EMAIL', environment.SENDGRID_FROM_EMAIL],
  ] as const;

  if (environment.NODE_ENV === 'production') {
    for (const [name, value] of requiredInProduction) {
      if (!value) {
        context.addIssue({
          code: 'custom',
          path: [name],
          message: `${name} is required in production`,
        });
      }
    }

    if (environment.JWT_SECRET && environment.JWT_SECRET.length < 32) {
      context.addIssue({
        code: 'custom',
        path: ['JWT_SECRET'],
        message: 'JWT_SECRET must contain at least 32 characters',
      });
    }

    if (environment.SITE_URL && !environment.SITE_URL.startsWith('https://')) {
      context.addIssue({
        code: 'custom',
        path: ['SITE_URL'],
        message: 'SITE_URL must use HTTPS in production',
      });
    }

    for (const [name, value] of [
      ['DATABASE_URL', environment.DATABASE_URL],
      ['DATABASE_URL_POOLED', environment.DATABASE_URL_POOLED],
      ['DIRECT_URL', environment.DIRECT_URL],
      ['SITE_URL', environment.SITE_URL],
      ['NEXT_PUBLIC_SITE_URL', environment.NEXT_PUBLIC_SITE_URL],
      ['NEXT_PUBLIC_API_URL', environment.NEXT_PUBLIC_API_URL],
      ['API_URL', environment.API_URL],
      ['REDIS_URL', environment.REDIS_URL],
      ['PAYSTACK_CALLBACK_URL', environment.PAYSTACK_CALLBACK_URL],
    ] as const) {
      if (value && /localhost|127\.0\.0\.1/i.test(value)) {
        context.addIssue({
          code: 'custom',
          path: [name],
          message: `${name} must not point to localhost or 127.0.0.1 in production`,
        });
      }
    }

    if (environment.NEXT_PUBLIC_API_URL && environment.NEXT_PUBLIC_API_URL !== '/api') {
      context.addIssue({
        code: 'custom',
        path: ['NEXT_PUBLIC_API_URL'],
        message: 'Use the same-origin /api path so secure cookies remain first-party',
      });
    }

    if (environment.SENDGRID_FROM_EMAIL && environment.SITE_URL) {
      const siteDomain = new URL(environment.SITE_URL).hostname.replace(/^www\./i, '').toLowerCase();
      const senderDomain = environment.SENDGRID_FROM_EMAIL.split('@')[1]?.toLowerCase();
      if (senderDomain !== siteDomain) {
        context.addIssue({
          code: 'custom',
          path: ['SENDGRID_FROM_EMAIL'],
          message: `Sender must use the authenticated ${siteDomain} domain`,
        });
      }
    }
  }

});

const normalizedEnvironment = Object.fromEntries(
  Object.entries(process.env).map(([key, value]) => [key, value === '' ? undefined : value])
);
const result = environmentSchema.safeParse(normalizedEnvironment);

if (!result.success) {
  const issues = result.error.issues
    .map(({ path, message }) => `- ${path.join('.') || 'environment'}: ${message}`)
    .join('\n');
  throw new Error(`Invalid environment configuration:\n${issues}`);
}

const parsedEnvironment = result.data;
const siteUrl = parsedEnvironment.SITE_URL ?? 'http://localhost:3001';

export const env = {
  ...parsedEnvironment,
  SITE_URL: siteUrl,
  NEXT_PUBLIC_SITE_URL: parsedEnvironment.NEXT_PUBLIC_SITE_URL ?? siteUrl,
  API_URL: parsedEnvironment.API_URL ?? `${siteUrl.replace(/\/$/, '')}/api`,
  databaseUrl: parsedEnvironment.DATABASE_URL_POOLED ?? parsedEnvironment.DATABASE_URL,
};

export const isProduction = () => env.NODE_ENV === 'production';
