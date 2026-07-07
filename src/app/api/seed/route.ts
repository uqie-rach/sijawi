import { prisma } from '@/lib/prisma';
import { bcrypt } from '@/lib/bcrypt';

export async function POST() {
  try {
    // Clear all data
    await Promise.all([
      prisma.jadwalSesi.deleteMany(),
      prisma.pelatihan.deleteMany(),
      prisma.mataPelatihan.deleteMany(),
      prisma.kategoriPelatihan.deleteMany(),
      prisma.lokasi.deleteMany(),
      prisma.widyaiswara.deleteMany(),
      prisma.adminConfig.deleteMany(),
    ]);

    // 1. Seed Kategori Pelatihan
    const kategori = [
      { id: 'kat-pkn', name: 'PKN (Pelatihan Kepemimpinan Nasional)', min_weight: 5 },
      { id: 'kat-pka', name: 'PKA (Pelatihan Kepemimpinan Administrator)', min_weight: 4 },
      { id: 'kat-pkp', name: 'PKP (Pelatihan Kepemimpinan Pengawas)', min_weight: 3 },
      { id: 'kat-latsar', name: 'Latsar (Pelatihan Dasar CPNS)', min_weight: 2 },
      { id: 'kat-pppk', name: 'PPPK (Pelatihan PPPK)', min_weight: 1 },
    ];
    for (const k of kategori) {
      await prisma.kategoriPelatihan.create({ data: k });
    }

    // 2. Seed Widyaiswara
    const widyaswaras = [
      { id: 'wi-bpsdm-institutional', name: 'Bidang Manajerial / Bidang PPK', gelar: 'BPSDM Prov. Jatim', email: 'wtms+wi.bpsdm@gmail.com', nip: '197001011990031001', jabatan: 'Tim Akademik BPSDM', level: 5, level_label: 'PKN', jp_last_month: 10 },
      { id: 'wi-mooc', name: 'Belajar Mandiri / MOOC', gelar: 'LAN RI', email: 'wtms+mooc@lan.go.id', nip: '199001012020011001', jabatan: 'Sistem MOOC', level: 4, level_label: 'PKA', jp_last_month: 0 },
      { id: 'wi-juli', name: 'Juli Winarto', gelar: 'AK., M.M., CA', email: 'wtms+wi.juli@gmail.com', nip: '197505122003121002', jabatan: 'WI Ahli Madya', level: 4, level_label: 'PKA', jp_last_month: 32 },
      { id: 'wi-suluh', name: 'Moch. Suluh', gelar: 'S.H., M.Si', email: 'wtms+wi.suluh@gmail.com', nip: '197204152002121001', jabatan: 'WI Ahli Madya', level: 4, level_label: 'PKA', jp_last_month: 28 },
      { id: 'wi-sitti', name: 'Sitti Sunarsih', gelar: 'S.Pd., M.Pd', email: 'wtms+wi.sitti@gmail.com', nip: '197808242006042003', jabatan: 'WI Ahli Madya', level: 4, level_label: 'PKA', jp_last_month: 24 },
      { id: 'wi-dewa', name: 'Dewa Ketut Alit', gelar: 'S.H., M.Si', email: 'wtms+wi.dewa@gmail.com', nip: '197102141998031004', jabatan: 'WI Ahli Utama', level: 4, level_label: 'PKA', jp_last_month: 35 },
      { id: 'wi-wahid', name: 'Dr. Ir. Wahid Wahyudi', gelar: 'M.T', email: 'wtms+wi.wahid@gmail.com', nip: '196811041994031002', jabatan: 'WI Ahli Utama', level: 4, level_label: 'PKA', jp_last_month: 40 },
      { id: 'wi-makhfudz', name: 'Makhfudz', gelar: 'S.H., M.Si', email: 'wtms+wi.makhfudz@gmail.com', nip: '197409212005011003', jabatan: 'WI Ahli Madya', level: 4, level_label: 'PKA', jp_last_month: 16 },
      { id: 'wi-izma', name: 'Izma Fardiana Affanti', gelar: 'S.E., M.IP', email: 'wtms+wi.izma@gmail.com', nip: '198303112009042001', jabatan: 'WI Ahli Muda', level: 4, level_label: 'PKA', jp_last_month: 20 },
    ];
    for (const w of widyaswaras) {
      await prisma.widyaiswara.create({
        data: { ...w, password_plain: 'wi123' },
      });
    }

    // 3. Seed Mata Pelatihan
    const mapels = [
      { id: 'mapel-overview', name: 'Overview Kebijakan Pelatihan & Pemetaan Sikap Perilaku', kategori_id: 'kat-pka', jp_total: 3 },
      { id: 'mapel-pretest', name: 'Pre Test Mandiri', kategori_id: 'kat-pka', jp_total: 1 },
      { id: 'mapel-kebijakan-blended', name: 'Pembelajaran Mandiri: Kebijakan Blended Learning', kategori_id: 'kat-pka', jp_total: 3 },
      { id: 'mapel-pemetaan-potensi', name: 'Pembelajaran Mandiri: Pemetaan Sikap Perilaku & Potensi Diri', kategori_id: 'kat-pka', jp_total: 6 },
      { id: 'mapel-agenda1-mooc', name: 'Agenda I: Wawasan Kebangsaan & Bela Negara Kepemimpinan Pancasila', kategori_id: 'kat-pka', jp_total: 5 },
      { id: 'mapel-esai-agenda1', name: 'Pembelajaran Mandiri: Pembuatan Esai Isu-isu Agenda I', kategori_id: 'kat-pka', jp_total: 2 },
      { id: 'mapel-agenda2-mooc', name: 'Agenda II: Kepemimpinan Transformasional & Jejaring Kerja', kategori_id: 'kat-pka', jp_total: 5 },
      { id: 'mapel-smart-gov-egov', name: 'Pembelajaran Mandiri: Sikap Perilaku Agenda Smart Governance (E-Gov)', kategori_id: 'kat-pka', jp_total: 6 },
      { id: 'mapel-agenda2-manajemen', name: 'Agenda II: Strategi Komunikasi & Manajemen Perubahan', kategori_id: 'kat-pka', jp_total: 3 },
      { id: 'mapel-esai-agenda2', name: 'Pembelajaran Mandiri: Pembuatan Esai Isu-isu Agenda II', kategori_id: 'kat-pka', jp_total: 2 },
      { id: 'mapel-agenda3-mooc', name: 'Agenda III: Akuntabilitas, Hubungan Kelembagaan & Organisasi Digital', kategori_id: 'kat-pka', jp_total: 5 },
      { id: 'mapel-agenda3-kinerja', name: 'Agenda III: Manajemen Kinerja & Standar Kinerja Pelayanan', kategori_id: 'kat-pka', jp_total: 5 },
      { id: 'mapel-smart-gov-mindset', name: 'Pembelajaran Mandiri: Sikap Perilaku Agenda Smart Governance (Mindset)', kategori_id: 'kat-pka', jp_total: 3 },
      { id: 'mapel-agenda3-keuangan', name: 'Agenda III: Manajemen Keuangan Negara & Manajemen Risiko', kategori_id: 'kat-pka', jp_total: 4 },
      { id: 'mapel-esai-agenda3', name: 'Pembelajaran Mandiri: Pembuatan Esai Isu-isu Agenda III', kategori_id: 'kat-pka', jp_total: 2 },
      { id: 'mapel-agenda4-stula', name: 'Agenda IV: Studi Lapangan & Aksi Perubahan Kinerja Organisasi', kategori_id: 'kat-pka', jp_total: 3 },
      { id: 'mapel-async-kelompok-individu', name: 'AsynC: Tugas Kelompok / Individu / Materi', kategori_id: 'kat-pka', jp_total: 30 },
      { id: 'mapel-sync-agenda1', name: 'SynC: Pembelajaran Agenda I', kategori_id: 'kat-pka', jp_total: 4 },
      { id: 'mapel-sync-agenda2', name: 'SynC: Pembelajaran Agenda II', kategori_id: 'kat-pka', jp_total: 4 },
      { id: 'mapel-sync-agenda3', name: 'SynC: Pembelajaran Agenda III', kategori_id: 'kat-pka', jp_total: 3 },
      { id: 'mapel-pembekalan-mentor-pka', name: 'Pembekalan Mentor PKA', kategori_id: 'kat-pka', jp_total: 2 },
    ];
    for (const m of mapels) {
      await prisma.mataPelatihan.create({ data: m });
    }

    // 4. Seed Lokasi
    const lokasi = [
      { id: 'lok-bpsdm-surabaya', name: 'BPSDM Surabaya (Virtual Classroom)' },
      { id: 'lok-zoom-meeting', name: 'E-Learning / WI Pengampu (Zoom Meeting)' },
      { id: 'lok-mooc-portal', name: 'Lembaga Administrasi Negara (MOOC Portal)' },
    ];
    for (const l of lokasi) {
      await prisma.lokasi.create({ data: l });
    }

    // 5. Seed Pelatihan
    await prisma.pelatihan.create({
      data: {
        id: 'batch-pka-ii-2026',
        name: 'Pelatihan Kepemimpinan Administrator (PKA) Angkatan II Tahun 2026',
        kategori_id: 'kat-pka',
        pola: 'Fasilitasi',
        start_date: '2026-04-01',
        end_date: '2026-04-20',
      },
    });

    // 6. Seed Jadwal Sesi
    const sessions = [
      { id: 'pka2-m1-s1', batch_id: 'batch-pka-ii-2026', mapel_id: 'mapel-overview', wi_ids: ['wi-bpsdm-institutional'], date: '2026-04-01', start_time: '09:00', end_time: '10:30', format: 'Klasikal', lokasi_id: 'lok-bpsdm-surabaya', jp_ke: '1-3', jp_count: 3 },
      { id: 'pka2-m1-s2', batch_id: 'batch-pka-ii-2026', mapel_id: 'mapel-pretest', wi_ids: ['wi-bpsdm-institutional'], date: '2026-04-01', start_time: '10:30', end_time: '11:15', format: 'Virtual', lokasi_id: 'lok-zoom-meeting', jp_ke: '4', jp_count: 1 },
      { id: 'pka2-m1-s3', batch_id: 'batch-pka-ii-2026', mapel_id: 'mapel-kebijakan-blended', wi_ids: ['wi-mooc'], date: '2026-04-01', start_time: '13:00', end_time: '15:15', format: 'Asinkron', lokasi_id: 'lok-mooc-portal', jp_ke: '5-7', jp_count: 3 },
      { id: 'pka2-m1-s4', batch_id: 'batch-pka-ii-2026', mapel_id: 'mapel-pemetaan-potensi', wi_ids: ['wi-mooc'], date: '2026-04-02', start_time: '08:00', end_time: '12:30', format: 'Asinkron', lokasi_id: 'lok-mooc-portal', jp_ke: '1-6', jp_count: 6 },
      { id: 'pka2-m1-s5', batch_id: 'batch-pka-ii-2026', mapel_id: 'mapel-agenda1-mooc', wi_ids: ['wi-mooc'], date: '2026-04-04', start_time: '08:00', end_time: '12:45', format: 'Asinkron', lokasi_id: 'lok-mooc-portal', jp_ke: '1-5', jp_count: 5 },
      { id: 'pka2-m1-s6', batch_id: 'batch-pka-ii-2026', mapel_id: 'mapel-esai-agenda1', wi_ids: ['wi-mooc'], date: '2026-04-04', start_time: '14:00', end_time: '16:00', format: 'Asinkron', lokasi_id: 'lok-mooc-portal', jp_ke: '6-7', jp_count: 2 },
      { id: 'pka2-m1-s7', batch_id: 'batch-pka-ii-2026', mapel_id: 'mapel-agenda2-mooc', wi_ids: ['wi-mooc'], date: '2026-04-06', start_time: '08:00', end_time: '11:45', format: 'Asinkron', lokasi_id: 'lok-mooc-portal', jp_ke: '1-5', jp_count: 5 },
      { id: 'pka2-m1-s8', batch_id: 'batch-pka-ii-2026', mapel_id: 'mapel-smart-gov-egov', wi_ids: ['wi-mooc'], date: '2026-04-06', start_time: '13:30', end_time: '18:00', format: 'Asinkron', lokasi_id: 'lok-mooc-portal', jp_ke: '6-11', jp_count: 6 },
      { id: 'pka2-m1-s9', batch_id: 'batch-pka-ii-2026', mapel_id: 'mapel-agenda2-manajemen', wi_ids: ['wi-mooc'], date: '2026-04-07', start_time: '08:00', end_time: '11:45', format: 'Asinkron', lokasi_id: 'lok-mooc-portal', jp_ke: '1-3', jp_count: 3 },
      { id: 'pka2-m1-s10', batch_id: 'batch-pka-ii-2026', mapel_id: 'mapel-esai-agenda2', wi_ids: ['wi-mooc'], date: '2026-04-07', start_time: '13:30', end_time: '18:00', format: 'Asinkron', lokasi_id: 'lok-mooc-portal', jp_ke: '4-5', jp_count: 2 },
      { id: 'pka2-m1-s11', batch_id: 'batch-pka-ii-2026', mapel_id: 'mapel-agenda3-mooc', wi_ids: ['wi-mooc'], date: '2026-04-08', start_time: '08:00', end_time: '11:45', format: 'Asinkron', lokasi_id: 'lok-mooc-portal', jp_ke: '1-5', jp_count: 5 },
      { id: 'pka2-m2-s1', batch_id: 'batch-pka-ii-2026', mapel_id: 'mapel-agenda3-kinerja', wi_ids: ['wi-mooc'], date: '2026-04-09', start_time: '08:00', end_time: '11:45', format: 'Asinkron', lokasi_id: 'lok-mooc-portal', jp_ke: '1-5', jp_count: 5 },
      { id: 'pka2-m2-s2', batch_id: 'batch-pka-ii-2026', mapel_id: 'mapel-smart-gov-mindset', wi_ids: ['wi-mooc'], date: '2026-04-10', start_time: '08:00', end_time: '10:15', format: 'Asinkron', lokasi_id: 'lok-mooc-portal', jp_ke: '1-3', jp_count: 3 },
      { id: 'pka2-m2-s3', batch_id: 'batch-pka-ii-2026', mapel_id: 'mapel-agenda3-keuangan', wi_ids: ['wi-mooc'], date: '2026-04-11', start_time: '08:00', end_time: '11:00', format: 'Asinkron', lokasi_id: 'lok-mooc-portal', jp_ke: '1-4', jp_count: 4 },
      { id: 'pka2-m2-s4', batch_id: 'batch-pka-ii-2026', mapel_id: 'mapel-esai-agenda3', wi_ids: ['wi-mooc'], date: '2026-04-11', start_time: '13:30', end_time: '15:00', format: 'Asinkron', lokasi_id: 'lok-mooc-portal', jp_ke: '5-6', jp_count: 2 },
      { id: 'pka2-m2-s5', batch_id: 'batch-pka-ii-2026', mapel_id: 'mapel-agenda4-stula', wi_ids: ['wi-mooc'], date: '2026-04-13', start_time: '08:00', end_time: '10:15', format: 'Asinkron', lokasi_id: 'lok-mooc-portal', jp_ke: '1-3', jp_count: 3 },
      { id: 'pka2-m3-s1', batch_id: 'batch-pka-ii-2026', mapel_id: 'mapel-async-kelompok-individu', wi_ids: ['wi-juli', 'wi-suluh', 'wi-sitti'], date: '2026-04-14', start_time: '08:00', end_time: '12:30', format: 'Asinkron', lokasi_id: 'lok-zoom-meeting', jp_ke: '1-4', jp_count: 4 },
      { id: 'pka2-m3-s2', batch_id: 'batch-pka-ii-2026', mapel_id: 'mapel-sync-agenda1', wi_ids: ['wi-dewa'], date: '2026-04-14', start_time: '13:30', end_time: '15:00', format: 'Virtual', lokasi_id: 'lok-zoom-meeting', jp_ke: '5-6', jp_count: 2 },
      { id: 'pka2-m3-s3', batch_id: 'batch-pka-ii-2026', mapel_id: 'mapel-sync-agenda1', wi_ids: ['wi-juli', 'wi-suluh', 'wi-sitti', 'wi-dewa'], date: '2026-04-15', start_time: '08:00', end_time: '09:30', format: 'Virtual', lokasi_id: 'lok-zoom-meeting', jp_ke: '1-2', jp_count: 2 },
      { id: 'pka2-m3-s4', batch_id: 'batch-pka-ii-2026', mapel_id: 'mapel-async-kelompok-individu', wi_ids: ['wi-juli', 'wi-suluh', 'wi-sitti', 'wi-dewa'], date: '2026-04-15', start_time: '09:30', end_time: '14:45', format: 'Asinkron', lokasi_id: 'lok-zoom-meeting', jp_ke: '3-8', jp_count: 6 },
      { id: 'pka2-m3-s5', batch_id: 'batch-pka-ii-2026', mapel_id: 'mapel-sync-agenda2', wi_ids: ['wi-wahid', 'wi-makhfudz', 'wi-suluh', 'wi-juli'], date: '2026-04-16', start_time: '08:00', end_time: '09:30', format: 'Virtual', lokasi_id: 'lok-zoom-meeting', jp_ke: '1-2', jp_count: 2 },
      { id: 'pka2-m3-s6', batch_id: 'batch-pka-ii-2026', mapel_id: 'mapel-async-kelompok-individu', wi_ids: ['wi-wahid', 'wi-makhfudz', 'wi-suluh', 'wi-juli'], date: '2026-04-16', start_time: '09:30', end_time: '14:45', format: 'Asinkron', lokasi_id: 'lok-zoom-meeting', jp_ke: '3-9', jp_count: 7 },
      { id: 'pka2-m3-s7', batch_id: 'batch-pka-ii-2026', mapel_id: 'mapel-async-kelompok-individu', wi_ids: ['wi-wahid', 'wi-makhfudz', 'wi-suluh'], date: '2026-04-17', start_time: '08:00', end_time: '11:00', format: 'Asinkron', lokasi_id: 'lok-zoom-meeting', jp_ke: '1-7', jp_count: 7 },
      { id: 'pka2-m3-s8', batch_id: 'batch-pka-ii-2026', mapel_id: 'mapel-sync-agenda2', wi_ids: ['wi-juli'], date: '2026-04-17', start_time: '13:30', end_time: '14:15', format: 'Virtual', lokasi_id: 'lok-zoom-meeting', jp_ke: '8-9', jp_count: 2 },
      { id: 'pka2-m3-s9', batch_id: 'batch-pka-ii-2026', mapel_id: 'mapel-sync-agenda2', wi_ids: ['wi-wahid', 'wi-makhfudz', 'wi-suluh', 'wi-juli'], date: '2026-04-18', start_time: '08:00', end_time: '10:15', format: 'Virtual', lokasi_id: 'lok-zoom-meeting', jp_ke: '1-2', jp_count: 2 },
      { id: 'pka2-m3-s10', batch_id: 'batch-pka-ii-2026', mapel_id: 'mapel-pembekalan-mentor-pka', wi_ids: ['wi-juli'], date: '2026-04-18', start_time: '13:30', end_time: '15:30', format: 'Virtual', lokasi_id: 'lok-zoom-meeting', jp_ke: '3-6', jp_count: 4 },
      { id: 'pka2-m3-s11', batch_id: 'batch-pka-ii-2026', mapel_id: 'mapel-sync-agenda3', wi_ids: ['wi-sitti', 'wi-juli', 'wi-dewa', 'wi-izma'], date: '2026-04-20', start_time: '08:00', end_time: '09:30', format: 'Virtual', lokasi_id: 'lok-zoom-meeting', jp_ke: '1-3', jp_count: 3 },
      { id: 'pka2-m3-s12', batch_id: 'batch-pka-ii-2026', mapel_id: 'mapel-async-kelompok-individu', wi_ids: ['wi-sitti', 'wi-juli', 'wi-dewa', 'wi-izma'], date: '2026-04-20', start_time: '13:30', end_time: '18:00', format: 'Asinkron', lokasi_id: 'lok-zoom-meeting', jp_ke: '4-7', jp_count: 4 },
    ];
    for (const s of sessions) {
      await prisma.jadwalSesi.create({ data: s });
    }

    // Seed AdminConfig
    await prisma.adminConfig.create({
      data: {
        id: 'admin-config',
        passwordHash: await bcrypt.hash('admin123'),
        primaryColor: '221 83% 53%',
      },
    });

    return Response.json({ success: true, message: 'Re-seeding completed with PKA Angkatan II 2026 dataset!' });
  } catch (error: any) {
    console.error('Seeding error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
