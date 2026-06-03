import React from 'react';
import { sql } from '@/db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Clock } from 'lucide-react';
import DashboardCharts from '@/components/admin/dashboard-charts';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const widyaswaras = await sql`SELECT * FROM widyaswaras ORDER BY name ASC`;
  const batches = await sql`SELECT * FROM batches`;
  const sessions = await sql`
    SELECT s.*, b.pola 
    FROM sessions s 
    JOIN batches b ON s.batch_id = b.id
  `;

  // Calculate dynamic JP loads
  const wiStats = widyaswaras.map(wi => {
    const wiSessions = sessions.filter(s => s.wi_id === wi.id);
    const jpCurrentMonth = wiSessions.reduce((sum, s) => sum + s.jp_count, 0);
    
    let apbd = 0, kontribusi = 0, kemitraan = 0;
    wiSessions.forEach(s => {
      if (s.pola === 'APBD') apbd += s.jp_count;
      else if (s.pola === 'Kontribusi') kontribusi += s.jp_count;
      else if (s.pola === 'Kemitraan') kemitraan += s.jp_count;
    });

    return {
      ...wi,
      jpCurrentMonth,
      breakdown: { apbd, kontribusi, kemitraan }
    };
  });

  const totalJp = sessions.reduce((sum, s) => sum + s.jp_count, 0);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Dashboard Overview</h2>
          <p className="text-slate-500">Monitor instructor loads and funding distribution.</p>
        </div>
        <div className="flex items-center gap-4 bg-blue-50 border border-blue-100 px-6 py-3 rounded-xl shadow-sm">
          <div className="bg-blue-600 p-2 rounded-lg text-white">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">Total Scheduled JP</p>
            <p className="text-2xl font-black text-blue-900">{totalJp} JP</p>
          </div>
        </div>
      </div>

      <DashboardCharts wiData={wiStats} />

      <Card className="shadow-sm border-slate-200">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100">
          <CardTitle>Widyaswara Load Balancing</CardTitle>
          <CardDescription>Real-time JP tracking across funding patterns.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/70">
                <TableHead className="pl-6 font-bold text-slate-700">Nama Widyaswara</TableHead>
                <TableHead className="font-bold text-slate-700">NIP & Jabatan</TableHead>
                <TableHead className="text-center font-bold text-slate-700">JP Lalu</TableHead>
                <TableHead className="text-center font-bold text-blue-700 bg-blue-50/30">JP Berjalan</TableHead>
                <TableHead className="pr-6 font-bold text-slate-700">Breakdown (APBD | Kontribusi | Kemitraan)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {wiStats.map((wi) => (
                <TableRow key={wi.id} className="hover:bg-slate-50/50">
                  <TableCell className="pl-6 font-semibold">{wi.name}, {wi.gelar}</TableCell>
                  <TableCell>
                    <p className="text-xs font-mono text-slate-500">{wi.nip}</p>
                    <p className="text-xs font-bold text-slate-700">{wi.jabatan}</p>
                  </TableCell>
                  <TableCell className="text-center font-medium text-slate-500">{wi.jp_last_month} JP</TableCell>
                  <TableCell className="text-center font-black text-blue-700 bg-blue-50/10">{wi.jpCurrentMonth} JP</TableCell>
                  <TableCell className="pr-6">
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-[10px] border-blue-200 text-blue-700">{wi.breakdown.apbd} APBD</Badge>
                      <Badge variant="outline" className="text-[10px] border-emerald-200 text-emerald-700">{wi.breakdown.kontribusi} KON</Badge>
                      <Badge variant="outline" className="text-[10px] border-amber-200 text-amber-700">{wi.breakdown.kemitraan} KEM</Badge>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}