import express from 'express';
import {
  getVideos,
  getVideo,
  createVideo,
  updateVideo,
  deleteVideo,
} from '../controllers/videoController';
import { auth, adminAuth } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = express.Router();

router.get('/', auth, getVideos);
router.get('/:id', auth, getVideo);
router.post('/', auth, adminAuth, upload.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'video', maxCount: 1 },
]), createVideo);
router.put('/:id', auth, adminAuth, updateVideo);
router.delete('/:id', auth, adminAuth, deleteVideo);

export default router;