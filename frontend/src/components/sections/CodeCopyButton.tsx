'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

interface Props {
  payload: string;
}

export function CodeCopyButton({ payload }: Props) {
  const t = useTranslations('premium.api.code');
  const [state, setState] = useState<'idle' | 'ok' | 'err'>('idle');

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(payload);
      setState('ok');
    } catch {
      setState('err');
    } finally {
      setTimeout(() => setState('idle'), 1500);
    }
  }

  const label =
    state === 'ok' ? t('copied') : state === 'err' ? t('copyError') : t('copy');

  return (
    <button type="button" className="code-copy-button" onClick={handleCopy} data-state={state}>
      {label}
    </button>
  );
}
