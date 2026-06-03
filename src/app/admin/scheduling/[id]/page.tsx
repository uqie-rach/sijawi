import React from 'react';
import { sql } from '@/db';
import { notFound } from 'next/navigation';
import BatchScheduler from '@/components/admin/batch-scheduler';

export const dynamic = 'force-dynamic';

export default async function SchedulingWorkspacePage({ params }: { params: { id: string } }) {
  const { id } = await params;
  
  const [batch] = await sql`
    SELECT b.*, k.name as category_name
    FROM batches b
    JOIN kategori_pelatihan k ON b.kategori_id = k.id
    WHERE b.id = ${id}
  `;

  if (!batch) notFound();

  const mapels = await sql`SELECT * FROM mata_pelatihan WHERE kategori_id = ${batch.kategori_id}`;
  const sessions = await sql`
    SELECT s.*, m.name as mapel_name, w.name as wi_name, w.gelar as wi_gelar, l.name as lokasi_name
    FROM sessions s
    JOIN mata_pelatihan m ON s.mapel_id = m.id
    JOIN widyaswaras w ON s.wi_id = w.id
    LEFT JOIN lokasi l ON s.lokasi_id = l.id
    WHERE s.batch_id = ${id}
    ORDER BY s.date ASC, s.start_time ASC
  `;
  const widyaswaras = await sql`SELECT * FROM widyaswaras ORDER BY name ASC`;
  const lokasi = await sql`SELECT * FROM lokasi ORDER BY name ASC`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">{batch.name}</h2>
          <p className="text-slate-500 font-medium">{batch.category_name} • {batch.pola} Funding</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 text-center">
            <p className="text-[10px] text-slate-400 font-bold uppercase">Period Start</p>
            <p className="text-sm font-bold text-slate-800">{batch.start_date}</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 text-center">
            <p className="text-[10px] text-slate-400 font-bold uppercase">Period End</p>
            <p className="text-sm font-bold text-slate-800">{batch.end_date}</p>
          </div>
        </div>
      </div>

      <BatchScheduler 
        batch={batch}
        mapels={mapels}
        sessions={sessions}
        widyaswaras={widyaswaras}
        lokasi={lokasi}
      />
    </div>
  );
}