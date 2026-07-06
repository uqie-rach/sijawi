import { connectToDatabase } from '@/lib/mongodb';
import Widyaiswara from '@/models/Widyaiswara';
import { bcrypt } from '@/lib/bcrypt';
import { cookies } from 'next/headers';
import { enqueueEmail } from '@/lib/queue';
import { getWelcomeEmailHtml } from '@/lib/email';

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

    // Enqueue welcome email via BullMQ (non-blocking)
    enqueueEmail({
      to: email,
      subject: 'Selamat Datang di WTMS - Kredensial Akun Anda',
      html: getWelcomeEmailHtml(name, email, level, plainPassword),
      type: 'welcome',
    });

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