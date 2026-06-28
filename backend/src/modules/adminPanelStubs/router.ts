import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { randomUUID } from 'node:crypto';
import { sql } from 'drizzle-orm';
import { sendPushFrostAlert, type PushProvider, type PushTokenTarget } from '@/modules/alerts/fcm.js';

type PushTargetWithUser = PushTokenTarget & {
  userId: string;
};

function asStr(v: unknown): string {
  return String(v ?? '').trim();
}

const isoNow = () => new Date().toISOString();

const ZERO_TOTALS = {
  bookings_total: 0,
  bookings_new: 0,
  bookings_confirmed: 0,
  bookings_completed: 0,
  bookings_cancelled: 0,
  bookings_other: 0,
  revenue_total: 0,
  slots_total: 0,
  slots_reserved: 0,
  resources_total: 0,
  services_total: 0,
  faqs_total: 0,
  email_templates_total: 0,
  site_settings_total: 0,
  custom_pages_total: 0,
  menu_items_total: 0,
  slider_total: 0,
  footer_sections_total: 0,
  reviews_total: 0,
  users_total: 0,
  storage_assets_total: 0,
  db_snapshots_total: 0,
  audit_logs_total: 0,
  availability_total: 0,
  notifications_total: 0,
  contact_messages_unread: 0,
  contact_messages_total: 0,
  consultants_active: 0,
  today_bookings: 0,
  support_tickets_total: 0,
  announcements_total: 0,
};

function parseRange(q: Record<string, unknown>): '7d' | '30d' | '90d' {
  const r = String(q.range ?? '30d');
  if (r === '7d' || r === '90d') return r;
  return '30d';
}

function rangeDays(key: '7d' | '30d' | '90d'): number {
  if (key === '7d') return 7;
  if (key === '90d') return 90;
  return 30;
}

function dashboardAnalyticsStub(req: FastifyRequest, reply: FastifyReply) {
  const q = (req.query ?? {}) as Record<string, unknown>;
  const range = parseRange(q);
  const days = rangeDays(range);
  const to = new Date();
  const from = new Date(to);
  from.setUTCDate(from.getUTCDate() - days);
  const fromYmd = from.toISOString().slice(0, 10);
  const toYmdExclusive = to.toISOString().slice(0, 10);
  return reply.send({
    range,
    fromYmd,
    toYmdExclusive,
    meta: { bucket: 'day' },
    totals: ZERO_TOTALS,
    resources: [],
    services: [],
    trend: [],
    revenueTrend: [],
  });
}

function ordersListStub(req: FastifyRequest, reply: FastifyReply) {
  const q = (req.query ?? {}) as Record<string, string>;
  const page = Math.max(1, Number(q.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(q.limit) || 20));
  return reply.send({ data: [], page, limit, total: 0 });
}

function orderDetailStub(req: FastifyRequest, reply: FastifyReply) {
  const { id } = req.params as { id: string };
  const now = isoNow();
  return reply.send({
    id,
    order_number: '—',
    status: 'pending',
    payment_status: 'unpaid',
    total_amount: '0.00',
    currency: 'TRY',
    transaction_id: null,
    user_id: '00000000-0000-0000-0000-000000000000',
    user_email: null,
    user_name: null,
    order_notes: null,
    created_at: now,
    updated_at: now,
    items: [],
    payments: [],
  });
}

function emptySubscriptionList(reply: FastifyReply, q: Record<string, string>) {
  const limit = Math.min(500, Math.max(1, Number(q.limit) || 20));
  const offset = Math.max(0, Number(q.offset) || 0);
  return reply.send({ data: [], limit, offset, total: 0 });
}

function emptyPlanList(reply: FastifyReply, q: Record<string, string>) {
  const limit = Math.min(500, Math.max(1, Number(q.limit) || 200));
  const offset = Math.max(0, Number(q.offset) || 0);
  return reply.send({ data: [], limit, offset, total: 0 });
}

