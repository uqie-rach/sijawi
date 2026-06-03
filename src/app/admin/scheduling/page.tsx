import React from 'react';
import Link from 'next/link';
import { sql } from '@/db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Calendar, Layers, MapPin, ArrowUpRight } from 'lucide-react';

interface BatchListItem {
  id: string;
  name: string;
  categoryName: string;
  pola: string;
  startDate: string;
  endDate: string;
  totalJpRequired: number;
  totalJpScheduled: number;
  distinctLocations: string[];
}

async function getBatchesWithSchedulingProgress(): Promise<BatchListItem[]> {
  try {
    const batches = await sql`
      SELECT b.*, k.name as "categoryName" 
      FROM batches b
      JOIN kategori_pelatihan k ON b.kategori_id = k.id
      ORDER BY b.start_date DESC
    `;

    const sessions = await sql`
      SELECT s.*, l.name as "locationName"
      FROM sessions s
      LEFT JOIN lokasi l ON s.lokasi_id = l.id
    `;

    const mapels = await sql`SELECT * FROM mata_pelatihan`;

    return batches.map((b) => {
      // Find all relevant mapels for this batch category to find required sum of JP
      const relevantMapels = mapels.filter((m) => m.kategori_id === b.kategori_id);
      const totalJpRequired = relevantMapels.reduce((sum, m) => sum + Number(m.jp_total), 0);

      const batchSessions = sessions.filter((s) => s.batch_id === b.id);
      const totalJpScheduled = batchSessions.reduce((sum, s) => sum + Number(s.jp_count), 0);

      const locations = Array.from(
        new Set(
          batchSessions
            .map((s) => s.locationName || (s.format !== 'Klasikal' ? s.format : ''))
            .filter(Boolean)
        )
      );

      return {
        id: b.id,
        name: b.name,
        categoryName: b.categoryName,
        pola: b.pola,
        startDate: b.start_date,
        endDate: b.end_date,
        totalJpRequired: totalJpRequired || 20, // Fallback threshold
        totalJpScheduled,
        distinctLocations: locations,
      };
    });
  } catch (e) {
    console.error(e);
    return [];
  }
}

export default async function SchedulingIndexPage() {
  const batchesData = await getBatchesWithSchedulingProgress();

  return (
    <div className="space-y-8">
      <Card className="shadow-sm border-slate-200 bg-white">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100">
          <CardTitle className="text-lg font-bold">Select Batch to Schedule</CardTitle>
          <CardDescription>View current scheduling progress and enter specific batch timeline workspaces.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/40">
                <TableHead className="pl-6 font-semibold">Nama Batch Pelatihan</TableHead>
                <TableHead className="font-semibold">Kategori & Pola</TableHead>
                <TableHead className="font-semibold">Periode Pelaksanaan</TableHead>
                <TableHead className="font-semibold">Lokasi Terkunci</TableHead>
                <TableHead className="font-semibold">Progress Alokasi JP</TableHead>
                <TableHead className="pr-6 text-right font-semibold">Workspace</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {batchesData.map((b) => {
                const percentage = Math.min((b.totalJpScheduled / b.totalJpRequired) * 100, 100);
                return (
                  <TableRow key={b.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="font-bold text-slate-900 pl-6">
                      <div className="flex items-center gap-2">
                        <Layers className="h-4 w-4 text-slate-400" />
                        {b.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="text-xs text-slate-600 font-medium">{b.categoryName}</p>
                        <Badge className={`font-semibold text-[10px] ${
                          b.pola === 'APBD' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          b.pola === 'Kontribusi' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {b.pola}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-slate-600 flex items-center gap-1.5 font-medium">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        {b.startDate} s/d {b.endDate}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {b.distinctLocations.length > 0 ? (
                          b.distinctLocations.map((loc, idx) => (
                            <Badge key={idx} variant="outline" className="bg-slate-50 text-slate-600 text-[10px] border-slate-200">
                              <MapPin className="h-2.5 w-2.5 mr-0.5 text-slate-400" />
                              {loc}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400 italic">None Locked</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="w-[200px]">
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-blue-700">{b.totalJpScheduled} / {b.totalJpRequired} JP</span>
                          <span className="text-slate-500">{Math.round(percentage)}%</span>
                        </div>
                        <Progress value={percentage} className="h-1.5 bg-slate-100" />
                      </div>
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      <Link href={`/admin/scheduling/${b.id}`} passHref>
                        <Button size="sm" variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800 gap-1.5">
                          Manage Schedule
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
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