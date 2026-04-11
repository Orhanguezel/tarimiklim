import nodemailer from 'nodemailer';
import { env } from '@/core/env.js';

export async function sendFrostAlertEmail(subject: string, text: string): Promise<number> {
  const to = String(env.ALERT_EMAIL_TO ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (!to.length || !env.SMTP_HOST?.trim()) return 0;

  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth:
      env.SMTP_USER && env.SMTP_PASS
        ? { user: env.SMTP_USER, pass: env.SMTP_PASS }
        : undefined,
  });

  await transporter.sendMail({
    from: env.MAIL_FROM,
    to: to.join(', '),
    subject,
    text,
  });
  return to.length;
}
