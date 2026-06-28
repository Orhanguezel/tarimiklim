import { z } from 'zod';

export const createAlertRuleSchema = z.object({
  locationId: z.string().uuid(),
  alertType: z.enum(['frost', 'heavy_rain', 'storm', 'heat', 'humidity']),
  threshold: z.string(),
  channel: z.enum(['telegram', 'push', 'email']),
  isActive: z.boolean().default(true),
});

export const createUserAlertRuleSchema = z
  .object({
    locationId: z.string().uuid().optional(),
    location_id: z.string().uuid().optional(),
    alertType: z.enum(['frost', 'heavy_rain', 'storm', 'heat', 'humidity']).optional(),
    alert_type: z.enum(['frost', 'heavy_rain', 'storm', 'heat', 'humidity']).optional(),
    threshold: z.union([z.string(), z.number()]).transform((v) => String(v)),
    channel: z.enum(['telegram', 'push', 'email']),
  })
  .transform((input) => ({
    locationId: input.locationId ?? input.location_id,
    alertType: input.alertType ?? input.alert_type,
    threshold: input.threshold,
    channel: input.channel,
  }))
  .refine((input) => Boolean(input.locationId), { message: 'location_id_required', path: ['location_id'] })
  .refine((input) => Boolean(input.alertType), { message: 'alert_type_required', path: ['alert_type'] });

export const telegramChatIdSchema = z.object({
  chat_id: z.string().trim().max(50).nullable().optional(),
  chatId: z.string().trim().max(50).nullable().optional(),
}).transform((input) => ({ chatId: input.chatId ?? input.chat_id ?? null }));

export const pushTokenSchema = z
  .object({
    token: z.string().trim().min(10).max(512),
    provider: z.enum(['fcm', 'expo']).default('fcm'),
    platform: z.enum(['ios', 'android', 'web', 'unknown']).default('unknown'),
    device_id: z.string().trim().max(128).nullable().optional(),
    deviceId: z.string().trim().max(128).nullable().optional(),
  })
  .transform((input) => ({
    token: input.token,
    provider: input.provider,
    platform: input.platform,
    deviceId: input.deviceId ?? input.device_id ?? null,
  }));

export const updateUserAlertRuleSchema = z.object({
  is_active: z.boolean().optional(),
  isActive: z.boolean().optional(),
}).transform((input) => ({ isActive: input.isActive ?? input.is_active }));

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
export type CreateUserAlertRuleInput = z.infer<typeof createUserAlertRuleSchema>;
export type PushTokenInput = z.infer<typeof pushTokenSchema>;
