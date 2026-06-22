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

    // Clear old state completely
    await Promise.all([
      Widyaiswara.deleteMany({}),
      KategoriPelatihan.deleteMany({}),
      MataPelatihan.deleteMany({}),
      Lokasi.deleteMany({}),
      Pelatihan.deleteMany({}),
      JadwalSesi.deleteMany({})
    ]);

    // 1. Seed Kategori Pelatihan
    const kategori = [
      { _id: 'kat-pkn', name: 'PKN (Pelatihan Kepemimpinan Nasional)', min_weight: 5 },
      { _id: 'kat-pka', name: 'PKA (Pelatihan Kepemimpinan Administrator)', min_weight: 4 },
      { _id: 'kat-pkp', name: 'PKP (Pelatihan Kepemimpinan Pengawas)', min_weight: 3 },
      { _id: 'kat-latsar', name: 'Latsar (Pelatihan Dasar CPNS)', min_weight: 2 },
      { _id: 'kat-pppk', name: 'PPPK (Pelatihan PPPK)', min_weight: 1 },
    ];
    for (const k of kategori) {
      await KategoriPelatihan.create(k);
    }

    // 2. Seed Widyaiswara (Master Records)
    const widyaswaras = [
      { _id: 'wi-qurrota', name: 'Qurrota A’yun', gelar: 'S.E., M.Si', email: 'wtms+wi.qurrota@gmail.com', nip: '198205122009032001', jabatan: 'WI Ahli Madya', level: 3, level_label: 'PKP', jp_last_month: 28 },
      { _id: 'wi-anung', name: 'Mohammad Anung Edy Nugroho', gelar: 'M.SM', email: 'wtms+wi.anung@gmail.com', nip: '198511042010121002', jabatan: 'WI Ahli Madya', level: 3, level_label: 'PKP', jp_last_month: 24 },
      { _id: 'wi-farid', name: 'Drs. Akhmad Farid Gaftan', gelar: 'M.Si', email: 'wtms+wi.farid@gmail.com', nip: '197604152003121001', jabatan: 'WI Ahli Madya', level: 4, level_label: 'PKA', jp_last_month: 30 },
      { _id: 'wi-mahariska', name: 'Mahariska Devi P.', gelar: 'S.T., M.PSDM', email: 'wtms+wi.mahariska@gmail.com', nip: '199008242015032002', jabatan: 'WI Ahli Muda', level: 3, level_label: 'PKP', jp_last_month: 16 },
      { _id: 'wi-randy', name: 'Randy Febriano Ruhyana', gelar: 'S.T., M.MT', email: 'wtms+wi.randy@gmail.com', nip: '199102142018011003', jabatan: 'WI Ahli Muda', level: 3, level_label: 'PKP', jp_last_month: 20 },
      { _id: 'wi-bpsdm-institutional', name: 'Kepala Badan/Sekretaris/Kabid', gelar: 'BPSDM Prov. Jatim', email: 'wtms+wi.bpsdm@gmail.com', nip: '197001011990031001', jabatan: 'WI Ahli Utama', level: 5, level_label: 'PKN', jp_last_month: 10 }
    ];
    for (const w of widyaswaras) {
      await Widyaiswara.create(w);
    }

    // 3. Seed Mata Pelatihan
    const mapels = [
      { _id: 'mapel-pembukaan', name: 'Kebijakan Pengembangan SDA', kategori_id: 'kat-latsar', jp_total: 2 },
      { _id: 'mapel-dinamika', name: 'Dinamika Kelompok', kategori_id: 'kat-latsar', jp_total: 3 },
      { _id: 'mapel-sikap-bela-negara', name: 'SYNC: Sikap Perilaku Bela Negara (Agenda 1)', kategori_id: 'kat-latsar', jp_total: 10 },
      { _id: 'mapel-pembekalan-mentor', name: 'Pembekalan Mentor', kategori_id: 'kat-latsar', jp_total: 2 },
      { _id: 'mapel-async-tugas', name: 'ASYNC: Tugas Individu / Kelompok', kategori_id: 'kat-latsar', jp_total: 20 },
      { _id: 'mapel-nilai-dasar', name: 'SYNC: Nilai-Nilai Dasar PNS (Agenda 2)', kategori_id: 'kat-latsar', jp_total: 10 },
      { _id: 'mapel-kedudukan-pns', name: 'SYNC: Kedudukan & Peran PNS (Agenda 3)', kategori_id: 'kat-latsar', jp_total: 5 },
      { _id: 'mapel-rancangan-aktualisasi', name: 'SYNC: Pembimbingan Rancangan Aktualisasi', kategori_id: 'kat-latsar', jp_total: 10 }
    ];
    for (const m of mapels) {
      await MataPelatihan.create(m);
    }

    // 4. Seed Lokasi
    const lokasi = [
      { _id: 'lok-bpsdm-surabaya', name: 'BPSDM Surabaya (Virtual Classroom)' },
      { _id: 'lok-aula', name: 'Aula Utama Jatim' },
      { _id: 'lok-kelas-a', name: 'Ruang Kelas A' }
    ];
    for (const l of lokasi) {
      await Lokasi.create(l);
    }

    // 5. Seed Batch
    const batch = {
      _id: 'batch-latsar-2026',
      name: 'Pelatihan Dasar CPNS Golongan II Angkatan II Tahun 2026',
      kategori_id: 'kat-latsar',
      pola: 'Kontribusi' as const,
      start_date: '2026-01-31',
      end_date: '2026-04-11'
    };
    await Pelatihan.create(batch);

    // 6. Seed Jadwal Sesi (Multi-WI samples included!)
    const sessions = [
      {
        _id: 'sess-1',
        batch_id: 'batch-latsar-2026',
        mapel_id: 'mapel-pembukaan',
        wi_ids: ['wi-bpsdm-institutional'],
        date: '2026-01-31',
        start_time: '09:00',
        end_time: '11:00',
        format: 'Klasikal' as const,
        lokasi_id: 'lok-bpsdm-surabaya',
        jp_ke: '1-2',
        jp_count: 2
      },
      {
        _id: 'sess-2',
        batch_id: 'batch-latsar-2026',
        mapel_id: 'mapel-dinamika',
        wi_ids: ['wi-qurrota'],
        date: '2026-01-31',
        start_time: '14:45',
        end_time: '17:00',
        format: 'Klasikal' as const,
        lokasi_id: 'lok-bpsdm-surabaya',
        jp_ke: '3-5',
        jp_count: 3
      },
      {
        _id: 'sess-3',
        batch_id: 'batch-latsar-2026',
        mapel_id: 'mapel-sikap-bela-negara',
        wi_ids: ['wi-qurrota', 'wi-anung', 'wi-farid', 'wi-mahariska'],
        date: '2026-02-02',
        start_time: '08:00',
        end_time: '09:30',
        format: 'Virtual' as const,
        lokasi_id: null,
        jp_ke: '1-2',
        jp_count: 2
      },
      {
        _id: 'sess-4',
        batch_id: 'batch-latsar-2026',
        mapel_id: 'mapel-pembekalan-mentor',
        wi_ids: ['wi-farid'],
        date: '2026-02-02',
        start_time: '09:30',
        end_time: '11:00',
        format: 'Klasikal' as const,
        lokasi_id: 'lok-bpsdm-surabaya',
        jp_ke: '3-4',
        jp_count: 2
      },
      {
        _id: 'sess-5',
        batch_id: 'batch-latsar-2026',
        mapel_id: 'mapel-async-tugas',
        wi_ids: ['wi-farid'],
        date: '2026-02-02',
        start_time: '12:00',
        end_time: '17:15',
        format: 'Asinkron' as const,
        lokasi_id: null,
        jp_ke: '5-11',
        jp_count: 7
      },
      {
        _id: 'sess-6',
        batch_id: 'batch-latsar-2026',
        mapel_id: 'mapel-sikap-bela-negara',
        wi_ids: ['wi-qurrota', 'wi-anung', 'wi-farid', 'wi-mahariska'],
        date: '2026-02-04',
        start_time: '13:00',
        end_time: '15:15',
        format: 'Virtual' as const,
        lokasi_id: null,
        jp_ke: '1-3',
        jp_count: 3
      },
      {
        _id: 'sess-7',
        batch_id: 'batch-latsar-2026',
        mapel_id: 'mapel-nilai-dasar',
        wi_ids: ['wi-qurrota', 'wi-anung', 'wi-farid', 'wi-mahariska'],
        date: '2026-02-05',
        start_time: '08:00',
        end_time: '09:30',
        format: 'Virtual' as const,
        lokasi_id: null,
        jp_ke: '1-2',
        jp_count: 2
      },
      {
        _id: 'sess-8',
        batch_id: 'batch-latsar-2026',
        mapel_id: 'mapel-nilai-dasar',
        wi_ids: ['wi-qurrota', 'wi-anung', 'wi-farid', 'wi-mahariska'],
        date: '2026-02-10',
        start_time: '13:00',
        end_time: '15:15',
        format: 'Virtual' as const,
        lokasi_id: null,
        jp_ke: '1-3',
        jp_count: 3
      },
      {
        _id: 'sess-9',
        batch_id: 'batch-latsar-2026',
        mapel_id: 'mapel-kedudukan-pns',
        wi_ids: ['wi-randy'],
        date: '2026-02-13',
        start_time: '08:00',
        end_time: '11:45',
        format: 'Virtual' as const,
        lokasi_id: null,
        jp_ke: '1-5',
        jp_count: 5
      },
      {
        _id: 'sess-10',
        batch_id: 'batch-latsar-2026',
        mapel_id: 'mapel-rancangan-aktualisasi',
        wi_ids: ['wi-qurrota', 'wi-anung', 'wi-farid', 'wi-mahariska'],
        date: '2026-02-13',
        start_time: '15:30',
        end_time: '17:00',
        format: 'Virtual' as const,
        lokasi_id: null,
        jp_ke: '6-7',
        jp_count: 2
      }
    ];

    for (const s of sessions) {
      await JadwalSesi.create(s);
    }

    return Response.json({ success: true, message: 'Re-seeding completed with Latsar CPNS 2026 schedule dataset!' });
  } catch (error: any) {
    console.error('Seeding error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}