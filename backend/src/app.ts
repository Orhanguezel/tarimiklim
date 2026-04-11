import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import cookie from '@fastify/cookie';
import multipart from '@fastify/multipart';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import { jsonSchemaTransform, serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import type { FastifyInstance } from 'fastify';

import authPlugin from '@agro/shared-backend/plugins/authPlugin';
import mysqlPlugin from '@agro/shared-backend/plugins/mysql';
import redisPlugin from '@agro/shared-backend/plugins/redis';
import { registerErrorHandlers } from '@agro/shared-backend/core/error';
import { loggerConfig } from '@agro/shared-backend/core/logger';
import { localeMiddleware } from '@agro/shared-backend/middleware/locale';

import { env } from '@/core/env.js';
import {
  registerSharedPublic,
  registerSharedAdmin,
  shouldSkipAuditLog,
  writeRequestAuditLog,
  startRetentionJob,
} from '@/routes/shared.js';
import { registerProjectPublic, registerProjectAdmin } from '@/routes/project.js';

function parseCorsOrigins(v?: string): boolean | string[] {
  if (!v) return true;
  const arr = v.trim().split(',').map((x) => x.trim()).filter(Boolean);
  return arr.length ? arr : true;
}

export async function createApp() {
  const { default: buildFastify } = (await import('fastify')) as unknown as {
    default: (opts?: unknown) => FastifyInstance;
  };

  const app = buildFastify({ logger: loggerConfig }) as FastifyInstance;

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  await app.register(cors, {
    origin: parseCorsOrigins(env.CORS_ORIGIN),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-lang', 'X-Locale', 'Accept'],
    exposedHeaders: ['x-total-count', 'content-range'],
  });

  await app.register(fastifySwagger, {
    openapi: {
      info: { title: 'Hava Durumu & Don Uyarisi API', version: '0.1.0' },
      servers: [{ url: `http://${env.HOST}:${env.PORT}` }],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'Authorization: Bearer <access_token>',
          },
        },
      },
    },
    transform: jsonSchemaTransform,
  });

  await app.register(fastifySwaggerUi, {
    routePrefix: '/documentation',
    uiConfig: { docExpansion: 'list', deepLinking: false },
    staticCSP: true,
    transformStaticCSP: (h) => h.replace('style-src', "style-src 'unsafe-inline'"),
  });

  const cookieSecret = process.env.COOKIE_SECRET ?? 'cookie-secret';
  await app.register(cookie, {
    secret: cookieSecret,
    hook: 'onRequest',
    parseOptions: {
      httpOnly: true,
      path: '/',
      sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
      secure: env.NODE_ENV === 'production',
    },
  });

  await app.register(jwt, {
    secret: env.JWT_SECRET,
    cookie: { cookieName: 'access_token', signed: false },
  });

  app.addHook('onRequest', localeMiddleware);
  await app.register(authPlugin);
  await app.register(mysqlPlugin);
  await app.register(redisPlugin);
  await app.register(multipart, {
    throwFileSizeLimit: true,
    limits: { fileSize: 20 * 1024 * 1024 },
  });

  await app.register(
    async (_api) => {
      const api = _api as unknown as FastifyInstance;

      api.addHook('onResponse', async (req, reply) => {
        try {
          if (shouldSkipAuditLog(req)) return;
          const reqId = String((req as any).id || '');
          const elapsed = typeof (reply as any).elapsedTime === 'number' ? (reply as any).elapsedTime : 0;
          await writeRequestAuditLog({ req, reply, reqId, responseTimeMs: elapsed });
        } catch (err) {
          (req as any).log?.warn?.({ err }, 'audit_log_failed');
        }
      });

      await api.register(
        async (v1) => {
          await registerSharedAdmin(v1);
          await registerProjectAdmin(v1);
          await registerSharedPublic(v1);
          await registerProjectPublic(v1);
        },
        { prefix: '/v1' },
      );
    },
    { prefix: '/api' },
  );

  registerErrorHandlers(app);
  startRetentionJob();

  return app;
}
