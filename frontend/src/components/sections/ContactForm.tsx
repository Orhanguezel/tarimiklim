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
        <input className="rounded-xl border border-line bg-paper px-4 py-3 text-sm text-ink" placeholder={t('name')} required />
        <input className="rounded-xl border border-line bg-paper px-4 py-3 text-sm text-ink" type="email" placeholder={t('email')} required />
        <textarea className="min-h-32 rounded-xl border border-line bg-paper px-4 py-3 text-sm text-ink" placeholder={t('message')} required />
        <button className="button-primary justify-center">{sent ? t('sent') : t('submit')}</button>
      </div>
    </form>
  );
}
