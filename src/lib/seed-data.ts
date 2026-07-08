// ---------------------------------------------------------------------------
// Balanced seed dataset — all 3 pola (APBD, Kontribusi, Kemitraan)
// across 5 kategori pelatihan with sensible scheduling.
// ---------------------------------------------------------------------------

export const kategoriPelatihan = [
  { _id: 'kat-pkn', singkatan: 'PKN', kepanjangan: 'Pelatihan Kepemimpinan Nasional', min_weight: 5 },
  { _id: 'kat-pka', singkatan: 'PKA', kepanjangan: 'Pelatihan Kepemimpinan Administrator', min_weight: 4 },
  { _id: 'kat-pkp', singkatan: 'PKP', kepanjangan: 'Pelatihan Kepemimpinan Pengawas', min_weight: 3 },
  { _id: 'kat-latsar', singkatan: 'Latsar', kepanjangan: 'Pelatihan Dasar CPNS', min_weight: 2 },
  { _id: 'kat-pppk', singkatan: 'PPPK', kepanjangan: 'Pelatihan PPPK', min_weight: 1 },
];

export const widyaswaras = [
  { _id: 'wi-qurrota', name: 'Qurrota A\'yun', gelar: 'S.E., M.Si', email: 'wtms+wi.qurrota@gmail.com', nip: '198205122009032001', jabatan: 'WI Ahli Madya', level: 3, level_label: 'PKP', jp_last_month: 28 },
  { _id: 'wi-anung', name: 'Mohammad Anung Edy Nugroho', gelar: 'M.SM', email: 'wtms+wi.anung@gmail.com', nip: '198511042010121002', jabatan: 'WI Ahli Madya', level: 3, level_label: 'PKP', jp_last_month: 24 },
  { _id: 'wi-farid', name: 'Drs. Akhmad Farid Gaftan', gelar: 'M.Si', email: 'wtms+wi.farid@gmail.com', nip: '197604152003121001', jabatan: 'WI Ahli Madya', level: 4, level_label: 'PKA', jp_last_month: 30 },
  { _id: 'wi-mahariska', name: 'Mahariska Devi P.', gelar: 'S.T., M.PSDM', email: 'wtms+wi.mahariska@gmail.com', nip: '199008242015032002', jabatan: 'WI Ahli Muda', level: 3, level_label: 'PKP', jp_last_month: 16 },
  { _id: 'wi-randy', name: 'Randy Febriano Ruhyana', gelar: 'S.T., M.MT', email: 'wtms+wi.randy@gmail.com', nip: '199102142018011003', jabatan: 'WI Ahli Muda', level: 3, level_label: 'PKP', jp_last_month: 20 },
  { _id: 'wi-bpsdm-institutional', name: 'Kepala Badan/Sekretaris/Kabid', gelar: 'BPSDM Prov. Jatim', email: 'wtms+wi.bpsdm@gmail.com', nip: '197001011990031001', jabatan: 'WI Ahli Utama', level: 5, level_label: 'PKN', jp_last_month: 10 },
];

