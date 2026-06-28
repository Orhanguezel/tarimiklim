'use client';

import { useEffect, useMemo, useState } from 'react';
import { AUTH_CHANGED_EVENT, AUTH_TOKEN_KEY, getAuthUser, logout, type AuthUser } from '@/lib/auth-client';
import { resolveLocalizedHref, type NavItem } from '@/lib/navigation';

type Props = {
  locale: string;
  className?: string;
  ctaItem?: NavItem | null;
};

function readToken(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(AUTH_TOKEN_KEY) || '';
}

export function AuthNavButtons({ locale, className, ctaItem }: Props) {
  const [token, setToken] = useState<string>('');
  const [user, setUser] = useState<AuthUser | null>(null);
  const isAuthed = !!token;

  const hrefs = useMemo(() => {
    return {
      login: `/${locale}/giris`,
      register: `/${locale}/kayit`,
      account: `/${locale}/hesabim`,
    };
  }, [locale]);

  useEffect(() => {
    const sync = async () => {
      const nextToken = readToken();
      setToken(nextToken);
      if (!nextToken) {
        setUser(null);
        return;
      }
      const u = await getAuthUser();
      setUser(u);
    };

    void sync();

    const onChanged = () => void sync();
    window.addEventListener(AUTH_CHANGED_EVENT, onChanged);
    window.addEventListener('storage', onChanged);
    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, onChanged);
      window.removeEventListener('storage', onChanged);
    };
  }, []);

  if (!isAuthed) {
    return (
      <div className={className}>
        {ctaItem ? (
          <a href={resolveLocalizedHref(ctaItem.href, locale)} className="site-nav-cta">
            {ctaItem.title}
          </a>
        ) : (
          <a href={hrefs.login}>Giriş</a>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <a href={hrefs.account} className="text-sm font-medium hover:text-pine transition-colors">
        {user?.full_name?.split(' ')[0] || 'Hesabım'}
      </a>
      <button
        type="button"
        onClick={() => void logout()}
        className="text-[10px] uppercase tracking-widest font-bold text-ink-soft hover:text-danger transition-colors"
      >
        Çıkış
      </button>
    </div>
  );
}
