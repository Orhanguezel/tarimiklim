'use client';

import { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { loginWithEmail, loginWithGoogle, signupWithEmail } from '@/lib/auth';
import { localePath } from '@/lib/locale-path';
import { getPublicAppName } from '@/lib/public-brand';

export function AuthPanel({ locale, mode }: { locale: string; mode: 'login' | 'register' }) {
  const router = useRouter();
  const t = useTranslations('public.auth');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (mode === 'login') await loginWithEmail({ email, password });
      else await signupWithEmail({ email, password, fullName });
      router.push(localePath(locale, '/hesabim'));
      router.refresh();
    } catch {
      setError(mode === 'login' ? t('loginError') : t('registerError'));
    } finally {
      setLoading(false);
    }
  }

  const isLogin = mode === 'login';

  const onGoogleCredential = useCallback(async (idToken?: string) => {
    if (!idToken) {
      setError(t('googleError'));
      return;
    }
    setGoogleLoading(true);
    setError('');
    try {
      await loginWithGoogle(idToken);
      router.push(localePath(locale, '/hesabim'));
      router.refresh();
    } catch {
      setError(t('googleError'));
    } finally {
      setGoogleLoading(false);
    }
  }, [locale, router, t]);

  const googleSection = useMemo(() => {
    if (!googleClientId) return null;
    return (
      <>
        <GoogleOAuthProvider clientId={googleClientId}>
          <div className="auth-google-wrap">
            <GoogleLogin
              width="360"
              text={isLogin ? 'signin_with' : 'signup_with'}
              shape="rectangular"
              theme="outline"
              size="large"
              logo_alignment="left"
              onSuccess={(credentialResponse) => onGoogleCredential(credentialResponse.credential)}
              onError={() => setError(t('googleError'))}
            />
            {googleLoading ? <span className="auth-google-loading">{t('googleLoading')}</span> : null}
          </div>
        </GoogleOAuthProvider>
        <div className="auth-divider">
          <span>{t('or')}</span>
        </div>
      </>
    );
  }, [googleClientId, googleLoading, isLogin, locale, onGoogleCredential, t]);

  return (
    <main className="auth-split-layout">
      <section className="auth-side-image" aria-hidden="true">
        <div className="auth-bg-image" />
        <div className="auth-side-overlay">
          <p className="auth-eyebrow">{isLogin ? t('loginEyebrow') : t('registerEyebrow')}</p>
          <h2>{t('heroTitle')}</h2>
          <p>{t('heroLead')}</p>
        </div>
      </section>

      <section className="auth-side-content">
        <div className="glass-auth-card auth-card">
          <p className="auth-eyebrow">{getPublicAppName()}</p>
          <h1 className="auth-title">
            {isLogin ? t('loginTitle') : t('registerTitle')}
          </h1>
          <p className="auth-lead">
            {isLogin ? t('loginLead', { app: getPublicAppName() }) : t('registerLead')}
          </p>
          {error ? <p className="auth-error">{error}</p> : null}
          {googleSection}
          <form className="auth-form" onSubmit={onSubmit}>
          {!isLogin ? (
            <input
              className="auth-input"
              placeholder={t('fullName')}
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
            />
          ) : null}
          <input
            className="auth-input"
            type="email"
            placeholder={t('email')}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <input
            className="auth-input"
            type="password"
            placeholder={t('password')}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          <button className="button-primary w-full justify-center" disabled={loading}>
            {loading ? t('loading') : isLogin ? t('loginButton') : t('registerButton')}
          </button>
          </form>
          <Link className="auth-switch-link" href={localePath(locale, isLogin ? '/kayit' : '/giris')}>
            {isLogin ? t('switchToRegister') : t('switchToLogin')}
          </Link>
        </div>
      </section>
    </main>
  );
}
