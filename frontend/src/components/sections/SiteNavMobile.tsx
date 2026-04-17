'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

const ANCHOR_IDS = ['modules', 'api', 'ekosistem', 'docs'] as const;

interface Props {
  locale: string;
}

export function SiteNavMobile({ locale }: Props) {
  const t = useTranslations('premium.nav');
  const [open, setOpen] = useState(false);
  const panelHref = `/${locale}/don-uyarisi`;
  const anchorHref = (id: string) => `/${locale}#${id}`;

  return (
    <>
      <button
        type="button"
        className="site-nav-mobile-toggle"
        aria-expanded={open}
        aria-controls="mobile-site-nav"
        onClick={() => setOpen((value) => !value)}
      >
        {open ? t('close') : t('menu')}
      </button>
      <div id="mobile-site-nav" className="site-nav-mobile-panel" data-open={open}>
        <ul>
          <li>
            <a href={panelHref} onClick={() => setOpen(false)}>
              {t('links.panel')}
            </a>
          </li>
          {ANCHOR_IDS.map((id) => (
            <li key={id}>
              <a href={anchorHref(id)} onClick={() => setOpen(false)}>
                {t(`links.${id}`)}
              </a>
            </li>
          ))}
          <li>
            <a className="site-nav-cta" href={panelHref} onClick={() => setOpen(false)}>
              {t('cta')}
            </a>
          </li>
        </ul>
      </div>
    </>
  );
}
