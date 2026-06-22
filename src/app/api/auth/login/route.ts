import { connectToDatabase } from '@/lib/mongodb';
import Widyaiswara from '@/models/Widyaiswara';
import { bcrypt } from '@/lib/bcrypt';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const { email, password } = await request.json();

    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Email and password are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check for Super Admin
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

    // Find user in MongoDB
    const user = await Widyaiswara.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });

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
      maxAge: 60 * 60 * 24, // 24 hours
    });

    const userMetadata = {
      id: user._id,
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