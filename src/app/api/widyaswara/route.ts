import { sql } from '@/db';
import { cookies } from 'next/headers';

async function isAdmin() {
  try {
    const countResult = await sql`SELECT COUNT(*)::int as count FROM widyaswaras`;
    if (countResult[0].count === 0) {
      return true;
    }
  } catch (e) {
    // Jika tabel belum ada atau error lainnya, abaikan dan lanjut ke cek cookie
  }
  const cookieStore = await cookies();
  const token = cookieStore.get('sessionToken')?.value;
  return token === 'admin-session-token';
}

export async function GET() {
  try {
    const rows = await sql`SELECT * FROM widyaswaras ORDER BY name ASC`;
    const widyaswaras = rows.map(r => ({
      id: r.id,
      name: r.name,
      gelar: r.gelar || '',
      email: r.email,
      nip: r.nip,
      jabatan: r.jabatan,
      level: r.level,
      levelLabel: r.level_label,
      jpLastMonth: r.jp_last_month || 0
    }));
    return Response.json(widyaswaras);
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { id, name, gelar, email, nip, jabatan, level, levelLabel, jpLastMonth } = body;
    
    await sql`
      INSERT INTO widyaswaras (id, name, gelar, email, nip, jabatan, level, level_label, jp_last_month)
      VALUES (${id}, ${name}, ${gelar || ''}, ${email}, ${nip}, ${jabatan}, ${level}, ${levelLabel}, ${jpLastMonth || 0})
    `;
    return Response.json({ success: true });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!(await isAdmin())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { id, name, gelar, email, nip, jabatan, level, levelLabel, jpLastMonth } = body;
    
    await sql`
      UPDATE widyaswaras
      SET name = ${name}, gelar = ${gelar || ''}, email = ${email}, nip = ${nip}, jabatan = ${jabatan}, level = ${level}, level_label = ${levelLabel}, jp_last_month = ${jpLastMonth || 0}
      WHERE id = ${id}
    `;
    return Response.json({ success: true });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!(await isAdmin())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return Response.json({ error: 'ID is required' }, { status: 400 });
    
    await sql`DELETE FROM widyaswaras WHERE id = ${id}`;
    return Response.json({ success: true });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}