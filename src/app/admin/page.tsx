import React from 'react';
import { connectToDatabase } from '@/lib/mongodb';
import Widyaiswara from '@/models/Widyaiswara';
import JadwalSesi from '@/models/JadwalSesi';
import Pelatihan from '@/models/Pelatihan';
import { OverviewCharts } from '@/components/admin/overview-charts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BRANDING } from '@/lib/config';

interface WidyaiswaraWithCalculation {
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

async function getWidyaiswaraOverviewData(): Promise<WidyaiswaraWithCalculation[]> {
  try {
    await connectToDatabase();
    const wis = await Widyaiswara.find().sort({ name: 1 });
    const sessions = await JadwalSesi.find();
    const batches = await Pelatihan.find();

    const batchMap = new Map(batches.map(b => [b._id, b]));

    return wis.map((wi) => {
      const wiSessions = sessions.filter((s) => {
        return (s.wi_id === wi._id) || (s.wi_ids && Array.isArray(s.wi_ids) && s.wi_ids.includes(wi._id));
      });
      const jpCurrentMonth = wiSessions.reduce((sum, s) => sum + Number(s.jp_count), 0);

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
  const wiData = await getWidyaiswaraOverviewData();

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
    { name: 'APBD', value: totalApbd, color: '#2563eb' },
    { name: 'Kontribusi', value: totalKontribusi, color: '#10b981' },
    { name: 'Kemitraan', value: totalKemitraan, color: '#0ea5e9' },
  ].filter((item) => item.value > 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <OverviewCharts barChartData={barChartData} pieChartData={pieChartData} />

      <Card className="shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-slate-200 bg-white rounded-lg">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-lg font-bold text-blue-900">Penyeimbangan Beban Mengajar & Pelacakan JP Widyaiswara</CardTitle>
              <CardDescription>Pemantauan waktu mengajar secara real-time dengan rincian berdasarkan pola pelaksanaan anggaran.</CardDescription>
            </div>
            <Badge variant="outline" className="bg-blue-50 text-blue-900 border-blue-200 font-semibold">
              1 JP = 45 Menit
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/70">
                <TableHead className="font-semibold text-slate-700 pl-6">Nama Widyaiswara</TableHead>
                <TableHead className="font-semibold text-slate-700">NIP & Jabatan</TableHead>
                <TableHead className="font-semibold text-slate-700">Tingkat Kompetensi</TableHead>
                <TableHead className="font-semibold text-slate-700 text-center">JP Bulan Lalu</TableHead>
                <TableHead className="font-semibold text-slate-700 text-center bg-blue-50/30">JP Bulan Berjalan</TableHead>
                <TableHead className="font-semibold text-slate-700 text-center">Total Jam</TableHead>
                <TableHead className="font-semibold text-slate-700 pr-6">Rincian (APBD | Kontribusi | Kemitraan)</TableHead>
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
                      <Badge className="bg-blue-100 text-blue-900 border-blue-200 font-semibold">
                        Level {wi.level} - {wi.levelLabel}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center font-medium text-slate-500">{wi.jpLastMonth} JP</TableCell>
                    <TableCell className="text-center font-bold text-blue-900 bg-blue-50/20">
                      <div className="flex flex-col items-center justify-center">
                        <span>{wi.jpCurrentMonth} JP</span>
                        <Progress value={Math.min((wi.jpCurrentMonth / 40) * 100, 100)} className="h-1.5 w-16 mt-1 bg-slate-100" />
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-medium text-slate-700">
                      {totalHours.toFixed(1)} jam
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
                            className="bg-blue-600"
                          />
                          <div 
                            style={{ width: `${wi.jpCurrentMonth ? (wi.breakdown.kontribusi / wi.jpCurrentMonth) * 100 : 0}%` }} 
                            className="bg-emerald-500"
                          />
                          <div 
                            style={{ width: `${wi.jpCurrentMonth ? (wi.breakdown.kemitraan / wi.jpCurrentMonth) * 100 : 0}%` }} 
                            className="bg-sky-500"
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