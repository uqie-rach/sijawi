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
    const rows = await sql`SELECT * FROM batches ORDER BY start_date DESC`;
    const batches = rows.map(r => ({
      id: r.id,
      name: r.name,
      kategoriId: r.kategori_id,
      pola: r.pola,
      startDate: r.start_date,
      endDate: r.end_date
    }));
    return Response.json(batches);
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
    const { id, name, kategoriId, pola, startDate, endDate } = body;
    await sql`
      INSERT INTO batches (id, name, kategori_id, pola, start_date, end_date)
      VALUES (${id}, ${name}, ${kategoriId}, ${pola}, ${startDate}, ${endDate})
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
    const { id, name, kategoriId, pola, startDate, endDate } = body;
    await sql`
      UPDATE batches
      SET name = ${name}, kategori_id = ${kategoriId}, pola = ${pola}, start_date = ${startDate}, end_date = ${endDate}
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
    await sql`DELETE FROM batches WHERE id = ${id}`;
    return Response.json({ success: true });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}