function stubSubscription(id: string) {
  const now = isoNow();
  return {
    id,
    user_id: '00000000-0000-0000-0000-000000000000',
    plan_id: '00000000-0000-0000-0000-000000000001',
    provider: 'manual',
    provider_subscription_id: null,
    provider_customer_id: null,
    status: 'cancelled',
    started_at: null,
    ends_at: null,
    trial_ends_at: null,
    cancelled_at: now,
    cancellation_reason: 'Tarım İklim: abonelik modülü bu kurulumda kapalı (stub).',
    auto_renew: 0,
    price_minor: 0,
    currency: 'TRY',
    created_at: now,
    updated_at: now,
    user_email: null,
    user_full_name: null,
    user_phone: null,
    plan_code: null,
    plan_name_tr: null,
    plan_name_en: null,
  };
}

function stubPlan(id: string) {
  const now = isoNow();
  return {
    id,
    code: 'stub',
    name_tr: 'Stub',
    name_en: 'Stub',
    description_tr: null,
    description_en: null,
    price_minor: 0,
    currency: 'TRY',
    period: 'monthly',
    trial_days: 0,
    features: null,
    is_active: 0,
    display_order: 0,
    created_at: now,
    updated_at: now,
  };
}

function stubTicket(id: string, patch?: Record<string, unknown>) {
  const now = isoNow();
  const base = {
    id,
    user_id: '00000000-0000-0000-0000-000000000000',
    subject: '—',
    message: 'Tarım İklim: destek modülü bu kurulumda kapalı (stub).',
    status: 'closed' as const,
    priority: 'low' as const,
    user_display_name: null as string | null,
    user_email: null as string | null,
    created_at: now,
    updated_at: now,
  };
  if (!patch) return base;
  return { ...base, ...patch, id: base.id };
}

function ok(reply: FastifyReply, body: Record<string, unknown> = {}) {
  return reply.send({ success: true, ...body });
}

function rowsFromExecute<T>(result: unknown): T[] {
  if (Array.isArray(result) && Array.isArray(result[0])) return result[0] as T[];
  if (Array.isArray(result)) return result as T[];
  return [];
}

function isActive(v: unknown) {
  return v === true || v === 1 || v === '1' || v === 'true';
}

function pushTargetWhere(segment: string) {
  if (segment === 'inactive_7d') {
    return sql`u.is_active = 1 AND (u.last_sign_in_at IS NULL OR u.last_sign_in_at < DATE_SUB(NOW(), INTERVAL 7 DAY))`;
  }
  return sql`u.is_active = 1`;
}

async function listPushCampaigns(req: FastifyRequest, reply: FastifyReply) {
  const db = (req.server as any).db;
  const result = await db.execute(sql`
    SELECT id, slug, title, body, target_segment, deep_link, is_active, created_at, updated_at
    FROM push_campaigns
    ORDER BY display_order ASC, created_at ASC
  `);
  const rows = rowsFromExecute<Record<string, unknown>>(result).map((row) => ({
    id: String(row.id ?? ''),
    slug: String(row.slug ?? ''),
    title: String(row.title ?? ''),
    body: String(row.body ?? ''),
    target_segment: String(row.target_segment ?? 'all'),
    deep_link: row.deep_link ? String(row.deep_link) : null,
    is_active: isActive(row.is_active),
    created_at: row.created_at,
    updated_at: row.updated_at,
  }));
  return reply.send(rows);
}

async function listPushTargets(db: any, segment: string): Promise<PushTargetWithUser[]> {
  const result = await db.execute(sql`
    SELECT upt.user_id, upt.token, upt.provider
    FROM user_push_tokens upt
    INNER JOIN users u ON u.id = upt.user_id
    WHERE upt.is_active = 1
      AND ${pushTargetWhere(segment)}
  `);
  return rowsFromExecute<Record<string, unknown>>(result)
    .map((row) => ({
      userId: String(row.user_id ?? '').trim(),
      token: String(row.token ?? '').trim(),
      provider: String(row.provider ?? 'fcm').trim() as PushProvider,
    }))
    .filter((target) => target.userId && target.token && (target.provider === 'fcm' || target.provider === 'expo'));
}

