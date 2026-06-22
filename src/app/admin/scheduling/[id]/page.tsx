import React from 'react';
import { notFound } from 'next/navigation';
import { connectToDatabase } from '@/lib/mongodb';
import Pelatihan from '@/models/Pelatihan';
import MataPelatihan from '@/models/MataPelatihan';
import Widyaiswara from '@/models/Widyaiswara';
import Lokasi from '@/models/Lokasi';
import JadwalSesi from '@/models/JadwalSesi';
import { Calendar } from 'lucide-react';
import { SchedulingWorkspaceClient } from '@/components/admin/scheduling-workspace-client';
import { BRANDING } from '@/lib/config';

async function getBatchWorkspaceDetails(id: string) {
  try {
    await connectToDatabase();
    const batch = await Pelatihan.findById(id);
    if (!batch) return null;

    const mapels = await MataPelatihan.find();
    const wis = await Widyaiswara.find().sort({ name: 1 });
    const lokasis = await Lokasi.find().sort({ name: 1 });
    const sessions = await JadwalSesi.find().sort({ date: 1, start_time: 1 });
    const allBatches = await Pelatihan.find().sort({ start_date: -1 });

    return {
      batch: { id: batch._id, name: batch.name, kategoriId: batch.kategori_id, pola: batch.pola, startDate: batch.start_date, endDate: batch.end_date },
      mapels: mapels.map(m => ({ id: m._id, name: m.name, kategoriId: m.kategori_id, jpTotal: Number(m.jp_total) })),
      wis: wis.map(w => ({ id: w._id, name: w.name, gelar: w.gelar, email: w.email, nip: w.nip, jabatan: w.jabatan, level: Number(w.level), levelLabel: w.level_label })),
      lokasis: lokasis.map(l => ({ id: l._id, name: l.name })),
      sessions: sessions.map(s => ({
        id: s._id,
        batchId: s.batch_id,
        mapelId: s.mapel_id,
        wiId: s.wi_id,
        date: s.date,
        startTime: s.start_time,
        endTime: s.end_time,
        format: s.format,
        lokasiId: s.lokasi_id || undefined,
        jpKe: s.jp_ke,
        jpCount: Number(s.jp_count)
      })),
      allBatches: allBatches.map(b => ({ id: b._id, name: b.name, startDate: b.start_date, endDate: b.end_date }))
    };
  } catch (e) {
    console.error(e);
    return null;
  }
}

export default async function BatchWorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getBatchWorkspaceDetails(id);

  if (!data) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-blue-900">Workspace: {data.batch.name}</h2>
          <p className="text-sm text-slate-500">Formulate precise operational timelines, prevent clashes and lock rooms in {BRANDING.name}.</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2 flex items-center gap-2 text-blue-900 text-sm font-semibold shrink-0">
          <Calendar className="h-4 w-4 text-blue-900" />
          Periode: {data.batch.startDate} s/d {data.batch.endDate}
        </div>
      </div>

      <SchedulingWorkspaceClient
        batchId={id}
        initialBatch={data.batch}
        initialMapels={data.mapels}
        initialWis={data.wis}
        initialLokasis={data.lokasis}
        initialSessions={data.sessions}
        allBatches={data.allBatches}
      />
    </div>
  );
}