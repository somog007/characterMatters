import express from 'express';
import {
  getAllVideos,
  getVideoById,
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

router.get('/', getAllVideos);
router.get('/:id', getVideoById);
router.post('/', auth, requireRole('ADMIN'), upload.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'video', maxCount: 1 },
]), validateBody(VideoCreateSchema), createVideo);
router.put('/:id', auth, canManageVideo, validateBody(VideoUpdateSchema), updateVideo);
router.delete('/:id', auth, canManageVideo, deleteVideo);

export default router;