async function deactivateInvalidPushTokens(db: any, tokens: string[]) {
  if (!tokens.length) return;
  await db.execute(sql`
    UPDATE user_push_tokens
    SET is_active = 0, updated_at = NOW()
    WHERE token IN (${sql.join(tokens, sql`, `)})
  `);
}

async function createInboxNotifications(db: any, input: {
  userIds: string[];
  title: string;
  message: string;
  type?: string;
}) {
  const uniqueUserIds = Array.from(new Set(input.userIds.map((id) => id.trim()).filter(Boolean)));
  if (!uniqueUserIds.length) return 0;

  await Promise.all(
    uniqueUserIds.map((userId) =>
      db.execute(sql`
        INSERT INTO notifications (id, user_id, title, message, type, is_read, created_at)
        VALUES (${randomUUID()}, ${userId}, ${input.title}, ${input.message}, ${input.type ?? 'push'}, 0, NOW(3))
      `),
    ),
  );
  return uniqueUserIds.length;
}

async function sendManualPush(req: FastifyRequest, reply: FastifyReply) {
  const body = (req.body ?? {}) as Record<string, unknown>;
  const title = asStr(body.title);
  const message = asStr(body.body);
  const userId = asStr(body.user_id);
  if (!title || !message) {
    return reply.status(400).send({ error: { message: 'title_body_required' } });
  }

  const db = (req.server as any).db;
  const result = userId
    ? await db.execute(sql`
        SELECT user_id, token, provider
        FROM user_push_tokens
        WHERE is_active = 1 AND user_id = ${userId}
      `)
    : await db.execute(sql`
        SELECT upt.user_id, upt.token, upt.provider
        FROM user_push_tokens upt
        INNER JOIN users u ON u.id = upt.user_id
        WHERE upt.is_active = 1 AND u.is_active = 1
      `);

  const targets = rowsFromExecute<Record<string, unknown>>(result)
    .map((row) => ({
      userId: String(row.user_id ?? '').trim(),
      token: String(row.token ?? '').trim(),
      provider: String(row.provider ?? 'fcm').trim() as PushProvider,
    }))
    .filter((target) => target.userId && target.token && (target.provider === 'fcm' || target.provider === 'expo'));

  const sent = await sendPushFrostAlert(title, message, targets);
  await deactivateInvalidPushTokens(db, sent.invalidTokens);
  const inboxCount = targets.length
    ? await createInboxNotifications(db, {
        userIds: targets.map((target) => target.userId),
        title,
        message,
        type: 'push',
      })
    : 0;
  if (!targets.length) {
    req.log.warn({ userId: userId || null }, 'manual_push_no_active_targets');
  } else {
    req.log.info(
      { targetCount: targets.length, sentCount: sent.successCount, failedCount: Math.max(0, targets.length - sent.successCount), inboxCount },
      'manual_push_send_result',
    );
  }
  return reply.send({
    success: true,
    target_count: targets.length,
    sent_count: sent.successCount,
    failed_count: Math.max(0, targets.length - sent.successCount),
    inbox_count: inboxCount,
  });
}

