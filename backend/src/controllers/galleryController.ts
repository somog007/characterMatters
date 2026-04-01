import { Response } from 'express';
import Gallery from '../models/Gallery';
import { AuthRequest } from '../middleware/auth';

export const getGallery = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 20, mediaType, school, location, search, category } = req.query;
    const filter: any = {};

    if (mediaType) filter.mediaType = mediaType;
    if (school) filter.school = { $regex: school, $options: 'i' };
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { school: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    const items = await Gallery.find(filter)
      .populate('createdBy', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Gallery.countDocuments(filter);

    res.json({ items, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const createGalleryItem = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { title, description, location, school, eventDate, mediaType, thumbnail, category } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: 'Media file is required' });
    }

    const url = (file as any).location || (file as any).path || '';

    const item = new Gallery({
      title,
      description,
      location,
      school,
      category,
      eventDate: eventDate ? new Date(eventDate) : undefined,
      mediaType,
      url,
      thumbnail,
      createdBy: req.user._id,
    });

    await item.save();
    res.status(201).json(item);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateGalleryItem = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const update = await Gallery.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!update) return res.status(404).json({ message: 'Gallery item not found' });

    res.json(update);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteGalleryItem = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Gallery.findByIdAndDelete(req.params.id);
    res.json({ message: 'Gallery item removed' });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
