import express from 'express';
import {
  getVideos,
  getVideo,
  createVideo,
  updateVideo,
  deleteVideo,
} from '../controllers/videoController';
import { auth } from '../middleware/auth';
import { requireRole, canManageVideo } from '../middleware/authorization';
import { upload } from '../middleware/upload';
import { validateBody } from '../middleware/validators';
import { VideoCreateSchema, VideoUpdateSchema } from '../middleware/validation';

const router = express.Router();

router.get('/', auth, getVideos);
router.get('/:id', auth, getVideo);
router.post('/', auth, requireRole('admin'), upload.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'video', maxCount: 1 },
]), validateBody(VideoCreateSchema), createVideo);
router.put('/:id', auth, canManageVideo, validateBody(VideoUpdateSchema), updateVideo);
router.delete('/:id', auth, canManageVideo, deleteVideo);

export default router;