import express from 'express';
import { auth } from '../middleware/auth';
import { validateBody } from '../middleware/validators';
import { GalleryCreateSchema, GalleryUpdateSchema } from '../middleware/validation';
import { requireRole, canManageGallery } from '../middleware/authorization';
import { getAllGalleryItems, getGalleryItemById, createGalleryItem, updateGalleryItem, deleteGalleryItem } from '../controllers/galleryController';

const router = express.Router();

router.get('/', getAllGalleryItems);
router.get('/:id', getGalleryItemById);
router.post('/', auth, requireRole('ADMIN'), validateBody(GalleryCreateSchema), createGalleryItem);
router.put('/:id', auth, canManageGallery, validateBody(GalleryUpdateSchema), updateGalleryItem);
router.delete('/:id', auth, canManageGallery, deleteGalleryItem);

export default router;
