import { prisma } from '@/lib/prisma';
import type { IEvent, IUser } from "@/calendar/interfaces";
import type { TEventColor } from "@/calendar/types";

export const getUsers = async (): Promise<IUser[]> => {
  try {
    const rows = await prisma.widyaiswara.findMany({ orderBy: { name: 'asc' } });
    return rows.map(r => ({
      id: r.id,
      name: r.gelar ? `${r.name}, ${r.gelar}` : r.name,
      picturePath: null,
    }));
  } catch (error) {
    console.error("Error fetching users for calendar:", error);
    return [];
  }
};

export const getEvents = async (): Promise<IEvent[]> => {
  try {
    const [sessionsRows, batches, mapels, lokasis, wis] = await Promise.all([
      prisma.jadwalSesi.findMany(),
      prisma.pelatihan.findMany(),
      prisma.mataPelatihan.findMany(),
      prisma.lokasi.findMany(),
      prisma.widyaiswara.findMany(),
    ]);

    const batchMap = new Map(batches.map(b => [b.id, b]));
    const mapelMap = new Map(mapels.map(m => [m.id, m]));
    const lokasiMap = new Map(lokasis.map(l => [l.id, l]));
    const wiMap = new Map(wis.map(w => [w.id, w]));

    return sessionsRows.map(s => {
      const batch = batchMap.get(s.batch_id);
      const mapel = mapelMap.get(s.mapel_id);
      const lok = lokasiMap.get(s.lokasi_id || '');

      const resolvedWis = (s.wi_ids || []).map(id => wiMap.get(id)).filter(Boolean);
      const wiNames = resolvedWis.map((w: any) => `${w.name}, ${w.gelar}`).join(', ');

      let color: TEventColor = 'blue';
      if (s.format === 'Virtual') {
        color = 'purple';
      } else if (s.format === 'Asinkron') {
        color = 'orange';
      }

      const startDate = new Date(`${s.date}T${s.start_time}`).toISOString();
      const endDate = new Date(`${s.date}T${s.end_time}`).toISOString();

      return {
        id: s.id,
        startDate,
        endDate,
        title: `${mapel ? mapel.name : 'Subject'} (${batch ? batch.name : 'Batch'})`,
        color,
        description: `Format: ${s.format} | Pengajar: ${wiNames || 'N/A'} | JP Ke: ${s.jp_ke} (${s.jp_count} JP) | Venue: ${lok ? lok.name : 'N/A'}`,
        user: {
          id: s.wi_ids && s.wi_ids.length > 0 ? s.wi_ids[0] : 'wi-1',
          name: wiNames || 'Widyaiswara',
          picturePath: null,
        },
      };
    });
  } catch (error) {
    console.error("Error fetching events for calendar:", error);
    return [];
  }
};
