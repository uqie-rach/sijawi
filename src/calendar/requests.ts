import { sql } from '@/db';
import type { IEvent, IUser } from "@/calendar/interfaces";
import type { TEventColor } from "@/calendar/types";

export const getUsers = async (): Promise<IUser[]> => {
  try {
    const rows = await sql`SELECT id, name, gelar FROM widyaswaras ORDER BY name ASC`;
    return rows.map(r => ({
      id: r.id,
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
    const sessionsRows = await sql`
      SELECT 
        s.id, s.batch_id, s.mapel_id, s.wi_id, 
        s.date, s.start_time, s.end_time, s.format, 
        s.lokasi_id, s.jp_ke, s.jp_count,
        b.name as batch_name,
        m.name as mapel_name,
        w.name as wi_name, w.gelar as wi_gelar,
        l.name as lokasi_name
      FROM sessions s
      JOIN batches b ON s.batch_id = b.id
      JOIN mata_pelatihan m ON s.mapel_id = m.id
      JOIN widyaswaras w ON s.wi_id = w.id
      LEFT JOIN lokasi l ON s.lokasi_id = l.id
      ORDER BY s.date ASC, s.start_time ASC
    `;

    return sessionsRows.map(s => {
      // Map format to calendar colors
      let color: TEventColor = 'blue';
      if (s.format === 'Virtual') {
        color = 'purple';
      } else if (s.format === 'Asinkron') {
        color = 'orange';
      }

      // Format dates to ISO strings
      // s.date is YYYY-MM-DD, s.start_time is HH:MM
      const startDate = new Date(`${s.date}T${s.start_time}`).toISOString();
      const endDate = new Date(`${s.date}T${s.end_time}`).toISOString();

      return {
        id: s.id,
        startDate,
        endDate,
        title: `${s.mapel_name} (${s.batch_name})`,
        color,
        description: `Format: ${s.format} | JP Ke: ${s.jp_ke} (${s.jp_count} JP) | Venue: ${s.lokasi_name || 'N/A'}`,
        user: {
          id: s.wi_id,
          name: s.wi_gelar ? `${s.wi_name}, ${s.wi_gelar}` : s.wi_name,
          picturePath: null
        }
      };
    });
  } catch (error) {
    console.error("Error fetching events for calendar:", error);
    return [];
  }
};