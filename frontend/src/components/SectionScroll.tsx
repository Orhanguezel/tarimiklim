'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

const VALID = new Set(['top', 'panel', 'modules', 'api', 'ekosistem', 'docs']);

export function SectionScroll() {
  const search = useSearchParams();
  const section = (search.get('section') || '').trim();

  useEffect(() => {
    if (!section) return;
    if (!VALID.has(section)) return;

    const el = document.getElementById(section);
    if (!el) return;

    // Allow layout paint first
    requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [section]);

  return null;
}

