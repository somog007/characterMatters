const mockPrisma = {
  user: { findUnique: jest.fn() },
  lesson: { create: jest.fn() },
  galleryItem: { create: jest.fn() },
  ebook: { create: jest.fn() },
};

jest.mock('../config/prisma', () => ({
  __esModule: true,
  default: mockPrisma,
}));

import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import app from '../app';
import { env } from '../config/env';
import { sessionVersion } from '../utils/sessionVersion';

const SECRET = 'integration-test-secret-that-is-at-least-32-characters';
const OWN_VIDEO = 'https://res.cloudinary.com/demo-cloud/video/upload/v1/character_matters/lessons/kindness.mp4';

describe('Admin uploads to Cloudinary', () => {
  const admin = {
    id: 'admin-1', email: 'admin@example.com', fullName: 'Admin', passwordHash: 'hash',
    role: 'ADMIN', status: 'active', emailVerified: true,
  };
  const tokenFor = (user: typeof admin) =>
    jwt.sign({ userId: user.id, sv: sessionVersion(user.passwordHash) }, SECRET, { expiresIn: '1h' });
  const as = (user: typeof admin, req: request.Test) => req.set('Authorization', `Bearer ${tokenFor(user)}`);

  beforeAll(() => {
    env.JWT_SECRET = SECRET;
  });

  beforeEach(() => {
    Object.assign(env, {
      CLOUDINARY_CLOUD_NAME: 'demo-cloud',
      CLOUDINARY_API_KEY: '123456',
      CLOUDINARY_API_SECRET: 'cloudinary-test-secret',
    });
    mockPrisma.user.findUnique.mockResolvedValue(admin);
    mockPrisma.lesson.create.mockImplementation(async ({ data }: { data: object }) => ({ id: 'lesson-1', ...data }));
    mockPrisma.galleryItem.create.mockImplementation(async ({ data }: { data: object }) => ({ id: 'g-1', ...data }));
  });

  afterEach(() => jest.clearAllMocks());

  it('signs a video upload pinned to the lessons folder and video formats', async () => {
    const response = await as(admin, request(app).post('/api/admin/uploads/sign').send({ kind: 'video' }));
    expect(response.status).toBe(200);
    expect(response.body.uploadUrl).toBe('https://api.cloudinary.com/v1_1/demo-cloud/video/upload');

    const { signature, api_key: apiKey, ...signed } = response.body.fields;
    expect(apiKey).toBe('123456');
    expect(signed.folder).toBe('character_matters/lessons');
    expect(signed.allowed_formats).toBe('mp4,mov,webm,m4v');
    const expected = crypto
      .createHash('sha1')
      .update(Object.keys(signed).sort().map((key) => `${key}=${signed[key]}`).join('&') + 'cloudinary-test-secret')
      .digest('hex');
    expect(signature).toBe(expected);
    expect(JSON.stringify(response.body)).not.toContain('cloudinary-test-secret');
  });

  it('refuses to sign uploads for non-admins', async () => {
    const parent = { ...admin, id: 'parent-1', role: 'PARENT' };
    mockPrisma.user.findUnique.mockResolvedValue(parent);
    const response = await as(parent, request(app).post('/api/admin/uploads/sign').send({ kind: 'video' }));
    expect(response.status).toBe(403);
  });

  it('rejects an unknown upload kind', async () => {
    const response = await as(admin, request(app).post('/api/admin/uploads/sign').send({ kind: 'anything' }));
    expect(response.status).toBe(400);
  });

  it('explains when Cloudinary is not configured', async () => {
    delete env.CLOUDINARY_API_SECRET;
    const response = await as(admin, request(app).post('/api/admin/uploads/sign').send({ kind: 'thumbnail' }));
    expect(response.status).toBe(503);
    expect(response.body.message).toMatch(/Cloudinary/);
  });

  it('creates a lesson with its HLS stream address', async () => {
    const response = await as(admin, request(app).post('/api/videos').send({
      title: 'Kindness',
      description: 'A lesson about being kind to others.',
      ageGroup: 'PRE_K',
      accessTier: 'GOLD',
      videoUrl: OWN_VIDEO,
    }));
    expect(response.status).toBe(201);
    expect(mockPrisma.lesson.create.mock.calls[0][0].data).toMatchObject({
      videoUrl: OWN_VIDEO,
      hlsManifestPath: 'https://res.cloudinary.com/demo-cloud/video/upload/sp_auto/v1/character_matters/lessons/kindness.m3u8',
    });
  });

  it.each([
    ['another Cloudinary account', 'https://res.cloudinary.com/someone-else/video/upload/v1/x.mp4'],
    ['another website', 'https://attacker.example/video.mp4'],
    ['plain http', 'http://res.cloudinary.com/demo-cloud/video/upload/v1/x.mp4'],
  ])('rejects media from %s', async (_label, videoUrl) => {
    const response = await as(admin, request(app).post('/api/videos').send({
      title: 'Kindness', description: 'A lesson about being kind to others.', videoUrl,
    }));
    expect(response.status).toBe(400);
    expect(mockPrisma.lesson.create).not.toHaveBeenCalled();
  });

  it('saves the uploaded media URL on a gallery item', async () => {
    const mediaUrl = 'https://res.cloudinary.com/demo-cloud/image/upload/v1/character_matters/gallery/day.jpg';
    const response = await as(admin, request(app).post('/api/gallery').send({
      title: 'Sports day', category: 'Events', mediaType: 'IMAGE', mediaUrl,
    }));
    expect(response.status).toBe(201);
    expect(mockPrisma.galleryItem.create.mock.calls[0][0].data.mediaUrl).toBe(mediaUrl);
  });
});
