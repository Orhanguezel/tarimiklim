import { API_URL } from '@/lib/site-settings';

export type NavItem = {
  id: string;
  title: string;
  href: string;
  icon: string | null;
  section_id: string | null;
  section_slug?: string | null;
  order_num: number;
  is_active: boolean;
};

export type FooterSection = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  display_order: number;
  is_active: boolean;
};

export type FooterContent = {
  tagline?: string;
  copy?: string;
  contact?: {
    company?: string;
    city?: string;
    email?: string;
    social?: string;
  };
  bottom?: {
    copyright?: string;
    creditLabel?: string;
    creditBy?: string;
    creditUrl?: string;
  };
};

export type NavigationData = {
  header: NavItem[];
  footer: {
    sections: FooterSection[];
    items: NavItem[];
    content: FooterContent | null;
  };
};

export const EMPTY_NAVIGATION: NavigationData = {
  header: [],
  footer: { sections: [], items: [], content: null },
};

export async function fetchNavigation(locale: string): Promise<NavigationData> {
  try {
    const params = new URLSearchParams({ locale });
    const res = await fetch(`${API_URL}/navigation?${params.toString()}`, {
      next: { revalidate: 60, tags: ['navigation', `navigation:${locale}`] },
    });
    if (!res.ok) return EMPTY_NAVIGATION;
    const payload = await res.json();
    const data = payload?.data ?? payload;
    if (!data || typeof data !== 'object') return EMPTY_NAVIGATION;
    return {
      header: Array.isArray(data.header) ? data.header : [],
      footer: {
        sections: Array.isArray(data.footer?.sections) ? data.footer.sections : [],
        items: Array.isArray(data.footer?.items) ? data.footer.items : [],
        content: data.footer?.content && typeof data.footer.content === 'object' ? data.footer.content : null,
      },
    };
  } catch {
    return EMPTY_NAVIGATION;
  }
}

export function resolveLocalizedHref(href: string | null | undefined, locale: string) {
  const raw = String(href || '').trim();
  if (!raw) return `/${locale}`;
  if (/^https?:\/\//i.test(raw) || raw.startsWith('mailto:') || raw.startsWith('tel:')) return raw;
  if (raw === '/widget' || raw.startsWith('/widget/')) return raw;
  if (raw.startsWith('#')) {
    const section = raw.slice(1).trim();
    return section ? `/${locale}?section=${encodeURIComponent(section)}` : `/${locale}`;
  }

  // Convert legacy hash navigation to query-param based navigation.
  // We intentionally map hashes on `/don-uyarisi` back to the home page,
  // because those sections live on `/${locale}`.
  if (raw.includes('#')) {
    const [basePart, hashPartRaw] = raw.split('#', 2);
    const hashPart = (hashPartRaw || '').trim();
    if (!hashPart) return basePart || `/${locale}`;

    const base = basePart || `/${locale}`;
    const home = `/${locale}`;
    const isDonUyarisi = /\/don-uyarisi\/?$/i.test(base);

    if (isDonUyarisi) {
      return `${home}?section=${encodeURIComponent(hashPart)}`;
    }

    // Preserve existing query string on base if present.
    const join = base.includes('?') ? '&' : '?';
    return `${base}${join}section=${encodeURIComponent(hashPart)}`;
  }

  if (raw.startsWith(`/${locale}/`) || raw === `/${locale}`) return raw;
  if (raw.startsWith('/tr/') || raw.startsWith('/en/') || raw === '/tr' || raw === '/en') return raw;
  if (raw.startsWith('/')) return `/${locale}${raw}`;
  return raw;
}
