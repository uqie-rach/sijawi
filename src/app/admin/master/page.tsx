import React from 'react';
import { connectToDatabase } from '@/lib/mongodb';
import Widyaiswara from '@/models/Widyaiswara';
import KategoriPelatihan from '@/models/KategoriPelatihan';
import MataPelatihan from '@/models/MataPelatihan';
import Lokasi from '@/models/Lokasi';
import Pelatihan from '@/models/Pelatihan';
import { MasterTabs } from '@/components/admin/master-tabs';
import { BRANDING } from '@/lib/config';

async function getMasterData() {
  try {
    await connectToDatabase();
    const wis = await Widyaiswara.find().sort({ name: 1 });
    const kats = await KategoriPelatihan.find().sort({ name: 1 });
    const mapels = await MataPelatihan.find().sort({ name: 1 });
    const lokasis = await Lokasi.find().sort({ name: 1 });
    const batches = await Pelatihan.find().sort({ start_date: -1 });

    return {
      wis: wis.map(w => ({ id: w._id, name: w.name, gelar: w.gelar, email: w.email, nip: w.nip, jabatan: w.jabatan, level: Number(w.level), levelLabel: w.level_label })),
      kats: kats.map(k => ({ id: k._id, name: k.name, minWeight: Number(k.min_weight) })),
      mapels: mapels.map(m => ({ id: m._id, name: m.name, kategoriId: m.kategori_id, jpTotal: Number(m.jp_total) })),
      lokasis: lokasis.map(l => ({ id: l._id, name: l.name })),
      batches: batches.map(b => ({ id: b._id, name: b.name, kategoriId: b.kategori_id, pola: b.pola, startDate: b.start_date, endDate: b.end_date })),
    };
  } catch (e) {
    console.error(e);
    return { wis: [], kats: [], mapels: [], lokasis: [], batches: [] };
  }
}

export default async function MasterPage() {
  const data = await getMasterData();

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-xl font-bold text-blue-900">Panel Kontrol Data Master</h2>
        <p className="text-sm text-slate-500">Kelola profil widyaiswara, kategori pelatihan, mata pelatihan kurikulum, dan batasan ketersediaan ruangan untuk {BRANDING.name}.</p>
      </div>

      <MasterTabs
        initialWis={data.wis}
        initialKats={data.kats}
        initialMapels={data.mapels}
        initialLokasis={data.lokasis}
        initialBatches={data.batches}
      />
    </div>
  );
}