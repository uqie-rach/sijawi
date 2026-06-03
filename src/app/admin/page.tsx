import React from 'react';
import { sql } from '@/db';
import { OverviewCharts } from '@/components/admin/overview-charts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface WidyaswaraWithCalculation {
  id: string;
  name: string;
  gelar: string;
  email: string;
  nip: string;
  jabatan: string;
  level: number;
  levelLabel: string;
  jpLastMonth: number;
  jpCurrentMonth: number;
  breakdown: {
    apbd: number;
    kontribusi: number;
    kemitraan: number;
  };
}

async function getWidyaswaraOverviewData(): Promise<WidyaswaraWithCalculation[]> {
  try {
    const wis = await sql`SELECT * FROM widyaswaras ORDER BY name ASC`;
    const sessions = await sql`
      SELECT s.*, b.pola FROM sessions s 
      JOIN batches b ON s.batch_id = b.id
    `;

    return wis.map((wi) => {
      const wiSessions = sessions.filter((s) => s.wi_id === wi.id);
      const jpCurrentMonth = wiSessions.reduce((sum, s) => sum + Number(s.jp_count), 0);

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
        jpLastMonth: Number(wi.jp_last_month || 0),
        jpCurrentMonth,
        breakdown: { apbd, kontribusi, kemitraan },
      };
    });
  } catch (e) {
    console.error(e);
    return [];
  }
}

export default async function OverviewPage() {
  const wiData = await getWidyaswaraOverviewData();

  const barChartData = wiData.map((wi) => ({
    name: wi.name.split(' ')[0],
    'Total JP': wi.jpCurrentMonth,
  }));

  let totalApbd = 0;
  let totalKontribusi = 0;
  let totalKemitraan = 0;

  wiData.forEach((wi) => {
    totalApbd += wi.breakdown.apbd;
    totalKontribusi += wi.breakdown.kontribusi;
    totalKemitraan += wi.breakdown.kemitraan;
  });

  const pieChartData = [
    { name: 'APBD', value: totalApbd, color: '#3b82f6' },
    { name: 'Kontribusi', value: totalKontribusi, color: '#10b981' },
    { name: 'Kemitraan', value: totalKemitraan, color: '#f59e0b' },
  ].filter((item) => item.value > 0);

  return (
    <div className="space-y-8">
      <OverviewCharts barChartData={barChartData} pieChartData={pieChartData} />

      <Card className="shadow-sm border-slate-200 bg-white">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-lg font-bold text-slate-900">Widyaswara Load Balancing & JP Tracking</CardTitle>
              <CardDescription>Real-time monitoring of teaching hours with breakdown by funding pattern (Pola).</CardDescription>
            </div>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-semibold">
              1 JP = 45 Minutes
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/70">
                <TableHead className="font-semibold text-slate-700 pl-6">Nama Widyaswara</TableHead>
                <TableHead className="font-semibold text-slate-700">NIP & Jabatan</TableHead>
                <TableHead className="font-semibold text-slate-700">Competency Level</TableHead>
                <TableHead className="font-semibold text-slate-700 text-center">JP Bulan Lalu</TableHead>
                <TableHead className="font-semibold text-slate-700 text-center bg-blue-50/30">JP Bulan Berjalan</TableHead>
                <TableHead className="font-semibold text-slate-700 text-center">Total Hours</TableHead>
                <TableHead className="font-semibold text-slate-700 pr-6">Breakdown (APBD | Kontribusi | Kemitraan)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {wiData.map((wi) => {
                const totalHours = (wi.jpCurrentMonth * 45) / 60;
                return (
                  <TableRow key={wi.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="font-medium text-slate-900 pl-6">
                      <div>
                        <p className="font-semibold">{wi.name}, {wi.gelar}</p>
                        <p className="text-xs text-slate-500">{wi.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-xs font-mono text-slate-600">NIP: {wi.nip}</p>
                        <p className="text-xs font-semibold text-slate-500">{wi.jabatan}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200 font-semibold">
                        Level {wi.level} - {wi.levelLabel}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center font-medium text-slate-500">{wi.jpLastMonth} JP</TableCell>
                    <TableCell className="text-center font-bold text-blue-700 bg-blue-50/20">
                      <div className="flex flex-col items-center justify-center">
                        <span>{wi.jpCurrentMonth} JP</span>
                        <Progress value={Math.min((wi.jpCurrentMonth / 40) * 100, 100)} className="h-1.5 w-16 mt-1 bg-slate-100" />
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-medium text-slate-700">
                      {totalHours.toFixed(1)} hrs
                    </TableCell>
                    <TableCell className="pr-6">
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-slate-500">
                          <span>APBD: <strong className="text-slate-700">{wi.breakdown.apbd} JP</strong></span>
                          <span>Kontribusi: <strong className="text-slate-700">{wi.breakdown.kontribusi} JP</strong></span>
                          <span>Kemitraan: <strong className="text-slate-700">{wi.breakdown.kemitraan} JP</strong></span>
                        </div>
                        <div className="flex h-2 w-full rounded-full overflow-hidden bg-slate-100">
                          <div 
                            style={{ width: `${wi.jpCurrentMonth ? (wi.breakdown.apbd / wi.jpCurrentMonth) * 100 : 0}%` }} 
                            className="bg-blue-500"
                          />
                          <div 
                            style={{ width: `${wi.jpCurrentMonth ? (wi.breakdown.kontribusi / wi.jpCurrentMonth) * 100 : 0}%` }} 
                            className="bg-emerald-500"
                          />
                          <div 
                            style={{ width: `${wi.jpCurrentMonth ? (wi.breakdown.kemitraan / wi.jpCurrentMonth) * 100 : 0}%` }} 
                            className="bg-amber-500"
                          />
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}