import React from 'react';
import { sql } from '@/db';
import { AdminHeader } from '@/components/admin/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Download, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ReportActions } from '@/components/admin/report-actions';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ 
    q?: string; 
    pola?: string; 
    start?: string; 
    end?: string;
    page?: string;
  }>;
}

export default async function ReportsPage({ searchParams }: PageProps) {
  const filters = await searchParams;
  const q = filters.q || '';
  const pola = filters.pola || 'ALL';
  
  // SSR SQL Query with dynamic filtering
  const widyaswaras = await sql`SELECT * FROM widyaswaras WHERE name ILIKE ${'%' + q + '%'}`;
  const sessions = await sql`
    SELECT s.*, b.pola 
    FROM sessions s 
    JOIN batches b ON s.batch_id = b.id
    WHERE 1=1
    ${pola !== 'ALL' ? sql`AND b.pola = ${pola}` : sql``}
  `;

  const reportData = widyaswaras.map(wi => {
    const wiSessions = sessions.filter(s => s.wi_id === wi.id);
    const apbd = wiSessions.filter(s => s.pola === 'APBD').reduce((sum, s) => sum + s.jp_count, 0);
    const kontribusi = wiSessions.filter(s => s.pola === 'Kontribusi').reduce((sum, s) => sum + s.jp_count, 0);
    const kemitraan = wiSessions.filter(s => s.pola === 'Kemitraan').reduce((sum, s) => sum + s.jp_count, 0);
    return { ...wi, apbd, kontribusi, kemitraan, total: apbd + kontribusi + kemitraan };
  });

  return (
    <div className="flex flex-col">
      <AdminHeader 
        title="Reports & Analytics" 
        description="Analyze training hours, formats, and top performing instructors." 
      />
      
      <div className="p-8 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold">Filters</CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input placeholder="Search instructor..." defaultValue={q} className="pl-9" />
            </div>
            {/* Additional filters would go here, updating URL Search Params */}
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardHeader className="border-b bg-slate-50/50 flex flex-row justify-between items-center">
            <div>
              <CardTitle className="text-lg font-bold">Monthly Recap Table</CardTitle>
              <CardDescription>Teaching hours per Widyaswara breakdown.</CardDescription>
            </div>
            <ReportActions data={reportData} />
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">NIP</TableHead>
                  <TableHead>Nama Widyaswara</TableHead>
                  <TableHead className="text-center">APBD</TableHead>
                  <TableHead className="text-center">Kontribusi</TableHead>
                  <TableHead className="text-center">Kemitraan</TableHead>
                  <TableHead className="text-center">Grand Total</TableHead>
                  <TableHead className="pr-6 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData.map(wi => (
                  <TableRow key={wi.id}>
                    <TableCell className="pl-6 font-mono text-xs">{wi.nip}</TableCell>
                    <TableCell className="font-semibold">{wi.name}, {wi.gelar}</TableCell>
                    <TableCell className="text-center text-blue-600">{wi.apbd} JP</TableCell>
                    <TableCell className="text-center text-emerald-600">{wi.kontribusi} JP</TableCell>
                    <TableCell className="text-center text-amber-600">{wi.kemitraan} JP</TableCell>
                    <TableCell className="text-center font-bold">{wi.total} JP</TableCell>
                    <TableCell className="pr-6 text-right">
                      <Button size="sm" variant="outline"><Download className="h-3 w-3 mr-2" /> Export</Button>
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