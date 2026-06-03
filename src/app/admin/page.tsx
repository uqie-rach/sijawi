import React from 'react';
import { sql } from '@/db';
import { AdminHeader } from '@/components/admin/header';
import { OverviewCharts } from '@/components/admin/overview-charts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  // SSR Data Fetching
  const widyaswaras = await sql`SELECT * FROM widyaswaras ORDER BY name ASC`;
  const sessions = await sql`
    SELECT s.*, b.pola 
    FROM sessions s 
    JOIN batches b ON s.batch_id = b.id
  `;

  // Processing Data for Load Balancing Table & Charts
  const processedWiData = widyaswaras.map(wi => {
    const wiSessions = sessions.filter(s => s.wi_id === wi.id);
    const jpCurrentMonth = wiSessions.reduce((sum, s) => sum + s.jp_count, 0);
    
    const apbd = wiSessions.filter(s => s.pola === 'APBD').reduce((sum, s) => sum + s.jp_count, 0);
    const kontribusi = wiSessions.filter(s => s.pola === 'Kontribusi').reduce((sum, s) => sum + s.jp_count, 0);
    const kemitraan = wiSessions.filter(s => s.pola === 'Kemitraan').reduce((sum, s) => sum + s.jp_count, 0);

    return {
      ...wi,
      jpCurrentMonth,
      breakdown: { apbd, kontribusi, kemitraan }
    };
  });

  const barChartData = processedWiData.map(wi => ({
    shortName: wi.name.split(' ')[0],
    'Total JP': wi.jpCurrentMonth
  }));

  const pieData = [
    { name: 'APBD', value: sessions.filter(s => s.pola === 'APBD').reduce((sum, s) => sum + s.jp_count, 0), color: '#3b82f6' },
    { name: 'Kontribusi', value: sessions.filter(s => s.pola === 'Kontribusi').reduce((sum, s) => sum + s.jp_count, 0), color: '#10b981' },
    { name: 'Kemitraan', value: sessions.filter(s => s.pola === 'Kemitraan').reduce((sum, s) => sum + s.jp_count, 0), color: '#f59e0b' }
  ].filter(item => item.value > 0);

  return (
    <div className="flex flex-col">
      <AdminHeader 
        title="Dashboard Overview & Load Balancing" 
        description="Monitor Widyaswara teaching hours and load balancing in real-time." 
      />
      
      <div className="p-8 space-y-8">
        <OverviewCharts barData={barChartData} pieData={pieData} />

        <Card className="shadow-sm border-slate-200">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-lg font-bold text-slate-900">Widyaswara Load Balancing & JP Tracking</CardTitle>
                <CardDescription>Real-time monitoring of teaching hours with breakdown by funding pattern.</CardDescription>
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
                  <TableHead className="pl-6">Nama Widyaswara</TableHead>
                  <TableHead>NIP & Jabatan</TableHead>
                  <TableHead>Competency Level</TableHead>
                  <TableHead className="text-center">JP Bulan Lalu</TableHead>
                  <TableHead className="text-center bg-blue-50/30">JP Bulan Berjalan</TableHead>
                  <TableHead className="text-center">Total Hours</TableHead>
                  <TableHead className="pr-6">JP Breakdown</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {processedWiData.map((wi) => (
                  <TableRow key={wi.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="font-medium text-slate-900 pl-6">
                      <div>
                        <p className="font-semibold">{wi.name}, {wi.gelar}</p>
                        <p className="text-xs text-slate-500">{wi.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-xs font-mono text-slate-600">NIP: {wi.nip}</p>
                      <p className="text-xs font-semibold text-slate-500">{wi.jabatan}</p>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200 font-semibold">
                        Level {wi.level} - {wi.level_label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center font-medium text-slate-500">{wi.jp_last_month} JP</TableCell>
                    <TableCell className="text-center font-bold text-blue-700 bg-blue-50/20">
                      <div className="flex flex-col items-center">
                        <span>{wi.jpCurrentMonth} JP</span>
                        <Progress value={Math.min((wi.jpCurrentMonth / 40) * 100, 100)} className="h-1.5 w-16 mt-1 bg-slate-100" />
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-medium text-slate-700">
                      {((wi.jpCurrentMonth * 45) / 60).toFixed(1)} hrs
                    </TableCell>
                    <TableCell className="pr-6">
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-slate-500">
                          <span>A: <strong className="text-slate-700">{wi.breakdown.apbd}</strong></span>
                          <span>K: <strong className="text-slate-700">{wi.breakdown.kontribusi}</strong></span>
                          <span>M: <strong className="text-slate-700">{wi.breakdown.kemitraan}</strong></span>
                        </div>
                        <div className="flex h-2 w-full rounded-full overflow-hidden bg-slate-100">
                          <div style={{ width: `${wi.jpCurrentMonth ? (wi.breakdown.apbd / wi.jpCurrentMonth) * 100 : 0}%` }} className="bg-blue-500" />
                          <div style={{ width: `${wi.jpCurrentMonth ? (wi.breakdown.kontribusi / wi.jpCurrentMonth) * 100 : 0}%` }} className="bg-emerald-500" />
                          <div style={{ width: `${wi.jpCurrentMonth ? (wi.breakdown.kemitraan / wi.jpCurrentMonth) * 100 : 0}%` }} className="bg-amber-500" />
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}