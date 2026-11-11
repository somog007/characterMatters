import express from 'express';
import {
  getAllEbooks,
  getEbookById,
  createEbook,
  updateEbook,
  deleteEbook,
} from '../controllers/ebookController';
import { auth, adminAuth } from '../middleware/auth';
import { validateBody } from '../middleware/validators';
import { EbookCreateSchema, EbookUpdateSchema } from '../middleware/validation';

const router = express.Router();

router.get('/', getAllEbooks);
router.get('/:id', getEbookById);
router.post('/', auth, adminAuth, validateBody(EbookCreateSchema), createEbook);
router.put('/:id', auth, adminAuth, validateBody(EbookUpdateSchema), updateEbook);
router.delete('/:id', auth, adminAuth, deleteEbook);

export default router;