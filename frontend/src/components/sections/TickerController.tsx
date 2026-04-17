'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { fetchWidgetData } from '@/lib/api';

const CITIES = ['konya', 'antalya', 'bursa', 'izmir', 'ankara', 'samsun', 'adana', 'istanbul'];

export function TickerController() {
  const t = useTranslations('premium.ticker');
  const [tickerItems, setTickerItems] = useState<string[]>([]);

  useEffect(() => {
    async function loadTickerData() {
      try {
        // Fetch 3 random cities to show live data
        const shuffled = [...CITIES].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 3);
        
        const data = await Promise.all(
          selected.map(async (slug) => {
            const res = await fetchWidgetData(slug).catch(() => null);
            if (!res) return null;
            return `${res.location.name}: ${Math.round(res.current.temp)}°C · ${res.current.condition}`;
          })
        );

        const liveItems = data.filter((item): item is string => item !== null);
        const staticItems = ['locations', 'parcels', 'risk', 'cache'].map(key => t(`items.${key}`));
        
        setTickerItems([...liveItems, ...staticItems]);
      } catch {
        // Fallback to static if API fails
        setTickerItems(['locations', 'parcels', 'risk', 'cache'].map(key => t(`items.${key}`)));
      }
    }

    loadTickerData();
  }, [t]);

  if (tickerItems.length === 0) return null;

  const labels = tickerItems.flatMap((item) => [item, 'sep']);

  return (
    <div className="ticker-track">
      {[...labels, ...labels, ...labels].map((item, index) =>
        item === 'sep' ? (
          <span key={`sep-${index}`} className="ticker-sep" aria-hidden="true">
            ✴
          </span>
        ) : (
          <span key={`${item}-${index}`}>{item}</span>
        )
      )}
    </div>
  );
}
