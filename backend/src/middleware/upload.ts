import multer from 'multer';
import os from 'os';
import path from 'path';
import fs from 'fs';
import { Request, Response, NextFunction } from 'express';

// Local file storage (staging area before Cloudinary upload)
const uploadDir = path.join(os.tmpdir(), 'character-matters-uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req: any, _file: any, cb: any) => {
    cb(null, uploadDir);
  },
  filename: (_req: any, file: any, cb: any) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${extension}`);
  },
});

// Multer configuration
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (_req: any, file: any, cb: any) => {
    // Check file types
    if (file.fieldname === 'video') {
      if (file.mimetype.startsWith('video/')) {
        cb(null, true);
      } else {
        cb(new Error('Only video files are allowed'));
      }
    } else if (file.fieldname === 'ebookFile') {
      if (file.mimetype === 'application/pdf') {
        cb(null, true);
      } else {
        cb(new Error('Only PDF files are allowed'));
      }
    } else if (file.fieldname === 'thumbnail' || file.fieldname === 'coverImage' || file.fieldname === 'galleryImage') {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed'));
      }
    } else if (file.fieldname === 'galleryVideo') {
      if (file.mimetype.startsWith('video/')) {
        cb(null, true);
      } else {
        cb(new Error('Only video files are allowed'));
      }
    } else if (file.fieldname === 'file') {
      if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image or video files are allowed'));
      }
    } else {
      cb(new Error('Unexpected field'));
    }
  },
});

export const cleanupUploadedFiles = (req: Request, res: Response, next: NextFunction) => {
  let cleaned = false;
  const cleanup = () => {
    if (cleaned) return;
    cleaned = true;

    const files = req.files;
    const uploadedFiles = [
      ...(req.file ? [req.file] : []),
      ...(Array.isArray(files) ? files : files ? Object.values(files).flat() : []),
    ] as Array<{ path?: string }>;

    for (const file of uploadedFiles) {
      if (file.path) void fs.promises.unlink(file.path).catch(() => undefined);
    }
  };

  res.once('finish', cleanup);
  res.once('close', cleanup);

  next();
};