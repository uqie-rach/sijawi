"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWTMS } from '@/context/wtms-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, BookOpen } from 'lucide-react';
import { toast } from '@/lib/toast';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export default function WidyaswaraReportsPage() {
  const router = useRouter();
  const { isAuthenticated, userRole, selectedWiId, widyaswaras, sessions, batches, mapelList, lokasiList } = useWTMS();

  useEffect(() => {
    if (!isAuthenticated || userRole !== 'wi') {
      router.push('/login');
    }
  }, [isAuthenticated, userRole, router]);

  const targetWiId = selectedWiId || (widyaswaras[0]?.id) || null;
  const targetWi = widyaswaras.find(w => w.id === targetWiId);

  const wiSessions = useMemo(() => {
    if (!targetWiId) return [];
    return sessions.filter(s => (s.wiIds || []).includes(targetWiId));
  }, [sessions, targetWiId]);

  const batchMap = useMemo(() => new Map(batches.map(b => [b.id, b])), [batches]);
  const mapelMap = useMemo(() => new Map(mapelList.map(m => [m.id, m])), [mapelList]);

  // Compute breakdown per pola
  const breakdown = useMemo(() => {
    let apbd = 0;
    let kontribusi = 0;
    let kemitraan = 0;
    wiSessions.forEach(s => {
      const batch = batchMap.get(s.batchId);
      const pola = batch?.pola || 'APBD';
      if (pola === 'APBD') apbd += s.jpCount;
      else if (pola === 'Kontribusi') kontribusi += s.jpCount;
      else if (pola === 'Kemitraan') kemitraan += s.jpCount;
    });
    return { apbd, kontribusi, kemitraan, grandTotal: apbd + kontribusi + kemitraan };
  }, [wiSessions, batchMap]);

  const handleExportIndividual = async () => {
    if (!targetWi) return;
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Laporan Individu');

      worksheet.mergeCells('A1:F1');
      const titleCell = worksheet.getCell('A1');
      titleCell.value = 'LAPORAN KINERJA INDIVIDU WIDYAISWARA';
      titleCell.font = { name: 'Arial', size: 14, bold: true, color: { argb: '1E3A8A' } };
      titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
      worksheet.getRow(1).height = 30;

      worksheet.addRow([]);

      const metaRows = [
        ['NIP', targetWi.nip],
        ['Nama & Gelar', `${targetWi.name}, ${targetWi.gelar || ''}`],
        ['Jabatan', targetWi.jabatan],
        ['Tingkat Kompetensi', `Level ${targetWi.level} (${targetWi.levelLabel})`]
      ];
      metaRows.forEach(meta => {
        const row = worksheet.addRow(meta);
        row.getCell(1).font = { name: 'Arial', size: 10, bold: true, color: { argb: '475569' } };
        row.getCell(2).font = { name: 'Arial', size: 10, bold: true };
      });

      worksheet.addRow([]);

      const headerRow = worksheet.addRow([
        'Tanggal', 'Nama Batch', 'Mata Pelatihan', 'JP Ke', 'Jumlah JP', 'Format Pelaksanaan'
      ]);
      headerRow.height = 25;
      headerRow.eachCell(cell => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'EFF6FF' } };
        cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: '1E3A8A' } };
        cell.border = {
          top: { style: 'thin', color: { argb: 'BFDBFE' } },
          bottom: { style: 'medium', color: { argb: '1E3A8A' } },
        };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      });

      const startRow = worksheet.rowCount + 1;

      const sorted = [...wiSessions].sort((a,b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));
      sorted.forEach(s => {
        const batch = batchMap.get(s.batchId);
        const mapel = mapelMap.get(s.mapelId);
        const row = worksheet.addRow([
          s.date,
          batch?.name || 'Unknown Batch',
          mapel?.name || 'Unknown Subject',
          s.jpKe,
          s.jpCount,
          s.format
        ]);
        row.eachCell((cell, col) => {
          cell.font = { name: 'Arial', size: 10 };
          cell.alignment = { vertical: 'middle', horizontal: col === 5 ? 'right' : 'left' };
        });
      });

      const totalRow = worksheet.addRow([
        'Total JP', '', '', '',
        { formula: `SUM(E${startRow}:E${worksheet.rowCount - 1})` }, ''
      ]);
      totalRow.eachCell((cell, col) => {
        cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: '1E3A8A' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F8FAFC' } };
        cell.alignment = { vertical: 'middle', horizontal: col === 5 ? 'right' : 'left' };
      });

      // Auto-fit
      worksheet.columns.forEach(col => {
        let maxLen = 0;
        col.eachCell?.({ includeEmpty: true }, cell => {
          const v = cell.value;
          if (v) maxLen = Math.max(maxLen, String(v).length);
        });
        col.width = Math.max(maxLen + 4, 12);
      });

      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
        `Laporan_WI_${targetWi.name.replace(/\s+/g, '_')}.xlsx`);
      toast.success("Laporan berhasil diekspor!");
    } catch (err) {
      console.error(err);
      toast.error("Gagal mengekspor laporan.");
    }
  };

  if (!targetWi) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-slate-500">Memuat data...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 space-y-6">
      <Card className="shadow-sm border-slate-200">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100">
          <CardTitle className="text-lg font-bold text-blue-900 flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Laporan Pribadi
          </CardTitle>
          <CardDescription>
            Rekap dan ekspor jam mengajar Anda berdasarkan pola pelaksanaan.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card className="shadow-sm border-slate-200">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="text font-bold text-blue-900">Detail JP Mengajar</CardTitle>
          </div>
          <Button onClick={handleExportIndividual} className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
            <Download className="h-4 w-4" /> Ekspor Laporan Pribadi
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Nama</TableHead>
                <TableHead>NIP</TableHead>
                <TableHead>Jabatan</TableHead>
                <TableHead className="text-center">APBD</TableHead>
                <TableHead className="text-center">Kontribusi</TableHead>
                <TableHead className="text-center">Kemitraan</TableHead>
                <TableHead className="text-center">Grand Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="pl-6 font-semibold">
                  {targetWi.name}, {targetWi.gelar}
                </TableCell>
                <TableCell className="font-mono text-xs">{targetWi.nip}</TableCell>
                <TableCell>
                  <Badge className="bg-blue-100 text-blue-900 border-blue-200">
                    Level {targetWi.level} - {targetWi.levelLabel}
                  </Badge>
                </TableCell>
                <TableCell className="text-center font-medium">{breakdown.apbd} JP</TableCell>
                <TableCell className="text-center font-medium">{breakdown.kontribusi} JP</TableCell>
                <TableCell className="text-center font-medium">{breakdown.kemitraan} JP</TableCell>
                <TableCell className="text-center font-bold text-slate-900">{breakdown.grandTotal} JP</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-slate-200">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50">
          <CardTitle className="text font-bold text-blue-900">Daftar Sesi Mengajar</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Tanggal</TableHead>
                <TableHead>Waktu</TableHead>
                <TableHead>Mata Pelatihan</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Format</TableHead>
                <TableHead className="text-center">JP Ke</TableHead>
                <TableHead className="text-center">Jumlah JP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {wiSessions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-slate-400">Belum ada sesi mengajar.</TableCell>
                </TableRow>
              ) : (
                [...wiSessions]
                  .sort((a,b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))
                  .map(s => {
                    const batch = batchMap.get(s.batchId);
                    const mapel = mapelMap.get(s.mapelId);
                    return (
                      <TableRow key={s.id}>
                        <TableCell className="pl-6 text-xs font-semibold">{s.date}</TableCell>
                        <TableCell className="text-xs">{s.startTime} - {s.endTime}</TableCell>
                        <TableCell className="text-xs">{mapel?.name || 'Unknown'}</TableCell>
                        <TableCell className="text-xs">{batch?.name || 'Unknown'}</TableCell>
                        <TableCell>
                          <Badge className={`text-[9px] font-bold ${
                            s.format === 'Klasikal' ? 'bg-blue-100 text-blue-800' :
                            s.format === 'Virtual' ? 'bg-purple-100 text-purple-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {s.format}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-center">{s.jpKe}</TableCell>
                        <TableCell className="text-xs text-center font-bold">{s.jpCount} JP</TableCell>
                      </TableRow>
                    );
                  })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}