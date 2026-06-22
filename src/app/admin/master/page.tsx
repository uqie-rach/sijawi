import React from 'react';
import { sql } from '@/db';
import { MasterTabs } from '@/components/admin/master-tabs';
import { BRANDING } from '@/lib/config';

async function getMasterData() {
  try {
    const wis = await sql`SELECT * FROM widyaswaras ORDER BY name ASC`;
    const kats = await sql`SELECT * FROM kategori_pelatihan ORDER BY name ASC`;
    const mapels = await sql`SELECT * FROM mata_pelatihan ORDER BY name ASC`;
    const lokasis = await sql`SELECT * FROM lokasi ORDER BY name ASC`;
    const batches = await sql`SELECT * FROM batches ORDER BY start_date DESC`;

    return {
      wis: wis.map(w => ({ id: w.id, name: w.name, gelar: w.gelar, email: w.email, nip: w.nip, jabatan: w.jabatan, level: Number(w.level), levelLabel: w.level_label })),
      kats: kats.map(k => ({ id: k.id, name: k.name, minWeight: Number(k.min_weight) })),
      mapels: mapels.map(m => ({ id: m.id, name: m.name, kategoriId: m.kategori_id, jpTotal: Number(m.jp_total) })),
      lokasis: lokasis.map(l => ({ id: l.id, name: l.name })),
      batches: batches.map(b => ({ id: b.id, name: b.name, kategoriId: b.kategori_id, pola: b.pola, startDate: b.start_date, endDate: b.end_date })),
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
        <h2 className="text-xl font-bold text-blue-900">Master Data Control Panel</h2>
        <p className="text-sm text-slate-500">Manage instructors, training categories, curricula subjects, and classroom availability constraints for {BRANDING.name}.</p>
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