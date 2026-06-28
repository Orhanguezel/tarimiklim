import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { Space_Grotesk, Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { AuthSessionProvider } from '@/components/providers/AuthSessionProvider';
import { FirebasePushProvider } from '@/components/providers/FirebasePushProvider';
import { ToastProvider } from '@/components/providers/ToastProvider';
import { getPublicSiteUrl } from '@/lib/public-brand';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  weight: ['400', '500', '600'],
});

const themeInitScript = `(()=>{try{const s=localStorage.getItem('tk_theme_mode');const d=window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.setAttribute('data-theme',s==='dark'||s==='light'?s:(d?'dark':'light'));}catch(_){}})();`;

const fontVars = [spaceGrotesk.variable, inter.variable, jetbrainsMono.variable].join(' ');

export const metadata: Metadata = {
  metadataBase: new URL(getPublicSiteUrl()),
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="tr" className={fontVars} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body suppressHydrationWarning>
        <AuthSessionProvider>
          <ToastProvider>
            <FirebasePushProvider />
            {children}
          </ToastProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
