import { connectToDatabase } from '@/lib/mongodb';
import JadwalSesi from '@/models/JadwalSesi';
import Pelatihan from '@/models/Pelatihan';
import MataPelatihan from '@/models/MataPelatihan';
import Widyaiswara from '@/models/Widyaiswara';
import { cookies } from 'next/headers';

async function isAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('sessionToken')?.value;
  return token === 'admin-session-token';
}

export async function GET(request: Request) {
  if (!(await isAdmin())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectToDatabase();
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
    const startDate = url.searchParams.get('startDate') || '';
    const endDate = url.searchParams.get('endDate') || '';
    const search = url.searchParams.get('search') || '';
    const pola = url.searchParams.get('pola') || '';

    const [sessions, batches, mapels, wis] = await Promise.all([
      JadwalSesi.find(),
      Pelatihan.find(),
      MataPelatihan.find(),
      Widyaiswara.find()
    ]);

    const batchMap = new Map(batches.map(b => [b._id, b]));
    const mapelMap = new Map(mapels.map(m => [m._id, m]));
    const wiMap = new Map(wis.map(w => [w._id, w]));

    // Join details (Multi-WI format supported!)
    const joinedSessions = sessions.map(s => {
      const batch = batchMap.get(s.batch_id);
      const mapel = mapelMap.get(s.mapel_id);

      const resolvedWis = (s.wi_ids || []).map((id: any) => wiMap.get(id)).filter(Boolean);
      const wiNames = resolvedWis.map((w: { name: any; gelar: any; }) => `${w.name}, ${w.gelar}`).join(', ');
      const wiEmails = resolvedWis.map((w: { email: any; }) => w.email).join(', ');

      return {
        id: s._id,
        batchId: s.batch_id,
        mapelId: s.mapel_id,
        wiIds: s.wi_ids,
        date: s.date,
        startTime: s.start_time,
        endTime: s.end_time,
        format: s.format,
        lokasiId: s.lokasi_id,
        jpKe: s.jp_ke,
        jpCount: s.jp_count,
        batchName: batch ? batch.name : 'Unknown Batch',
        pola: batch ? batch.pola : 'APBD',
        mapelName: mapel ? mapel.name : 'Unknown Subject',
        wiName: wiNames || 'Unknown WI',
        wiEmail: wiEmails || ''
      };
    });

    // Filter
    let filtered = joinedSessions;

    if (startDate) {
      filtered = filtered.filter(s => s.date >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter(s => s.date <= endDate);
    }
    if (pola && pola !== 'ALL') {
      filtered = filtered.filter(s => s.pola === pola);
    }
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(s =>
        s.wiName.toLowerCase().includes(searchLower) ||
        s.wiEmail.toLowerCase().includes(searchLower)
      );
    }

    filtered.sort((a, b) => {
      if (a.date !== b.date) return b.date.localeCompare(a.date);
      return a.startTime.localeCompare(b.startTime);
    });

    const totalCount = filtered.length;
    const paginatedSessions = filtered.slice((page - 1) * pageSize, page * pageSize);

    const formatBreakdown: Record<string, number> = {};
    filtered.forEach(s => {
      formatBreakdown[s.format] = (formatBreakdown[s.format] || 0) + s.jpCount;
    });

    const polaBreakdown: Record<string, number> = {};
    filtered.forEach(s => {
      polaBreakdown[s.pola] = (polaBreakdown[s.pola] || 0) + s.jpCount;
    });

    const wiNames = Array.from(new Set(filtered.flatMap(s => (s.wiName ? s.wiName.split(', ') : [])))).map(name => ({ name }));

    return Response.json({
      sessions: paginatedSessions,
      formatBreakdown: Object.entries(formatBreakdown).map(([format, sum]) => ({ format, _sum: { jp_count: sum } })),
      polaBreakdown: Object.entries(polaBreakdown).map(([pola, sum]) => ({ batch: { pola }, _sum: { jp_count: sum } })),
      totalCount,
      wiNames,
      page,
      pageSize,
      startDate,
      endDate,
      search,
      pola,
    });
  } catch (error: any) {
    console.error('Error generating report:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}