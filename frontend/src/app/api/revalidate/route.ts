import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

type Body = {
  secret?: string;
  all?: boolean;
  path?: string;
  paths?: string[];
  tag?: string;
  tags?: string[];
};

const CORE_TAGS = [
  'site-settings',
  'site-media',
  'page-seo',
  'design_tokens',
  'custom_css',
];

function normalizePaths(body: Body): string[] {
  const out = new Set<string>();
  if (typeof body.path === 'string' && body.path.trim()) out.add(body.path.trim());
  if (Array.isArray(body.paths)) {
    for (const p of body.paths) {
      if (typeof p === 'string' && p.trim()) out.add(p.trim());
    }
  }
  return [...out];
}

function normalizeTags(body: Body): string[] {
  const out = new Set<string>();
  if (typeof body.tag === 'string' && body.tag.trim()) out.add(body.tag.trim());
  if (Array.isArray(body.tags)) {
    for (const t of body.tags) {
      if (typeof t === 'string' && t.trim()) out.add(t.trim());
    }
  }
  return [...out];
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Body;
    const expectedSecret = process.env.REVALIDATE_SECRET || 'dev-only-set-REVALIDATE_SECRET';

    if ((body.secret || '') !== expectedSecret) {
      return NextResponse.json({ ok: false, error: 'invalid_secret' }, { status: 401 });
    }

    const revalidatedPaths: string[] = [];
    const revalidatedTags: string[] = [];

    if (body.all) {
      for (const t of CORE_TAGS) {
        revalidateTag(t, 'max');
        revalidatedTags.push(t);
      }
      const allPaths = ['/', '/tr', '/en'];
      for (const p of allPaths) {
        revalidatePath(p);
        revalidatedPaths.push(p);
      }
    }

    for (const p of normalizePaths(body)) {
      revalidatePath(p);
      revalidatedPaths.push(p);
    }

    for (const t of normalizeTags(body)) {
      revalidateTag(t, 'max');
      revalidatedTags.push(t);
    }

    return NextResponse.json({
      ok: true,
      revalidated: {
        all: Boolean(body.all),
        paths: [...new Set(revalidatedPaths)],
        tags: [...new Set(revalidatedTags)],
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'revalidate_failed';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

