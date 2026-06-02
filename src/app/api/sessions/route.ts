import { sql } from '@/db';
import { cookies } from 'next/headers';

async function isAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('sessionToken')?.value;
  return token === 'admin-session-token';
}

export async function GET() {
  try {
    const rows = await sql`SELECT * FROM sessions ORDER BY date ASC, start_time ASC`;
    const sessions = rows.map(r => ({
      id: r.id,
      batchId: r.batch_id,
      mapelId: r.mapel_id,
      wiId: r.wi_id,
      date: r.date,
      startTime: r.start_time,
      endTime: r.end_time,
      format: r.format,
      lokasiId: r.lokasi_id || undefined,
      jpKe: r.jp_ke,
      jpCount: r.jp_count
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
    const { id, batchId, mapelId, wiId, date, startTime, endTime, format, lokasiId, jpKe, jpCount } = body;
    await sql`
      INSERT INTO sessions (id, batch_id, mapel_id, wi_id, date, start_time, end_time, format, lokasi_id, jp_ke, jp_count)
      VALUES (${id}, ${batchId}, ${mapelId}, ${wiId}, ${date}, ${startTime}, ${endTime}, ${format}, ${lokasiId || null}, ${jpKe}, ${jpCount})
    `;
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
    const { id, batchId, mapelId, wiId, date, startTime, endTime, format, lokasiId, jpKe, jpCount } = body;
    await sql`
      UPDATE sessions
      SET batch_id = ${batchId}, mapel_id = ${mapelId}, wi_id = ${wiId}, date = ${date}, start_time = ${startTime}, end_time = ${endTime}, format = ${format}, lokasi_id = ${lokasiId || null}, jp_ke = ${jpKe}, jp_count = ${jpCount}
      WHERE id = ${id}
    `;
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
    await sql`DELETE FROM sessions WHERE id = ${id}`;
    return Response.json({ success: true });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}