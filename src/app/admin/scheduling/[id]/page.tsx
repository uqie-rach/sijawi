import React from 'react';
import { sql } from '@/db';
import { AdminHeader } from '@/components/admin/header';
import { SchedulingWorkspace } from '@/components/admin/scheduling-workspace';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SchedulingPage({ params }: PageProps) {
  const { id } = await params;

  // SSR Batch Context Fetching
  const batchResult = await sql`
    SELECT b.*, k.name as category_name, k.min_weight 
    FROM batches b 
    JOIN kategori_pelatihan k ON b.kategori_id = k.id 
    WHERE b.id = ${id}
  `;
  const batch = batchResult[0];

  if (!batch) notFound();

  const [mapels, widyaswaras, lokasiList, sessions] = await Promise.all([
    sql`SELECT * FROM mata_pelatihan WHERE kategori_id = ${batch.kategori_id}`,
    sql`SELECT * FROM widyaswaras WHERE level >= ${batch.min_weight}`,
    sql`SELECT * FROM lokasi ORDER BY name ASC`,
    sql`
      SELECT s.*, m.name as mapel_name, w.name as wi_name, l.name as lokasi_name 
      FROM sessions s 
      JOIN mata_pelatihan m ON s.mapel_id = m.id 
      JOIN widyaswaras w ON s.wi_id = w.id 
      LEFT JOIN lokasi l ON s.lokasi_id = l.id 
      WHERE s.batch_id = ${id}
      ORDER BY s.date ASC, s.start_time ASC
    `
  ]);

  return (
    <div className="flex flex-col">
      <AdminHeader 
        title={`Scheduling: ${batch.name}`} 
        description={`Manage training timeline and WI assignments for ${batch.name}.`} 
      />
      
      <div className="p-8">
        <SchedulingWorkspace 
          batch={batch}
          mapels={mapels}
          widyaswaras={widyaswaras}
          lokasiList={lokasiList}
          sessions={sessions}
        />
      </div>
    </div>
  );
}