import { Response } from 'express';
import cloudinary from '../config/cloudinary';
import { env } from '../config/env';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../middleware/logger';

/**
 * Admin uploads go straight from the browser to Cloudinary. Netlify Functions
 * cannot receive request bodies larger than about 6 MB, so files never pass
 * through the API. The API only signs each upload, which pins the folder, the
 * resource type and the allowed formats; Cloudinary rejects anything else.
 */
export const UPLOAD_KINDS = {
  video: { resourceType: 'video', folder: 'character_matters/lessons', formats: 'mp4,mov,webm,m4v', eagerHls: true },
  thumbnail: { resourceType: 'image', folder: 'character_matters/thumbnails', formats: 'jpg,jpeg,png,webp' },
  worksheet: { resourceType: 'image', folder: 'character_matters/worksheets', formats: 'pdf' },
  ebookCover: { resourceType: 'image', folder: 'character_matters/ebook_covers', formats: 'jpg,jpeg,png,webp' },
  ebookFile: { resourceType: 'image', folder: 'character_matters/ebooks', formats: 'pdf' },
  galleryImage: { resourceType: 'image', folder: 'character_matters/gallery', formats: 'jpg,jpeg,png,webp' },
  galleryVideo: { resourceType: 'video', folder: 'character_matters/gallery', formats: 'mp4,mov,webm,m4v' },
} as const;

export type UploadKind = keyof typeof UPLOAD_KINDS;
export const UPLOAD_KIND_NAMES = Object.keys(UPLOAD_KINDS) as [UploadKind, ...UploadKind[]];

export const isCloudinaryConfigured = () =>
  Boolean(env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET);

/** True for a delivery URL in this site's own Cloudinary account. */
export const isOwnCloudinaryUrl = (value: string) => {
  if (!env.CLOUDINARY_CLOUD_NAME) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' &&
      url.hostname === 'res.cloudinary.com' &&
      url.pathname.startsWith(`/${env.CLOUDINARY_CLOUD_NAME}/`);
  } catch {
    return false;
  }
};

/** The adaptive-streaming (HLS) address Cloudinary serves for an uploaded video. */
export const hlsUrlFor = (videoUrl: string) => {
  const url = new URL(videoUrl);
  url.pathname = url.pathname
    .replace('/video/upload/', '/video/upload/sp_auto/')
    .replace(/\.[a-z0-9]+$/i, '.m3u8');
  return url.toString();
};

export const signUpload = (req: AuthRequest, res: Response) => {
  if (!isCloudinaryConfigured()) {
    logger.error({ message: 'Upload signing requested but Cloudinary environment variables are missing' });
    return res.status(503).json({
      message: 'Uploads are not set up yet: add the Cloudinary keys in Netlify and redeploy.',
    });
  }

  const kind = UPLOAD_KINDS[req.body.kind as UploadKind];
  const timestamp = Math.round(Date.now() / 1000);
  const params: Record<string, string | number> = {
    allowed_formats: kind.formats,
    folder: kind.folder,
    timestamp,
  };
  if ('eagerHls' in kind && kind.eagerHls) {
    // Prepare the streaming version in the background so playback starts quickly.
    params.eager = 'sp_auto/m3u8';
    params.eager_async = 'true';
  }

  const signature = cloudinary.utils.api_sign_request(params, env.CLOUDINARY_API_SECRET!);
  return res.json({
    uploadUrl: `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/${kind.resourceType}/upload`,
    fields: { ...params, api_key: env.CLOUDINARY_API_KEY, signature },
  });
};
