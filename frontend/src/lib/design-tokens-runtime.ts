import { API_URL } from '@/lib/site-settings';

type Dict = Record<string, unknown>;

type DesignTokens = {
  version?: string;
  colors?: Dict;
  typography?: Dict;
  radius?: Dict;
  shadows?: Dict;
  branding?: Dict;
};

const DEFAULT_TOKENS: Required<DesignTokens> = {
  version: '2',
  colors: {
    brand_primary: '#1E3023',
    brand_primary_dark: '#162217',
    brand_primary_light: '#3B5A3C',
    brand_secondary: '#3B5A3C',
    brand_accent: '#B8553A',
    bg_base: '#F1EBDD',
    bg_deep: '#E8DFCB',
    bg_surface: '#FFFCF6',
    bg_surface_high: '#F5EFE2',
    text_primary: '#141B14',
    text_secondary: '#2B3527',
    text_muted: '#64748b',
    border: 'rgba(20, 27, 20, 0.14)',
    success: '#16a34a',
    warning: '#ca8a04',
    error: '#dc2626',
    sky: '#5D7A8C',
    brand_rgb: '30, 48, 35',
  },
  typography: {
    font_display: 'var(--font-display), system-ui, sans-serif',
    font_serif: 'Georgia, serif',
    font_sans: 'var(--font-sans), system-ui, sans-serif',
    font_mono: 'var(--font-mono), ui-monospace, monospace',
    base_size: '16px',
  },
  radius: {
    xs: '12px',
    sm: '20px',
    md: '28px',
    lg: '40px',
    xl: '48px',
    pill: '999px',
  },
  shadows: {
    soft: '0 18px 40px rgba(20, 27, 20, 0.10)',
    card: '0 24px 60px rgba(30, 48, 35, 0.12)',
    glow_primary: '0 0 60px rgba(30, 48, 35, 0.18)',
    glow_gold: '0 0 30px rgba(184, 85, 58, 0.14)',
  },
  branding: {},
};

function asObj(v: unknown): Dict {
  return v && typeof v === 'object' && !Array.isArray(v) ? (v as Dict) : {};
}

function asStr(v: unknown, fallback: string): string {
  const s = typeof v === 'string' ? v.trim() : '';
  return s || fallback;
}

function mergeTokens(raw: unknown): Required<DesignTokens> {
  const input = asObj(raw) as DesignTokens;
  return {
    version: asStr(input.version, DEFAULT_TOKENS.version),
    colors: { ...DEFAULT_TOKENS.colors, ...asObj(input.colors) },
    typography: { ...DEFAULT_TOKENS.typography, ...asObj(input.typography) },
    radius: { ...DEFAULT_TOKENS.radius, ...asObj(input.radius) },
    shadows: { ...DEFAULT_TOKENS.shadows, ...asObj(input.shadows) },
    branding: { ...DEFAULT_TOKENS.branding, ...asObj(input.branding) },
  };
}

