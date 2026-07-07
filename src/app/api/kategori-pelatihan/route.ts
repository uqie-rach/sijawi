import { connectToDatabase } from '@/lib/mongodb';
import KategoriPelatihan from '@/models/KategoriPelatihan';
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
    const rows = await KategoriPelatihan.find().sort({ name: 1 });
    const kategori = rows.map(r => ({
      id: r._id,
      name: r.name,
      minWeight: r.min_weight
    }));
    return Response.json(kategori);
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
    const { id, name, minWeight } = body;
    
    const newKat = new KategoriPelatihan({
      _id: id,
      name,
      min_weight: minWeight
    });

    await newKat.save();
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
    const { id, name, minWeight } = body;
    
    await KategoriPelatihan.findByIdAndUpdate(id, {
      name,
      min_weight: minWeight
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
    
    await KategoriPelatihan.findByIdAndDelete(id);
    return Response.json({ success: true });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}