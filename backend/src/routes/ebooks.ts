import express from 'express';
import {
  getAllEbooks,
  getEbookById,
  createEbook,
  updateEbook,
  deleteEbook,
} from '../controllers/ebookController';
import { auth, adminAuth } from '../middleware/auth';
import { cleanupUploadedFiles, upload } from '../middleware/upload';

const router = express.Router();

router.get('/', getAllEbooks);
router.get('/:id', getEbookById);
router.post('/', auth, adminAuth, cleanupUploadedFiles, upload.fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'ebookFile', maxCount: 1 },
]), createEbook);
router.put('/:id', auth, adminAuth, updateEbook);
router.delete('/:id', auth, adminAuth, deleteEbook);

export default router;