import { sql } from '@/db';
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

    // Cek jika login sebagai Super Admin default
    if (email === 'admin@wtms.com' && password === 'admin123') {
      const cookieStore = await cookies();
      cookieStore.set('sessionToken', 'admin-session-token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 24 hours
      });

      return new Response(JSON.stringify({ 
        user: { name: 'Super Admin', email: 'admin@wtms.com', role: 'admin' }, 
        token: 'admin-session-token' 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Cari user dari tabel widyaswaras di Neon Database
    const rows = await sql`SELECT * FROM widyaswaras WHERE LOWER(email) = LOWER(${email}) LIMIT 1`;
    const user = rows[0];

    if (!user) {
      return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Jika password_hash ada di database, verifikasi dengan bcrypt. 
    // Jika tidak ada (atau untuk kemudahan demo menggunakan password default 'wi123'), kita izinkan login.
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
      maxAge: 60 * 60 * 24, // 24 hours
    });

    const userMetadata = {
      id: user.id,
      name: user.name,
      gelar: user.gelar,
      email: user.email,
      nip: user.nip,
      jabatan: user.jabatan,
      level: user.level,
      levelLabel: user.level_label
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