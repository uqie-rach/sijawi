"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Download, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function ReportsManager({ initialSessions, widyaswaras, filters }: any) {
  return (
    <div className="space-y-6">
      <Card className="shadow-sm bg-white">
        <CardContent className="p-6 grid md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input placeholder="Search instructor..." className="pl-10" />
          </div>
          <Input type="date" placeholder="Start Date" />
          <Input type="date" placeholder="End Date" />
          <Button className="bg-blue-600 hover:bg-blue-500 text-white font-bold">
            Apply Filters
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="bg-slate-50/50 border-b flex flex-row justify-between items-center">
          <CardTitle className="text-base font-bold">Performance Logs</CardTitle>
          <Button variant="outline" className="text-blue-600 border-blue-200">
            <Download className="h-4 w-4 mr-2" /> Export Global Recap
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/70">
                <TableHead className="pl-6">Date</TableHead>
                <TableHead>Instructor</TableHead>
                <TableHead>Batch & Subject</TableHead>
                <TableHead className="text-center">JP</TableHead>
                <TableHead className="text-right pr-6">Export</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialSessions.map((s: any) => (
                <TableRow key={s.id}>
                  <TableCell className="pl-6 text-xs font-mono">{s.date}</TableCell>
                  <TableCell className="font-semibold">{s.wi_name}</TableCell>
                  <TableCell>
                    <p className="text-xs font-bold">{s.batch_name}</p>
                    <p className="text-[10px] text-slate-500">{s.mapel_name}</p>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline">{s.jp_count} JP</Badge>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <Button variant="ghost" size="sm" className="text-blue-600"><Download className="h-3.5 w-3.5" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="p-4 border-t flex justify-between items-center">
            <span className="text-xs text-slate-500 font-bold">Showing logs for selected period</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm"><ChevronLeft className="h-4 w-4" /></Button>
              <Button variant="outline" size="sm"><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}