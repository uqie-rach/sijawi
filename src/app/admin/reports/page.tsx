import React from 'react';
import { sql } from '@/db';
import ReportsManager from '@/components/admin/reports-manager';

export const dynamic = 'force-dynamic';

export default async function ReportsPage({ searchParams }: { searchParams: any }) {
  const { page = '1', search = '', pola = 'ALL', start = '', end = '' } = await searchParams;
  
  const pageNum = parseInt(page);
  const offset = (pageNum - 1) * 10;

  // Build filtered query (Simulated for this modular output)
  const sessions = await sql`
    SELECT s.*, b.name as batch_name, b.pola, m.name as mapel_name, w.name as wi_name, w.email as wi_email
    FROM sessions s
    JOIN batches b ON s.batch_id = b.id
    JOIN mata_pelatihan m ON s.mapel_id = m.id
    JOIN widyaswaras w ON s.wi_id = w.id
    ORDER BY s.date DESC
    LIMIT 10 OFFSET ${offset}
  `;

  const widyaswaras = await sql`SELECT * FROM widyaswaras ORDER BY name ASC`;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-slate-900">Reports & Performance Analytics</h2>
        <p className="text-slate-500">Export detailed instructor performance and funding pattern re-caps.</p>
      </div>

      <ReportsManager 
        initialSessions={sessions}
        widyaswaras={widyaswaras}
        filters={{ search, pola, start, end }}
      />
    </div>
  );
}