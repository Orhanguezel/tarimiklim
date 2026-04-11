import { DEFAULT_THEME_CONFIG, type ThemeConfig } from '@agro/shared-types/theme';

function apiBase(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8088/api/v1';
}

/** Sunucuda /theme okur; API yoksa ortak DEFAULT_THEME_CONFIG */
export async function fetchThemeConfig(): Promise<ThemeConfig> {
  try {
    const res = await fetch(`${apiBase()}/theme`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return DEFAULT_THEME_CONFIG;
    const data = (await res.json()) as unknown;
    if (
      data &&
      typeof data === 'object' &&
      'colors' in data &&
      data.colors &&
      typeof data.colors === 'object' &&
      data.colors !== null &&
      'primary' in data.colors &&
      'background' in data.colors
    ) {
      return data as ThemeConfig;
    }
    return DEFAULT_THEME_CONFIG;
  } catch {
    return DEFAULT_THEME_CONFIG;
  }
}
