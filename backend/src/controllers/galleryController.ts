import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../config/prisma';

export const getAllGalleryItems = async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, Number.parseInt(String(req.query.page ?? '1'), 10) || 1);
    const limit = Math.min(100, Math.max(1, Number.parseInt(String(req.query.limit ?? '20'), 10) || 20));
    const skip = (page - 1) * limit;
    const { category, mediaType } = req.query;

    const where: any = { isPublished: true };
    if (category) where.category = category;
    if (mediaType) where.mediaType = mediaType;

    const [items, total] = await Promise.all([
      prisma.galleryItem.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.galleryItem.count({ where }),
    ]);

    res.json({
      items,
      page,
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getGalleryItemById = async (req: Request, res: Response) => {
  try {
    const item = await prisma.galleryItem.findFirst({ where: { id: req.params.id, isPublished: true } });
    if (!item) return res.status(404).json({ message: 'Gallery item not found' });

    res.json(item);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const createGalleryItem = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, category, mediaType, mediaUrl, thumbnailUrl, location, school, eventDate } = req.body;

    const item = await prisma.galleryItem.create({
      data: {
        title,
        description,
        category: category || 'Events',
        mediaType: mediaType || 'IMAGE',
        mediaUrl: mediaUrl || '',
        thumbnailUrl,
        location,
        school,
        eventDate: eventDate ? new Date(eventDate) : null,
      },
    });

    res.status(201).json(item);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateGalleryItem = async (req: AuthRequest, res: Response) => {
  try {
    const item = await prisma.galleryItem.findUnique({ where: { id: req.params.id } });
    if (!item) return res.status(404).json({ message: 'Gallery item not found' });

    const updated = await prisma.galleryItem.update({
      where: { id: req.params.id },
      data: req.body,
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteGalleryItem = async (req: AuthRequest, res: Response) => {
  try {
    const item = await prisma.galleryItem.findUnique({ where: { id: req.params.id } });
    if (!item) return res.status(404).json({ message: 'Gallery item not found' });

    await prisma.galleryItem.delete({ where: { id: req.params.id } });

    res.json({ message: 'Gallery item deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
