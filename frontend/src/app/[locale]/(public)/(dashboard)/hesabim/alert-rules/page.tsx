'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Bell, Trash2, CheckCircle, XCircle, Send } from 'lucide-react';
import { getAuthUser } from '@/lib/auth-client';
import { reverseGeocode, searchPlaces, type GeocodeResult } from '@/lib/geocoding';
import { requestBrowserLocation } from '@/lib/user-location';
import { useToast } from '@/components/providers/ToastProvider';
import {
  createMyAlertRule,
  deleteMyAlertRule,
  getMyTelegramChatId,
  listLocations,
  listMyAlertRules,
  setMyAlertRuleActive,
  updateMyTelegramChatId,
  type LocationRow,
  type MyAlertRule,
} from '@/lib/alerts-client';

export default function MyAlertRulesPage() {
  const params = useParams<{ locale: string }>();
  const locale = params?.locale || 'tr';
  const router = useRouter();
  const toast = useToast();

  const [booting, setBooting] = useState(true);
  const [locations, setLocations] = useState<LocationRow[]>([]);
  const [rules, setRules] = useState<MyAlertRule[]>([]);
  const [chatId, setChatId] = useState<string>('');

  const [locationId, setLocationId] = useState('');
  const [alertType, setAlertType] = useState<MyAlertRule['alertType']>('frost');
  const [channel, setChannel] = useState<MyAlertRule['channel']>('telegram');
  const [threshold, setThreshold] = useState('60');
  const [searchText, setSearchText] = useState('');
  const [searching, setSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<GeocodeResult[]>([]);
  const [pickedPlace, setPickedPlace] = useState<GeocodeResult | null>(null);
  const [nearestLocationName, setNearestLocationName] = useState<string>('');
  const [nearestDistanceKm, setNearestDistanceKm] = useState<number | null>(null);
  const [geoLocating, setGeoLocating] = useState(false);
  const [savingTelegram, setSavingTelegram] = useState(false);
  const [creatingRule, setCreatingRule] = useState(false);

  const locationsById = useMemo(() => new Map(locations.map((l) => [l.id, l])), [locations]);

  useEffect(() => {
    (async () => {
      const user = await getAuthUser();
      if (!user) {
        router.replace(`/${locale}/giris`);
        return;
      }
      const [locs, myRules, tg] = await Promise.all([
        listLocations(),
        listMyAlertRules(),
        getMyTelegramChatId(),
      ]);
      setLocations(locs);
      setRules(myRules);
      setChatId(tg || '');
      if (!locationId && locs.length) setLocationId(locs[0]!.id);
      setBooting(false);
    })().catch(() => {
      setBooting(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const q = searchText.trim();
    if (q.length < 3) {
      setSuggestions([]);
      return;
    }

    const handle = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await searchPlaces(q, undefined, { limit: 6, language: 'tr' });
        setSuggestions(results);
      } catch {
        setSuggestions([]);
      } finally {
        setSearching(false);
      }
    }, 350);

    return () => clearTimeout(handle);
  }, [searchText]);

  useEffect(() => {
    if (!pickedPlace || locations.length === 0) return;
    const nearest = findNearestLocation(locations, pickedPlace.lat, pickedPlace.lon);
    if (!nearest) return;
    setLocationId(nearest.location.id);
    setNearestLocationName(nearest.location.name);
    setNearestDistanceKm(Number(nearest.distanceKm.toFixed(1)));
  }, [pickedPlace, locations]);

  useEffect(() => {
    if (!locationId || locations.length === 0 || pickedPlace) return;
    const selected = locations.find((l) => l.id === locationId);
    if (!selected) return;
    const lat = Number(selected.latitude);
    const lon = Number(selected.longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;
    setPickedPlace({
      name: selected.name,
      displayName: `${selected.name}${selected.city ? `, ${selected.city}` : ''}`,
      lat,
      lon,
    });
  }, [locationId, locations, pickedPlace]);

  async function useMyLocation() {
    setGeoLocating(true);
    try {
      const cur = await requestBrowserLocation();
      if (cur.status !== 'granted' || cur.lat == null || cur.lon == null) return;
      const rev = await reverseGeocode(cur.lat, cur.lon);
      const place: GeocodeResult = {
        name: rev?.name || 'Mevcut Konum',
        displayName: rev?.displayName || `${cur.lat.toFixed(4)}, ${cur.lon.toFixed(4)}`,
        lat: cur.lat,
        lon: cur.lon,
      };
      setPickedPlace(place);
      setSearchText(place.displayName);
      setSuggestions([]);
    } finally {
      setGeoLocating(false);
    }
  }

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    if (!locationId) {
      toast.error('Önce bir konum seçin.');
      return;
    }
    setCreatingRule(true);
    try {
      const created = await createMyAlertRule({
        locationId,
        alertType,
        channel,
        threshold,
      });
      setRules((prev) => [created, ...prev]);
      toast.success('Bildirim kuralı oluşturuldu.');
    } catch {
      toast.error('Kural oluşturulamadı. Lütfen tekrar deneyin.');
    } finally {
      setCreatingRule(false);
    }
  }

  if (booting) {
    return (
      <div className="dashboard-loading">
        <div className="dashboard-loading-spinner" />
        <p>Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-page-head">
        <div className="dashboard-page-kicker">
          Katman 05 · Uyarı Yönetimi
        </div>
        <h1>Uyarı Tercihleri</h1>
        <p>
          Meteorolojik riskler için kişiselleştirilmiş bildirim talepleri oluşturun. 
          Eşik değerleriniz aşıldığında sizi anında bilgilendiririz.
        </p>
      </header>

      <div className="dashboard-alert-grid">
        <div className="dashboard-page">
          <section className="dashboard-panel dashboard-panel-body">
            <div className="dashboard-panel-inline-head">
              <div className="dashboard-panel-icon">
                <Send size={20} />
              </div>
              <h2 className="dashboard-panel-title">Telegram Bağlantısı</h2>
            </div>
            <div className="dashboard-form-stack">
              <div className="dashboard-field">
                <label>Chat ID</label>
                <input
                  className="dashboard-input"
                  placeholder="-100123456789 veya 123456789"
                  value={chatId}
                  onChange={(e) => setChatId(e.target.value)}
                />
              </div>
              <button
                className="dashboard-button is-full"
                onClick={async () => {
                  setSavingTelegram(true);
                  try {
                    const saved = await updateMyTelegramChatId(chatId.trim() ? chatId.trim() : null);
                    setChatId(saved || '');
                    toast.success('Telegram Chat ID kaydedildi.');
                  } catch {
                    toast.error('Telegram Chat ID kaydedilemedi.');
                  } finally {
                    setSavingTelegram(false);
                  }
                }}
                disabled={savingTelegram}
              >
                {savingTelegram ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </section>

          <section className="dashboard-panel dashboard-panel-body">
            <h2 className="dashboard-panel-title">Yeni Bildirim Talebi</h2>
            <form className="dashboard-form-stack" onSubmit={onCreate}>
              <div className="dashboard-field">
                <label>Konum Ara</label>
                <input
                  className="dashboard-input"
                  placeholder="İl, ilçe, mahalle veya adres yazın..."
                  value={searchText}
                  onChange={(e) => {
                    setSearchText(e.target.value);
                    setPickedPlace(null);
                    setNearestLocationName('');
                    setNearestDistanceKm(null);
                  }}
                />
                <div className="dashboard-inline-actions">
                  <button
                    type="button"
                    className="dashboard-outline-button"
                    onClick={useMyLocation}
                    disabled={geoLocating}
                  >
                    {geoLocating ? 'Konum alınıyor...' : 'Mevcut Konumumu Kullan'}
                  </button>
                </div>
                {searching ? <small>Konum aranıyor...</small> : null}
                {suggestions.length > 0 ? (
                  <div className="dashboard-suggestions">
                    {suggestions.map((s) => (
                      <button
                        key={`${s.lat}-${s.lon}-${s.displayName}`}
                        type="button"
                        className="dashboard-suggestion-item"
                        onClick={() => {
                          setPickedPlace(s);
                          setSearchText(s.displayName);
                          setSuggestions([]);
                        }}
                      >
                        <strong>{s.name}</strong>
                        <span>{s.displayName}</span>
                      </button>
                    ))}
                  </div>
                ) : null}
                {pickedPlace ? (
                  <div className="dashboard-location-preview">
                    <div>
                      <strong>{pickedPlace.name}</strong>
                      <p>{pickedPlace.displayName}</p>
                      <small>
                        {pickedPlace.lat.toFixed(5)}, {pickedPlace.lon.toFixed(5)}
                      </small>
                      {nearestLocationName ? (
                        <p>
                          Eşlenen sistem konumu: <strong>{nearestLocationName}</strong>
                          {nearestDistanceKm != null ? ` (${nearestDistanceKm} km)` : ''}
                        </p>
                      ) : null}
                    </div>
                    <iframe
                      title="Seçilen Konum Harita Önizleme"
                      className="dashboard-map-preview"
                      loading="lazy"
                      src={buildOsmEmbedUrl(pickedPlace.lat, pickedPlace.lon)}
                    />
                  </div>
                ) : null}
              </div>

              <div className="dashboard-field">
                <small>Not: Bildirim kuralı sistemde kayıtlı en yakın konuma bağlanır.</small>
              </div>

              <div className="dashboard-form-grid">
                <div className="dashboard-field">
                  <label>Tip</label>
                  <select
                    className="dashboard-input"
                    value={alertType}
                    onChange={(e) => setAlertType(e.target.value as any)}
                  >
                    <option value="frost">Don</option>
                    <option value="heavy_rain">Yağış</option>
                    <option value="storm">Fırtına</option>
                    <option value="heat">Sıcaklık</option>
                    <option value="humidity">Nem</option>
                  </select>
                </div>
                <div className="dashboard-field">
                  <label>Kanal</label>
                  <select
                    className="dashboard-input"
                    value={channel}
                    onChange={(e) => setChannel(e.target.value as any)}
                  >
                    <option value="telegram">Telegram</option>
                    <option value="email">E-posta</option>
                    <option value="push">Push</option>
                  </select>
                </div>
              </div>

              <div className="dashboard-field">
                <label>Risk Eşiği (%)</label>
                <input
                  className="dashboard-input"
                  type="number"
                  min="1"
                  max="100"
                  value={threshold}
                  onChange={(e) => setThreshold(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="dashboard-button is-full"
                disabled={!locationId || creatingRule}
              >
                {creatingRule ? 'Oluşturuluyor...' : 'Talebi Oluştur'}
              </button>
            </form>
          </section>
        </div>

        <div className="dashboard-page">
          <div className="dashboard-page-headline">
            <h2 className="dashboard-page-title is-small">Bildirim Kurallarınız</h2>
            <span className="dashboard-badge is-success">
              {rules.length} Aktif
            </span>
          </div>

          {rules.length === 0 ? (
            <div className="dashboard-empty">
              <Bell size={32} />
              <p>Henüz bir kural tanımlamadınız.</p>
            </div>
          ) : (
            <div className="dashboard-list">
              {rules.map((r) => {
                const loc = locationsById.get(r.locationId);
                const isActive = r.isActive === 1;
                
                return (
                  <article
                    key={r.id}
                    className={`dashboard-alert-rule${isActive ? '' : ' is-disabled'}`}
                  >
                    <div className="dashboard-alert-rule-head">
                      <div className="dashboard-alert-rule-title-wrap">
                        <div className="dashboard-alert-rule-icon">
                          <Bell size={16} />
                        </div>
                        <div>
                          <div className="dashboard-list-note">
                            {loc?.name || 'Konum'}
                          </div>
                          <h3>
                            {r.alertType} Bildirimi
                          </h3>
                        </div>
                      </div>
                      <div className="dashboard-alert-status">
                        {isActive ? <CheckCircle size={20} /> : <XCircle size={20} />}
                      </div>
                    </div>

                    <div className="dashboard-alert-rule-foot">
                      <div className="dashboard-alert-rule-meta">
                        <div>
                          <span>Kanal</span>
                          <strong>{r.channel}</strong>
                        </div>
                        <div>
                          <span>Eşik</span>
                          <strong>%{r.threshold}</strong>
                        </div>
                      </div>

                      <div className="dashboard-list-actions">
                        <button
                          className={isActive ? 'dashboard-outline-button' : 'dashboard-button'}
                          onClick={async () => {
                            const updated = await setMyAlertRuleActive(r.id, !isActive);
                            setRules((prev) => prev.map((x) => (x.id === r.id ? updated : x)));
                          }}
                        >
                          {isActive ? 'Durdur' : 'Başlat'}
                        </button>
                        <button
                          className="dashboard-icon-button is-danger"
                          onClick={async () => {
                            if (confirm('Silmek istediğinize emin misiniz?')) {
                              await deleteMyAlertRule(r.id);
                              setRules((prev) => prev.filter((x) => x.id !== r.id));
                            }
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function toRad(n: number) {
  return (n * Math.PI) / 180;
}

function haversineKm(aLat: number, aLon: number, bLat: number, bLon: number) {
  const R = 6371;
  const dLat = toRad(bLat - aLat);
  const dLon = toRad(bLon - aLon);
  const aa =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa));
  return R * c;
}

function findNearestLocation(locations: LocationRow[], lat: number, lon: number) {
  let best: { location: LocationRow; distanceKm: number } | null = null;
  for (const l of locations) {
    const lLat = Number(l.latitude);
    const lLon = Number(l.longitude);
    if (!Number.isFinite(lLat) || !Number.isFinite(lLon)) continue;
    const d = haversineKm(lat, lon, lLat, lLon);
    if (!best || d < best.distanceKm) {
      best = { location: l, distanceKm: d };
    }
  }
  return best;
}

function buildOsmEmbedUrl(lat: number, lon: number) {
  const delta = 0.08;
  const left = lon - delta;
  const right = lon + delta;
  const top = lat + delta;
  const bottom = lat - delta;
  const bbox = `${left}%2C${bottom}%2C${right}%2C${top}`;
  const marker = `${lat}%2C${lon}`;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${marker}`;
}
