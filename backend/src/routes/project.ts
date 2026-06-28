import type { FastifyInstance } from 'fastify';

import { registerWeather } from '@/modules/weather/router.js';
import { registerWeatherInternal } from '@/modules/weather/internal.router.js';
import { registerLocations } from '@/modules/locations/router.js';
import { registerAlerts } from '@/modules/alerts/router.js';
import { registerTarimiklimTelegramBot } from '@/modules/telegramBot/router.js';
import { registerHomeSections } from '@/modules/homeSections/router.js';
import { registerNavigation } from '@/modules/navigation/router.js';

import { registerWeatherAdmin } from '@/modules/weather/admin.routes.js';
import { registerLocationsAdmin } from '@/modules/locations/admin.routes.js';
import { registerAlertsAdmin } from '@/modules/alerts/admin.routes.js';
import { registerHomeSectionsAdmin } from '@/modules/homeSections/admin.routes.js';
import { registerNavigationAdmin } from '@/modules/navigation/admin.routes.js';
import { registerAdminPanelStubs } from '@/modules/adminPanelStubs/router.js';

export async function registerProjectPublic(api: FastifyInstance) {
  await api.register(registerWeather);
  await api.register(registerWeatherInternal, { prefix: '/internal/weather' });
  await api.register(registerLocations);
  await api.register(registerAlerts);
  await api.register(registerTarimiklimTelegramBot);
  await api.register(registerHomeSections);
  await api.register(registerNavigation);
}

export async function registerProjectAdmin(api: FastifyInstance) {
  await api.register(registerWeatherAdmin);
  await api.register(registerLocationsAdmin);
  await api.register(registerAlertsAdmin);
  await api.register(registerHomeSectionsAdmin);
  await api.register(registerNavigationAdmin);
  await api.register(registerAdminPanelStubs);
}
