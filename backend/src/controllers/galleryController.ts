import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../config/prisma';

export const getAllGalleryItems = async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '20', category, mediaType } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = { isPublished: true };
    if (category) where.category = category;
    if (mediaType) where.mediaType = mediaType;

    const [items, total] = await Promise.all([
      prisma.galleryItem.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.galleryItem.count({ where }),
    ]);

    res.json({
      items,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      total,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getGalleryItemById = async (req: Request, res: Response) => {
  try {
    const item = await prisma.galleryItem.findUnique({ where: { id: req.params.id } });
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