export const mataPelatihan = [
  // ---- PKN (min_weight: 5) ----
  { _id: 'mapel-pkn-1', name: 'Kepemimpinan Strategis Nasional', kategori_id: 'kat-pkn', jp_total: 6 },
  { _id: 'mapel-pkn-2', name: 'Manajemen Perubahan Organisasi', kategori_id: 'kat-pkn', jp_total: 4 },
  { _id: 'mapel-pkn-3', name: 'Kebijakan Publik & Governance', kategori_id: 'kat-pkn', jp_total: 6 },

  // ---- PKA (min_weight: 4) ----
  { _id: 'mapel-pka-1', name: 'Kepemimpinan Administratif', kategori_id: 'kat-pka', jp_total: 4 },
  { _id: 'mapel-pka-2', name: 'Manajemen Kinerja Organisasi', kategori_id: 'kat-pka', jp_total: 6 },
  { _id: 'mapel-pka-3', name: 'Penyusunan Kebijakan Teknis', kategori_id: 'kat-pka', jp_total: 4 },

  // ---- PKP (min_weight: 3) ----
  { _id: 'mapel-pkp-1', name: 'Kepemimpinan Pengawas', kategori_id: 'kat-pkp', jp_total: 4 },
  { _id: 'mapel-pkp-2', name: 'Pengendalian Pelaksanaan Kegiatan', kategori_id: 'kat-pkp', jp_total: 6 },
  { _id: 'mapel-pkp-3', name: 'Komunikasi & Koordinasi Organisasi', kategori_id: 'kat-pkp', jp_total: 4 },

  // ---- Latsar (min_weight: 2) ----
  { _id: 'mapel-latsar-1', name: 'Kebijakan Pengembangan SDA', kategori_id: 'kat-latsar', jp_total: 2 },
  { _id: 'mapel-latsar-2', name: 'Dinamika Kelompok', kategori_id: 'kat-latsar', jp_total: 3 },
  { _id: 'mapel-latsar-3', name: 'SYNC: Sikap Perilaku Bela Negara (Agenda 1)', kategori_id: 'kat-latsar', jp_total: 10 },
  { _id: 'mapel-latsar-4', name: 'Pembekalan Mentor', kategori_id: 'kat-latsar', jp_total: 2 },
  { _id: 'mapel-latsar-5', name: 'SYNC: Nilai-Nilai Dasar PNS (Agenda 2)', kategori_id: 'kat-latsar', jp_total: 10 },
  { _id: 'mapel-latsar-6', name: 'SYNC: Kedudukan & Peran PNS (Agenda 3)', kategori_id: 'kat-latsar', jp_total: 5 },

  // ---- PPPK (min_weight: 1) ----
  { _id: 'mapel-pppk-1', name: 'Orientasi Pengenalan PPPK', kategori_id: 'kat-pppk', jp_total: 2 },
  { _id: 'mapel-pppk-2', name: 'Etika Profesi ASN', kategori_id: 'kat-pppk', jp_total: 4 },
  { _id: 'mapel-pppk-3', name: 'Pelayanan Publik Berbasis Digital', kategori_id: 'kat-pppk', jp_total: 4 },
  { _id: 'mapel-pppk-4', name: 'Pengembangan Kompetensi Teknis', kategori_id: 'kat-pppk', jp_total: 6 },
];

export const lokasi = [
  { _id: 'lok-bpsdm-surabaya', name: 'BPSDM Surabaya (Virtual Classroom)' },
  { _id: 'lok-aula', name: 'Aula Utama Jatim' },
  { _id: 'lok-kelas-a', name: 'Ruang Kelas A' },
  { _id: 'lok-kelas-b', name: 'Ruang Kelas B' },
  { _id: 'lok-kelas-c', name: 'Ruang Kelas C' },
];

export const batches = [
  // ---- Pola: APBD ----
  {
    _id: 'batch-pkn-apbd',
    name: 'PKN Tingkat II Angkatan I Tahun 2026',
    kategori_id: 'kat-pkn',
    pola: 'APBD' as const,
    start_date: '2026-02-01',
    end_date: '2026-03-15',
  },
  {
    _id: 'batch-pka-apbd',
    name: 'PKA Angkatan III Tahun 2026',
    kategori_id: 'kat-pka',
    pola: 'APBD' as const,
    start_date: '2026-02-15',
    end_date: '2026-03-30',
  },
  // ---- Pola: Kontribusi ----
  {
    _id: 'batch-pkp-kontribusi',
    name: 'PKP Angkatan V Tahun 2026',
    kategori_id: 'kat-pkp',
    pola: 'Kontribusi' as const,
    start_date: '2026-03-01',
    end_date: '2026-04-10',
  },
  {
    _id: 'batch-latsar-kontribusi',
    name: 'Pelatihan Dasar CPNS Golongan II Angkatan II Tahun 2026',
    kategori_id: 'kat-latsar',
    pola: 'Kontribusi' as const,
    start_date: '2026-01-31',
    end_date: '2026-04-11',
  },
  // ---- Pola: Kemitraan ----
  {
    _id: 'batch-pppk-kemitraan',
    name: 'PPPK Gelombang I Kemitraan Provinsi 2026',
    kategori_id: 'kat-pppk',
    pola: 'Kemitraan' as const,
    start_date: '2026-03-15',
    end_date: '2026-04-30',
  },
];

