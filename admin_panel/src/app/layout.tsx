import type { ReactNode } from 'react';
import '../styles/globals.css';
import { Providers } from './providers';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="tr">
      <head>
        <title>Hava Durumu Admin</title>
        <meta name="robots" content="noindex,nofollow" />
      </head>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
