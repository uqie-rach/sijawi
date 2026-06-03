import { sql } from '@/db';

export async function POST() {
  try {
    // Cek apakah data sudah ada
    const countResult = await sql`SELECT COUNT(*)::int as count FROM widyaswaras`;
    if (countResult[0].count > 0) {
      return Response.json({ success: true, message: 'Already seeded' });
    }

    // Seed Kategori Pelatihan
    const kategori = [
      { id: 'kat-pkn', name: 'PKN (Pelatihan Kepemimpinan Nasional)', min_weight: 5 },
      { id: 'kat-pka', name: 'PKA (Pelatihan Kepemimpinan Administrator)', min_weight: 4 },
      { id: 'kat-pkp', name: 'PKP (Pelatihan Kepemimpinan Pengawas)', min_weight: 3 },
      { id: 'kat-latsar', name: 'Latsar (Pelatihan Dasar CPNS)', min_weight: 2 },
      { id: 'kat-pppk', name: 'PPPK (Pelatihan PPPK)', min_weight: 1 },
    ];

    for (const k of kategori) {
      await sql`
        INSERT INTO kategori_pelatihan (id, name, min_weight)
        VALUES (${k.id}, ${k.name}, ${k.min_weight})
        ON CONFLICT (id) DO NOTHING
      `;
    }

    // Seed Widyaswaras
    const widyaswaras = [
      { id: 'wi-1', name: 'Uqie Rachmadie', gelar: 'M.Pd.', email: 'wtms+wi.uqie@gmail.com', nip: '197508122001121002', jabatan: 'WI Ahli Utama', level: 5, level_label: 'PKM', jp_last_month: 32 },
      { id: 'wi-2', name: 'Americo Block', gelar: 'S.T.', email: 'wtms+wi.americo@gmail.com', nip: '198803152010121001', jabatan: 'WI Ahli Muda', level: 2, level_label: 'Latsar', jp_last_month: 24 },
      { id: 'wi-3', name: 'Dr. H. Ahmad Yani', gelar: 'M.Si.', email: 'wtms+wi.yani@gmail.com', nip: '197001011995031001', jabatan: 'WI Ahli Madya', level: 4, level_label: 'PKA', jp_last_month: 28 },
      { id: 'wi-4', name: 'Rina Wijaya', gelar: 'M.Si.', email: 'wtms+wi.rina@gmail.com', nip: '198211202006042003', jabatan: 'WI Ahli Madya', level: 3, level_label: 'PKP', jp_last_month: 18 },
      { id: 'wi-5', name: 'Budi Santoso', gelar: 'S.Kom.', email: 'wtms+wi.budi@gmail.com', nip: '199205102018011002', jabatan: 'WI Ahli Pertama', level: 1, level_label: 'PPPK', jp_last_month: 12 },
    ];

    for (const w of widyaswaras) {
      await sql`
        INSERT INTO widyaswaras (id, name, gelar, email, nip, jabatan, level, level_label, jp_last_month)
        VALUES (${w.id}, ${w.name}, ${w.gelar}, ${w.email}, ${w.nip}, ${w.jabatan}, ${w.level}, ${w.level_label}, ${w.jp_last_month})
        ON CONFLICT (id) DO NOTHING
      `;
    }

    // Seed Mata Pelatihan
    const mapel = [
      { id: 'mapel-1', name: 'Kepemimpinan Pancasila & Nasionalisme', kategori_id: 'kat-pka', jp_total: 4 },
      { id: 'mapel-2', name: 'Manajemen Perubahan Sektor Publik', kategori_id: 'kat-pka', jp_total: 6 },
      { id: 'mapel-3', name: 'Etika dan Integritas Kepemimpinan', kategori_id: 'kat-pka', jp_total: 3 },
      { id: 'mapel-4', name: 'Agenda Bela Negara', kategori_id: 'kat-latsar', jp_total: 2 },
      { id: 'mapel-5', name: 'Nilai-Nilai Dasar PNS (BerAKHLAK)', kategori_id: 'kat-latsar', jp_total: 6 },
      { id: 'mapel-6', name: 'Manajemen Strategis Nasional', kategori_id: 'kat-pkm', jp_total: 6 },
      { id: 'mapel-7', name: 'Inovasi Pelayanan Publik', kategori_id: 'kat-pkp', jp_total: 4 },
    ];

    for (const m of mapel) {
      await sql`
        INSERT INTO mata_pelatihan (id, name, kategori_id, jp_total)
        VALUES (${m.id}, ${m.name}, ${m.kategori_id}, ${m.jp_total})
        ON CONFLICT (id) DO NOTHING
      `;
    }

    // Seed Lokasi
    const lokasi = [
      { id: 'lok-1', name: 'Aula Utama' },
      { id: 'lok-2', name: 'Lab Komputer' },
      { id: 'lok-3', name: 'Ruang Kelas A' },
      { id: 'lok-4', name: 'Ruang Kelas B' },
    ];

    for (const l of lokasi) {
      await sql`
        INSERT INTO lokasi (id, name)
        VALUES (${l.id}, ${l.name})
        ON CONFLICT (id) DO NOTHING
      `;
    }

    // Seed Batches
    const batches = [
      { id: 'batch-1', name: 'PKA Angkatan I', kategori_id: 'kat-pka', pola: 'APBD', start_date: '2026-03-01', end_date: '2026-03-15' },
      { id: 'batch-2', name: 'Latsar CPNS 2026', kategori_id: 'kat-latsar', pola: 'Kontribusi', start_date: '2026-03-10', end_date: '2026-03-25' },
      { id: 'batch-3', name: 'PKM Kepemimpinan Nasional', kategori_id: 'kat-pkm', pola: 'Kemitraan', start_date: '2026-03-05', end_date: '2026-03-20' },
      { id: 'batch-4', name: 'PKA Angkatan II (April)', kategori_id: 'kat-pka', pola: 'APBD', start_date: '2026-04-01', end_date: '2026-04-15' },
      { id: 'batch-5', name: 'PKP Angkatan I (April)', kategori_id: 'kat-pkp', pola: 'Kontribusi', start_date: '2026-04-05', end_date: '2026-04-20' },
    ];

    for (const b of batches) {
      await sql`
        INSERT INTO batches (id, name, kategori_id, pola, start_date, end_date)
        VALUES (${b.id}, ${b.name}, ${b.kategori_id}, ${b.pola}, ${b.start_date}, ${b.end_date})
        ON CONFLICT (id) DO NOTHING
      `;
    }

    // Seed Sessions
    const sessions = [
      { id: 'sess-1', batch_id: 'batch-1', mapel_id: 'mapel-1', wi_id: 'wi-3', date: '2026-03-02', start_time: '08:00', end_time: '09:30', format: 'Klasikal', lokasi_id: 'lok-3', jp_ke: '1-2', jp_count: 2 },
      { id: 'sess-2', batch_id: 'batch-1', mapel_id: 'mapel-2', wi_id: 'wi-1', date: '2026-03-03', start_time: '10:00', end_time: '12:15', format: 'Klasikal', lokasi_id: 'lok-1', jp_ke: '3-5', jp_count: 3 },
      { id: 'sess-3', batch_id: 'batch-2', mapel_id: 'mapel-4', wi_id: 'wi-2', date: '2026-03-11', start_time: '08:00', end_time: '09:30', format: 'Klasikal', lokasi_id: 'lok-2', jp_ke: '1-2', jp_count: 2 },
      { id: 'sess-4', batch_id: 'batch-3', mapel_id: 'mapel-6', wi_id: 'wi-1', date: '2026-03-06', start_time: '08:00', end_time: '10:15', format: 'Klasikal', lokasi_id: 'lok-1', jp_ke: '1-3', jp_count: 3 },
      { id: 'sess-5', batch_id: 'batch-3', mapel_id: 'mapel-6', wi_id: 'wi-3', date: '2026-03-07', start_time: '13:00', end_time: '15:15', format: 'Virtual', lokasi_id: null, jp_ke: '4-6', jp_count: 3 },
      { id: 'sess-6', batch_id: 'batch-2', mapel_id: 'mapel-5', wi_id: 'wi-4', date: '2026-03-12', start_time: '08:00', end_time: '10:15', format: 'Klasikal', lokasi_id: 'lok-3', jp_ke: '1-3', jp_count: 3 },
      { id: 'sess-7', batch_id: 'batch-2', mapel_id: 'mapel-5', wi_id: 'wi-2', date: '2026-03-13', start_time: '13:00', end_time: '15:15', format: 'Virtual', lokasi_id: null, jp_ke: '4-6', jp_count: 3 },
      { id: 'sess-8', batch_id: 'batch-4', mapel_id: 'mapel-1', wi_id: 'wi-3', date: '2026-04-02', start_time: '08:00', end_time: '09:30', format: 'Klasikal', lokasi_id: 'lok-3', jp_ke: '1-2', jp_count: 2 },
      { id: 'sess-9', batch_id: 'batch-4', mapel_id: 'mapel-2', wi_id: 'wi-1', date: '2026-04-03', start_time: '10:00', end_time: '12:15', format: 'Klasikal', lokasi_id: 'lok-1', jp_ke: '3-5', jp_count: 3 },
      { id: 'sess-10', batch_id: 'batch-5', mapel_id: 'mapel-7', wi_id: 'wi-4', date: '2026-04-06', start_time: '08:00', end_time: '10:15', format: 'Klasikal', lokasi_id: 'lok-4', jp_ke: '1-3', jp_count: 3 },
      { id: 'sess-11', batch_id: 'batch-5', mapel_id: 'mapel-7', wi_id: 'wi-3', date: '2026-04-07', start_time: '13:00', end_time: '13:45', format: 'Virtual', lokasi_id: null, jp_ke: '4', jp_count: 1 },
      { id: 'sess-12', batch_id: 'batch-4', mapel_id: 'mapel-3', wi_id: 'wi-4', date: '2026-04-08', start_time: '08:00', end_time: '10:15', format: 'Klasikal', lokasi_id: 'lok-3', jp_ke: '1-3', jp_count: 3 }
    ];

    for (const s of sessions) {
      await sql`
        INSERT INTO sessions (id, batch_id, mapel_id, wi_id, date, start_time, end_time, format, lokasi_id, jp_ke, jp_count)
        VALUES (${s.id}, ${s.batch_id}, ${s.mapel_id}, ${s.wi_id}, ${s.date}, ${s.start_time}, ${s.end_time}, ${s.format}, ${s.lokasi_id}, ${s.jp_ke}, ${s.jp_count})
        ON CONFLICT (id) DO NOTHING
      `;
    }

    return Response.json({ success: true, message: 'Seeding completed successfully' });
  } catch (error: any) {
    console.error('Seeding error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}