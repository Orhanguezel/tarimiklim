import type { FastifyReply, FastifyRequest } from 'fastify';
import { randomUUID } from 'crypto';
import { sql } from 'drizzle-orm';
import { handleRouteError, sendNotFound } from '@agro/shared-backend/modules/_shared/http';

function rowsFromExecute<T>(result: unknown): T[] {
  if (Array.isArray(result) && Array.isArray(result[0])) return result[0] as T[];
  if (Array.isArray(result)) return result as T[];
  return [];
}

function isActive(v: unknown) {
  return v === true || v === 1 || v === '1' || v === 'true';
}

async function listMenuItems(db: any, locale: string, location: 'header' | 'footer') {
  const result = await db.execute(sql`
    SELECT
      mi.id,
      mi.parent_id,
      mi.location,
      mi.icon,
      mi.section_id,
      mi.order_num,
      mi.is_active,
      fs.slug AS section_slug,
      COALESCE(i18n_locale.title, i18n_tr.title, i18n_en.title, '') AS title,
      COALESCE(i18n_locale.url, i18n_tr.url, i18n_en.url, '') AS url
    FROM menu_items mi
    LEFT JOIN footer_sections fs ON fs.id = mi.section_id
    LEFT JOIN menu_items_i18n i18n_locale ON i18n_locale.menu_item_id = mi.id AND i18n_locale.locale = ${locale}
    LEFT JOIN menu_items_i18n i18n_tr ON i18n_tr.menu_item_id = mi.id AND i18n_tr.locale = 'tr'
    LEFT JOIN menu_items_i18n i18n_en ON i18n_en.menu_item_id = mi.id AND i18n_en.locale = 'en'
    WHERE mi.location = ${location}
    ORDER BY mi.order_num ASC, mi.created_at ASC
  `);
  return rowsFromExecute<Record<string, unknown>>(result).map((row) => ({
    id: String(row.id ?? ''),
    parent_id: row.parent_id ? String(row.parent_id) : null,
    location: String(row.location ?? location),
    icon: row.icon ? String(row.icon) : null,
    section_id: row.section_id ? String(row.section_id) : null,
    section_slug: row.section_slug ? String(row.section_slug) : null,
    order_num: Number(row.order_num ?? 0),
    is_active: isActive(row.is_active),
    title: String(row.title ?? ''),
    href: String(row.url ?? ''),
  }));
}

async function listFooterSections(db: any, locale: string, activeOnly = true) {
  const result = await db.execute(sql`
    SELECT id, slug, title, description, locale, display_order, is_active, created_at, updated_at
    FROM footer_sections
    WHERE locale = ${locale} ${activeOnly ? sql`AND is_active = 1` : sql``}
    ORDER BY display_order ASC, created_at ASC
  `);
  return rowsFromExecute<Record<string, unknown>>(result).map((row) => ({
    id: String(row.id ?? ''),
    slug: String(row.slug ?? ''),
    title: String(row.title ?? ''),
    description: row.description ? String(row.description) : null,
    locale: String(row.locale ?? locale),
    display_order: Number(row.display_order ?? 0),
    is_active: isActive(row.is_active),
    created_at: row.created_at,
    updated_at: row.updated_at,
  }));
}

