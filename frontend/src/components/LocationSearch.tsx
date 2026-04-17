'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import provincesData from '../../public/data/turkey-provinces.json';
import { searchPlaces, reverseGeocode, type GeocodeResult } from '@/lib/geocoding';
import {
  readSaved,
  saveLocation,
  requestBrowserLocation,
  type SavedLocation,
} from '@/lib/user-location';

type Mode = 'idle' | 'search' | 'manual';
type Source = SavedLocation['source'];

export interface SelectedLocation {
  lat: number;
  lon: number;
  name: string;
  source: Source;
  subtitle?: string;
}

interface Province {
  plate: number;
  slug: string;
  name: string;
  lat: number;
  lon: number;
  region: string;
}

const PROVINCES = (provincesData as { provinces: Province[] }).provinces;
const DEFAULT_FALLBACK: SelectedLocation = {
  lat: 41.0082,
  lon: 28.9784,
  name: 'İstanbul',
  source: 'province',
  subtitle: 'Marmara',
};

interface Props {
  value: SelectedLocation | null;
  onChange: (loc: SelectedLocation) => void;
}

function matchProvinces(q: string): Province[] {
  const norm = q.toLocaleLowerCase('tr').trim();
  if (!norm) return [];
  return PROVINCES.filter((p) =>
    p.name.toLocaleLowerCase('tr').includes(norm) || p.slug.includes(norm),
  ).slice(0, 5);
}

function formatCoord(n: number): string {
  return n.toFixed(4);
}

