import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/auth-utils';

export async function GET() {
  try {
    const rows = await prisma.kategoriPelatihan.findMany({ orderBy: { name: 'asc' } });
    const kategori = rows.map(r => ({
      id: r.id,
      name: r.name,
      minWeight: r.min_weight,
    }));
    return Response.json(kategori);
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
    const { id, name, minWeight } = body;

    await prisma.kategoriPelatihan.create({
      data: { id, name, min_weight: minWeight },
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
    const { id, name, minWeight } = body;

    await prisma.kategoriPelatihan.update({
      where: { id },
      data: { name, min_weight: minWeight },
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

    await prisma.kategoriPelatihan.delete({ where: { id } });
    return Response.json({ success: true });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
