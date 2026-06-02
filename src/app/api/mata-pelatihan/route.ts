import { sql } from '@/db';
import { cookies } from 'next/headers';

async function isAdmin() {
  try {
    const countResult = await sql`SELECT COUNT(*)::int as count FROM widyaswaras`;
    if (countResult[0].count === 0) {
      return true;
    }
  } catch (e) {}
  const cookieStore = await cookies();
  const token = cookieStore.get('sessionToken')?.value;
  return token === 'admin-session-token';
}

export async function GET() {
  try {
    const rows = await sql`SELECT * FROM mata_pelatihan ORDER BY name ASC`;
    const mapel = rows.map(r => ({
      id: r.id,
      name: r.name,
      kategoriId: r.kategori_id,
      jpTotal: r.jp_total
    }));
    return Response.json(mapel);
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
    const { id, name, kategoriId, jpTotal } = body;
    await sql`
      INSERT INTO mata_pelatihan (id, name, kategori_id, jp_total)
      VALUES (${id}, ${name}, ${kategoriId}, ${jpTotal})
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
    const { id, name, kategoriId, jpTotal } = body;
    await sql`
      UPDATE mata_pelatihan
      SET name = ${name}, kategori_id = ${kategoriId}, jp_total = ${jpTotal}
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
    await sql`DELETE FROM mata_pelatihan WHERE id = ${id}`;
    return Response.json({ success: true });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}