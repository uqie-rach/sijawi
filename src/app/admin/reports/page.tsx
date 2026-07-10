import React from 'react';
import { connectToDatabase } from '@/lib/mongodb';
import Widyaiswara from '@/models/Widyaiswara';
import JadwalSesi from '@/models/JadwalSesi';
import Pelatihan from '@/models/Pelatihan';
import { ReportsClient } from '@/components/admin/reports-client';

export const dynamic = 'force-dynamic';

async function getWidyaswaraReportsData(filters: {
  q?: string;
  pola?: string;
  start?: string;
  end?: string;
}) {
  try {
    await connectToDatabase();
    const wis = await Widyaiswara.find().sort({ name: 1 });
    const sessions = await JadwalSesi.find();
    const batches = await Pelatihan.find();

    const batchMap = new Map(batches.map(b => [b._id, b]));

    return wis.map((wi) => {
      const wiSessions = sessions.filter((s) => {
        // Safe check: s.wi_id (old) OR s.wi_ids array (new)
        const hasMatch = (s.wi_id === wi._id) || (s.wi_ids && s.wi_ids.includes(wi._id)) || (s.wi_id === undefined && s.wi_id === wi._id);
        
        // Let's check both for safety
        const isWiAssigned = (s.wi_id === wi._id) || (s.wi_ids && Array.isArray(s.wi_ids) && s.wi_ids.includes(wi._id)) || (s.wi_id === wi._id);
        
        if (!isWiAssigned) return false;
        if (filters.start && s.date < filters.start) return false;
        if (filters.end && s.date > filters.end) return false;
        
        const batch = batchMap.get(s.batch_id);
        const pola = batch ? batch.pola : 'APBD';
        if (filters.pola && filters.pola !== 'ALL' && pola !== filters.pola) return false;
        return true;
      });

      let apbd = 0;
      let kontribusi = 0;
      let kemitraan = 0;

      wiSessions.forEach((s) => {
        const batch = batchMap.get(s.batch_id);
        const pola = batch ? batch.pola : 'APBD';
        if (pola === 'APBD') apbd += Number(s.jp_count);
        else if (pola === 'Kontribusi') kontribusi += Number(s.jp_count);
        else if (pola === 'Kemitraan') kemitraan += Number(s.jp_count);
      });

      return {
        id: wi._id,
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