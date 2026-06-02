'use server';

import { prisma } from '@/lib/prisma';
import { bcrypt } from '@/lib/bcrypt';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function POST(request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return new Response(JSON.stringify({ error: 'Email and password are required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Fetch user from Widyaswara table
    const user = await prisma.widyaswara.findUnique({
      where: { email },
    });

    if (!user) {
      return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Verify password using bcrypt
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Create secure session cookie    const sessionToken = await crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store session in database or cache if needed
    // For simplicity, we'll just set the cookie
    cookies().set('sessionToken', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt,
    });

    // Return user metadata with role
    const { password_hash, ...userMetadata } = user;

    return new Response(JSON.stringify({ user: userMetadata, token: sessionToken }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Auth error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}