import { z } from 'zod';

export const createLocationSchema = z.object({
  name: z.string().min(2).max(255),
  slug: z.string().min(2).max(255).regex(/^[a-z0-9-]+$/, 'Slug sadece kucuk harf, rakam ve - icerabilir'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  city: z.string().max(100).optional(),
  district: z.string().max(100).optional(),
  region: z.string().max(100).optional(),
  timezone: z.string().default('Europe/Istanbul'),
  isActive: z.boolean().default(true),
});

export const updateLocationSchema = createLocationSchema.partial();

export const listLocationsQuerySchema = z.object({
  city: z.string().optional(),
  region: z.string().optional(),
  active: z.coerce.boolean().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
});

export type CreateLocationInput = z.infer<typeof createLocationSchema>;
export type UpdateLocationInput = z.infer<typeof updateLocationSchema>;
