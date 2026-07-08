/**
 * Standalone database seeding script.
 *
 * Usage:   npm run seed
 *
 * Connects directly to MongoDB using the MONGODB_URI environment variable
 * and seeds balanced scheduling data across all 3 pola
 * (APBD, Kontribusi, Kemitraan).
 */

import mongoose from 'mongoose';
import {
  kategoriPelatihan,
  widyaswaras,
  mataPelatihan,
  lokasi,
  batches,
  sessions,
} from '../src/lib/seed-data';

// ---- Model schemas (lightweight, must match actual Mongoose models) --------
const KategoriSchema = new mongoose.Schema({
  _id: String,
  singkatan: String,
  kepanjangan: String,
  min_weight: Number,
}, { timestamps: true });

const WidyaiswaraSchema = new mongoose.Schema({
  _id: String,
  name: String,
  gelar: String,
  email: String,
  nip: String,
  jabatan: String,
  level: Number,
  level_label: String,
  jp_last_month: Number,
  password_plain: String,
}, { timestamps: true });

const MapelSchema = new mongoose.Schema({
  _id: String,
  name: String,
  kategori_id: String,
  jp_total: Number,
}, { timestamps: true });

const LokasiSchema = new mongoose.Schema({
  _id: String,
  name: String,
}, { timestamps: true });

const BatchSchema = new mongoose.Schema({
  _id: String,
  name: String,
  kategori_id: String,
  pola: String,
  start_date: String,
  end_date: String,
  lokasi_id: String,
}, { timestamps: true });

const JadwalSchema = new mongoose.Schema({
  _id: String,
  batch_id: String,
  mapel_id: String,
  wi_ids: [String],
  date: String,
  start_time: String,
  end_time: String,
  format: String,
  lokasi_id: String,
  jp_ke: String,
  jp_count: Number,
}, { timestamps: true });

async function seed() {
  // ---- Resolve connection string -------------------------------------------
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/wtms';

  if (!uri) {
    console.error('❌ No database connection string found. Set MONGODB_URI in .env.local.');
    process.exit(1);
  }

  console.log(`🔌 Connecting to database...`);
  await mongoose.connect(uri);
  console.log('✅ Connected.');

  // ---- Models --------------------------------------------------------------
  const Kategori = mongoose.models.KategoriPelatihan || mongoose.model('KategoriPelatihan', KategoriSchema);
  const WI = mongoose.models.Widyaiswara || mongoose.model('Widyaiswara', WidyaiswaraSchema);
  const Mapel = mongoose.models.MataPelatihan || mongoose.model('MataPelatihan', MapelSchema);
  const Lokasi = mongoose.models.Lokasi || mongoose.model('Lokasi', LokasiSchema);
  const Batch = mongoose.models.Pelatihan || mongoose.model('Pelatihan', BatchSchema);
  const Jadwal = mongoose.models.JadwalSesi || mongoose.model('JadwalSesi', JadwalSchema);

  // ---- Clear existing data -------------------------------------------------
  console.log('🧹 Clearing existing data...');
  await Promise.all([
    Kategori.deleteMany({}),
    WI.deleteMany({}),
    Mapel.deleteMany({}),
    Lokasi.deleteMany({}),
    Batch.deleteMany({}),
    Jadwal.deleteMany({}),
  ]);
  console.log('✅ Cleared.');

  // ---- Insert fresh data ---------------------------------------------------
  console.log('🌱 Seeding kategori...');
  await Kategori.insertMany(kategoriPelatihan);
  for (const k of kategoriPelatihan) {
    console.log(`   → ${k.singkatan}: ${k.kepanjangan} (min weight: ${k.min_weight})`);
  }

  console.log('🌱 Seeding widyaiswara...');
  await WI.insertMany(widyaswaras);
  console.log(`   → ${widyaswaras.length} widyaiswara`);

  console.log('🌱 Seeding mata pelatihan...');
  await Mapel.insertMany(mataPelatihan);
  console.log(`   → ${mataPelatihan.length} mata pelatihan`);

  console.log('🌱 Seeding lokasi...');
  await Lokasi.insertMany(lokasi);
  console.log(`   → ${lokasi.length} lokasi`);

  console.log('🌱 Seeding batches...');
  await Batch.insertMany(batches);

  const batchSummary = batches.map(b =>
    `     • ${b.name} [${b.pola}] (${b.start_date} → ${b.end_date})`
  ).join('\n');
  console.log(`   → ${batches.length} batches:\n${batchSummary}`);

  console.log('🌱 Seeding jadwal sesi...');
  await Jadwal.insertMany(sessions);

  // Count sessions per batch
  const sessionCounts: Record<string, number> = {};
  for (const s of sessions) {
    sessionCounts[s.batch_id] = (sessionCounts[s.batch_id] || 0) + 1;
  }
  for (const [batchId, count] of Object.entries(sessionCounts)) {
    const b = batches.find(x => x._id === batchId);
    console.log(`   → ${b?.name || batchId}: ${count} sesi`);
  }

  console.log(`\n✅ Seeding complete! ${batches.length} batches, ${sessions.length} sessions across all 3 pola.`);

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
