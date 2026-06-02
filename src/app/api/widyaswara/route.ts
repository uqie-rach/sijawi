'use server';

import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// Helper to check if user is admin
async function isAdmin() {
  const token = cookies().get('sessionToken')?.value;
  if (!token) return false;

  // In a real app, verify the token with your session store
  // For demo purposes, we'll check a simple condition  return token === 'admin-session-token';
}

export async function GET(request) {
  if (!(await isAdmin)()) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
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

export async function POST(request) {
  if (!(await isAdmin)()) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const body = await request.json();
  const {
    name,
    gelar,
    email,
    nip,
    jabatan,
    level,
    levelLabel,
  } = body;

  if (!name || !email || !nip || !jabatan || !level) {
    return new Response(JSON.stringify({ error: 'All fields are required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const newWidyaswara = await prisma.widyaswara.create({
      data: {
        name,
        gelar,
        email,
        nip,
        jabatan,
        level: parseInt(level),
        level_label: levelLabel,
        jp_last_month: 0,
      },
    });

    return new Response(JSON.stringify(newWidyaswara), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating widyaswara:', error);
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
    const updatedWidyaswara = await prisma.widyaswara.update({
      where: { id },
      data,
    });

    return new Response(JSON.stringify(updatedWidyaswara), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error updating widyaswara:', error);
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
    await prisma.widyaswara.delete({
      where: { id },
    });
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error deleting widyaswara:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}