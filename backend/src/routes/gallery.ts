import express from 'express';
import { auth } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { validateBody } from '../middleware/validators';
import { GalleryCreateSchema } from '../middleware/validation';
import { requireRole, canManageGallery } from '../middleware/authorization';
import { getAllGalleryItems, getGalleryItemById, createGalleryItem, updateGalleryItem, deleteGalleryItem } from '../controllers/galleryController';

const router = express.Router();

router.get('/', getAllGalleryItems);
router.get('/:id', getGalleryItemById);
router.post('/', auth, requireRole('ADMIN'), upload.single('file'), validateBody(GalleryCreateSchema), createGalleryItem);
router.put('/:id', auth, canManageGallery, updateGalleryItem);
router.delete('/:id', auth, canManageGallery, deleteGalleryItem);

export default router;
