import { z } from 'zod';

export const createAlertRuleSchema = z.object({
  locationId: z.string().uuid(),
  alertType: z.enum(['frost', 'heavy_rain', 'storm', 'heat', 'humidity']),
  threshold: z.string(),
  channel: z.enum(['telegram', 'push', 'email']),
  isActive: z.boolean().default(true),
});

export const listAlertsQuerySchema = z.object({
  locationId: z.string().uuid().optional(),
  alertType: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export const listAlertRulesQuerySchema = z.object({
  userId: z.string().uuid().optional(),
  all: z.coerce.boolean().optional(),
});

export type CreateAlertRuleInput = z.infer<typeof createAlertRuleSchema>;
