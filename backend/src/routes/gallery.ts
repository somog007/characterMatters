import express from 'express';
import { auth } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { validateBody } from '../middleware/validators';
import { GalleryCreateSchema } from '../middleware/validation';
import { requireRole, canManageGallery } from '../middleware/authorization';
import { getGallery, createGalleryItem, updateGalleryItem, deleteGalleryItem } from '../controllers/galleryController';

const router = express.Router();

router.get('/', getGallery);
router.post('/', auth, requireRole('admin'), upload.single('file'), validateBody(GalleryCreateSchema), createGalleryItem);
router.put('/:id', auth, canManageGallery, updateGalleryItem);
router.delete('/:id', auth, canManageGallery, deleteGalleryItem);

export default router;
