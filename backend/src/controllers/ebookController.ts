import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../config/prisma';

export const getAllEbooks = async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '20' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [ebooks, total] = await Promise.all([
      prisma.ebook.findMany({
        where: { isPublished: true },
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.ebook.count({ where: { isPublished: true } }),
    ]);

    res.json({
      ebooks,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      total,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getEbookById = async (req: Request, res: Response) => {
  try {
    const ebook = await prisma.ebook.findUnique({ where: { id: req.params.id } });
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