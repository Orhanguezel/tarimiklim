import type { FastifyInstance } from 'fastify';

import { registerAuth } from '@agro/shared-backend/modules/auth/router';
import { registerUserAdmin } from '@agro/shared-backend/modules/auth';
import { registerStorage } from '@agro/shared-backend/modules/storage/router';
import { registerContacts } from '@agro/shared-backend/modules/contact/router';
import { registerNewsletter } from '@agro/shared-backend/modules/newsletter/router';
import { registerSiteSettings } from '@agro/shared-backend/modules/siteSettings/router';
import { registerCustomPages } from '@agro/shared-backend/modules/customPages/router';
import { registerNotifications } from '@agro/shared-backend/modules/notifications/router';
import { registerTelegram } from '@agro/shared-backend/modules/telegram/router';
import { registerTheme } from '@agro/shared-backend/modules/theme/router';
import { registerHealth } from '@agro/shared-backend/modules/health/router';
import { registerProfiles } from '@agro/shared-backend/modules/profiles';
import { registerMenuItems, registerMenuItemsAdmin } from '@agro/shared-backend/modules/menuItems';
import { registerUserRoles } from '@agro/shared-backend/modules/userRoles';

import { registerStorageAdmin } from '@agro/shared-backend/modules/storage/admin.routes';
import { registerContactsAdmin } from '@agro/shared-backend/modules/contact/admin.routes';
import { registerNewsletterAdmin } from '@agro/shared-backend/modules/newsletter/admin.routes';
import { registerSiteSettingsAdmin } from '@agro/shared-backend/modules/siteSettings/admin.routes';
import { registerCustomPagesAdmin } from '@agro/shared-backend/modules/customPages/admin.routes';
import { registerAuditAdmin } from '@agro/shared-backend/modules/audit/admin.routes';
import { registerEmailTemplatesAdmin } from '@agro/shared-backend/modules/emailTemplates/admin.routes';
import { registerTelegramAdmin } from '@agro/shared-backend/modules/telegram/admin.routes';
import { registerThemeAdmin } from '@agro/shared-backend/modules/theme/admin.routes';

export {
  shouldSkipAuditLog,
  writeRequestAuditLog,
  startRetentionJob,
} from '@agro/shared-backend/modules/audit/service';

export async function registerSharedPublic(api: FastifyInstance) {
  await api.register(registerHealth);
  await api.register(registerAuth);
  await api.register(registerStorage);
  await api.register(registerProfiles);
  await api.register(registerContacts);
  await api.register(registerNewsletter);
  await api.register(registerSiteSettings);
  await api.register(registerCustomPages);
  await api.register(registerMenuItems);
  await api.register(registerUserRoles);
  await api.register(registerNotifications);
  await api.register(registerTelegram);
  await api.register(registerTheme);
}

export async function registerSharedAdmin(api: FastifyInstance) {
  await api.register(registerUserAdmin);
  await api.register(registerMenuItemsAdmin);
  await api.register(registerStorageAdmin);
  await api.register(registerContactsAdmin);
  await api.register(registerNewsletterAdmin);
  await api.register(registerSiteSettingsAdmin);
  await api.register(registerCustomPagesAdmin);
  await api.register(registerAuditAdmin);
  await api.register(registerEmailTemplatesAdmin);
  await api.register(registerTelegramAdmin);
  await api.register(registerThemeAdmin);
}
