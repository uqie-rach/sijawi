import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { getWelcomeEmailHtml } from './email-templates';

// SMTP SumoPOD (staging) — hardcoded defaults with env var overrides
const smtpHost = process.env.SMTP_HOST || 'smtp.sumopod.com';
const smtpPort = parseInt(process.env.SMTP_PORT || '465');
const smtpSecure = process.env.SMTP_SECURE === 'false' ? false : true;
const smtpUser = process.env.SMTP_USER || 'cmr984ap1el52qh08yjynbrsk';
const smtpPass = process.env.SMTP_PASS || 'IcblCdX00Ym1itPC7f6neJFnTVd2vhKD';
const fromEmail = process.env.SMTP_FROM || 'noreply@wtms.com';

let _transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (_transporter) return _transporter;
  try {
    _transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      connectionTimeout: 10000,
      socketTimeout: 10000,
    });
    return _transporter;
  } catch {
    // Fallback: return a noop transporter if SMTP config is broken
    // This prevents uncaughtException crashes at module import time
    return nodemailer.createTransport({ streamTransport: true, buffer: true });
  }
}

export async function sendEmail(to: string, subject: string, html: string) {
  try {
    const transporter = getTransporter();
    await transporter.sendMail({
      from: `"WTMS System" <${fromEmail}>`,
      to,
      subject,
      html,
    });
  } catch (error) {
    // Graceful degradation: log error but don't crash the process
    console.error('[Email] Failed to send email:', error);
  }
}

export async function sendWelcomeEmail(
  name: string,
  email: string,
  level: number,
  plainPassword?: string,
) {
  const html = getWelcomeEmailHtml(name, email, level, plainPassword);
  await sendEmail(email, 'Selamat Datang di WTMS - Kredensial Akun Anda', html);
}
