import React from 'react';
import { sql } from '@/db';
import { ReportsClient } from '@/components/admin/reports-client';

async function getWidyaswaraReportsData(filters: {
  q?: string;
  pola?: string;
  start?: string;
  end?: string;
}) {
  try {
    const wis = await sql`SELECT * FROM widyaswaras ORDER BY name ASC`;
    const sessions = await sql`
      SELECT s.*, b.pola FROM sessions s
      JOIN batches b ON s.batch_id = b.id
    `;

    return wis.map((wi) => {
      const wiSessions = sessions.filter((s) => {
        if (s.wi_id !== wi.id) return false;
        if (filters.start && s.date < filters.start) return false;
        if (filters.end && s.date > filters.end) return false;
        if (filters.pola && filters.pola !== 'ALL' && s.pola !== filters.pola) return false;
        return true;
      });

      let apbd = 0;
      let kontribusi = 0;
      let kemitraan = 0;

      wiSessions.forEach((s) => {
        if (s.pola === 'APBD') apbd += Number(s.jp_count);
        else if (s.pola === 'Kontribusi') kontribusi += Number(s.jp_count);
        else if (s.pola === 'Kemitraan') kemitraan += Number(s.jp_count);
      });

      return {
        id: wi.id,
        name: wi.name,
        gelar: wi.gelar || '',
        email: wi.email,
        nip: wi.nip,
        jabatan: wi.jabatan,
        level: Number(wi.level),
        levelLabel: wi.level_label,
        apbd,
        kontribusi,
        kemitraan,
        grandTotal: apbd + kontribusi + kemitraan,
      };
    });
  } catch (e) {
    console.error(e);
    return [];
  }
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; pola?: string; start?: string; end?: string }>;
}) {
  const params = await searchParams;
  const wis = await getWidyaswaraReportsData({
    q: params.q,
    pola: params.pola,
    start: params.start,
    end: params.end,
  });

  return <ReportsClient initialWis={wis} />;
}