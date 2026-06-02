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

    // Convert dates to UTC
    const startDateUTC = startDate ? new Date(startDate).toISOString().split('T')[0] : null;
    const endDateUTC = endDate ? new Date(endDate).toISOString().split('T')[0] : null;

    const skip = (page - 1) * pageSize;
    const take = pageSize;

    // Build filter object
    const whereClause = {};

    if (startDateUTC) whereClause.date = { gte: startDateUTC };
    if (endDateUTC) whereClause.date = { lte: endDateUTC };
    if (search) {
      whereClause OR: [
        { wi_name: { contains: search, mode: 'insensitive' } },
        { wi_email: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (pola) {
      whereClause.pola = pola;
    }

    // Get total count
    const totalCount = await prisma.session.count({
      where: whereClause,
    });

    // Get paginated sessions
    const sessions = await prisma.session.findMany({
      skip,
      take,
      where: whereClause,
      include: {
        batch: { include: { kategori: true } },
        wi: true,
        mapel: true,
      },
      orderBy: { date: 'desc' },
    });

    // Aggregations
    const formatBreakdown = await prisma.session.groupBy({
      by: { format: true },
      _sum: { jp_count: true },
    });

    const polaBreakdown = await prisma.session.groupBy({
      by: { batch: { pola: true } },
      _sum: { jp_count: true },
    });

    // WI names for search
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