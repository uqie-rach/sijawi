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

  // Validate required fields
  if (!batchId || !mapelId || !wiId || !date || !startTime || !endTime || !format) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Start a database transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Hierarchy validation: WI level must be >= category min weight      const wi = await tx.widyaswara.findUnique({ where: { id: wiId } });
      const batch = await tx.batches.findUnique({ where: { id: batchId } });
      const mapel = await tx.mataPelatihan.findUnique({ where: { id: mapelId } });
      const category = batch ? await tx.kategoriPelatihan.findUnique({ where: { id: batch.kategoriId } }) : null;

      if (!wi || !batch || !mapel || !category) {
        throw new Error('Invalid WI, batch, mapel, or category');
      }

      if (wi.level < category.minWeight) {
        throw new Error(`Hierarchy validation failed: ${wi.name} (Level ${wi.level}) < ${category.name} (Min Level ${category.minWeight})`);
      }

      // 2. Check for time conflicts
      const existingSession = await tx.sessions.findFirst({
        where: {
          batchId,
          date,
          OR: [
            { startTime: { lte: startTime }, endTime: { gte: startTime } },
            { startTime: { lte: endTime }, endTime: { gte: endTime } },
            { startTime: { lte: startTime }, endTime: { gte: endTime } },
          ],
        },
      });

      if (existingSession) {
        throw new Error('Time conflict detected with existing session');
      }

      // 3. Location clash validation for Klasikal format
      if (format === 'Klasikal' && lokasiId) {
        const locationConflict = await tx.sessions.findFirst({
          where: {
            batchId,
            date,
            lokasiId,
            OR: [
              { startTime: { lte: startTime }, endTime: { gte: startTime } },
              { startTime: { lte: endTime }, endTime: { gte: endTime } },
              { startTime: { lte: startTime }, endTime: { gte: endTime } },
            ],
          },
        });

        if (locationConflict) {
          throw new Error('Location is already booked during this time slot');
        }
      }

      // 4. JP accumulation validation
      const currentJpSum = await tx.sessions.aggregate({
        _sum: { jpCount: true },
        where: { batchId, mapelId },
      });

      const maxJp = mapel.jpTotal;
      if ((currentJpSum._sum.jpCount || 0) + parseInt(jpCount) > maxJp) {
        throw new Error(`JP accumulation exceeded limit: ${maxJp} JP max for ${mapel.name}`);
      }

      // 5. Create the session
      const newSession = await tx.sessions.create({
        data: {
          batchId,
          mapelId,
          wiId,
          date,
          startTime,
          endTime,
          format,
          lokasiId,
          jpKe,
          jpCount: parseInt(jpCount),
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

export async function DELETE(request) {
  if (!(await isAdmin)()) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('id');

  if (!sessionId) {
    return new Response(JSON.stringify({ error: 'ID is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    await prisma.sessions.delete({
      where: { id: sessionId },
    });
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error deleting session:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}