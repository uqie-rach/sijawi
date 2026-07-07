import { connectToDatabase } from '@/lib/mongodb';
import Widyaiswara from '@/models/Widyaiswara';
import KategoriPelatihan from '@/models/KategoriPelatihan';
import MataPelatihan from '@/models/MataPelatihan';
import Lokasi from '@/models/Lokasi';
import Pelatihan from '@/models/Pelatihan';
import JadwalSesi from '@/models/JadwalSesi';
import {
  kategoriPelatihan,
  widyaswaras,
  mataPelatihan,
  lokasi,
  batches,
  sessions,
} from '@/lib/seed-data';

export async function POST() {
  try {
    await connectToDatabase();

    // Clear old state
    await Promise.all([
      Widyaiswara.deleteMany({}),
      KategoriPelatihan.deleteMany({}),
      MataPelatihan.deleteMany({}),
      Lokasi.deleteMany({}),
      Pelatihan.deleteMany({}),
      JadwalSesi.deleteMany({}),
    ]);

    // Insert fresh data
    await KategoriPelatihan.insertMany(kategoriPelatihan);
    await Widyaiswara.insertMany(widyaswaras);
    await MataPelatihan.insertMany(mataPelatihan);
    await Lokasi.insertMany(lokasi);
    await Pelatihan.insertMany(batches);
    await JadwalSesi.insertMany(sessions);

    const polaCovered = [...new Set(batches.map(b => b.pola))];

    return Response.json({
      success: true,
      message: `Seeding complete: ${batches.length} batches, ${sessions.length} sessions across ${polaCovered.length} pola (${polaCovered.join(', ')})`,
    });
  } catch (error: any) {
    console.error('Seeding error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
