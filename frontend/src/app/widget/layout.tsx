import type { ReactNode } from 'react';

export const metadata = { robots: 'noindex' };

export default function WidgetLayout({ children }: { children: ReactNode }) {
  return <div className="widget-root">{children}</div>;
}
