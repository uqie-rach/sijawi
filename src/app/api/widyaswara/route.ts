import { connectToDatabase } from '@/lib/mongodb';
import Widyaiswara from '@/models/Widyaiswara';
import { bcrypt } from '@/lib/bcrypt';
import { cookies } from 'next/headers';
import nodemailer from 'nodemailer';

async function isAdmin() {
  try {
    await connectToDatabase();
    const count = await Widyaiswara.countDocuments();
    if (count === 0) {
      return true;
    }
  } catch (e) {
    // Ignore and proceed to cookie check
  }
  const cookieStore = await cookies();
  const token = cookieStore.get('sessionToken')?.value;
  return token === 'admin-session-token';
}

// Helper to send welcome email
async function sendWelcomeEmail(name: string, email: string, level: number, plainPassword?: string) {
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = parseInt(process.env.SMTP_PORT || '587');
  const smtpUser = process.env.SMTP_USER || '';
  const smtpPass = process.env.SMTP_PASS || '';
  const fromEmail = process.env.SMTP_FROM || smtpUser || 'noreply@wtms.com';

  if (!smtpUser || !smtpPass) {
    console.warn("SMTP credentials not configured. Skipping welcome email sending.");
    return;
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login`;

  const htmlContent = `
<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>WTMS Get profile email</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
        }

        .container {
            padding: 20px;
            border: 1px solid #eeeeee;
            border-radius: 5px;
            max-width: 600px;
            margin: 0 auto;
        }

        .credentials {
            background-color: #f9f9f9;
            padding: 15px;
            border-left: 4px solid #0070f3;
            margin: 15px 0;
        }

        .button {
            display: inline-block;
            padding: 10px 20px;
            color: #ffffff !important;
            background-color: #0070f3;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin-top: 10px;
        }
    </style>
</head>

<body>
    <div class="container">
        <h2>Selamat Datang di WTMS, ${name}!</h2>
        <p>Akun Anda untuk Widyaswara Training Management System (WTMS) telah berhasil dibuat. Berikut adalah kredensial
            login Anda:</p>

        <div class="credentials">
            <p><strong>Email Sistem:</strong> ${email}</p>
            <p><strong>Level Weight:</strong> ${level}</p>
            ${plainPassword ? `<p><strong>Password Sementara:</strong> ${plainPassword}</p>` : ''}
        </div>

        <p>Silakan klik tombol di bawah ini untuk masuk ke dashboard Anda dan segera ubah password Anda pada menu profil
            demi keamanan data.</p>
        <a href="${loginUrl}" class="button">Login ke WTMS</a>

        <hr style="border: none; border-top: 1px solid #eeeeee; margin-top: 20px;" />
        <p style="font-size: 12px; color: #777777;">Email ini dikirimkan secara otomatis oleh sistem, mohon tidak
            membalas email ini.</p>
    </div>
</body>

</html>
  `;

  await transporter.sendMail({
    from: `"WTMS System" <${fromEmail}>`,
    to: email,
    subject: 'Selamat Datang di WTMS - Kredensial Akun Anda',
    html: htmlContent,
  });
}

export async function GET() {
  try {
    await connectToDatabase();
    const rows = await Widyaiswara.find().sort({ name: 1 });
    const widyaswaras = rows.map(r => ({
      id: r._id,
      name: r.name,
      gelar: r.gelar || '',
      email: r.email,
      nip: r.nip,
      jabatan: r.jabatan,
      level: r.level,
      levelLabel: r.level_label,
      jpLastMonth: r.jp_last_month || 0,
      password: r.password_plain || 'wi123'
    }));
    return Response.json(widyaswaras);
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    await connectToDatabase();
    const body = await request.json();
    const { id, name, gelar, email, nip, jabatan, level, levelLabel, jpLastMonth, password } = body;
    
    const plainPassword = password || 'wi123';
    const passwordHash = await bcrypt.hash(plainPassword);

    const newWi = new Widyaiswara({
      _id: id,
      name,
      gelar: gelar || '',
      email,
      nip,
      jabatan,
      level,
      level_label: levelLabel,
      jp_last_month: jpLastMonth || 0,
      password_hash: passwordHash,
      password_plain: plainPassword
    });

    await newWi.save();

    // Send welcome email asynchronously
    try {
      await sendWelcomeEmail(name, email, level, plainPassword);
    } catch (emailErr) {
      console.error("Failed to send welcome email:", emailErr);
    }

    return Response.json({ success: true });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!(await isAdmin())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    await connectToDatabase();
    const body = await request.json();
    const { id, name, gelar, email, nip, jabatan, level, levelLabel, jpLastMonth, password } = body;
    
    const updateData: any = {
      name,
      gelar: gelar || '',
      email,
      nip,
      jabatan,
      level,
      level_label: levelLabel,
      jp_last_month: jpLastMonth || 0
    };

    if (password) {
      updateData.password_hash = await bcrypt.hash(password);
      updateData.password_plain = password;
    }

    await Widyaiswara.findByIdAndUpdate(id, updateData);
    return Response.json({ success: true });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!(await isAdmin())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return Response.json({ error: 'ID is required' }, { status: 400 });
    
    await Widyaiswara.findByIdAndDelete(id);
    return Response.json({ success: true });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}