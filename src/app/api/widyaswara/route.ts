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
    // Aggregate total_jp for current month using Prisma groups
    const widyaswaras = await prisma.widyaswara.findMany({
      select: {
        id: true,
        name: true,
        gelar: true,
        email: true,
        nip: true,
        jabatan: true,
        level: true,
        level_label: true,
        jp_last_month: true,
        jp_current_month: prisma.widyaswara.aggregate({
          _sum: { jpCount: true },
          where: { id: prisma.widyaswara.id },
        }),
      },
    });

    return new Response(JSON.stringify(widyaswaras), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching widyaswaras:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Other CRUD methods remain similar to previous implementation