async function getFooterContent(db: any, locale: string) {
  const result = await db.execute(sql`
    SELECT value
    FROM site_settings
    WHERE \`key\` = 'footer_content' AND locale IN (${locale}, 'tr', '*')
    ORDER BY FIELD(locale, ${locale}, 'tr', '*')
    LIMIT 1
  `);
  const rows = rowsFromExecute<{ value?: unknown }>(result);
  const raw = rows[0]?.value;
  if (typeof raw !== 'string') return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function publicNavigationHandler(req: FastifyRequest, reply: FastifyReply) {
  try {
    const query = (req.query ?? {}) as { locale?: string };
    const locale = String(query.locale || 'tr');
    const db = (req.server as any).db;
    const [header, footerSections, footerItems, footerContent] = await Promise.all([
      listMenuItems(db, locale, 'header'),
      listFooterSections(db, locale, true),
      listMenuItems(db, locale, 'footer'),
      getFooterContent(db, locale),
    ]);
    return reply.send({ success: true, data: { header, footer: { sections: footerSections, items: footerItems, content: footerContent } } });
  } catch (err) {
    return handleRouteError(reply, req, err, 'navigation.public');
  }
}

export async function listFooterSectionsAdminHandler(req: FastifyRequest, reply: FastifyReply) {
  try {
    const query = (req.query ?? {}) as { locale?: string; limit?: string; offset?: string; is_active?: string };
    const locale = String(query.locale || 'tr');
    const data = await listFooterSections((req.server as any).db, locale, false);
    reply.header('x-total-count', String(data.length));
    return reply.send(data);
  } catch (err) {
    return handleRouteError(reply, req, err, 'footerSections.admin.list');
  }
}

export async function getFooterSectionAdminHandler(req: FastifyRequest, reply: FastifyReply) {
  try {
    const { id } = req.params as { id: string };
    const result = await (req.server as any).db.execute(sql`SELECT * FROM footer_sections WHERE id = ${id} LIMIT 1`);
    const row = rowsFromExecute<Record<string, unknown>>(result)[0];
    if (!row) return sendNotFound(reply);
    return reply.send(row);
  } catch (err) {
    return handleRouteError(reply, req, err, 'footerSections.admin.get');
  }
}

export async function getFooterSectionBySlugAdminHandler(req: FastifyRequest, reply: FastifyReply) {
  try {
    const { slug } = req.params as { slug: string };
    const result = await (req.server as any).db.execute(sql`SELECT * FROM footer_sections WHERE slug = ${slug} LIMIT 1`);
    const row = rowsFromExecute<Record<string, unknown>>(result)[0];
    if (!row) return sendNotFound(reply);
    return reply.send(row);
  } catch (err) {
    return handleRouteError(reply, req, err, 'footerSections.admin.getBySlug');
  }
}

export async function createFooterSectionAdminHandler(req: FastifyRequest, reply: FastifyReply) {
  try {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const id = randomUUID();
    const locale = String(body.locale || 'tr');
    await (req.server as any).db.execute(sql`
      INSERT INTO footer_sections (id, slug, title, description, locale, display_order, is_active)
      VALUES (${id}, ${String(body.slug || '')}, ${String(body.title || '')}, ${body.description ? String(body.description) : null}, ${locale}, ${Number(body.display_order ?? 0)}, ${body.is_active === false || body.is_active === 0 ? 0 : 1})
    `);
    const result = await (req.server as any).db.execute(sql`SELECT * FROM footer_sections WHERE id = ${id} LIMIT 1`);
    return reply.status(201).send(rowsFromExecute<Record<string, unknown>>(result)[0]);
  } catch (err) {
    return handleRouteError(reply, req, err, 'footerSections.admin.create');
  }
}

export async function updateFooterSectionAdminHandler(req: FastifyRequest, reply: FastifyReply) {
  try {
    const { id } = req.params as { id: string };
    const body = (req.body ?? {}) as Record<string, unknown>;
    await (req.server as any).db.execute(sql`
      UPDATE footer_sections
      SET
        title = COALESCE(${body.title != null ? String(body.title) : null}, title),
        description = ${body.description === undefined ? sql`description` : body.description ? String(body.description) : null},
        display_order = COALESCE(${body.display_order != null ? Number(body.display_order) : null}, display_order),
        is_active = COALESCE(${body.is_active === undefined ? null : body.is_active === false || body.is_active === 0 ? 0 : 1}, is_active),
        updated_at = CURRENT_TIMESTAMP(3)
      WHERE id = ${id}
    `);
    const result = await (req.server as any).db.execute(sql`SELECT * FROM footer_sections WHERE id = ${id} LIMIT 1`);
    const row = rowsFromExecute<Record<string, unknown>>(result)[0];
    if (!row) return sendNotFound(reply);
    return reply.send(row);
  } catch (err) {
    return handleRouteError(reply, req, err, 'footerSections.admin.update');
  }
}

export async function deleteFooterSectionAdminHandler(req: FastifyRequest, reply: FastifyReply) {
  try {
    const { id } = req.params as { id: string };
    await (req.server as any).db.execute(sql`UPDATE menu_items SET section_id = NULL WHERE section_id = ${id}`);
    await (req.server as any).db.execute(sql`DELETE FROM footer_sections WHERE id = ${id}`);
    return reply.send({ ok: true });
  } catch (err) {
    return handleRouteError(reply, req, err, 'footerSections.admin.delete');
  }
}
