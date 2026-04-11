import type { FastifyInstance } from 'fastify';

import { registerAuth } from '@agro/shared-backend/modules/auth/router';
import { registerStorage } from '@agro/shared-backend/modules/storage/router';
import { registerContacts } from '@agro/shared-backend/modules/contact/router';
import { registerNewsletter } from '@agro/shared-backend/modules/newsletter/router';
import { registerSiteSettings } from '@agro/shared-backend/modules/siteSettings/router';
import { registerCustomPages } from '@agro/shared-backend/modules/customPages/router';
import { registerNotifications } from '@agro/shared-backend/modules/notifications/router';
import { registerTelegram } from '@agro/shared-backend/modules/telegram/router';
import { registerTheme } from '@agro/shared-backend/modules/theme/router';
import { registerHealth } from '@agro/shared-backend/modules/health/router';

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
  await api.register(registerContacts);
  await api.register(registerNewsletter);
  await api.register(registerSiteSettings);
  await api.register(registerCustomPages);
  await api.register(registerNotifications);
  await api.register(registerTelegram);
  await api.register(registerTheme);
}

export async function registerSharedAdmin(api: FastifyInstance) {
  await api.register(
    async (i) => {
      await i.register(registerStorageAdmin);
      await i.register(registerContactsAdmin);
      await i.register(registerNewsletterAdmin);
      await i.register(registerSiteSettingsAdmin);
      await i.register(registerCustomPagesAdmin);
      await i.register(registerAuditAdmin);
      await i.register(registerEmailTemplatesAdmin);
      await i.register(registerTelegramAdmin);
      await i.register(registerThemeAdmin);
    },
    { prefix: '/admin' },
  );
}
