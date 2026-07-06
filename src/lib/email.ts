import nodemailer from 'nodemailer';
import { getWelcomeEmailHtml } from './email-templates';

// SMTP SumoPOD (staging) — hardcoded defaults with env var overrides
const smtpHost = process.env.SMTP_HOST || 'smtp.sumopod.com';
const smtpPort = parseInt(process.env.SMTP_PORT || '465');
const smtpSecure = process.env.SMTP_SECURE === 'false' ? false : true;
const smtpUser = process.env.SMTP_USER || 'cmr984ap1el52qh08yjynbrsk';
const smtpPass = process.env.SMTP_PASS || 'IcblCdX00Ym1itPC7f6neJFnTVd2vhKD';
const fromEmail = process.env.SMTP_FROM || 'noreply@wtms.com';

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpSecure,
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
});

export async function sendEmail(to: string, subject: string, html: string) {
  await transporter.sendMail({
    from: `"WTMS System" <${fromEmail}>`,
    to,
    subject,
    html,
  });
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
