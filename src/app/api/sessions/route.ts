'use server';

import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// Helper to check if user is admin
async function isAdmin() {
  const token = cookies().get('sessionToken')?.value;
  if (!token) return false;
  return token === 'admin-session-token';
}

export async function POST(request) {
  if (!(await isAdmin)()) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const sessionData = await request.json();
  const {
    batchId,
    mapelId,
    wiId,
    date,
    startTime,
    endTime,
    format,
    lokasiId,
    jpKe,
    jpCount,
  } = sessionData;

  // Convert dates to UTC
  const dateUTC = new Date(date).toISOString().split('T')[0]; // YYYY-MM-DD
  const startTimeUTC = new Date(date + 'T' + startTime).toISOString();
  const endTimeUTC = new Date(date + 'T' + endTime).toISOString();

  // Validate required fields
  if (!batchId || !mapelId || !wiId || !dateUTC || !startTimeUTC || !endTimeUTC || !format) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Hierarchy validation
      const wi = await tx.widyaswara.findUnique({ where: { id: wiId } });
      const batch = await tx.batches.findUnique({ where: { id: batchId } });
      const mapel = await tx.mataPelatihan.findUnique({ where: { id: mapelId } });
      const category = batch ? await tx.kategoriPelatihan.findUnique({ where: { id: batch.kategoriId } }) : null;

      if (!wi || !batch || !mapel || !category) {
        throw new Error('Invalid WI, batch, mapel, or category');
      }

      if (wi.level < category.minWeight) {
        throw new Error(`Hierarchy validation failed: ${wi.name} (Level ${wi.level}) < ${category.name} (Min Level ${category.minWeight})`);
      }

      // 2. Time conflict check (UTC)
      const existingSession = await tx.sessions.findFirst({
        where: {
          batchId,
          date: dateUTC,
          OR: [
            { start_time: { lte: startTimeUTC }, end_time: { gte: startTimeUTC } },
            { start_time: { lte: endTimeUTC }, end_time: { gte: endTimeUTC } },
            { start_time: { lte: startTimeUTC }, end_time: { gte: endTimeUTC } },
          ],
        },
      });

      if (existingSession) {
        throw new Error('Time conflict detected with existing session');
      }

      // 3. Location clash for Klasikal
      if (format === 'Klasikal' && lokasiId) {
        const locationConflict = await tx.sessions.findFirst({
          where: {
            batchId,
            date: dateUTC,
            lokasi_id: lokasiId,
            OR: [
              { start_time: { lte: startTimeUTC }, end_time: { gte: startTimeUTC } },
              { start_time: { lte: endTimeUTC }, end_time: { gte: endTimeUTC } },
              { start_time: { lte: startTimeUTC }, end_time: { gte: endTimeUTC } },
            ],
          },
        });

        if (locationConflict) {
          throw new Error('Location is already booked during this time slot');
        }
      }

      // 4. JP accumulation
      const currentJpSum = await tx.sessions.aggregate({
        _sum: { jp_count: true },
        where: { batchId, mapelId },
      });

      const maxJp = mapel.jp_total;
      if ((currentJpSum._sum.jp_count || 0) + parseInt(jpCount) > maxJp) {
        throw new Error(`JP accumulation exceeded limit: ${maxJp} JP max for ${mapel.name}`);
      }

      // 5. Create session with UTC timestamps
      const newSession = await tx.sessions.create({
        data: {
          batch_id: batchId,
          mapel_id: mapelId,
          wi_id: wiId,
          date: dateUTC,
          start_time: startTimeUTC,
          end_time: endTimeUTC,
          format,
          lokasi_id: lokasiId,
          jp_ke: jpKe,
          jp_count: parseInt(jpCount),
        },
      });

      return newSession;
    });

    return new Response(JSON.stringify(result), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating session:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Other methods remain similar