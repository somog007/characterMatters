import { z } from 'zod';

export const AuthRegisterSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
  password: z.string().min(6).max(128),
});

export const AuthLoginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(6).max(128),
});

export const AuthUpdateProfileSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  avatar: z.string().url().optional(),
});

export const UserCreateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const UserUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  avatar: z.string().url().optional(),
  role: z.enum(['USER', 'PARENT', 'TEACHER', 'SCHOOL_ADMIN', 'ADMIN']).optional(),
});

export const VideoCreateSchema = z.object({
  title: z.string().trim().min(3, 'Title required').max(200),
  description: z.string().trim().min(10, 'Description required').max(4000),
  ageGroup: z.enum(['TODDLER', 'PRE_K', 'SCHOOL_AGE']).optional(),
  accessTier: z.enum(['BRONZE', 'SILVER', 'GOLD', 'SAPPHIRE', 'DIAMOND', 'PLATINUM']).optional(),
  videoUrl: z.string().url().optional(),
  durationSeconds: z.coerce.number().min(0).optional(),
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
});

export const PaystackCheckoutSchema = z.object({
  planId: z.string().min(1),
  amount: z.coerce.number().positive(),
  billingCycle: z.enum(['MONTHLY', 'YEARLY', 'ACADEMIC_SESSION']).optional(),
  callbackUrl: z.string().url().optional(),
});

export const PaginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export type UserCreate = z.infer<typeof UserCreateSchema>;
export type UserUpdate = z.infer<typeof UserUpdateSchema>;
export type VideoCreate = z.infer<typeof VideoCreateSchema>;
export type GalleryCreate = z.infer<typeof GalleryCreateSchema>;
