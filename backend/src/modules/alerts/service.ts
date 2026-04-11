import type { MySql2Database } from 'drizzle-orm/mysql2';
import {
  repoCreateAlert,
  repoMarkAlertSent,
  repoAlertSentRecently,
  repoGetAlerts,
  repoGetAlertRulesByLocation,
} from './repository.js';
import { repoGetLocationById } from '@/modules/locations/repository.js';
import { repoGetFrostForecastsAboveThreshold } from '@/modules/weather/repository.js';
import { telegramNotify } from '@agro/shared-backend/modules/telegram/helpers';
import { sendFcmFrostAlert } from './fcm.js';
import { sendFrostAlertEmail } from './email-delivery.js';

export type AlertChannel = 'telegram' | 'push' | 'email';
export type AlertSeverity = 'info' | 'warning' | 'critical';

interface FrostCheckResult {
  sent: boolean;
  alertId?: string;
  reason?: string;
}

function parseFrostThreshold(raw: string, fallback: number): number {
  const n = Number(String(raw).trim());
  return Number.isFinite(n) ? n : fallback;
}

/** Aktif frost kurallarindan esik + kanal listesi; kural yoksa varsayilan 30 + telegram. */
function frostTargetsFromRules(
  dbRules: Awaited<ReturnType<typeof repoGetAlertRulesByLocation>>,
): { threshold: number; channels: AlertChannel[] }[] {
  const frostRules = dbRules.filter((r) => r.alertType === 'frost' && r.isActive === 1);
  if (!frostRules.length) {
    return [{ threshold: 30, channels: ['telegram'] }];
  }
  const byThreshold = new Map<number, Set<AlertChannel>>();
  for (const r of frostRules) {
    const t = parseFrostThreshold(r.threshold, 30);
    const ch = r.channel as AlertChannel;
    if (ch !== 'telegram' && ch !== 'push' && ch !== 'email') continue;
    if (!byThreshold.has(t)) byThreshold.set(t, new Set());
    byThreshold.get(t)!.add(ch);
  }
  if (!byThreshold.size) {
    return [{ threshold: 30, channels: ['telegram'] }];
  }
  return [...byThreshold.entries()].map(([threshold, set]) => ({ threshold, channels: [...set] }));
}

export async function checkAndSendFrostAlerts(db: MySql2Database, locationId: string): Promise<FrostCheckResult> {
  const alreadySent = await repoAlertSentRecently(db, locationId, 'frost');
  if (alreadySent) return { sent: false, reason: 'spam_prevention' };

  const rules = await repoGetAlertRulesByLocation(db, locationId);
  const targets = frostTargetsFromRules(rules);
  const minTh = Math.min(...targets.map((t) => t.threshold));
  const highRiskForecasts = await repoGetFrostForecastsAboveThreshold(db, locationId, minTh);
  if (!highRiskForecasts.length) return { sent: false, reason: 'no_risk' };

  const maxRisk = Math.max(...highRiskForecasts.map((f) => f.frostRisk ?? 0));
  const channelsSet = new Set<AlertChannel>();
  for (const { threshold, channels } of targets) {
    if (maxRisk >= threshold) {
      for (const c of channels) channelsSet.add(c);
    }
  }
  const channels = [...channelsSet];
  if (!channels.length) return { sent: false, reason: 'no_risk' };

  const severity = getSeverity(maxRisk);
  const location = await repoGetLocationById(db, locationId);
  if (!location) return { sent: false, reason: 'location_not_found' };

  const worstDay = highRiskForecasts.sort((a, b) => (b.frostRisk ?? 0) - (a.frostRisk ?? 0))[0];
  const title = `${severity === 'critical' ? '🚨' : '⚠️'} Don Uyarisi — ${location.name}`;
  const message = buildFrostMessage(location.name, worstDay, severity);

  const alert = await repoCreateAlert(db, {
    locationId,
    alertType: 'frost',
    severity,
    title,
    message,
    threshold: String(Math.min(...targets.filter((t) => maxRisk >= t.threshold).map((t) => t.threshold))),
    actualValue: String(worstDay.tempMin),
    forecastDate: worstDay.forecastDate,
    sentAt: null,
    channels,
    recipients: 0,
  });

  let recipients = 0;
  if (channels.includes('telegram')) {
    if (await sendTelegramAlert(title, message)) recipients += 1;
  }
  if (channels.includes('push')) {
    recipients += await sendFcmFrostAlert(title, message.slice(0, 500));
  }
  if (channels.includes('email')) {
    recipients += await sendFrostAlertEmail(title, message);
  }

  if (recipients > 0) {
    await repoMarkAlertSent(db, alert.id, recipients);
  }

  return { sent: recipients > 0, alertId: alert.id, reason: recipients > 0 ? undefined : 'delivery_failed' };
}

export async function listAlerts(db: MySql2Database, params: { locationId?: string; alertType?: string; page: number; limit: number }) {
  return repoGetAlerts(db, params);
}

function getSeverity(score: number): AlertSeverity {
  if (score >= 80) return 'critical';
  if (score >= 50) return 'warning';
  return 'info';
}

function buildFrostMessage(locationName: string, forecast: any, severity: AlertSeverity): string {
  const tempMin = parseFloat(String(forecast.tempMin ?? 0)).toFixed(1);
  const risk = forecast.frostRisk ?? 0;
  const severityText = severity === 'critical' ? 'KRİTİK' : severity === 'warning' ? 'YÜKSEK' : 'ORTA';

  return [
    `📍 Konum: ${locationName}`,
    `📅 Tarih: ${forecast.forecastDate}`,
    `🌡️ Min Sıcaklık: ${tempMin}°C`,
    `⚠️ Risk Skoru: ${risk}/100 (${severityText})`,
    '',
    '🛡️ Önerilen Önlemler:',
    '• Seralarda ısıtma sistemini kontrol edin',
    '• Açık alandaki hassas bitkileri örtün',
    '• Sulama sistemlerini boşaltın',
  ].join('\n');
}

async function sendTelegramAlert(title: string, message: string): Promise<boolean> {
  try {
    await telegramNotify({ title, message });
    return true;
  } catch {
    return false;
  }
}
