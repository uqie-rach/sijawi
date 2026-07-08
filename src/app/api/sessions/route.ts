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
  return token === 'admin-session-token' || token === 'admin-token';
}

function getSessionYear(sessionDate: string): number {
  return new Date(sessionDate).getFullYear();
}

function parseJpRange(jpKe: string): { start: number; end: number } | null {
  if (!jpKe) return null;
  const parts = jpKe.split('-');
  if (parts.length !== 2) return null;
  const start = parseInt(parts[0]);
  const end = parseInt(parts[1]);
  if (isNaN(start) || isNaN(end) || start > end) return null;
  return { start, end };
}

function rangesOverlap(a: { start: number; end: number }, b: { start: number; end: number }): boolean {
  return a.start <= b.end && a.end >= b.start;
}

const currentYear = new Date().getFullYear();

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);

    // Filters
    const yearParam = searchParams.get('year');
    const batchId = searchParams.get('batchId');
    const mapelId = searchParams.get('mapelId');
    const wiId = searchParams.get('wiId');
    const format = searchParams.get('format');
    const lokasiId = searchParams.get('lokasiId');

    // Pagination
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '10')));

    // Sorting
    const sortField = searchParams.get('sortField') || 'date';
    const sortDirection = searchParams.get('sortDirection') === 'desc' ? -1 : 1;

    // Build query
    const query: Record<string, any> = {};

    if (yearParam && !isNaN(Number(yearParam))) {
      query.date = { $regex: `^${yearParam}-` };
    }

    if (batchId) {
      query.batch_id = batchId;
    }

    if (mapelId) {
      query.mapel_id = mapelId;
    }

    if (wiId) {
      query.wi_ids = wiId;
    }

    if (format) {
      query.format = format;
    }

    if (lokasiId) {
      query.lokasi_id = lokasiId;
    }

    // Map sort field to DB field
    const dbSortField =
      sortField === 'startTime' ? 'start_time' :
      sortField === 'jpCount' ? 'jp_count' :
      sortField === 'format' ? 'format' :
      'date';

    const sortStr = sortDirection === -1 ? `-${dbSortField}` : dbSortField;

    const [rows, total] = await Promise.all([
      JadwalSesi.find(query).sort(sortStr).skip((page - 1) * pageSize).limit(pageSize),
      JadwalSesi.countDocuments(query),
    ]);

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
      jpCount: r.jp_count,
    }));

    const totalPages = Math.ceil(total / pageSize);

    return Response.json({ sessions, total, page, totalPages });
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

    // JP overlap validation
    const newRange = parseJpRange(jpKe);
    if (newRange && batchId && mapelId) {
      const existingSessions = await JadwalSesi.find({
        batch_id: batchId,
        mapel_id: mapelId,
      });

      for (const s of existingSessions) {
        const existingRange = parseJpRange(s.jp_ke);
        if (existingRange && rangesOverlap(newRange, existingRange)) {
          return Response.json(
            { error: `Rentang JP ${jpKe} tumpang tindih dengan sesi yang sudah ada (JP ${s.jp_ke}).` },
            { status: 409 }
          );
        }
      }
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
      jp_count: jpCount,
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

    // JP overlap validation (exclude current session)
    const newRange = parseJpRange(jpKe);
    if (newRange && batchId && mapelId) {
      const existingSessions = await JadwalSesi.find({
        batch_id: batchId,
        mapel_id: mapelId,
        _id: { $ne: id },
      });

      for (const s of existingSessions) {
        const existingRange = parseJpRange(s.jp_ke);
        if (existingRange && rangesOverlap(newRange, existingRange)) {
          return Response.json(
            { error: `Rentang JP ${jpKe} tumpang tindih dengan sesi yang sudah ada (JP ${s.jp_ke}).` },
            { status: 409 }
          );
        }
      }
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
      jp_count: jpCount,
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
