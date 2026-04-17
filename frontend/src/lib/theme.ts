import { DEFAULT_THEME_CONFIG, type ThemeConfig } from '@agro/shared-types/theme';

function apiBase(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8088/api/v1';
}

type CssVarMap = Record<string, string>;

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

export function premiumThemeVars(theme: ThemeConfig): CssVarMap {
  const colors = theme.colors as unknown as Record<string, string | undefined>;
  return {
    '--color-brand': colors.primary ?? '#b8553a',
    '--color-brand-dark': colors.primaryDark ?? '#8e3f2c',
    '--color-bg': colors.background ?? '#f1ebdd',
    '--color-bg-alt': colors.surface ?? '#fffcf6',
    '--color-text': colors.text ?? '#141b14',
    '--color-text-secondary': colors.muted ?? '#2b3527',
    '--color-border': colors.border ?? 'rgb(20 27 20 / 14%)',
  };
}
