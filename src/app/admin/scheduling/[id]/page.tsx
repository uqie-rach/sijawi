import React from 'react';
import { notFound } from 'next/navigation';
import { sql } from '@/db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { SchedulingWorkspaceClient } from '@/components/admin/scheduling-workspace-client';

async function getBatchWorkspaceDetails(id: string) {
  try {
    const batches = await sql`SELECT * FROM batches WHERE id = ${id}`;
    if (batches.length === 0) return null;

    const batch = batches[0];
    const mapels = await sql`SELECT * FROM mata_pelatihan`;
    const wis = await sql`SELECT * FROM widyaswaras ORDER BY name ASC`;
    const lokasis = await sql`SELECT * FROM lokasi ORDER BY name ASC`;
    const sessions = await sql`SELECT * FROM sessions ORDER BY date ASC, start_time ASC`;

    return {
      batch: { id: batch.id, name: batch.name, kategoriId: batch.kategori_id, pola: batch.pola, startDate: batch.start_date, endDate: batch.end_date },
      mapels: mapels.map(m => ({ id: m.id, name: m.name, kategoriId: m.kategori_id, jpTotal: Number(m.jp_total) })),
      wis: wis.map(w => ({ id: w.id, name: w.name, gelar: w.gelar, email: w.email, nip: w.nip, jabatan: w.jabatan, level: Number(w.level), levelLabel: w.level_label })),
      lokasis: lokasis.map(l => ({ id: l.id, name: l.name })),
      sessions: sessions.map(s => ({
        id: s.id,
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
          <h2 className="text-xl font-bold text-slate-900">Workspace: {data.batch.name}</h2>
          <p className="text-sm text-slate-500">Formulate precise operational timelines, prevent clashes and lock rooms.</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2 flex items-center gap-2 text-blue-900 text-sm font-semibold shrink-0">
          <Calendar className="h-4 w-4 text-blue-600" />
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
      />
    </div>
  );
}