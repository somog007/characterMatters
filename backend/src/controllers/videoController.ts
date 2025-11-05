import { Response } from 'express';
import Video from '../models/Video';
import { AuthRequest } from '../middleware/auth';

export const getVideos = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 10, category, accessLevel } = req.query;
    
    const filter: any = {};
    if (category) filter.category = category;
    if (accessLevel) filter.accessLevel = accessLevel;
    
    // For non-subscribers, only show free videos
    if (req.user?.role !== 'subscriber' && req.user?.role !== 'admin') {
      filter.accessLevel = 'free';
    }

    const videos = await Video.find(filter)
      .populate('category')
      .populate('createdBy', 'name')
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit))
      .sort({ createdAt: -1 });

    const total = await Video.countDocuments(filter);

    res.json({
      videos,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getVideo = async (req: AuthRequest, res: Response) => {
  try {
    const video = await Video.findById(req.params.id)
      .populate('category')
      .populate('createdBy', 'name avatar');

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Check access for premium videos
    if (video.accessLevel === 'premium' && 
        req.user?.role !== 'subscriber' && 
        req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Premium content requires subscription' });
    }

    // Increment views
    video.views += 1;
    await video.save();

    res.json(video);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const createVideo = async (req: AuthRequest, res: Response) => {
  try {
    const videoData = {
      ...req.body,
      createdBy: (req.user as any)?._id,
    };

    const video = new Video(videoData);
    await video.save();

    await video.populate('category');
    await video.populate('createdBy', 'name');

    res.status(201).json(video);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const updateVideo = async (req: AuthRequest, res: Response) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Check ownership or admin
    if (video.createdBy.toString() !== (req.user as any)?._id.toString() && req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedVideo = await Video.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('category').populate('createdBy', 'name');

    res.json(updatedVideo);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const deleteVideo = async (req: AuthRequest, res: Response) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Check ownership or admin
    if (video.createdBy.toString() !== (req.user as any)?._id.toString() && req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Video.findByIdAndDelete(req.params.id);
    res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};