export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8088/api/v1';

function backendOrigin(): string {
  try {
    return new URL(API_URL).origin;
  } catch {
    return 'http://127.0.0.1:8088';
  }
}

function resolveMediaUrl(value: unknown): string | null {
  if (value && typeof value === 'object') {
    return resolveMediaUrl((value as { url?: unknown }).url);
  }
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith('/')) return `${backendOrigin()}${trimmed}`;
  return `${backendOrigin()}/${trimmed}`;
}

export interface SiteMedia {
  logo: string | null;
  favicon: string | null;
  appleTouchIcon: string | null;
}

export type SiteSettingRow = {
  key: string;
  locale: string;
  value: unknown;
};

const MEDIA_KEYS = ['site_logo', 'site_favicon', 'site_apple_touch_icon'] as const;

export async function fetchSetting(
  key: string,
  locale?: string,
  opts?: { revalidate?: number },
): Promise<SiteSettingRow | null> {
  const cleanKey = key.trim();
  if (!cleanKey) return null;

  const params = new URLSearchParams();
  if (locale) params.set('locale', locale);

  try {
    const qs = params.toString();
    const res = await fetch(`${API_URL}/site_settings/${encodeURIComponent(cleanKey)}${qs ? `?${qs}` : ''}`, {
      next: { revalidate: opts?.revalidate ?? 600, tags: [cleanKey, 'site-settings'] },
    });
    if (!res.ok) return null;
    return (await res.json()) as SiteSettingRow;
  } catch {
    return null;
  }
}

export async function fetchSiteMedia(locale?: string): Promise<SiteMedia> {
  const params = new URLSearchParams({ key_in: MEDIA_KEYS.join(',') });
  if (locale) params.set('locale', locale);

  try {
    const res = await fetch(`${API_URL}/site_settings?${params.toString()}`, {
      next: { revalidate: 300, tags: ['site-media'] },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const rows = (await res.json()) as Array<{ key: string; value: unknown }>;
    const byKey = new Map(rows.map((r) => [r.key, r.value]));
    return {
      logo: resolveMediaUrl(byKey.get('site_logo')),
      favicon: resolveMediaUrl(byKey.get('site_favicon')),
      appleTouchIcon: resolveMediaUrl(byKey.get('site_apple_touch_icon')),
    };
  } catch {
    return { logo: null, favicon: null, appleTouchIcon: null };
  }
}
