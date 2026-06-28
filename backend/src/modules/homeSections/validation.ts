import { z } from 'zod';

const configSchema = z.record(z.unknown()).nullable().optional();

export const createHomeSectionSchema = z.object({
  slug: z.string().trim().min(1).max(100).regex(/^[a-z0-9_-]+$/),
  label: z.string().trim().min(1).max(255),
  component_key: z.string().trim().min(1).max(100),
  order_index: z.coerce.number().int().optional(),
  is_active: z.union([z.boolean(), z.coerce.number().int().min(0).max(1)]).optional(),
  config: configSchema,
});

export const updateHomeSectionSchema = z.object({
  label: z.string().trim().min(1).max(255).optional(),
  component_key: z.string().trim().min(1).max(100).optional(),
  order_index: z.coerce.number().int().optional(),
  is_active: z.union([z.boolean(), z.coerce.number().int().min(0).max(1)]).optional(),
  config: configSchema,
});

export const reorderHomeSectionsSchema = z.object({
  items: z.array(z.object({
    id: z.string().trim().min(1).max(36),
    order_index: z.coerce.number().int(),
  })),
});