// ---------------------------------------------------------------------------
// Scheduled sessions — balanced across batches, no time/room/WI conflicts.
// ---------------------------------------------------------------------------
export const sessions = [
  // ===================== PKN / APBD =====================
  {
    _id: 'sess-pkn-1', batch_id: 'batch-pkn-apbd', mapel_id: 'mapel-pkn-1',
    wi_ids: ['wi-bpsdm-institutional'], date: '2026-02-01',
    start_time: '08:00', end_time: '09:30', format: 'Klasikal' as const,
    lokasi_id: 'lok-aula', jp_ke: '1-2', jp_count: 2,
  },
  {
    _id: 'sess-pkn-2', batch_id: 'batch-pkn-apbd', mapel_id: 'mapel-pkn-1',
    wi_ids: ['wi-bpsdm-institutional'], date: '2026-02-03',
    start_time: '08:00', end_time: '09:30', format: 'Klasikal' as const,
    lokasi_id: 'lok-aula', jp_ke: '1-2', jp_count: 2,
  },
  {
    _id: 'sess-pkn-3', batch_id: 'batch-pkn-apbd', mapel_id: 'mapel-pkn-1',
    wi_ids: ['wi-bpsdm-institutional'], date: '2026-02-05',
    start_time: '08:00', end_time: '09:30', format: 'Virtual' as const,
    lokasi_id: null, jp_ke: '1-2', jp_count: 2,
  },
  {
    _id: 'sess-pkn-4', batch_id: 'batch-pkn-apbd', mapel_id: 'mapel-pkn-2',
    wi_ids: ['wi-bpsdm-institutional'], date: '2026-02-10',
    start_time: '08:00', end_time: '11:00', format: 'Klasikal' as const,
    lokasi_id: 'lok-aula', jp_ke: '1-4', jp_count: 4,
  },
  {
    _id: 'sess-pkn-5', batch_id: 'batch-pkn-apbd', mapel_id: 'mapel-pkn-3',
    wi_ids: ['wi-bpsdm-institutional'], date: '2026-02-17',
    start_time: '08:00', end_time: '11:00', format: 'Klasikal' as const,
    lokasi_id: 'lok-aula', jp_ke: '1-4', jp_count: 4,
  },
  {
    _id: 'sess-pkn-6', batch_id: 'batch-pkn-apbd', mapel_id: 'mapel-pkn-3',
    wi_ids: ['wi-bpsdm-institutional'], date: '2026-02-19',
    start_time: '08:00', end_time: '09:30', format: 'Virtual' as const,
    lokasi_id: null, jp_ke: '1-2', jp_count: 2,
  },

  // ===================== PKA / APBD =====================
  {
    _id: 'sess-pka-1', batch_id: 'batch-pka-apbd', mapel_id: 'mapel-pka-1',
    wi_ids: ['wi-farid'], date: '2026-02-15',
    start_time: '08:00', end_time: '11:00', format: 'Klasikal' as const,
    lokasi_id: 'lok-kelas-a', jp_ke: '1-4', jp_count: 4,
  },
  {
    _id: 'sess-pka-2', batch_id: 'batch-pka-apbd', mapel_id: 'mapel-pka-2',
    wi_ids: ['wi-farid', 'wi-bpsdm-institutional'], date: '2026-02-18',
    start_time: '08:00', end_time: '09:30', format: 'Klasikal' as const,
    lokasi_id: 'lok-kelas-a', jp_ke: '1-2', jp_count: 2,
  },
  {
    _id: 'sess-pka-3', batch_id: 'batch-pka-apbd', mapel_id: 'mapel-pka-2',
    wi_ids: ['wi-farid'], date: '2026-02-20',
    start_time: '08:00', end_time: '11:00', format: 'Virtual' as const,
    lokasi_id: null, jp_ke: '1-4', jp_count: 4,
  },
  {
    _id: 'sess-pka-4', batch_id: 'batch-pka-apbd', mapel_id: 'mapel-pka-3',
    wi_ids: ['wi-farid'], date: '2026-02-25',
    start_time: '08:00', end_time: '11:00', format: 'Klasikal' as const,
    lokasi_id: 'lok-kelas-a', jp_ke: '1-4', jp_count: 4,
  },

  // ===================== PKP / Kontribusi =====================
  {
    _id: 'sess-pkp-1', batch_id: 'batch-pkp-kontribusi', mapel_id: 'mapel-pkp-1',
    wi_ids: ['wi-qurrota', 'wi-anung'], date: '2026-03-01',
    start_time: '08:00', end_time: '11:00', format: 'Klasikal' as const,
    lokasi_id: 'lok-kelas-b', jp_ke: '1-4', jp_count: 4,
  },
  {
    _id: 'sess-pkp-2', batch_id: 'batch-pkp-kontribusi', mapel_id: 'mapel-pkp-2',
    wi_ids: ['wi-qurrota', 'wi-randy'], date: '2026-03-03',
    start_time: '08:00', end_time: '09:30', format: 'Klasikal' as const,
    lokasi_id: 'lok-kelas-b', jp_ke: '1-2', jp_count: 2,
  },
  {
    _id: 'sess-pkp-3', batch_id: 'batch-pkp-kontribusi', mapel_id: 'mapel-pkp-2',
    wi_ids: ['wi-mahariska', 'wi-anung'], date: '2026-03-05',
    start_time: '08:00', end_time: '11:00', format: 'Virtual' as const,
    lokasi_id: null, jp_ke: '1-4', jp_count: 4,
  },
  {
    _id: 'sess-pkp-4', batch_id: 'batch-pkp-kontribusi', mapel_id: 'mapel-pkp-3',
    wi_ids: ['wi-randy'], date: '2026-03-10',
    start_time: '08:00', end_time: '11:00', format: 'Klasikal' as const,
    lokasi_id: 'lok-kelas-b', jp_ke: '1-4', jp_count: 4,
  },

  // ===================== Latsar / Kontribusi =====================
  {
    _id: 'sess-latsar-1', batch_id: 'batch-latsar-kontribusi', mapel_id: 'mapel-latsar-1',
    wi_ids: ['wi-bpsdm-institutional'], date: '2026-01-31',
    start_time: '09:00', end_time: '10:30', format: 'Klasikal' as const,
    lokasi_id: 'lok-bpsdm-surabaya', jp_ke: '1-2', jp_count: 2,
  },
  {
    _id: 'sess-latsar-2', batch_id: 'batch-latsar-kontribusi', mapel_id: 'mapel-latsar-2',
    wi_ids: ['wi-qurrota'], date: '2026-01-31',
    start_time: '14:45', end_time: '17:00', format: 'Klasikal' as const,
    lokasi_id: 'lok-bpsdm-surabaya', jp_ke: '3-5', jp_count: 3,
  },
  {
    _id: 'sess-latsar-3', batch_id: 'batch-latsar-kontribusi', mapel_id: 'mapel-latsar-3',
    wi_ids: ['wi-qurrota', 'wi-anung', 'wi-farid', 'wi-mahariska'],
    date: '2026-02-02', start_time: '08:00', end_time: '09:30',
    format: 'Virtual' as const, lokasi_id: null, jp_ke: '1-2', jp_count: 2,
  },
  {
    _id: 'sess-latsar-4', batch_id: 'batch-latsar-kontribusi', mapel_id: 'mapel-latsar-4',
    wi_ids: ['wi-farid'], date: '2026-02-02',
    start_time: '09:30', end_time: '11:00', format: 'Klasikal' as const,
    lokasi_id: 'lok-bpsdm-surabaya', jp_ke: '3-4', jp_count: 2,
  },
  {
    _id: 'sess-latsar-5', batch_id: 'batch-latsar-kontribusi', mapel_id: 'mapel-latsar-3',
    wi_ids: ['wi-qurrota', 'wi-anung', 'wi-farid', 'wi-mahariska'],
    date: '2026-02-04', start_time: '13:00', end_time: '15:15',
    format: 'Virtual' as const, lokasi_id: null, jp_ke: '1-3', jp_count: 3,
  },
  {
    _id: 'sess-latsar-6', batch_id: 'batch-latsar-kontribusi', mapel_id: 'mapel-latsar-5',
    wi_ids: ['wi-qurrota', 'wi-anung', 'wi-farid', 'wi-mahariska'],
    date: '2026-02-05', start_time: '08:00', end_time: '09:30',
    format: 'Virtual' as const, lokasi_id: null, jp_ke: '1-2', jp_count: 2,
  },
  {
    _id: 'sess-latsar-7', batch_id: 'batch-latsar-kontribusi', mapel_id: 'mapel-latsar-5',
    wi_ids: ['wi-qurrota', 'wi-anung', 'wi-farid', 'wi-mahariska'],
    date: '2026-02-10', start_time: '13:00', end_time: '15:15',
    format: 'Virtual' as const, lokasi_id: null, jp_ke: '1-3', jp_count: 3,
  },
  {
    _id: 'sess-latsar-8', batch_id: 'batch-latsar-kontribusi', mapel_id: 'mapel-latsar-6',
    wi_ids: ['wi-randy'], date: '2026-02-13',
    start_time: '08:00', end_time: '11:45', format: 'Virtual' as const,
    lokasi_id: null, jp_ke: '1-5', jp_count: 5,
  },
  {
    _id: 'sess-latsar-9', batch_id: 'batch-latsar-kontribusi', mapel_id: 'mapel-latsar-3',
    wi_ids: ['wi-qurrota', 'wi-anung', 'wi-farid', 'wi-mahariska'],
    date: '2026-02-16', start_time: '08:00', end_time: '09:30',
    format: 'Klasikal' as const, lokasi_id: 'lok-bpsdm-surabaya', jp_ke: '1-2', jp_count: 2,
  },
  {
    _id: 'sess-latsar-10', batch_id: 'batch-latsar-kontribusi', mapel_id: 'mapel-latsar-3',
    wi_ids: ['wi-qurrota', 'wi-anung', 'wi-farid', 'wi-mahariska'],
    date: '2026-02-18', start_time: '08:00', end_time: '10:15',
    format: 'Klasikal' as const, lokasi_id: 'lok-bpsdm-surabaya', jp_ke: '1-3', jp_count: 3,
  },
  {
    _id: 'sess-latsar-11', batch_id: 'batch-latsar-kontribusi', mapel_id: 'mapel-latsar-5',
    wi_ids: ['wi-qurrota', 'wi-anung', 'wi-farid', 'wi-mahariska'],
    date: '2026-02-23', start_time: '08:00', end_time: '11:45',
    format: 'Virtual' as const, lokasi_id: null, jp_ke: '1-5', jp_count: 5,
  },

  // ===================== PPPK / Kemitraan =====================
  {
    _id: 'sess-pppk-1', batch_id: 'batch-pppk-kemitraan', mapel_id: 'mapel-pppk-1',
    wi_ids: ['wi-randy', 'wi-mahariska'], date: '2026-03-15',
    start_time: '08:00', end_time: '09:30', format: 'Klasikal' as const,
    lokasi_id: 'lok-kelas-c', jp_ke: '1-2', jp_count: 2,
  },
  {
    _id: 'sess-pppk-2', batch_id: 'batch-pppk-kemitraan', mapel_id: 'mapel-pppk-2',
    wi_ids: ['wi-mahariska'], date: '2026-03-17',
    start_time: '08:00', end_time: '11:00', format: 'Klasikal' as const,
    lokasi_id: 'lok-kelas-c', jp_ke: '1-4', jp_count: 4,
  },
  {
    _id: 'sess-pppk-3', batch_id: 'batch-pppk-kemitraan', mapel_id: 'mapel-pppk-3',
    wi_ids: ['wi-randy'], date: '2026-03-20',
    start_time: '08:00', end_time: '11:00', format: 'Virtual' as const,
    lokasi_id: null, jp_ke: '1-4', jp_count: 4,
  },
  {
    _id: 'sess-pppk-4', batch_id: 'batch-pppk-kemitraan', mapel_id: 'mapel-pppk-4',
    wi_ids: ['wi-qurrota', 'wi-anung'], date: '2026-03-24',
    start_time: '08:00', end_time: '11:00', format: 'Klasikal' as const,
    lokasi_id: 'lok-kelas-c', jp_ke: '1-4', jp_count: 4,
  },
  {
    _id: 'sess-pppk-5', batch_id: 'batch-pppk-kemitraan', mapel_id: 'mapel-pppk-4',
    wi_ids: ['wi-anung'], date: '2026-03-26',
    start_time: '08:00', end_time: '09:30', format: 'Asinkron' as const,
    lokasi_id: null, jp_ke: '1-2', jp_count: 2,
  },
];
