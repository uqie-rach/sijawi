import { connectToDatabase } from '@/lib/mongodb';
import JadwalSesi from '@/models/JadwalSesi';
import Widyaiswara from '@/models/Widyaiswara';
import { cookies } from 'next/headers';
import { withApiProtection } from '@/lib/api-helpers';

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
  if (parts.length === 2) {
    const start = parseInt(parts[0]);
    const end = parseInt(parts[1]);
    if (isNaN(start) || isNaN(end) || start > end) return null;
    return { start, end };
  }
  const single = parseInt(jpKe);
  if (!isNaN(single)) return { start: single, end: single };
  return null;
}

function timesOverlap(aStart: string, aEnd: string, bStart: string, bEnd: string): boolean {
  return aStart < bEnd && aEnd > bStart;
}

function rangesOverlap(a: { start: number; end: number }, b: { start: number; end: number }): boolean {
  return a.start <= b.end && a.end >= b.start;
}

interface SessionData {
  batchId: string;
  mapelId: string;
  wiIds: string[];
  date: string;
  startTime: string;
  endTime: string;
  format: string;
  lokasiId?: string;
  jpKe: string;
  jpCount: number;
}

async function validateSession(
  data: SessionData,
  excludeId?: string
): Promise<{ error: string; status: number } | null> {
  const { batchId, mapelId, wiIds, date, startTime, endTime, format, lokasiId, jpKe } = data;
  const excludeFilter = excludeId ? { _id: { $ne: excludeId } } : {};

  // 1. JP overlap validation (same batch + mapel)
  const newRange = parseJpRange(jpKe);
  if (newRange) {
    const existingJpSessions = await JadwalSesi.find({
      batch_id: batchId,
      mapel_id: mapelId,
      ...excludeFilter,
    });
    for (const s of existingJpSessions) {
      const existingRange = parseJpRange(s.jp_ke);
      if (existingRange && rangesOverlap(newRange, existingRange)) {
        return {
          error: `Rentang JP ${jpKe} tumpang tindih dengan sesi yang sudah ada (JP ${s.jp_ke}).`,
          status: 409,
        };
      }
    }
  }

  // 2. Same-mapel parallel time validation
  const parallelMapelSessions = await JadwalSesi.find({
    batch_id: batchId,
    mapel_id: mapelId,
    date,
    ...excludeFilter,
  });
  for (const s of parallelMapelSessions) {
    if (timesOverlap(startTime, endTime, s.start_time, s.end_time)) {
      return {
        error: `Mata pelatihan ini sudah memiliki sesi pada jam ${s.start_time}-${s.end_time} di tanggal yang sama.`,
        status: 409,
      };
    }
  }

  // 3. WI time clash validation
  if (wiIds && wiIds.length > 0) {
    const wiSessions = await JadwalSesi.find({
      date,
      wi_ids: { $in: wiIds },
      ...excludeFilter,
    });
    for (const s of wiSessions) {
      if (timesOverlap(startTime, endTime, s.start_time, s.end_time)) {
        const clashingWiIds = (s.wi_ids || []).filter((id: string) => wiIds.includes(id));
        const wis = await Widyaiswara.find({ _id: { $in: clashingWiIds } });
        const wiNames = wis.map((w: any) => w.name).join(', ');
        return {
          error: `Widyaiswara ${wiNames} sudah memiliki sesi pada jam ${s.start_time}-${s.end_time} di tanggal ${date}.`,
          status: 409,
        };
      }
    }
  }

  // 4. Lokasi clash validation (Klasikal only)
  if (format === 'Klasikal' && lokasiId) {
    const lokasiSessions = await JadwalSesi.find({
      date,
      lokasi_id: lokasiId,
      format: 'Klasikal',
      ...excludeFilter,
    });
    for (const s of lokasiSessions) {
      if (timesOverlap(startTime, endTime, s.start_time, s.end_time)) {
        return {
          error: `Lokasi sudah digunakan oleh sesi lain pada jam ${s.start_time}-${s.end_time} di tanggal ${date}.`,
          status: 409,
        };
      }
    }
  }

  // 5. JP chronological order validation
  if (newRange) {
    const allMapelSessions = await JadwalSesi.find({
      batch_id: batchId,
      mapel_id: mapelId,
      ...excludeFilter,
    }).lean();

    const combined = allMapelSessions.map((s: any) => ({
      date: s.date,
      start_time: s.start_time,
      jpStart: parseJpRange(s.jp_ke)?.start ?? 999,
      jpEnd: parseJpRange(s.jp_ke)?.end ?? 999,
      jpKe: s.jp_ke,
    }));

    combined.push({
      date,
      start_time: startTime,
      jpStart: newRange.start,
      jpEnd: newRange.end,
      jpKe,
    });

    combined.sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.start_time.localeCompare(b.start_time);
    });

    for (let i = 1; i < combined.length; i++) {
      if (combined[i - 1].jpStart > combined[i].jpStart) {
        return {
          error: `Urutan JP tidak kronologis: JP ${combined[i - 1].jpKe} (${combined[i - 1].date}) dijadwalkan sebelum JP ${combined[i].jpKe} (${combined[i].date}), tetapi nomor JP lebih besar.`,
          status: 409,
        };
      }
    }
  }

  return null;
}

const currentYear = new Date().getFullYear();

export const GET = withApiProtection(async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);

    const yearParam = searchParams.get('year');
    const batchId = searchParams.get('batchId');
    const mapelId = searchParams.get('mapelId');
    const wiId = searchParams.get('wiId');
    const format = searchParams.get('format');
    const lokasiId = searchParams.get('lokasiId');

    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '10')));

    const sortField = searchParams.get('sortField') || 'date';
    const sortDirection = searchParams.get('sortDirection') === 'desc' ? -1 : 1;

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
});

export const POST = withApiProtection(async function POST(request: Request) {
  if (!(await isAdmin())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    await connectToDatabase();
    const body = await request.json();
    const { id, batchId, mapelId, wiIds, date, startTime, endTime, format, lokasiId, jpKe, jpCount } = body;

    if (getSessionYear(date) !== currentYear) {
      return Response.json({ error: 'Data tahun sebelumnya tidak dapat diubah.' }, { status: 403 });
    }

    const validationError = await validateSession({
      batchId, mapelId, wiIds, date, startTime, endTime, format, lokasiId, jpKe, jpCount,
    });
    if (validationError) {
      return Response.json({ error: validationError.error }, { status: validationError.status });
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
});

export const PUT = withApiProtection(async function PUT(request: Request) {
  if (!(await isAdmin())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    await connectToDatabase();
    const body = await request.json();
    const { id, batchId, mapelId, wiIds, date, startTime, endTime, format, lokasiId, jpKe, jpCount } = body;

    if (getSessionYear(date) !== currentYear) {
      return Response.json({ error: 'Data tahun sebelumnya tidak dapat diubah.' }, { status: 403 });
    }

    const validationError = await validateSession({
      batchId, mapelId, wiIds, date, startTime, endTime, format, lokasiId, jpKe, jpCount,
    }, id);
    if (validationError) {
      return Response.json({ error: validationError.error }, { status: validationError.status });
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
});

export const DELETE = withApiProtection(async function DELETE(request: Request) {
  if (!(await isAdmin())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return Response.json({ error: 'ID is required' }, { status: 400 });

    const existing = await JadwalSesi.findById(id);
    if (existing && getSessionYear(existing.date) !== currentYear) {
      return Response.json({ error: 'Data tahun sebelumnya tidak dapat diubah.' }, { status: 403 });
    }

    await JadwalSesi.findByIdAndDelete(id);
    return Response.json({ success: true });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});