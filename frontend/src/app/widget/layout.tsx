import type { ReactNode } from 'react';

export const metadata = { robots: 'noindex' };

export default function WidgetLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="tr">
      <body style={{ margin: 0, padding: 0, background: 'transparent' }}>
        {children}
      </body>
    </html>
  );
}