async function fetchSettingValue(key: string): Promise<unknown> {
  const res = await fetch(`${API_URL}/site_settings/${encodeURIComponent(key)}`, {
    next: { revalidate: 30, tags: [key, 'site-settings'] },
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { value?: unknown };
  if (typeof data?.value === 'string') {
    const v = data.value.trim();
    if (!v) return null;
    try {
      return JSON.parse(v);
    } catch {
      return data.value;
    }
  }
  return data?.value ?? null;
}

export async function fetchRuntimeDesignTokens(): Promise<Required<DesignTokens>> {
  try {
    const raw = await fetchSettingValue('design_tokens');
    return mergeTokens(raw);
  } catch {
    return DEFAULT_TOKENS;
  }
}

export async function fetchRuntimeCustomCss(): Promise<string> {
  try {
    const raw = await fetchSettingValue('custom_css');
    return typeof raw === 'string' ? raw : '';
  } catch {
    return '';
  }
}

export function buildRuntimeThemeCss(tokens: Required<DesignTokens>): string {
  const c = tokens.colors;
  const t = tokens.typography;
  const r = tokens.radius;
  const s = tokens.shadows;

  const darkBg = asStr(c.bg_base_dark, '#0f172a');
  const darkBgDeep = asStr(c.bg_deep_dark, '#111827');
  const darkSurface = asStr(c.bg_surface_dark, '#1f2937');
  const darkSurfaceHigh = asStr(c.bg_surface_high_dark, '#273449');
  const darkText = asStr(c.text_primary_dark, '#f9fafb');
  const darkTextSecondary = asStr(c.text_secondary_dark, '#e5e7eb');
  const darkMuted = asStr(c.text_muted_dark, '#cbd5e1');
  const brandRgb = asStr(c.brand_rgb, '30, 48, 35');

  return `
:root{
  --paper:${asStr(c.bg_base, '#F1EBDD')};
  --paper-dim:${asStr(c.bg_deep, '#E8DFCB')};
  --paper-deep:${asStr(c.bg_surface_high, '#DDD1B6')};
  --ink:${asStr(c.text_primary, '#141B14')};
  --ink-soft:${asStr(c.text_secondary, '#2B3527')};
  --pine:${asStr(c.brand_primary, '#1E3023')};
  --moss:${asStr(c.brand_secondary, '#3B5A3C')};
  --sage:${asStr(c.brand_primary_light, '#7A8C6A')};
  --terra:${asStr(c.brand_accent, '#B8553A')};
  --terra-deep:${asStr(c.brand_primary_dark, '#8E3F2C')};
  --wheat:${asStr(c.warning, '#C69B3A')};
  --sky:${asStr(c.sky, '#5D7A8C')};
  --danger:${asStr(c.error, '#C23B2C')};
  --brand-rgb:${brandRgb};
  --line:${asStr(c.border, 'rgba(20, 27, 20, 0.14)')};
  --line-soft:rgba(20, 27, 20, 0.08);
  --surface-strong:${asStr(c.bg_surface, 'rgba(255, 252, 246, 0.92)')};
  --surface-panel:${asStr(c.bg_surface_high, 'rgba(245, 239, 226, 0.78)')};
  --color-brand:var(--pine);
  --color-brand-dark:var(--moss);
  --color-brand-fg:#F1EBDD;
  --color-background:var(--paper);
  --color-bg-alt:var(--paper-dim);
  --color-foreground:var(--ink);
  --color-muted:var(--ink-soft);
  --color-faint:var(--sage);
  --color-surface:var(--surface-strong);
  --color-border:var(--line);
  --color-border-soft:var(--line-soft);
  --color-success:var(--moss);
  --color-navy:#F1EBDD;
  --shadow-soft:${asStr(s.soft, '0 18px 40px rgba(20, 27, 20, 0.10)')};
  --shadow-card:${asStr(s.card, '0 24px 60px rgba(30, 48, 35, 0.12)')};
  --radius-xs:${asStr(r.xs, '12px')};
  --radius-sm:${asStr(r.sm, '20px')};
  --radius-md:${asStr(r.md, '28px')};
  --radius-lg:${asStr(r.lg, '40px')};
  --radius-pill:${asStr(r.pill, '999px')};
  --display:${asStr(t.font_display, 'var(--font-display), system-ui, sans-serif')};
  --sans:${asStr(t.font_sans, 'var(--font-sans), system-ui, sans-serif')};
  --mono:${asStr(t.font_mono, 'var(--font-mono), ui-monospace, monospace')};
}

[data-theme="dark"]{
  --paper:${darkBg};
  --paper-dim:${darkBgDeep};
  --paper-deep:${darkSurface};
  --ink:${darkText};
  --ink-soft:${darkTextSecondary};
  --surface-strong:${darkSurface};
  --surface-panel:${darkSurfaceHigh};
  --line:rgba(248, 250, 252, 0.22);
  --line-soft:rgba(248, 250, 252, 0.12);
  --color-brand:${asStr(c.brand_primary_light, '#8BA88B')};
  --color-brand-dark:${asStr(c.brand_secondary, '#6F936F')};
  --color-brand-fg:${darkBg};
  --color-background:var(--paper);
  --color-bg-alt:var(--paper-dim);
  --color-foreground:var(--ink);
  --color-muted:var(--ink-soft);
  --color-faint:${darkMuted};
  --color-surface:var(--surface-strong);
  --color-border:var(--line);
  --color-border-soft:var(--line-soft);
  --color-success:var(--moss);
  --color-navy:${darkBg};
}
`;
}