export function LocationSearch({ value, onChange }: Props) {
  const t = useTranslations('home.locationSearch');
  const [mode, setMode] = useState<Mode>('idle');
  const [query, setQuery] = useState('');
  const [remoteResults, setRemoteResults] = useState<GeocodeResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [geoStatus, setGeoStatus] = useState<'idle' | 'pending' | 'denied' | 'unavailable'>('idle');
  const [manualLat, setManualLat] = useState('');
  const [manualLon, setManualLon] = useState('');
  const initRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);

  const commit = useCallback(
    (loc: SelectedLocation) => {
      onChange(loc);
      saveLocation({ lat: loc.lat, lon: loc.lon, name: loc.name, source: loc.source });
    },
    [onChange],
  );

  const useBrowserLocation = useCallback(async () => {
    setGeoStatus('pending');
    const res = await requestBrowserLocation();
    if (res.status !== 'granted' || res.lat == null || res.lon == null) {
      setGeoStatus(res.status === 'denied' ? 'denied' : 'unavailable');
      return;
    }
    const reverse = await reverseGeocode(res.lat, res.lon);
    const name = reverse?.name || t('currentArea');
    const subtitle =
      [reverse?.district, reverse?.city || reverse?.state].filter(Boolean).join(' · ') ||
      `${formatCoord(res.lat)}° N, ${formatCoord(res.lon)}° E`;
    commit({ lat: res.lat, lon: res.lon, name, source: 'geolocation', subtitle });
    setGeoStatus('idle');
    setMode('idle');
  }, [commit, t]);

  useEffect(() => {
    if (initRef.current) return;
    // Parent zaten bir değer verdiyse (URL query'den geldi örn.) init'i atla.
    if (value) {
      initRef.current = true;
      return;
    }
    initRef.current = true;
    const saved = readSaved();
    if (saved) {
      onChange({ lat: saved.lat, lon: saved.lon, name: saved.name, source: saved.source });
      return;
    }
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      void useBrowserLocation();
    } else {
      onChange(DEFAULT_FALLBACK);
    }
  }, [onChange, useBrowserLocation, value]);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 3) {
      setRemoteResults([]);
      return;
    }
    const handle = setTimeout(async () => {
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      setSearching(true);
      try {
        const items = await searchPlaces(q, ctrl.signal);
        if (!ctrl.signal.aborted) setRemoteResults(items);
      } catch {
        if (!ctrl.signal.aborted) setRemoteResults([]);
      } finally {
        if (!ctrl.signal.aborted) setSearching(false);
      }
    }, 350);
    return () => clearTimeout(handle);
  }, [query]);

  const provinceMatches = useMemo(() => matchProvinces(query), [query]);

  const applyProvince = (p: Province) => {
    commit({
      lat: p.lat,
      lon: p.lon,
      name: p.name,
      source: 'province',
      subtitle: (provincesData as { regions: Record<string, string> }).regions[p.region],
    });
    setMode('idle');
    setQuery('');
  };

  const applyGeocode = (r: GeocodeResult) => {
    const subtitle = [r.district, r.city || r.state].filter(Boolean).join(' · ') || r.country;
    commit({ lat: r.lat, lon: r.lon, name: r.name, source: 'search', subtitle });
    setMode('idle');
    setQuery('');
    setRemoteResults([]);
  };

  const applyManual = () => {
    const lat = Number(manualLat);
    const lon = Number(manualLon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;
    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return;
    commit({
      lat,
      lon,
      name: `${formatCoord(lat)}° N, ${formatCoord(lon)}° E`,
      source: 'manual',
    });
    setMode('idle');
  };

  const active = value ?? DEFAULT_FALLBACK;

  return (
    <section className="location-search">
      <header className="location-search-head">
        <div>
          <div className="location-search-eyebrow">{t('eyebrow')}</div>
          <div className="location-search-name">{active.name}</div>
          <div className="location-search-sub">
            {active.subtitle ?? `${formatCoord(active.lat)}° N, ${formatCoord(active.lon)}° E`}
          </div>
        </div>
        <div className="location-search-actions">
          <button
            type="button"
            className="button-ghost"
            onClick={useBrowserLocation}
            disabled={geoStatus === 'pending'}
          >
            {geoStatus === 'pending' ? t('locating') : t('useMyLocation')}
          </button>
          <button
            type="button"
            className="button-primary"
            onClick={() => setMode(mode === 'search' ? 'idle' : 'search')}
          >
            {t('searchOther')}
          </button>
        </div>
      </header>

      {geoStatus === 'denied' ? (
        <p className="location-search-hint">{t('geoDenied')}</p>
      ) : geoStatus === 'unavailable' ? (
        <p className="location-search-hint">{t('geoUnavailable')}</p>
      ) : null}

      {mode === 'search' ? (
        <div className="location-search-panel">
          <input
            type="search"
            className="location-search-input"
            placeholder={t('placeholder')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <div className="location-search-results">
            {provinceMatches.length > 0 ? (
              <div className="location-search-group">
                <div className="location-search-group-label">{t('provinces')}</div>
                {provinceMatches.map((p) => (
                  <button
                    key={p.slug}
                    type="button"
                    className="location-search-item"
                    onClick={() => applyProvince(p)}
                  >
                    <span className="location-search-item-name">{p.name}</span>
                    <span className="location-search-item-sub">
                      {(provincesData as { regions: Record<string, string> }).regions[p.region]}
                    </span>
                  </button>
                ))}
              </div>
            ) : null}
            {searching ? <p className="location-search-hint">{t('searching')}</p> : null}
            {remoteResults.length > 0 ? (
              <div className="location-search-group">
                <div className="location-search-group-label">{t('addresses')}</div>
                {remoteResults.map((r) => (
                  <button
                    key={`${r.lat}-${r.lon}`}
                    type="button"
                    className="location-search-item"
                    onClick={() => applyGeocode(r)}
                  >
                    <span className="location-search-item-name">{r.name}</span>
                    <span className="location-search-item-sub">{r.displayName}</span>
                  </button>
                ))}
              </div>
            ) : null}
            {query.trim().length >= 3 &&
            !searching &&
            provinceMatches.length === 0 &&
            remoteResults.length === 0 ? (
              <p className="location-search-hint">{t('noResults')}</p>
            ) : null}
          </div>
          <details className="location-search-advanced">
            <summary>{t('advanced')}</summary>
            <div className="location-search-manual">
              <input
                type="number"
                step="0.0001"
                placeholder={t('lat')}
                value={manualLat}
                onChange={(e) => setManualLat(e.target.value)}
              />
              <input
                type="number"
                step="0.0001"
                placeholder={t('lon')}
                value={manualLon}
                onChange={(e) => setManualLon(e.target.value)}
              />
              <button type="button" className="button-ghost" onClick={applyManual}>
                {t('apply')}
              </button>
            </div>
          </details>
        </div>
      ) : null}
    </section>
  );
}
