import { connectToDatabase } from '@/lib/mongodb';
import Widyaiswara from '@/models/Widyaiswara';
import KategoriPelatihan from '@/models/KategoriPelatihan';
import MataPelatihan from '@/models/MataPelatihan';
import Lokasi from '@/models/Lokasi';
import Pelatihan from '@/models/Pelatihan';
import JadwalSesi from '@/models/JadwalSesi';

export async function POST() {
  try {
    await connectToDatabase();

    // Check if data already exists
    const count = await Widyaiswara.countDocuments();
    if (count > 0) {
      return Response.json({ success: true, message: 'Already seeded' });
    }

    // Seed Kategori Pelatihan
    const kategori = [
      { _id: 'kat-pkn', name: 'PKN (Pelatihan Kepemimpinan Nasional)', min_weight: 5 },
      { _id: 'kat-pka', name: 'PKA (Pelatihan Kepemimpinan Administrator)', min_weight: 4 },
      { _id: 'kat-pkp', name: 'PKP (Pelatihan Kepemimpinan Pengawas)', min_weight: 3 },
      { _id: 'kat-latsar', name: 'Latsar (Pelatihan Dasar CPNS)', min_weight: 2 },
      { _id: 'kat-pppk', name: 'PPPK (Pelatihan PPPK)', min_weight: 1 },
    ];

    for (const k of kategori) {
      await KategoriPelatihan.findByIdAndUpdate(k._id, k, { upsert: true });
    }

    // Seed Widyaswaras
    const widyaswaras = [
      { _id: 'wi-1', name: 'Uqie Rachmadie', gelar: 'M.Pd.', email: 'wtms+wi.uqie@gmail.com', nip: '197508122001121002', jabatan: 'WI Ahli Utama', level: 5, level_label: 'PKN', jp_last_month: 32 },
      { _id: 'wi-2', name: 'Americo Block', gelar: 'S.T.', email: 'wtms+wi.americo@gmail.com', nip: '198803152010121001', jabatan: 'WI Ahli Muda', level: 2, level_label: 'Latsar', jp_last_month: 24 },
      { _id: 'wi-3', name: 'Dr. H. Ahmad Yani', gelar: 'M.Si.', email: 'wtms+wi.yani@gmail.com', nip: '197001011995031001', jabatan: 'WI Ahli Madya', level: 4, level_label: 'PKA', jp_last_month: 28 },
      { _id: 'wi-4', name: 'Rina Wijaya', gelar: 'M.Si.', email: 'wtms+wi.rina@gmail.com', nip: '198211202006042003', jabatan: 'WI Ahli Madya', level: 3, level_label: 'PKP', jp_last_month: 18 },
      { _id: 'wi-5', name: 'Budi Santoso', gelar: 'S.Kom.', email: 'wtms+wi.budi@gmail.com', nip: '199205102018011002', jabatan: 'WI Ahli Pertama', level: 1, level_label: 'PPPK', jp_last_month: 12 },
    ];

    for (const w of widyaswaras) {
      await Widyaiswara.findByIdAndUpdate(w._id, w, { upsert: true });
    }

    // Seed Mata Pelatihan
    const mapel = [
      { _id: 'mapel-1', name: 'Kepemimpinan Pancasila & Nasionalisme', kategori_id: 'kat-pka', jp_total: 4 },
      { _id: 'mapel-2', name: 'Manajemen Perubahan Sektor Publik', kategori_id: 'kat-pka', jp_total: 6 },
      { _id: 'mapel-3', name: 'Etika dan Integritas Kepemimpinan', kategori_id: 'kat-pka', jp_total: 3 },
      { _id: 'mapel-4', name: 'Agenda Bela Negara', kategori_id: 'kat-latsar', jp_total: 2 },
      { _id: 'mapel-5', name: 'Nilai-Nilai Dasar PNS (BerAKHLAK)', kategori_id: 'kat-latsar', jp_total: 6 },
      { _id: 'mapel-6', name: 'Manajemen Strategis Nasional', kategori_id: 'kat-pkn', jp_total: 6 },
      { _id: 'mapel-7', name: 'Inovasi Pelayanan Publik', kategori_id: 'kat-pkp', jp_total: 4 },
    ];

    for (const m of mapel) {
      await MataPelatihan.findByIdAndUpdate(m._id, m, { upsert: true });
    }

    // Seed Lokasi
    const lokasi = [
      { _id: 'lok-1', name: 'Aula Utama' },
      { _id: 'lok-2', name: 'Lab Komputer' },
      { _id: 'lok-3', name: 'Ruang Kelas A' },
      { _id: 'lok-4', name: 'Ruang Kelas B' },
    ];

    for (const l of lokasi) {
      await Lokasi.findByIdAndUpdate(l._id, l, { upsert: true });
    }

    // Seed Batches
    const batches = [
      { _id: 'batch-1', name: 'PKA Angkatan I', kategori_id: 'kat-pka', pola: 'APBD', start_date: '2026-03-01', end_date: '2026-03-15' },
      { _id: 'batch-2', name: 'Latsar CPNS 2026', kategori_id: 'kat-latsar', pola: 'Kontribusi', start_date: '2026-03-10', end_date: '2026-03-25' },
      { _id: 'batch-3', name: 'PKN Kepemimpinan Nasional', kategori_id: 'kat-pkn', pola: 'Kemitraan', start_date: '2026-03-05', end_date: '2026-03-20' },
      { _id: 'batch-4', name: 'PKA Angkatan II (April)', kategori_id: 'kat-pka', pola: 'APBD', start_date: '2026-04-01', end_date: '2026-04-15' },
      { _id: 'batch-5', name: 'PKP Angkatan I (April)', kategori_id: 'kat-pkp', pola: 'Kontribusi', start_date: '2026-04-05', end_date: '2026-04-20' },
    ];

    for (const b of batches) {
      await Pelatihan.findByIdAndUpdate(b._id, b, { upsert: true });
    }

    // Seed Sessions
    const sessions = [
      { _id: 'sess-1', batch_id: 'batch-1', mapel_id: 'mapel-1', wi_id: 'wi-3', date: '2026-03-02', start_time: '08:00', end_time: '09:30', format: 'Klasikal', lokasi_id: 'lok-3', jp_ke: '1-2', jp_count: 2 },
      { _id: 'sess-2', batch_id: 'batch-1', mapel_id: 'mapel-2', wi_id: 'wi-1', date: '2026-03-03', start_time: '10:00', end_time: '12:15', format: 'Klasikal', lokasi_id: 'lok-1', jp_ke: '3-5', jp_count: 3 },
      { _id: 'sess-3', batch_id: 'batch-2', mapel_id: 'mapel-4', wi_id: 'wi-2', date: '2026-03-11', start_time: '08:00', end_time: '09:30', format: 'Klasikal', lokasi_id: 'lok-2', jp_ke: '1-2', jp_count: 2 },
      { _id: 'sess-4', batch_id: 'batch-3', mapel_id: 'mapel-6', wi_id: 'wi-1', date: '2026-03-06', start_time: '08:00', end_time: '10:15', format: 'Klasikal', lokasi_id: 'lok-1', jp_ke: '1-3', jp_count: 3 },
      { _id: 'sess-5', batch_id: 'batch-3', mapel_id: 'mapel-6', wi_id: 'wi-3', date: '2026-03-07', start_time: '13:00', end_time: '15:15', format: 'Virtual', lokasi_id: null, jp_ke: '4-6', jp_count: 3 },
      { _id: 'sess-6', batch_id: 'batch-2', mapel_id: 'mapel-5', wi_id: 'wi-4', date: '2026-03-12', start_time: '08:00', end_time: '10:15', format: 'Klasikal', lokasi_id: 'lok-3', jp_ke: '1-3', jp_count: 3 },
      { _id: 'sess-7', batch_id: 'batch-2', mapel_id: 'mapel-5', wi_id: 'wi-2', date: '2026-03-13', start_time: '13:00', end_time: '15:15', format: 'Virtual', lokasi_id: null, jp_ke: '4-6', jp_count: 3 },
      { _id: 'sess-8', batch_id: 'batch-4', mapel_id: 'mapel-1', wi_id: 'wi-3', date: '2026-04-02', start_time: '08:00', end_time: '09:30', format: 'Klasikal', lokasi_id: 'lok-3', jp_ke: '1-2', jp_count: 2 },
      { _id: 'sess-9', batch_id: 'batch-4', mapel_id: 'mapel-2', wi_id: 'wi-1', date: '2026-04-03', start_time: '10:00', end_time: '12:15', format: 'Klasikal', lokasi_id: 'lok-1', jp_ke: '3-5', jp_count: 3 },
      { _id: 'sess-10', batch_id: 'batch-5', mapel_id: 'mapel-7', wi_id: 'wi-4', date: '2026-04-06', start_time: '08:00', end_time: '10:15', format: 'Klasikal', lokasi_id: 'lok-4', jp_ke: '1-3', jp_count: 3 },
      { _id: 'sess-11', batch_id: 'batch-5', mapel_id: 'mapel-7', wi_id: 'wi-3', date: '2026-04-07', start_time: '13:00', end_time: '13:45', format: 'Virtual', lokasi_id: null, jp_ke: '4', jp_count: 1 },
      { _id: 'sess-12', batch_id: 'batch-4', mapel_id: 'mapel-3', wi_id: 'wi-4', date: '2026-04-08', start_time: '08:00', end_time: '10:15', format: 'Klasikal', lokasi_id: 'lok-3', jp_ke: '1-3', jp_count: 3 }
    ];

    for (const s of sessions) {
      await JadwalSesi.findByIdAndUpdate(s._id, s, { upsert: true });
    }

    return Response.json({ success: true, message: 'Seeding completed successfully' });
  } catch (error: any) {
    console.error('Seeding error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}