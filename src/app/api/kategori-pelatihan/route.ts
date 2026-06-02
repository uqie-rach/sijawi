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
    const kategori = await prisma.kategoriPelatihan.findMany({
      select: { id: true, name: true, minWeight: true },
    });
    return new Response(JSON.stringify(kategori), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching kategori:', error);
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
  const { name, minWeight } = body;

  if (!name || !minWeight) {
    return new Response(JSON.stringify({ error: 'Name and minWeight are required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const newKategori = await prisma.kategoriPelatihan.create({
      data: {
        name,
        min_weight: parseInt(minWeight),
      },
    });

    return new Response(JSON.stringify(newKategori), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating kategori:', error);
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
    const updatedKategori = await prisma.kategoriPelatihan.update({
      where: { id },
      data,
    });

    return new Response(JSON.stringify(updatedKategori), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error updating kategori:', error);
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
    await prisma.kategoriPelatihan.delete({
      where: { id },
    });
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error deleting kategori:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}