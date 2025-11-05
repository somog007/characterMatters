import express from 'express';
import {
  getEBooks,
  getEBook,
  createEBook,
  purchaseEBook,
} from '../controllers/ebookController';
import { auth, adminAuth } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = express.Router();

router.get('/', getEBooks);
router.get('/:id', auth, getEBook);
router.post('/', auth, adminAuth, upload.fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'ebookFile', maxCount: 1 },
]), createEBook);
router.post('/:id/purchase', auth, purchaseEBook);

export default router;