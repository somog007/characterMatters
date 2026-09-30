import request from 'supertest';
import app from '../app';
import prisma from '../config/prisma';

jest.mock('../config/prisma', () => ({
  __esModule: true,
  default: {
    galleryItem: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  },
}));

const mockPrisma = prisma as unknown as {
  galleryItem: {
    findMany: jest.Mock;
    count: jest.Mock;
  };
};

describe('Public gallery listing', () => {
  beforeEach(() => {
    mockPrisma.galleryItem.findMany.mockResolvedValue([]);
    mockPrisma.galleryItem.count.mockResolvedValue(0);
  });

  it('GET /api/gallery is available without a token', async () => {
    const res = await request(app).get('/api/gallery');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('items');
  });
});
