import { connectToDatabase } from '@/lib/mongodb';
import Widyaiswara from '@/models/Widyaiswara';
import JadwalSesi from '@/models/JadwalSesi';
import Pelatihan from '@/models/Pelatihan';
import MataPelatihan from '@/models/MataPelatihan';
import Lokasi from '@/models/Lokasi';
import type { IEvent, IUser } from "@/calendar/interfaces";
import type { TEventColor } from "@/calendar/types";

export const getUsers = async (): Promise<IUser[]> => {
  try {
    await connectToDatabase();
    const rows = await Widyaiswara.find().sort({ name: 1 });
    return rows.map(r => ({
      id: r._id,
      name: r.gelar ? `${r.name}, ${r.gelar}` : r.name,
      picturePath: null
    }));
  } catch (error) {
    console.error("Error fetching users for calendar:", error);
    return [];
  }
};

export const getEvents = async (): Promise<IEvent[]> => {
  try {
    await connectToDatabase();
    const [sessionsRows, batches, mapels, lokasis] = await Promise.all([
      JadwalSesi.find(),
      Pelatihan.find(),
      MataPelatihan.find(),
      Lokasi.find()
    ]);

    const batchMap = new Map(batches.map(b => [b._id, b]));
    const mapelMap = new Map(mapels.map(m => [m._id, m]));
    const lokasiMap = new Map(lokasis.map(l => [l._id, l]));

    return sessionsRows.map(s => {
      const batch = batchMap.get(s.batch_id);
      const mapel = mapelMap.get(s.mapel_id);
      const lok = lokasiMap.get(s.lokasi_id || '');

      // Map format to calendar colors
      let color: TEventColor = 'blue';
      if (s.format === 'Virtual') {
        color = 'purple';
      } else if (s.format === 'Asinkron') {
        color = 'orange';
      }

      // Format dates to ISO strings
      const startDate = new Date(`${s.date}T${s.start_time}`).toISOString();
      const endDate = new Date(`${s.date}T${s.end_time}`).toISOString();

      return {
        id: s._id,
        startDate,
        endDate,
        title: `${mapel ? mapel.name : 'Subject'} (${batch ? batch.name : 'Batch'})`,
        color,
        description: `Format: ${s.format} | JP Ke: ${s.jp_ke} (${s.jp_count} JP) | Venue: ${lok ? lok.name : 'N/A'}`,
        user: {
          id: s.wi_id,
          name: 'Widyaiswara',
          picturePath: null
        }
      };
    });
  } catch (error) {
    console.error("Error fetching events for calendar:", error);
    return [];
  }
};