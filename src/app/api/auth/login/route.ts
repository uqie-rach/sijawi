import { prisma } from '@/lib/prisma';
import { bcrypt } from '@/lib/bcrypt';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Email and password are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check for Super Admin
    if (email === 'admin@wtms.com') {
      const config = await prisma.adminConfig.findUnique({ where: { id: 'admin-config' } });
      let passwordValid = false;

      if (config?.passwordHash) {
        passwordValid = await bcrypt.compare(password, config.passwordHash);
      } else {
        passwordValid = password === 'admin123';
      }

      if (passwordValid) {
        const cookieStore = await cookies();
        cookieStore.set('sessionToken', 'admin-session-token', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24,
        });

        return new Response(JSON.stringify({
          user: { name: 'Super Admin', email: 'admin@wtms.com', role: 'admin' },
          token: 'admin-session-token'
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      } else {
        return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // Find Widyaiswara
    const user = await prisma.widyaiswara.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } },
    });

    if (!user) {
      return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let passwordMatch = true;
    if (user.password_hash) {
      passwordMatch = await bcrypt.compare(password, user.password_hash);
    } else {
      passwordMatch = (password === 'wi123');
    }

    if (!passwordMatch) {
      return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const sessionToken = 'wi-session-token';
    const cookieStore = await cookies();
    cookieStore.set('sessionToken', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
    });

    const userMetadata = {
      id: user.id,
      name: user.name,
      gelar: user.gelar,
      email: user.email,
      nip: user.nip,
      jabatan: user.jabatan,
      level: user.level,
      levelLabel: user.level_label,
    };

    return new Response(JSON.stringify({ user: userMetadata, token: sessionToken }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Auth error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
