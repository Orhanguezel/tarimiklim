'use client';

import { useState } from 'react';
import { resolveLocalizedHref, type NavItem } from '@/lib/navigation';
import { AuthNavButtons } from '@/components/AuthNavButtons';

interface Props {
  locale: string;
  items?: NavItem[];
}

export function SiteNavMobile({ locale, items = [] }: Props) {
  const [open, setOpen] = useState(false);
  const cta = items.find((item) => item.icon === 'cta');
  const links = items.filter((item) => item.icon !== 'cta');

  return (
    <>
      <button
        type="button"
        className="site-nav-mobile-toggle"
        aria-expanded={open}
        aria-controls="mobile-site-nav"
        onClick={() => setOpen((value) => !value)}
      >
        {open ? 'Kapat' : 'Menu'}
      </button>
      <div id="mobile-site-nav" className="site-nav-mobile-panel" data-open={open}>
        <ul>
          {links.map((item) => (
            <li key={item.id}>
              <a href={resolveLocalizedHref(item.href, locale)} onClick={() => setOpen(false)}>
                {item.title}
              </a>
            </li>
          ))}
          <li>
            <AuthNavButtons locale={locale} />
          </li>
          {cta ? (
            <li>
              <a className="site-nav-cta" href={resolveLocalizedHref(cta.href, locale)} onClick={() => setOpen(false)}>
                {cta.title}
              </a>
            </li>
          ) : null}
        </ul>
      </div>
    </>
  );
}
