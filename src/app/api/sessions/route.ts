import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/auth-utils';

export async function GET() {
  try {
    const rows = await prisma.jadwalSesi.findMany({
      orderBy: [{ date: 'asc' }, { start_time: 'asc' }],
    });
    const sessions = rows.map(r => ({
      id: r.id,
      batchId: r.batch_id,
      mapelId: r.mapel_id,
      wiIds: r.wi_ids || [],
      date: r.date,
      startTime: r.start_time,
      endTime: r.end_time,
      format: r.format,
      lokasiId: r.lokasi_id || undefined,
      jpKe: r.jp_ke,
      jpCount: r.jp_count,
    }));
    return Response.json(sessions);
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
    const { id, batchId, mapelId, wiIds, date, startTime, endTime, format, lokasiId, jpKe, jpCount } = body;

    await prisma.jadwalSesi.create({
      data: {
        id,
        batch_id: batchId,
        mapel_id: mapelId,
        wi_ids: wiIds || [],
        date,
        start_time: startTime,
        end_time: endTime,
        format,
        lokasi_id: lokasiId || null,
        jp_ke: jpKe,
        jp_count: jpCount,
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
    const { id, batchId, mapelId, wiIds, date, startTime, endTime, format, lokasiId, jpKe, jpCount } = body;

    await prisma.jadwalSesi.update({
      where: { id },
      data: {
        batch_id: batchId,
        mapel_id: mapelId,
        wi_ids: wiIds || [],
        date,
        start_time: startTime,
        end_time: endTime,
        format,
        lokasi_id: lokasiId || null,
        jp_ke: jpKe,
        jp_count: jpCount,
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

    await prisma.jadwalSesi.delete({ where: { id } });
    return Response.json({ success: true });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
