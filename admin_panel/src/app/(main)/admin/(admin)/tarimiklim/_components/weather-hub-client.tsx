'use client';

import Link from 'next/link';

import { useAdminT } from '@/app/(main)/admin/_components/common/useAdminT';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function WeatherAdminHubClient() {
  const t = useAdminT();
  const envTitle = (process.env.NEXT_PUBLIC_ADMIN_WEATHER_HUB_TITLE || '').trim();
  const envSubtitle = (process.env.NEXT_PUBLIC_ADMIN_WEATHER_HUB_SUBTITLE || '').trim();
  const title = envTitle || t('weatherModule.hubTitle');
  const subtitle = envSubtitle || t('weatherModule.hubSubtitle');

  const links = [
    {
      href: '/admin/tarimiklim/locations',
      title: t('weatherModule.cardLocationsTitle'),
      desc: t('weatherModule.cardLocationsDesc'),
    },
    {
      href: '/admin/tarimiklim/alerts',
      title: t('weatherModule.cardAlertsTitle'),
      desc: t('weatherModule.cardAlertsDesc'),
    },
    {
      href: '/admin/tarimiklim/alert-rules',
      title: t('weatherModule.cardRulesTitle'),
      desc: t('weatherModule.cardRulesDesc'),
    },
  ] as const;

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="w-8 h-px bg-gm-gold" />
            <span className="text-gm-gold font-bold text-[10px] tracking-[0.2em] uppercase">Sistem</span>
          </div>
          <h1 className="font-serif text-4xl text-gm-text">{title}</h1>
          <p className="text-gm-muted text-sm font-serif italic max-w-xl">
            {subtitle}
          </p>
        </div>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {links.map((item) => (
          <li key={item.href}>
            <Link href={item.href} prefetch={false}>
              <Card className="h-full bg-gm-surface/20 border-gm-border-soft rounded-[32px] overflow-hidden backdrop-blur-sm shadow-xl transition-all hover:bg-gm-surface/50 group">
                <CardHeader className="p-8">
                  <CardTitle className="font-serif text-2xl text-gm-text group-hover:text-gm-gold transition-colors">{item.title}</CardTitle>
                  <CardDescription className="text-gm-muted font-serif italic mt-2">{item.desc}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
