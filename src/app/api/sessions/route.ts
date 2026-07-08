import { connectToDatabase } from '@/lib/mongodb';
import JadwalSesi from '@/models/JadwalSesi';
import Widyaiswara from '@/models/Widyaiswara';
import { cookies } from 'next/headers';

async function isAdmin() {
  try {
    await connectToDatabase();
    const count = await Widyaiswara.countDocuments();
    if (count === 0) {
      return true;
    }
  } catch (e) {}
  const cookieStore = await cookies();
  const token = cookieStore.get('sessionToken')?.value;
  return token === 'admin-session-token';
}

function getSessionYear(sessionDate: string): number {
  return new Date(sessionDate).getFullYear();
}

const currentYear = new Date().getFullYear();

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const yearParam = searchParams.get('year');

    let rows;
    if (yearParam && !isNaN(Number(yearParam))) {
      const year = Number(yearParam);
      // Filter by year using date string prefix
      const yearStr = String(year);
      rows = await JadwalSesi.find({
        date: { $regex: `^${yearStr}-` }
      }).sort({ date: 1, start_time: 1 });
    } else {
      rows = await JadwalSesi.find().sort({ date: 1, start_time: 1 });
    }

    const sessions = rows.map(r => ({
      id: r._id,
      batchId: r.batch_id,
      mapelId: r.mapel_id,
      wiIds: r.wi_ids || [],
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
    await connectToDatabase();
    const body = await request.json();
    const { id, batchId, mapelId, wiIds, date, startTime, endTime, format, lokasiId, jpKe, jpCount } = body;

    // Prevent modifications to non-current year data
    if (getSessionYear(date) !== currentYear) {
      return Response.json({ error: 'Data tahun sebelumnya tidak dapat diubah.' }, { status: 403 });
    }
    
    const newSession = new JadwalSesi({
      _id: id,
      batch_id: batchId,
      mapel_id: mapelId,
      wi_ids: wiIds || [],
      date,
      start_time: startTime,
      end_time: endTime,
      format,
      lokasi_id: lokasiId || null,
      jp_ke: jpKe,
      jp_count: jpCount
    });

    await newSession.save();
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
    const { id, batchId, mapelId, wiIds, date, startTime, endTime, format, lokasiId, jpKe, jpCount } = body;

    // Prevent modifications to non-current year data
    if (getSessionYear(date) !== currentYear) {
      return Response.json({ error: 'Data tahun sebelumnya tidak dapat diubah.' }, { status: 403 });
    }
    
    await JadwalSesi.findByIdAndUpdate(id, {
      batch_id: batchId,
      mapel_id: mapelId,
      wi_ids: wiIds || [],
      date,
      start_time: startTime,
      end_time: endTime,
      format,
      lokasi_id: lokasiId || null,
      jp_ke: jpKe,
      jp_count: jpCount
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
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return Response.json({ error: 'ID is required' }, { status: 400 });

    // Check year before deleting
    const existing = await JadwalSesi.findById(id);
    if (existing && getSessionYear(existing.date) !== currentYear) {
      return Response.json({ error: 'Data tahun sebelumnya tidak dapat diubah.' }, { status: 403 });
    }
    
    await JadwalSesi.findByIdAndDelete(id);
    return Response.json({ success: true });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
