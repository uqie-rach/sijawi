import React from 'react';
import { sql } from '@/db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { CalendarDays, ArrowRight, Layers } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function SchedulingIndexPage() {
  const batches = await sql`
    SELECT b.*, k.name as category_name
    FROM batches b
    JOIN kategori_pelatihan k ON b.kategori_id = k.id
    ORDER BY b.start_date DESC
  `;

  const mapels = await sql`SELECT * FROM mata_pelatihan`;
  const sessions = await sql`SELECT * FROM sessions`;

  const batchList = batches.map(b => {
    // Calculate JP progress
    const requiredJp = mapels
      .filter(m => m.kategori_id === b.kategori_id)
      .reduce((sum, m) => sum + m.jp_total, 0);
    
    const scheduledJp = sessions
      .filter(s => s.batch_id === b.id)
      .reduce((sum, s) => sum + s.jp_count, 0);
    
    const progress = requiredJp > 0 ? (scheduledJp / requiredJp) * 100 : 0;
    const isComplete = progress >= 100;

    return {
      ...b,
      requiredJp,
      scheduledJp,
      progress,
      isComplete
    };
  });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Training Batch Scheduling</h2>
          <p className="text-slate-500">Monitor and manage granular schedules for all active training cohorts.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 flex items-center gap-2">
          <Layers className="h-4 w-4 text-slate-400" />
          <span className="text-sm font-bold text-slate-700">{batchList.length} Active Batches</span>
        </div>
      </div>

      <Card className="shadow-sm border-slate-200">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100">
          <CardTitle>Training Sessions Pipeline</CardTitle>
          <CardDescription>Select a batch to enter the core scheduling engine workspace.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/70">
                <TableHead className="pl-6 font-bold text-slate-700">Batch Name</TableHead>
                <TableHead className="font-bold text-slate-700">Category & Pola</TableHead>
                <TableHead className="font-bold text-slate-700">Implementation Window</TableHead>
                <TableHead className="font-bold text-slate-700">JP Scheduling Progress</TableHead>
                <TableHead className="pr-6 text-right font-bold text-slate-700">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {batchList.map((batch) => (
                <TableRow key={batch.id} className="hover:bg-slate-50/50 transition-all">
                  <TableCell className="pl-6 font-black text-slate-900">{batch.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-bold text-slate-500">{batch.category_name}</span>
                      <Badge variant="outline" className={`w-fit text-[10px] ${
                        batch.pola === 'APBD' ? 'border-blue-200 text-blue-700' :
                        batch.pola === 'Kontribusi' ? 'border-emerald-200 text-emerald-700' :
                        'border-amber-200 text-amber-700'
                      }`}>
                        {batch.pola}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                      <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                      {batch.start_date} – {batch.end_date}
                    </div>
                  </TableCell>
                  <TableCell className="min-w-[200px]">
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                        <span>{batch.scheduledJp} / {batch.requiredJp} JP</span>
                        <span>{Math.round(batch.progress)}%</span>
                      </div>
                      <Progress value={batch.progress} className={`h-1.5 ${batch.isComplete ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                        <div className={`h-full transition-all ${batch.isComplete ? 'bg-emerald-500' : 'bg-blue-600'}`} />
                      </Progress>
                    </div>
                  </TableCell>
                  <TableCell className="pr-6 text-right">
                    <Link href={`/admin/scheduling/${batch.id}`}>
                      <Button size="sm" className="bg-slate-900 hover:bg-blue-600 text-white font-bold group">
                        Manage Workspace
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </Link>
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