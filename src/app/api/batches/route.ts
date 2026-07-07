import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/auth-utils';

export async function GET() {
  try {
    const rows = await prisma.pelatihan.findMany({ orderBy: { start_date: 'desc' } });
    const batches = rows.map(r => ({
      id: r.id,
      name: r.name,
      kategoriId: r.kategori_id,
      pola: r.pola,
      startDate: r.start_date,
      endDate: r.end_date,
    }));
    return Response.json(batches);
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
    const { id, name, kategoriId, pola, startDate, endDate } = body;

    await prisma.pelatihan.create({
      data: {
        id,
        name,
        kategori_id: kategoriId,
        pola,
        start_date: startDate,
        end_date: endDate,
      },
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
    const { id, name, kategoriId, pola, startDate, endDate } = body;

    await prisma.pelatihan.update({
      where: { id },
      data: {
        name,
        kategori_id: kategoriId,
        pola,
        start_date: startDate,
        end_date: endDate,
      },
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

    await prisma.pelatihan.delete({ where: { id } });
    return Response.json({ success: true });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
