'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';
import clsx from 'clsx';

const nav = [
  { href: '/dashboard', label: 'Ozet' },
  { href: '/dashboard/locations', label: 'Konumlar' },
  { href: '/dashboard/alerts', label: 'Uyarılar' },
  { href: '/dashboard/alerts/rules', label: 'Uyarı kuralları' },
];

export function DashboardShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const t = localStorage.getItem('access_token');
    if (!t) {
      router.replace('/login');
      return;
    }
    if (!user) {
      authApi
        .me()
        .then((res) => {
          const payload = res.data as {
            user?: { id: string; email: string | null; role: string };
          };
          const u = payload.user;
          if (u) {
            useAuthStore.getState().setUser({
              id: u.id,
              email: u.email ?? '',
              role: u.role,
              is_admin: u.role === 'admin',
            });
          }
        })
        .catch(() => toast.error('Oturum doğrulanamadı'));
    }
  }, [router, user]);

  async function onLogout() {
    try {
      await authApi.logout();
    } catch {
      /* */
    }
    logout();
    router.replace('/login');
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-52 shrink-0 bg-[var(--color-sidebar)] text-[var(--color-sidebar-text)]">
        <div className="border-b border-slate-700 px-4 py-4 text-sm font-semibold">Hava Admin</div>
        <nav className="flex flex-col gap-1 p-2">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'rounded px-3 py-2 text-sm transition',
                pathname === item.href
                  ? 'bg-slate-700 text-white'
                  : 'hover:bg-slate-800',
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-bg-alt)] px-6 py-3">
          <span className="text-sm text-[var(--color-text-secondary)]">Yönetim paneli</span>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-[var(--color-text-secondary)]">{user?.email ?? '—'}</span>
            <button
              type="button"
              onClick={() => void onLogout()}
              className="rounded border border-[var(--color-border)] px-3 py-1 text-[var(--color-text)]"
            >
              Çıkış
            </button>
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
