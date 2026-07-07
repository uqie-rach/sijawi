import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/auth-utils';

export async function GET() {
  try {
    const rows = await prisma.mataPelatihan.findMany({ orderBy: { name: 'asc' } });
    const mapel = rows.map(r => ({
      id: r.id,
      name: r.name,
      kategoriId: r.kategori_id,
      jpTotal: r.jp_total,
    }));
    return Response.json(mapel);
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
    const { id, name, kategoriId, jpTotal } = body;

    await prisma.mataPelatihan.create({
      data: { id, name, kategori_id: kategoriId, jp_total: jpTotal },
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
    const { id, name, kategoriId, jpTotal } = body;

    await prisma.mataPelatihan.update({
      where: { id },
      data: { name, kategori_id: kategoriId, jp_total: jpTotal },
    });
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

    await prisma.mataPelatihan.delete({ where: { id } });
    return Response.json({ success: true });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
