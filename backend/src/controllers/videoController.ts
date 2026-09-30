import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../config/prisma';
import { handleControllerError } from '../utils/handleControllerError';

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
      videos: videos.map((v: any) => ({
        id: v.id,
        title: v.title,
        description: v.description,
        ageGroup: v.ageGroup,
        accessTier: v.accessTier,
        thumbnailUrl: v.thumbnailUrl,
        durationSeconds: v.durationSeconds,
        price: v.price ? Number(v.price) : 50000,
        createdAt: v.createdAt,
        category: v.category,
      })),
      page,
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    handleControllerError(res, 'Video listing failed', error);
  }
};

export const getVideoById = async (req: Request, res: Response) => {
  try {
    const video = await prisma.lesson.findUnique({
      where: { id: req.params.id, isPublished: true },
      include: { category: true },
    });

    if (!video) return res.status(404).json({ message: 'Video not found' });

    const { id, title, description, ageGroup, accessTier, thumbnailUrl, durationSeconds, price, createdAt, category } = video as any;
    res.json({
      id,
      title,
      description,
      ageGroup,
      accessTier,
      thumbnailUrl,
      durationSeconds,
      price: price ? Number(price) : 50000,
      createdAt,
      category,
    });
  } catch (error) {
    handleControllerError(res, 'Video retrieval failed', error);
  }
};

export const createVideo = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, ageGroup, accessTier, videoUrl, thumbnailUrl, worksheetUrl, durationSeconds, price, categoryId } = req.body;

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
        price: price || 50000,
        categoryId,
      },
    });

    res.status(201).json(video);
  } catch (error) {
    handleControllerError(res, 'Video creation failed', error);
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
  } catch (error) {
    handleControllerError(res, 'Video update failed', error);
  }
};

export const deleteVideo = async (req: AuthRequest, res: Response) => {
  try {
    const video = await prisma.lesson.findUnique({ where: { id: req.params.id } });
    if (!video) return res.status(404).json({ message: 'Video not found' });

    await prisma.lesson.delete({ where: { id: req.params.id } });

    res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    handleControllerError(res, 'Video deletion failed', error);
  }
};