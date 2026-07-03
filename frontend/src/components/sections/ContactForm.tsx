'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

export function ContactForm() {
  const t = useTranslations('public.contactForm');
  const [sent, setSent] = useState(false);

  return (
    <form
      className="rounded-2xl border border-line bg-surface-strong p-6 shadow-card"
      onSubmit={(event) => {
        event.preventDefault();
        setSent(true);
      }}
    >
      <div className="grid gap-4">
        <label className="sr-only" htmlFor="contact-name">{t('name')}</label>
        <input id="contact-name" name="name" className="rounded-xl border border-line bg-paper px-4 py-3 text-sm text-ink" placeholder={t('name')} autoComplete="name" required />
        <label className="sr-only" htmlFor="contact-email">{t('email')}</label>
        <input id="contact-email" name="email" className="rounded-xl border border-line bg-paper px-4 py-3 text-sm text-ink" type="email" placeholder={t('email')} autoComplete="email" required />
        <label className="sr-only" htmlFor="contact-message">{t('message')}</label>
        <textarea id="contact-message" name="message" className="min-h-32 rounded-xl border border-line bg-paper px-4 py-3 text-sm text-ink" placeholder={t('message')} required />
        <button className="button-primary justify-center">{sent ? t('sent') : t('submit')}</button>
      </div>
    </form>
  );
}
