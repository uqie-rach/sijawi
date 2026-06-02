import { sql } from '@/db';
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
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
    const startDate = url.searchParams.get('startDate') || '';
    const endDate = url.searchParams.get('endDate') || '';
    const search = url.searchParams.get('search') || '';
    const pola = url.searchParams.get('pola') || '';

    // Fetch all sessions with joined details
    const allSessionsRows = await sql`
      SELECT 
        s.id, s.batch_id as "batchId", s.mapel_id as "mapelId", s.wi_id as "wiId", 
        s.date, s.start_time as "startTime", s.end_time as "endTime", s.format, 
        s.lokasi_id as "lokasiId", s.jp_ke as "jpKe", s.jp_count as "jpCount",
        b.name as "batchName", b.pola,
        m.name as "mapelName",
        w.name as "wiName", w.email as "wiEmail"
      FROM sessions s
      JOIN batches b ON s.batch_id = b.id
      JOIN mata_pelatihan m ON s.mapel_id = m.id
      JOIN widyaswaras w ON s.wi_id = w.id
      ORDER BY s.date DESC, s.start_time ASC
    `;

    // Filter in-memory to support flexible search and dynamic parameters easily
    let filtered = allSessionsRows;

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

    const totalCount = filtered.length;
    const paginatedSessions = filtered.slice((page - 1) * pageSize, page * pageSize);

    // Calculate format breakdown
    const formatBreakdown: Record<string, number> = {};
    filtered.forEach(s => {
      formatBreakdown[s.format] = (formatBreakdown[s.format] || 0) + s.jpCount;
    });

    // Calculate pola breakdown
    const polaBreakdown: Record<string, number> = {};
    filtered.forEach(s => {
      polaBreakdown[s.pola] = (polaBreakdown[s.pola] || 0) + s.jpCount;
    });

    // Get distinct WI names
    const wiNames = Array.from(new Set(filtered.map(s => s.wiName))).map(name => ({ name }));

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