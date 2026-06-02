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

export async function GET(request) {
  if (!(await isAdmin)()) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const search = url.searchParams.get('search') || '';
    const pola = url.searchParams.get('pola') || '';

    const skip = (page - 1) * pageSize;
    const take = pageSize;

    // Build filter object
    const whereClause = {};

    if (startDate) whereClause.date = { gte: startDate };
    if (endDate) whereClause.date = { lte: endDate };
    if (search) {
      whereClause OR: [
        { wiName: { contains: search, mode: 'insensitive' } },
        { wiEmail: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (pola) {
      whereClause.pola = pola;
    }

    // Get total count for pagination
    const totalCount = await prisma.sessionCount({
      where: whereClause,
    });

    // Get paginated sessions with aggregation    const sessions = await prisma.session.findMany({
      skip,
      take,
      where: whereClause,
      include: {
        batch: {
          include: {
            kategori: true,
          },
        },
        wi: true,
        mapel: true,
      },
      orderBy: { date: 'desc' },
    });

    // Calculate aggregated statistics
    const formatBreakdown = await prisma.session.groupBy({
      by: { format: true },
      _sum: { jpCount: true },
    });

    const polaBreakdown = await prisma.session.groupBy({
      by: { batch: { pola: true } },
      _sum: { jpCount: true },
    });

    // Get distinct WI names for search filtering
    const wiNames = await prisma.widyaswara.findMany({
      where: search ? { email: { contains: search, mode: 'insensitive' } } : {},
      select: { name: true },
    });

    return new Response(JSON.stringify({
      sessions,
      formatBreakdown,
      polaBreakdown,
      totalCount,
      wiNames,
      page,
      pageSize,
      startDate,
      endDate,
      search,
      pola,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error generating report:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}