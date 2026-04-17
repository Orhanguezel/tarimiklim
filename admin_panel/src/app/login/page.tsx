'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import axios from 'axios';

import { authApi } from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';

const defaultApiUrl = 'http://localhost:8088/api/v1';

const defaultSeedEmail = 'admin@hava-durumu.local';
const defaultSeedPassword = 'HavaDurumuDev2026!';

export default function LoginPage() {
  const router = useRouter();
  const setToken = useAuthStore((s) => s.setToken);
  const setUser = useAuthStore((s) => s.setUser);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? defaultApiUrl;
  const emailHint = process.env.NEXT_PUBLIC_DEV_LOGIN_HINT_EMAIL ?? defaultSeedEmail;
  const passwordHint = process.env.NEXT_PUBLIC_DEV_LOGIN_HINT_PASSWORD ?? defaultSeedPassword;
  const showDevSeedHint = process.env.NODE_ENV === 'development';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authApi.login(email, password);
      const token = (data as { access_token?: string }).access_token;
      if (!token) throw new Error('no_token');
      setToken(token);
      try {
        const me = await authApi.me();
        const payload = me.data as {
          user?: { id: string; email: string | null; role: string };
        };
        const u = payload.user;
        if (u) {
          setUser({
            id: u.id,
            email: u.email ?? '',
            role: u.role,
            is_admin: u.role === 'admin',
          });
        }
      } catch {
        /* /auth/user basarisiz olsa bile token ile devam */
      }
      toast.success('Giris basarili');
      router.push('/dashboard');
    } catch (err) {
      if (axios.isAxiosError(err) && !err.response) {
        toast.error(
          'API\'ye ulasilamadi (CORS veya sunucu kapali). Backend .env CORS_ORIGIN ve NEXT_PUBLIC_API_URL kontrol edin.',
        );
      } else {
        toast.error('Giris basarisiz. E-posta ve sifreyi kontrol edin.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm space-y-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-alt)] p-6 shadow-sm"
      >
        <h1 className="text-xl font-semibold text-[var(--color-text)]">Hava Durumu Admin</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">API: {apiUrl}</p>
        {showDevSeedHint ? (
          <p className="rounded border border-dashed border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-xs text-[var(--color-text-secondary)]">
            Geliştirici — db:seed varsayılan: <span className="font-mono text-[var(--color-text)]">{emailHint}</span> /{' '}
            <span className="font-mono text-[var(--color-text)]">{passwordHint}</span>
          </p>
        ) : null}
        <label className="block text-sm font-medium">
          E-posta
          <input
            type="email"
            autoComplete="email"
            placeholder={emailHint}
            value={email}
            onChange={(ev) => setEmail(ev.target.value)}
            className="mt-1 w-full rounded border border-[var(--color-border)] px-3 py-2"
            required
          />
        </label>
        <label className="block text-sm font-medium">
          Sifre
          <input
            type="password"
            autoComplete="current-password"
            placeholder={showDevSeedHint ? passwordHint : undefined}
            value={password}
            onChange={(ev) => setPassword(ev.target.value)}
            className="mt-1 w-full rounded border border-[var(--color-border)] px-3 py-2"
            required
            minLength={6}
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-[var(--color-brand)] py-2 font-medium text-white disabled:opacity-60"
        >
          {loading ? 'Giris...' : 'Giris'}
        </button>
      </form>
    </div>
  );
}
