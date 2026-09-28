import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../config/prisma';

export const getAllEbooks = async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, Number.parseInt(String(req.query.page ?? '1'), 10) || 1);
    const limit = Math.min(100, Math.max(1, Number.parseInt(String(req.query.limit ?? '20'), 10) || 20));
    const skip = (page - 1) * limit;

    const [ebooks, total] = await Promise.all([
      prisma.ebook.findMany({
        where: { isPublished: true },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          description: true,
          author: true,
          coverUrl: true,
          price: true,
          accessTier: true,
          createdAt: true,
        },
      }),
      prisma.ebook.count({ where: { isPublished: true } }),
    ]);

    res.json({
      ebooks,
      page,
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getEbookById = async (req: Request, res: Response) => {
  try {
    const ebook = await prisma.ebook.findFirst({
      where: { id: req.params.id, isPublished: true },
      select: {
        id: true,
        title: true,
        description: true,
        author: true,
        coverUrl: true,
        price: true,
        accessTier: true,
        createdAt: true,
      },
    });
    if (!ebook) return res.status(404).json({ message: 'eBook not found' });

    res.json(ebook);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const createEbook = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, author, price, accessTier, coverUrl, fileUrl } = req.body;

    const ebook = await prisma.ebook.create({
      data: {
        title,
        description,
        author,
        price: price || 0,
        accessTier: accessTier || 'BRONZE',
        coverUrl,
        fileUrl,
      },
    });

    res.status(201).json(ebook);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateEbook = async (req: AuthRequest, res: Response) => {
  try {
    const ebook = await prisma.ebook.findUnique({ where: { id: req.params.id } });
    if (!ebook) return res.status(404).json({ message: 'eBook not found' });

    const updated = await prisma.ebook.update({
      where: { id: req.params.id },
      data: req.body,
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteEbook = async (req: AuthRequest, res: Response) => {
  try {
    const ebook = await prisma.ebook.findUnique({ where: { id: req.params.id } });
    if (!ebook) return res.status(404).json({ message: 'eBook not found' });

    await prisma.ebook.delete({ where: { id: req.params.id } });

    res.json({ message: 'eBook deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};