async function sendPushCampaign(req: FastifyRequest, reply: FastifyReply) {
  const { slug } = req.params as { slug: string };
  const db = (req.server as any).db;
  const campaignRows = rowsFromExecute<Record<string, unknown>>(await db.execute(sql`
    SELECT id, slug, title, body, target_segment, deep_link, is_active
    FROM push_campaigns
    WHERE slug = ${slug}
    LIMIT 1
  `));
  const campaign = campaignRows[0];
  if (!campaign) return reply.status(404).send({ error: { message: 'campaign_not_found' } });
  if (!isActive(campaign.is_active)) return reply.status(400).send({ error: { message: 'campaign_inactive' } });

  const segment = String(campaign.target_segment ?? 'all');
  const targets = await listPushTargets(db, segment);
  const sent = await sendPushFrostAlert(String(campaign.title ?? ''), String(campaign.body ?? ''), targets);
  await deactivateInvalidPushTokens(db, sent.invalidTokens);
  const inboxCount = targets.length
    ? await createInboxNotifications(db, {
        userIds: targets.map((target) => target.userId),
        title: String(campaign.title ?? ''),
        message: String(campaign.body ?? ''),
        type: 'push_campaign',
      })
    : 0;
  if (!targets.length) {
    req.log.warn({ slug, segment }, 'push_campaign_no_active_targets');
  } else {
    req.log.info(
      { slug, segment, targetCount: targets.length, sentCount: sent.successCount, failedCount: Math.max(0, targets.length - sent.successCount), inboxCount },
      'push_campaign_send_result',
    );
  }

  return reply.send({
    success: true,
    campaign_slug: String(campaign.slug ?? slug),
    target_segment: segment,
    target_count: targets.length,
    sent_count: sent.successCount,
    failed_count: Math.max(0, targets.length - sent.successCount),
    inbox_count: inboxCount,
  });
}

