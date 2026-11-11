import { z } from 'zod';
import { PLAN_IDS } from '../config/plans';
import { UPLOAD_KIND_NAMES, isOwnCloudinaryUrl } from '../controllers/uploadController';

// Profile pictures are stored as small data URLs (the browser resizes them to
// 256x256 first). Only PNG, JPEG and WebP are accepted, and the file's first
// bytes must match the declared type, so SVG/HTML or scripts cannot be smuggled in.
export const MAX_AVATAR_DATA_URL_LENGTH = 400_000; // about 300 KB of image data
const avatarSignatures: Record<string, (bytes: Buffer) => boolean> = {
  png: (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  jpeg: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  webp: (b) => b.subarray(0, 4).toString('latin1') === 'RIFF' && b.subarray(8, 12).toString('latin1') === 'WEBP',
};
const avatarSchema = z
  .string()
  .max(MAX_AVATAR_DATA_URL_LENGTH, 'Profile picture is too large')
  .refine((value) => {
    const match = /^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(value);
    if (!match) return false;
    const header = Buffer.from(match[2].slice(0, 24), 'base64');
    return avatarSignatures[match[1]](header);
  }, 'Profile picture must be a PNG, JPEG or WebP image')
  .nullable();

// Media must live in this site's own Cloudinary account (uploaded via /api/admin/uploads/sign).
const cloudinaryUrl = z.string().trim().max(2048)
  .refine(isOwnCloudinaryUrl, 'Must be a file uploaded to this site’s Cloudinary account');
const optionalHttpsUrl = cloudinaryUrl.optional();

export const UploadSignSchema = z.object({
  kind: z.enum(UPLOAD_KIND_NAMES),
});

const passwordSchema = z
  .string()
  .min(12)
  .max(72)
  .refine((password) => Buffer.byteLength(password, 'utf8') <= 72, {
    message: 'Password must be 72 UTF-8 bytes or fewer',
  });

export const AuthRegisterSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().transform((email) => email.toLowerCase()),
  password: passwordSchema,
  accountType: z.enum(['PARENT', 'SCHOOL']).default('PARENT'),
  schoolName: z.string().trim().min(2).max(160).optional(),
}).refine(
  (data) => data.accountType !== 'SCHOOL' || Boolean(data.schoolName),
  { path: ['schoolName'], message: 'School name is required for school accounts' }
);

export const AuthLoginSchema = z.object({
  email: z.string().trim().email().transform((email) => email.toLowerCase()),
  password: z.string().min(6).max(128),
});

export const AuthResendVerificationSchema = z.object({
  email: z.string().trim().email().transform((email) => email.toLowerCase()),
});

export const AuthVerifyEmailSchema = z.object({
  token: z.string().min(32).max(256),
});

export const AuthChangePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(128),
  newPassword: passwordSchema,
});

export const AuthUpdateProfileSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  avatar: avatarSchema.optional(),
});

export const UserCreateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  password: passwordSchema,
});

// Roles are changed only through the admin role endpoint, never here.
export const UserUpdateSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  avatar: avatarSchema.optional(),
});

export const AdminRoleUpdateSchema = z.object({
  role: z.enum(['USER', 'PARENT', 'TEACHER', 'SCHOOL_ADMIN', 'ADMIN']),
});

export const VideoCreateSchema = z.object({
  title: z.string().trim().min(3, 'Title required').max(200),
  description: z.string().trim().min(10, 'Description required').max(4000),
  ageGroup: z.enum(['TODDLER', 'PRE_K', 'SCHOOL_AGE']).optional(),
  accessTier: z.enum(['BRONZE', 'SILVER', 'GOLD', 'SAPPHIRE', 'DIAMOND', 'PLATINUM']).optional(),
  videoUrl: cloudinaryUrl,
  thumbnailUrl: optionalHttpsUrl,
  worksheetUrl: optionalHttpsUrl,
  durationSeconds: z.coerce.number().int().min(0).max(24 * 60 * 60).optional(),
});

export const VideoUpdateSchema = z.object({
  title: z.string().trim().min(3).max(200).optional(),
  description: z.string().trim().min(10).max(4000).optional(),
  ageGroup: z.enum(['TODDLER', 'PRE_K', 'SCHOOL_AGE']).optional(),
  accessTier: z.enum(['BRONZE', 'SILVER', 'GOLD', 'SAPPHIRE', 'DIAMOND', 'PLATINUM']).optional(),
  durationSeconds: z.coerce.number().min(0).optional(),
});

export const GalleryCreateSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  category: z.enum(['Events', 'School Seminars']),
  location: z.string().optional(),
  school: z.string().optional(),
  eventDate: z.string().optional(),
  mediaType: z.enum(['IMAGE', 'VIDEO']),
  mediaUrl: cloudinaryUrl,
  thumbnailUrl: optionalHttpsUrl,
});

export const PaystackCheckoutSchema = z.object({
  planId: z.enum(PLAN_IDS),
});

export const AdminAssignSubscriptionSchema = z.object({
  email: z.string().trim().email().transform((email) => email.toLowerCase()),
  planId: z.enum(PLAN_IDS).default('package_6'),
});

const accessTier = z.enum(['BRONZE', 'SILVER', 'GOLD', 'SAPPHIRE', 'DIAMOND', 'PLATINUM']);

export const EbookCreateSchema = z.object({
  title: z.string().trim().min(2).max(200),
  description: z.string().trim().max(4000).optional(),
  author: z.string().trim().max(200).optional(),
  price: z.coerce.number().min(0).max(100_000_000).optional(),
  accessTier: accessTier.optional(),
  coverUrl: optionalHttpsUrl,
  fileUrl: optionalHttpsUrl,
});

export const EbookUpdateSchema = EbookCreateSchema.partial().extend({
  isPublished: z.boolean().optional(),
});

export const GalleryUpdateSchema = z.object({
  title: z.string().trim().min(3).max(200).optional(),
  description: z.string().trim().max(4000).optional(),
  category: z.enum(['Events', 'School Seminars']).optional(),
  location: z.string().trim().max(200).optional(),
  school: z.string().trim().max(200).optional(),
  eventDate: z.coerce.date().optional(),
  mediaType: z.enum(['IMAGE', 'VIDEO']).optional(),
  mediaUrl: optionalHttpsUrl,
  thumbnailUrl: optionalHttpsUrl,
  isPublished: z.boolean().optional(),
});

export const PaginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export type UserCreate = z.infer<typeof UserCreateSchema>;
export type UserUpdate = z.infer<typeof UserUpdateSchema>;
export type VideoCreate = z.infer<typeof VideoCreateSchema>;
export type GalleryCreate = z.infer<typeof GalleryCreateSchema>;
