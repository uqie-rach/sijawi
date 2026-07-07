import { connectToDatabase } from '@/lib/mongodb';
import Pelatihan from '@/models/Pelatihan';
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
    const rows = await Pelatihan.find().sort({ start_date: -1 });
    const batches = rows.map(r => ({
      id: r._id,
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
    await connectToDatabase();
    const body = await request.json();
    const { id, name, kategoriId, pola, startDate, endDate } = body;
    
    const newBatch = new Pelatihan({
      _id: id,
      name,
      kategori_id: kategoriId,
      pola,
      start_date: startDate,
      end_date: endDate
    });

    await newBatch.save();
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
    const { id, name, kategoriId, pola, startDate, endDate } = body;
    
    await Pelatihan.findByIdAndUpdate(id, {
      name,
      kategori_id: kategoriId,
      pola,
      start_date: startDate,
      end_date: endDate
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
    
    await Pelatihan.findByIdAndDelete(id);
    return Response.json({ success: true });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}