/** Vista tarzı admin panelde olmayan modüller için güvenli boş cevaplar (404 gürültüsünü keser). */
export async function registerAdminPanelStubs(adminApi: FastifyInstance) {
  adminApi.get('/dashboard/analytics', dashboardAnalyticsStub);

  adminApi.get('/orders', ordersListStub);
  adminApi.get('/orders/:id', orderDetailStub);
  adminApi.patch('/orders/:id', async (_req, reply) => ok(reply));
  adminApi.post('/orders/:id/refund', async (_req, reply) => ok(reply));

  adminApi.get('/payment-gateways', async (_req, reply) => reply.send([]));
  adminApi.post('/payment-gateways', async (_req, reply) => reply.send({ success: true, id: randomUUID() }));
  adminApi.patch('/payment-gateways/:id', async (_req, reply) => ok(reply));

  adminApi.get('/subscriptions', (req, reply) =>
    emptySubscriptionList(reply, (req.query ?? {}) as Record<string, string>),
  );
  adminApi.get('/subscriptions/:id', (req, reply) => {
    const { id } = req.params as { id: string };
    return reply.send(stubSubscription(id));
  });
  adminApi.post('/subscriptions/:id/refund', async (_req, reply) => ok(reply));

  adminApi.get('/subscription-plans', (req, reply) =>
    emptyPlanList(reply, (req.query ?? {}) as Record<string, string>),
  );
  adminApi.get('/subscription-plans/:id', (req, reply) => {
    const { id } = req.params as { id: string };
    return reply.send(stubPlan(id));
  });
  adminApi.post('/subscription-plans', async (req, reply) => {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const id = randomUUID();
    const periodRaw = asStr(body.period);
    const period = ['monthly', 'yearly', 'lifetime'].includes(periodRaw) ? periodRaw : 'monthly';
    return reply.send({
      ...stubPlan(id),
      code: asStr(body.code) || 'plan',
      name_tr: asStr(body.name_tr) || 'Plan',
      name_en: asStr(body.name_en) || 'Plan',
      description_tr: body.description_tr != null ? asStr(body.description_tr) : null,
      description_en: body.description_en != null ? asStr(body.description_en) : null,
      price_minor: Number(body.price_minor) || 0,
      currency: asStr(body.currency) || 'TRY',
      period,
      trial_days: Number(body.trial_days) || 0,
      is_active: body.is_active === 1 || body.is_active === true ? 1 : 0,
      display_order: Number(body.display_order) || 0,
    });
  });
  adminApi.patch('/subscription-plans/:id', (req, reply) => {
    const { id } = req.params as { id: string };
    const body = (req.body ?? {}) as Record<string, unknown>;
    return reply.send({ ...stubPlan(id), ...body, id });
  });
  adminApi.delete('/subscription-plans/:id', async (_req, reply) => ok(reply));

  adminApi.get('/support_tickets', async (_req, reply) => reply.send([]));
  adminApi.get('/support_tickets/:id', (req, reply) => {
    const { id } = req.params as { id: string };
    return reply.send(stubTicket(id));
  });
  adminApi.patch('/support_tickets/:id', (req, reply) => {
    const { id } = req.params as { id: string };
    const patch = (req.body ?? {}) as Record<string, unknown>;
    return reply.send(stubTicket(id, patch));
  });
  adminApi.post('/support_tickets/:id/:action', (req, reply) => {
    const { id, action } = req.params as { id: string; action: string };
    const status = action === 'reopen' ? 'open' : 'closed';
    return reply.send(stubTicket(id, { status }));
  });

  adminApi.get('/ticket_replies/by-ticket/:ticketId', async (_req, reply) => reply.send([]));
  adminApi.post('/ticket_replies', async (req, reply) => {
    const body = (req.body ?? {}) as { ticket_id?: string; message?: string };
    const now = isoNow();
    return reply.send({
      id: randomUUID(),
      ticket_id: String(body.ticket_id ?? ''),
      user_id: null,
      message: String(body.message ?? ''),
      is_admin: true,
      created_at: now,
    });
  });

  adminApi.get('/chat/threads', async (_req, reply) => reply.send({ items: [] }));
  adminApi.get('/chat/threads/:threadId/messages', async (_req, reply) => reply.send({ items: [] }));
  adminApi.get('/chat/knowledge', async (_req, reply) => reply.send({ items: [] }));

  adminApi.get('/banners', async (_req, reply) => reply.send([]));
  adminApi.get('/campaigns', async (_req, reply) => reply.send([]));
  adminApi.get('/reviews', async (_req, reply) => reply.send([]));
  adminApi.get('/announcements', async (_req, reply) => reply.send([]));
  adminApi.get('/push/campaigns', listPushCampaigns);
  adminApi.post('/push/campaigns/:slug/send', sendPushCampaign);

  adminApi.get('/resources', async (_req, reply) => reply.send([]));
  adminApi.get('/resources/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const now = isoNow();
    return reply.send({
      id,
      title: 'Stub',
      label: 'Stub',
      status: 'active',
      created_at: now,
      updated_at: now,
    });
  });
  adminApi.get('/resource-slots', async (_req, reply) => reply.send([]));
  adminApi.get('/resource-recurring-overrides', async (_req, reply) => reply.send([]));
  adminApi.get('/resource-working-hours', async (_req, reply) => reply.send([]));

  adminApi.get('/wallets', async (_req, reply) =>
    reply.send({ data: [], page: 1, limit: 20, total: 0 }),
  );
  adminApi.get('/wallets/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const now = isoNow();
    return reply.send({
      id,
      user_id: '00000000-0000-0000-0000-000000000000',
      email: null,
      full_name: null,
      balance: '0.00',
      total_earnings: '0.00',
      total_withdrawn: '0.00',
      currency: 'TRY',
      status: 'active',
      created_at: now,
      updated_at: now,
    });
  });
  adminApi.patch('/wallets/:id/status', async (_req, reply) => ok(reply));
  adminApi.post('/wallets/adjust', async (_req, reply) => ok(reply, { transaction_id: randomUUID() }));
  adminApi.get('/wallets/:walletId/transactions', async (_req, reply) =>
    reply.send({ data: [], page: 1, limit: 20, total: 0 }),
  );

  adminApi.get('/wallet_deposits', async (_req, reply) =>
    reply.send({ data: [], page: 1, limit: 20, total: 0 }),
  );
  adminApi.post('/wallet_deposits/:id/approve', async (_req, reply) => ok(reply));
  adminApi.post('/wallet_deposits/:id/reject', async (_req, reply) => ok(reply));

  adminApi.patch('/wallet_transactions/:id/status', async (_req, reply) => ok(reply));

  adminApi.get('/reports/kpi', async (_req, reply) => reply.send([]));
  adminApi.get('/reports/users-performance', async (_req, reply) => reply.send([]));
  adminApi.get('/reports/locations', async (_req, reply) => reply.send([]));

  adminApi.get('/services', async (_req, reply) => reply.send([]));
  adminApi.post('/services/reorder', async (_req, reply) => ok(reply));

  adminApi.get('/llm-prompts', async (_req, reply) => reply.send({ items: [], total: 0 }));
  adminApi.get('/llm-prompts/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const now = isoNow();
    return reply.send({
      id,
      key: 'stub',
      title: 'Stub',
      body: '',
      provider: 'groq',
      is_active: true,
      created_at: now,
      updated_at: now,
    });
  });
  adminApi.post('/llm-prompts', async (_req, reply) => reply.send({ id: randomUUID() }));
  adminApi.patch('/llm-prompts/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    return reply.send({ id, key: 'stub', title: 'Stub', body: '', provider: 'groq', is_active: true });
  });
  adminApi.delete('/llm-prompts/:id', async (_req, reply) => ok(reply));

  adminApi.get('/db/snapshots', async (_req, reply) => reply.send([]));
  adminApi.post('/db/snapshots', async (_req, reply) =>
    reply.send({
      id: randomUUID(),
      label: 'stub',
      note: null,
      created_at: isoNow(),
      size_bytes: 0,
    }),
  );
  adminApi.post('/db/snapshots/:id/restore', async (_req, reply) =>
    reply.send({ ok: true, dryRun: false, message: 'stub' }),
  );
  adminApi.delete('/db/snapshots/:id', async (_req, reply) => reply.send({ ok: true }));
  adminApi.get('/db/modules/validate', async (_req, reply) =>
    reply.send({
      ok: true,
      okAll: true,
      db: { database: 'tarimiklim' },
      unknownRequested: [],
      dbTables: [],
      results: [],
    }),
  );
  adminApi.get('/db/export', async (_req, reply) => reply.type('application/sql').send('-- stub export\n'));
  adminApi.get('/db/export-module', async (_req, reply) => reply.type('application/sql').send('-- stub module export\n'));
  adminApi.post('/db/import-module', async (_req, reply) => reply.send({ ok: true, message: 'stub' }));
  adminApi.post('/db/import-sql', async (_req, reply) => reply.send({ ok: true, message: 'stub' }));
  adminApi.post('/db/import-url', async (_req, reply) => reply.send({ ok: true, message: 'stub' }));
  adminApi.post('/db/import-file', async (_req, reply) => reply.send({ ok: true, message: 'stub' }));
  adminApi.get('/db/site-settings/ui-export', async (_req, reply) => reply.send({}));
  adminApi.post('/db/site-settings/ui-bootstrap', async (_req, reply) => reply.send({ ok: true, insertedOrUpdated: 0 }));

  adminApi.get('/roles', async (_req, reply) => reply.send([]));
  adminApi.get('/roles/:slug', async (req, reply) => {
    const { slug } = req.params as { slug: string };
    const now = isoNow();
    return reply.send({
      slug,
      name: slug,
      permissions: [],
      created_at: now,
      updated_at: now,
    });
  });
  adminApi.post('/roles', async (_req, reply) =>
    reply.send({ slug: 'stub', name: 'Stub', permissions: [], created_at: isoNow(), updated_at: isoNow() }),
  );
  adminApi.patch('/roles/:slug', async (req, reply) => {
    const { slug } = req.params as { slug: string };
    const now = isoNow();
    return reply.send({ slug, name: slug, permissions: [], created_at: now, updated_at: now });
  });

  adminApi.get('/permissions', async (_req, reply) => reply.send([]));

  const emptyListPaths = [
    '/consultants',
    '/consultant-applications',
    '/bookings',
    '/brands',
    '/sliders',
    '/popups',
    '/faqs',
    '/projects',
    '/offers',
    '/availability',
    '/pricing/plans',
    '/skill-counters',
    '/skill-logos',
    '/resume-entries',
  ];
  for (const p of emptyListPaths) {
    adminApi.get(p, async (_req, reply) => reply.send([]));
  }

  adminApi.post('/push/send', sendManualPush);
  adminApi.get('/livekit/status', async (_req, reply) => reply.send({ ok: false, disabled: true }));
}
