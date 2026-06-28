import type { MySql2Database } from 'drizzle-orm/mysql2';
import {
  repoCreateAlert,
  repoMarkAlertSent,
  repoAlertSentRecently,
  repoDeactivatePushTokens,
  repoGetAlerts,
  repoGetSubscribedUsersForLocation,
  type SubscribedAlertUser,
} from './repository.js';
import { repoGetLocationById } from '@/modules/locations/repository.js';
import { repoGetFrostForecastsAboveThreshold } from '@/modules/weather/repository.js';
import { telegramNotify } from '@agro/shared-backend/modules/telegram';
import { sendFrostAlertEmail } from './email-delivery.js';
import { sendPushFrostAlert, type PushProvider, type PushSendResult, type PushTokenTarget } from './fcm.js';

export type AlertChannel = 'telegram' | 'push' | 'email';
export type AlertSeverity = 'info' | 'warning' | 'critical';

interface FrostCheckResult {
  sent: boolean;
  alertId?: string;
  reason?: string;
}

type PushAlertSender = (title: string, body: string, targets: PushTokenTarget[]) => Promise<PushSendResult>;

let pushAlertSender: PushAlertSender = sendPushFrostAlert;

export function setPushAlertSenderForTests(sender: PushAlertSender | null): void {
  pushAlertSender = sender ?? sendPushFrostAlert;
}

function parseFrostThreshold(raw: string, fallback: number): number {
  const n = Number(String(raw).trim());
  return Number.isFinite(n) ? n : fallback;
}

export async function checkAndSendFrostAlerts(db: MySql2Database, locationId: string): Promise<FrostCheckResult> {
  const subscribers = await repoGetSubscribedUsersForLocation(db, locationId, 'frost');
  const targets = subscribers
    .map((user) => ({
      user,
      threshold: parseFrostThreshold(user.threshold, 30),
      channel: user.channel as AlertChannel,
    }))
    .filter((target) => target.channel === 'telegram' || target.channel === 'email' || target.channel === 'push');

  if (!targets.length) return { sent: false, reason: 'no_subscribers' };

  const minTh = Math.min(...targets.map((t) => t.threshold));
  const highRiskForecasts = await repoGetFrostForecastsAboveThreshold(db, locationId, minTh);
  if (!highRiskForecasts.length) return { sent: false, reason: 'no_risk' };

  const maxRisk = Math.max(...highRiskForecasts.map((f) => f.frostRisk ?? 0));
  const matchedTargets = targets.filter((target) => maxRisk >= target.threshold);
  if (!matchedTargets.length) return { sent: false, reason: 'no_risk' };

  const severity = getSeverity(maxRisk);
  const location = await repoGetLocationById(db, locationId);
  if (!location) return { sent: false, reason: 'location_not_found' };

  const worstDay = highRiskForecasts.sort((a, b) => (b.frostRisk ?? 0) - (a.frostRisk ?? 0))[0];
  const title = `${severity === 'critical' ? '🚨' : '⚠️'} Don Uyarisi — ${location.name}`;
  const message = buildFrostMessage(location.name, worstDay, severity);

  let recipients = 0;
  let firstAlertId: string | undefined;

  for (const target of matchedTargets) {
    const recipientCount = await sendFrostAlertToSubscriber(db, {
      subscriber: target.user,
      threshold: target.threshold,
      channel: target.channel,
      locationId,
      severity,
      title,
      message,
      tempMin: String(worstDay.tempMin),
      forecastDate: worstDay.forecastDate,
    });
    recipients += recipientCount.recipients;
    firstAlertId ??= recipientCount.alertId;
  }

  return { sent: recipients > 0, alertId: firstAlertId, reason: recipients > 0 ? undefined : 'delivery_failed' };
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

async function sendTelegramAlertToChat(title: string, message: string, chatId?: string): Promise<boolean> {
  try {
    await telegramNotify({ title, message, chatId });
    return true;
  } catch {
    return false;
  }
}

async function sendFrostAlertToSubscriber(
  db: MySql2Database,
  input: {
    subscriber: SubscribedAlertUser;
    threshold: number;
    channel: AlertChannel;
    locationId: string;
    severity: AlertSeverity;
    title: string;
    message: string;
    tempMin: string;
    forecastDate: Date;
  },
): Promise<{ recipients: number; alertId?: string }> {
  const alreadySent = await repoAlertSentRecently(
    db,
    input.locationId,
    'frost',
    input.subscriber.userId,
    input.forecastDate,
  );
  if (alreadySent) return { recipients: 0 };

  const channels = [input.channel];
  const alert = await repoCreateAlert(db, {
    userId: input.subscriber.userId,
    locationId: input.locationId,
    alertType: 'frost',
    severity: input.severity,
    title: input.title,
    message: input.message,
    threshold: String(input.threshold),
    actualValue: input.tempMin,
    forecastDate: input.forecastDate,
    sentAt: null,
    channels,
    recipients: 0,
  });

  let recipients = 0;
  if (input.channel === 'telegram' && input.subscriber.telegramChatId) {
    if (await sendTelegramAlertToChat(input.title, input.message, input.subscriber.telegramChatId)) recipients = 1;
  }
  if (input.channel === 'email' && input.subscriber.email) {
    recipients = await sendFrostAlertEmail(input.title, input.message, input.subscriber.email);
  }
  if (input.channel === 'push') {
    const pushTargets = input.subscriber.pushTokens
      .filter((token) => token.provider === 'fcm' || token.provider === 'expo')
      .map((token) => ({ token: token.token, provider: token.provider as PushProvider }));
    const result = await pushAlertSender(input.title, input.message, pushTargets);
    recipients = result.successCount;
    if (result.invalidTokens.length) await repoDeactivatePushTokens(db, result.invalidTokens);
  }

  if (recipients > 0) await repoMarkAlertSent(db, alert.id, recipients);
  return { recipients, alertId: alert.id };
}
