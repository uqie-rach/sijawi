import React from 'react';
import { sql } from '@/db';
import MasterDataManager from '@/components/admin/master-data-manager';

export const dynamic = 'force-dynamic';

export default async function MasterDataPage() {
  const widyaswaras = await sql`SELECT * FROM widyaswaras ORDER BY name ASC`;
  const kategori = await sql`SELECT * FROM kategori_pelatihan ORDER BY name ASC`;
  const mapel = await sql`SELECT * FROM mata_pelatihan ORDER BY name ASC`;
  const lokasi = await sql`SELECT * FROM lokasi ORDER BY name ASC`;
  const batches = await sql`SELECT * FROM batches ORDER BY start_date DESC`;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-900">Master Data Management</h2>
        <p className="text-slate-500">Configure central reference tables for training orchestration.</p>
      </div>

      <MasterDataManager 
        initialData={{
          widyaswaras,
          kategori,
          mapel,
          lokasi,
          batches
        }}
      />
    </div>
  );
}