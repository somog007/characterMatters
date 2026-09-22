import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../config/prisma';

export const getAllVideos = async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '20', ageGroup, accessTier } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = { isPublished: true };
    if (ageGroup) where.ageGroup = ageGroup;
    if (accessTier) where.accessTier = accessTier;

    const [videos, total] = await Promise.all([
      prisma.lesson.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: { category: true },
      }),
      prisma.lesson.count({ where }),
    ]);

    res.json({
      videos,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      total,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getVideoById = async (req: Request, res: Response) => {
  try {
    const video = await prisma.lesson.findUnique({
      where: { id: req.params.id },
      include: { category: true },
    });

    if (!video) return res.status(404).json({ message: 'Video not found' });

    res.json(video);
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