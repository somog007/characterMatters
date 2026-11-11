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
import { validateBody } from '../middleware/validators';
import { VideoCreateSchema, VideoUpdateSchema } from '../middleware/validation';

const router = express.Router();

router.get('/', getAllVideos);
router.get('/:id', getVideoById);
router.post('/', auth, requireRole('ADMIN'), validateBody(VideoCreateSchema), createVideo);
router.put('/:id', auth, canManageVideo, validateBody(VideoUpdateSchema), updateVideo);
router.delete('/:id', auth, canManageVideo, deleteVideo);

export default router;