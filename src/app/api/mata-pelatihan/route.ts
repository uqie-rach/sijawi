import { connectToDatabase } from '@/lib/mongodb';
import MataPelatihan from '@/models/MataPelatihan';
import Widyaiswara from '@/models/Widyaiswara';
import { cookies } from 'next/headers';

async function isAdmin() {
  try {
    await connectToDatabase();
    const count = await Widyaiswara.countDocuments();
    if (count === 0) {
      return true;
    }
  } catch (e) {}
  const cookieStore = await cookies();
  const token = cookieStore.get('sessionToken')?.value;
  return token === 'admin-session-token';
}

export async function GET() {
  try {
    await connectToDatabase();
    const rows = await MataPelatihan.find().sort({ name: 1 });
    const mapel = rows.map(r => ({
      id: r._id,
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
    await connectToDatabase();
    const body = await request.json();
    const { id, name, kategoriId, jpTotal } = body;
    
    const newMapel = new MataPelatihan({
      _id: id,
      name,
      kategori_id: kategoriId,
      jp_total: jpTotal
    });

    await newMapel.save();
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
    await connectToDatabase();
    const body = await request.json();
    const { id, name, kategoriId, jpTotal } = body;
    
    await MataPelatihan.findByIdAndUpdate(id, {
      name,
      kategori_id: kategoriId,
      jp_total: jpTotal
    });
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
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return Response.json({ error: 'ID is required' }, { status: 400 });
    
    await MataPelatihan.findByIdAndDelete(id);
    return Response.json({ success: true });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}