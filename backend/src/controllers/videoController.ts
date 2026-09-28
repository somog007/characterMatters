import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../config/prisma';

export const getAllVideos = async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, Number.parseInt(String(req.query.page ?? '1'), 10) || 1);
    const limit = Math.min(100, Math.max(1, Number.parseInt(String(req.query.limit ?? '20'), 10) || 20));
    const skip = (page - 1) * limit;
    const { ageGroup, accessTier } = req.query;

    const where: any = { isPublished: true };
    if (ageGroup) where.ageGroup = ageGroup;
    if (accessTier) where.accessTier = accessTier;

    const [videos, total] = await Promise.all([
      prisma.lesson.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { category: true },
      }),
      prisma.lesson.count({ where }),
    ]);

    res.json({
      videos: videos.map(({ id, title, description, ageGroup: group, accessTier: tier, thumbnailUrl, durationSeconds, createdAt, category }) => ({
        id,
        title,
        description,
        ageGroup: group,
        accessTier: tier,
        thumbnailUrl,
        durationSeconds,
        createdAt,
        category,
      })),
      page,
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getVideoById = async (req: Request, res: Response) => {
  try {
    const video = await prisma.lesson.findUnique({
      where: { id: req.params.id, isPublished: true },
      include: { category: true },
    });

    if (!video) return res.status(404).json({ message: 'Video not found' });

    const { id, title, description, ageGroup, accessTier, thumbnailUrl, durationSeconds, createdAt, category } = video;
    res.json({ id, title, description, ageGroup, accessTier, thumbnailUrl, durationSeconds, createdAt, category });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const createVideo = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, ageGroup, accessTier, videoUrl, thumbnailUrl, worksheetUrl, durationSeconds, categoryId } = req.body;

    const video = await prisma.lesson.create({
      data: {
        title,
        description,
        ageGroup: ageGroup || 'TODDLER',
        accessTier: accessTier || 'BRONZE',
        videoUrl: videoUrl || '',
        thumbnailUrl,
        worksheetUrl,
        durationSeconds: durationSeconds || 0,
        categoryId,
      },
    });

    res.status(201).json(video);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateVideo = async (req: AuthRequest, res: Response) => {
  try {
    const video = await prisma.lesson.findUnique({ where: { id: req.params.id } });
    if (!video) return res.status(404).json({ message: 'Video not found' });

    const updated = await prisma.lesson.update({
      where: { id: req.params.id },
      data: req.body,
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteVideo = async (req: AuthRequest, res: Response) => {
  try {
    const video = await prisma.lesson.findUnique({ where: { id: req.params.id } });
    if (!video) return res.status(404).json({ message: 'Video not found' });

    await prisma.lesson.delete({ where: { id: req.params.id } });

    res.json({ message: 'Video deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};