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
    const mataPelatihan = await prisma.mataPelatihan.findMany({
      include: { kategoriPelatihan: true },
      select: {
        id: true,
        name: true,
        jpTotal: true,
        kategoriPelatihan: {
          select: { id: true, name: true },
        },
      },
    });
    return new Response(JSON.stringify(mataPelatihan), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching mata pelatihan:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function POST(request) {
  if (!(await isAdmin)()) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const body = await request.json();
  const { name, kategoriId, jpTotal } = body;

  if (!name || !kategoriId || !jpTotal) {
    return new Response(JSON.stringify({ error: 'Name, kategoriId, and jpTotal are required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const newMapel = await prisma.mataPelatihan.create({
      data: {
        name,
        kategoriId,
        jpTotal: parseInt(jpTotal),
      },
    });

    return new Response(JSON.stringify(newMapel), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating mata pelatihan:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function PUT(request) {
  if (!(await isAdmin)()) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const body = await request.json();
  const { id, ...data } = body;

  if (!id) {
    return new Response(JSON.stringify({ error: 'ID is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const updatedMapel = await prisma.mataPelatihan.update({
      where: { id },
      data,
    });

    return new Response(JSON.stringify(updatedMapel), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error updating mata pelatihan:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
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
  const id = searchParams.get('id');

  if (!id) {
    return new Response(JSON.stringify({ error: 'ID is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    await prisma.mataPelatihan.delete({
      where: { id },
    });
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error deleting mata pelatihan:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}