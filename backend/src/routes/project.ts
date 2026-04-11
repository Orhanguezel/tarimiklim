import type { FastifyInstance } from 'fastify';

import { registerWeather } from '@/modules/weather/router.js';
import { registerWeatherInternal } from '@/modules/weather/internal.router.js';
import { registerLocations } from '@/modules/locations/router.js';
import { registerAlerts } from '@/modules/alerts/router.js';

import { registerWeatherAdmin } from '@/modules/weather/admin.routes.js';
import { registerLocationsAdmin } from '@/modules/locations/admin.routes.js';
import { registerAlertsAdmin } from '@/modules/alerts/admin.routes.js';

export async function registerProjectPublic(api: FastifyInstance) {
  await api.register(registerWeather);
  await api.register(registerWeatherInternal, { prefix: '/internal/weather' });
  await api.register(registerLocations);
  await api.register(registerAlerts);
}

export async function registerProjectAdmin(api: FastifyInstance) {
  await api.register(
    async (i) => {
      await i.register(registerWeatherAdmin);
      await i.register(registerLocationsAdmin);
      await i.register(registerAlertsAdmin);
    },
    { prefix: '/admin' },
  );
}
