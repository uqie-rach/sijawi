import { prisma } from '@/lib/prisma';
import { bcrypt } from '@/lib/bcrypt';
import { isAdmin } from '@/lib/auth-utils';
import { enqueueEmail } from '@/lib/queue';
import { getWelcomeEmailHtml } from '@/lib/email-templates';

export async function GET() {
  try {
    const rows = await prisma.widyaiswara.findMany({ orderBy: { name: 'asc' } });
    const widyaswaras = rows.map(r => ({
      id: r.id,
      name: r.name,
      gelar: r.gelar || '',
      email: r.email,
      nip: r.nip,
      jabatan: r.jabatan,
      level: r.level,
      levelLabel: r.level_label,
      jpLastMonth: r.jp_last_month || 0,
      password: r.password_plain || 'wi123',
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
    const body = await request.json();
    const { id, name, gelar, email, nip, jabatan, level, levelLabel, jpLastMonth, password } = body;

    const existing = await prisma.widyaiswara.findFirst({
      where: { OR: [{ email }, { nip }] },
    });
    if (existing) {
      return Response.json({ error: 'Email or NIP already exists' }, { status: 400 });
    }

    const plainPassword = password || 'wi123';
    const passwordHash = await bcrypt.hash(plainPassword);

    await prisma.widyaiswara.create({
      data: {
        id,
        name,
        gelar: gelar || '',
        email,
        nip,
        jabatan,
        level,
        level_label: levelLabel,
        jp_last_month: jpLastMonth || 0,
        password_hash: passwordHash,
        password_plain: plainPassword,
      },
    });

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
    const body = await request.json();
    const { id, name, gelar, email, nip, jabatan, level, levelLabel, jpLastMonth, password } = body;

    const data: Record<string, any> = {
      name,
      gelar: gelar || '',
      email,
      nip,
      jabatan,
      level,
      level_label: levelLabel,
      jp_last_month: jpLastMonth || 0,
    };

    if (password) {
      data.password_hash = await bcrypt.hash(password);
      data.password_plain = password;
    }

    await prisma.widyaiswara.update({ where: { id }, data });
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
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return Response.json({ error: 'ID is required' }, { status: 400 });

    await prisma.widyaiswara.delete({ where: { id } });
    return Response.json({ success: true });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
