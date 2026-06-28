'use client';

import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

type Mode = 'light' | 'dark';

function readMode(): Mode {
  if (typeof document === 'undefined') return 'light';
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
}

function applyMode(mode: Mode) {
  document.documentElement.setAttribute('data-theme', mode);
  localStorage.setItem('tk_theme_mode', mode);
}

export function ThemeModeToggle() {
  const [mode, setMode] = useState<Mode>('light');
  const isDark = mode === 'dark';

  useEffect(() => {
    setMode(readMode());
  }, []);

  return (
    <button
      type="button"
      className="theme-mode-toggle"
      aria-label={isDark ? 'Açık moda geç' : 'Koyu moda geç'}
      title={isDark ? 'Açık mod' : 'Koyu mod'}
      onClick={() => {
        const next: Mode = isDark ? 'light' : 'dark';
        applyMode(next);
        setMode(next);
      }}
    >
      {isDark ? (
        <Sun aria-hidden="true" className="theme-mode-toggle-icon" />
      ) : (
        <Moon aria-hidden="true" className="theme-mode-toggle-icon" />
      )}
    </button>
  );
}
