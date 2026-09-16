import { Router } from 'express';
import { auth } from '../middleware/auth';
import { authorizeVideoCategoryAccess } from '../middleware/videoAccessMiddleware';
import { createPlaybackSession } from '../controllers/playbackController';
import { getHLSKey } from '../controllers/keyProxyController';

const router = Router();

// Create authenticated video playback session & issue CDN signed manifest token
router.post(
  '/:videoId/playback-session',
  auth as any,
  authorizeVideoCategoryAccess as any,
  createPlaybackSession as any
);

// Authenticated HLS Key Proxy endpoint
router.get(
  '/hls-key',
  auth as any,
  getHLSKey as any
);

export default router;
