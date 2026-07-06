import nodemailer from 'nodemailer';

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

export function getWelcomeEmailHtml(
  name: string,
  email: string,
  level: number,
  plainPassword?: string,
) {
  const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login`;

  return `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>WTMS Get profile email</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333333; }
        .container { padding: 20px; border: 1px solid #eeeeee; border-radius: 5px; max-width: 600px; margin: 0 auto; }
        .credentials { background-color: #f9f9f9; padding: 15px; border-left: 4px solid #0070f3; margin: 15px 0; }
        .button { display: inline-block; padding: 10px 20px; color: #ffffff !important; background-color: #0070f3; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <h2>Selamat Datang di WTMS, ${name}!</h2>
        <p>Akun Anda untuk Widyaswara Training Management System (WTMS) telah berhasil dibuat. Berikut adalah kredensial login Anda:</p>
        <div class="credentials">
            <p><strong>Email Sistem:</strong> ${email}</p>
            <p><strong>Level Weight:</strong> ${level}</p>
            ${plainPassword ? `<p><strong>Password Sementara:</strong> ${plainPassword}</p>` : ''}
        </div>
        <p>Silakan klik tombol di bawah ini untuk masuk ke dashboard Anda dan segera ubah password Anda pada menu profil demi keamanan data.</p>
        <a href="${loginUrl}" class="button">Login ke WTMS</a>
        <hr style="border: none; border-top: 1px solid #eeeeee; margin-top: 20px;" />
        <p style="font-size: 12px; color: #777777;">Email ini dikirimkan secara otomatis oleh sistem, mohon tidak membalas email ini.</p>
    </div>
</body>
</html>`;
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
