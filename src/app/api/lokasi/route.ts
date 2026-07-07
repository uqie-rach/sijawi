import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/auth-utils';

export async function GET() {
  try {
    const rows = await prisma.lokasi.findMany({ orderBy: { name: 'asc' } });
    const lokasi = rows.map(r => ({
      id: r.id,
      name: r.name,
    }));
    return Response.json(lokasi);
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
    const { id, name } = body;

    await prisma.lokasi.create({ data: { id, name } });
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
    const { id, name } = body;

    await prisma.lokasi.update({ where: { id }, data: { name } });
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

    await prisma.lokasi.delete({ where: { id } });
    return Response.json({ success: true });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
