"use client";

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

interface ReportsClientProps {
  initialWis: any[];
}

export function ReportsClient({ initialWis }: ReportsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // local URL search params states
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [filterPola, setFilterPola] = useState(searchParams.get('pola') || 'ALL');
  const [startDate, setStartDate] = useState(searchParams.get('start') || '');
  const [endDate, setEndDate] = useState(searchParams.get('end') || '');
  const [currentPage, setCurrentPage] = useState(1);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (filterPola !== 'ALL') params.set('pola', filterPola);
    if (startDate) params.set('start', startDate);
    if (endDate) params.set('end', endDate);
    router.push(`/admin/reports?${params.toString()}`);
  };

  const rowsPerPage = 10;
  const filteredWis = initialWis.filter((wi) => {
    const matchesSearch = wi.name.toLowerCase().includes(searchQuery.toLowerCase()) || wi.nip.includes(searchQuery);
    return matchesSearch;
  });

  const totalRows = filteredWis.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const paginatedWis = filteredWis.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // 1. Professional Global Monthly Recap Export (.xlsx)
  const handleExportGlobal = async () => {
    try {
      if (filteredWis.length === 0) {
        toast.error("Tidak ada data untuk diekspor.");
        return;
      }

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Rekap Global');

      // Title Block
      worksheet.mergeCells('A1:G1');
      const titleCell = worksheet.getCell('A1');
      titleCell.value = 'LAPORAN REKAPITULASI GLOBAL BULANAN WIDYAISWARA';
      titleCell.font = { name: 'Arial', size: 14, bold: true, color: { argb: '1E3A8A' } };
      titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
      worksheet.getRow(1).height = 30;

      worksheet.addRow([]); // Spacing

      // Header Row
      const headerRow = worksheet.addRow([
        'NIP',
        'Nama Widyaiswara',
        'Jabatan',
        'Total JP APBD',
        'Total JP Kontribusi',
        'Total JP Kemitraan',
        'Grand Total JP'
      ]);

      headerRow.height = 25;
      headerRow.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'EFF6FF' } // Light blue background
        };
        cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: '1E3A8A' } };
        cell.border = {
          top: { style: 'thin', color: { argb: 'BFDBFE' } },
          bottom: { style: 'medium', color: { argb: '1E3A8A' } },
          left: { style: 'thin', color: { argb: 'BFDBFE' } },
          right: { style: 'thin', color: { argb: 'BFDBFE' } }
        };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      });

      // Data Rows
      filteredWis.forEach((wi) => {
        const row = worksheet.addRow([
          wi.nip,
          `${wi.name}, ${wi.gelar}`,
          wi.jabatan,
          Number(wi.apbd),
          Number(wi.kontribusi),
          Number(wi.kemitraan),
          Number(wi.grandTotal)
        ]);

        row.height = 20;
        row.eachCell((cell, colNumber) => {
          cell.font = { name: 'Arial', size: 10 };
          cell.border = {
            top: { style: 'thin', color: { argb: 'E2E8F0' } },
            bottom: { style: 'thin', color: { argb: 'E2E8F0' } },
            left: { style: 'thin', color: { argb: 'E2E8F0' } },
            right: { style: 'thin', color: { argb: 'E2E8F0' } }
          };
          if (colNumber >= 4) {
            cell.alignment = { vertical: 'middle', horizontal: 'right' };
            cell.numFmt = '#,##0';
          } else {
            cell.alignment = { vertical: 'middle', horizontal: 'left' };
          }
        });
      });

      // Total Summary Row
      const totalRowIndex = worksheet.rowCount + 1;
      const totalRow = worksheet.addRow([
        'Total Keseluruhan',
        '',
        '',
        { formula: `SUM(D4:D${totalRowIndex - 1})` },
        { formula: `SUM(E4:E${totalRowIndex - 1})` },
        { formula: `SUM(F4:F${totalRowIndex - 1})` },
        { formula: `SUM(G4:G${totalRowIndex - 1})` }
      ]);

      worksheet.mergeCells(`A${totalRowIndex}:C${totalRowIndex}`);
      totalRow.height = 22;
      totalRow.eachCell((cell, colNumber) => {
        cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: '1E3A8A' } };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'F8FAFC' }
        };
        cell.border = {
          top: { style: 'medium', color: { argb: '1E3A8A' } },
          bottom: { style: 'double', color: { argb: '1E3A8A' } },
          left: { style: 'thin', color: { argb: 'E2E8F0' } },
          right: { style: 'thin', color: { argb: 'E2E8F0' } }
        };
        if (colNumber >= 4) {
          cell.alignment = { vertical: 'middle', horizontal: 'right' };
          cell.numFmt = '#,##0';
        } else {
          cell.alignment = { vertical: 'middle', horizontal: 'left' };
        }
      });

      // Auto-fit Columns
      worksheet.columns.forEach((column) => {
        let maxLen = 0;
        column.eachCell?.({ includeEmpty: true }, (cell) => {
          const val = cell.value;
          if (val) {
            let strLen = 0;
            if (typeof val === 'object' && 'formula' in val) {
              strLen = 10; // Default length for formula results
            } else {
              strLen = String(val).length;
            }
            if (strLen > maxLen) maxLen = strLen;
          }
        });
        column.width = Math.max(maxLen + 4, 12);
      });

      // Write and Save File
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `Laporan_Rekap_Global_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success("Rekap Global berhasil diekspor ke Excel!");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Gagal mengekspor laporan.");
    }
  };

  // 2. Professional Individual Widyaiswara Report Export (.xlsx)
  const handleExportIndividual = async (wi: any) => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Laporan Individu');

      // Title Block
      worksheet.mergeCells('A1:F1');
      const titleCell = worksheet.getCell('A1');
      titleCell.value = 'LAPORAN KINERJA INDIVIDU WIDYAISWARA';
      titleCell.font = { name: 'Arial', size: 14, bold: true, color: { argb: '1E3A8A' } };
      titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
      worksheet.getRow(1).height = 30;

      worksheet.addRow([]); // Spacing

      // Metadata Block
      const metaRows = [
        ['NIP', wi.nip],
        ['Nama & Gelar', `${wi.name}, ${wi.gelar}`],
        ['Jabatan', wi.jabatan],
        ['Tingkat Kompetensi', `Level ${wi.level} (${wi.levelLabel})`]
      ];

      metaRows.forEach((meta) => {
        const row = worksheet.addRow(meta);
        row.getCell(1).font = { name: 'Arial', size: 10, bold: true, color: { argb: '475569' } };
        row.getCell(2).font = { name: 'Arial', size: 10, bold: true };
      });

      worksheet.addRow([]); // Spacing

      // Fetch sessions for this specific WI to build the timeline
      const resSessions = await fetch('/api/sessions').then(r => r.ok ? r.json() : []);
      const resBatches = await fetch('/api/batches').then(r => r.ok ? r.json() : []);
      const resMapels = await fetch('/api/mata-pelatihan').then(r => r.ok ? r.json() : []);

      const wiSessions = resSessions.filter((s: any) => s.wiId === wi.id);

      // Session Table Header
      const headerRow = worksheet.addRow([
        'Tanggal',
        'Nama Batch',
        'Mata Pelatihan',
        'JP Ke',
        'Jumlah JP',
        'Format Pelaksanaan'
      ]);

      headerRow.height = 25;
      headerRow.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'EFF6FF' }
        };
        cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: '1E3A8A' } };
        cell.border = {
          top: { style: 'thin', color: { argb: 'BFDBFE' } },
          bottom: { style: 'medium', color: { argb: '1E3A8A' } },
          left: { style: 'thin', color: { argb: 'BFDBFE' } },
          right: { style: 'thin', color: { argb: 'BFDBFE' } }
        };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      });

      const startRowIndex = worksheet.rowCount + 1;

      // Session Table Data
      if (wiSessions.length === 0) {
        const emptyRow = worksheet.addRow(['Tidak ada jadwal mengajar bulan ini.', '', '', '', 0, '']);
        worksheet.mergeCells(`A${startRowIndex}:D${startRowIndex}`);
        emptyRow.eachCell((cell) => {
          cell.font = { name: 'Arial', size: 10, italic: true };
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        });
      } else {
        wiSessions.forEach((s: any) => {
          const batch = resBatches.find((b: any) => b.id === s.batchId);
          const mapel = resMapels.find((m: any) => m.id === s.mapelId);

          const row = worksheet.addRow([
            s.date,
            batch ? batch.name : 'Unknown Batch',
            mapel ? mapel.name : 'Unknown Subject',
            s.jpKe,
            Number(s.jpCount),
            s.format
          ]);

          row.height = 20;
          row.eachCell((cell, colNumber) => {
            cell.font = { name: 'Arial', size: 10 };
            cell.border = {
              top: { style: 'thin', color: { argb: 'E2E8F0' } },
              bottom: { style: 'thin', color: { argb: 'E2E8F0' } },
              left: { style: 'thin', color: { argb: 'E2E8F0' } },
              right: { style: 'thin', color: { argb: 'E2E8F0' } }
            };
            if (colNumber === 5) {
              cell.alignment = { vertical: 'middle', horizontal: 'right' };
              cell.numFmt = '#,##0';
            } else {
              cell.alignment = { vertical: 'middle', horizontal: 'left' };
            }
          });
        });
      }

      // Summary Row
      const totalRowIndex = worksheet.rowCount + 1;
      const totalRow = worksheet.addRow([
        'Total Jam Pelajaran (JP)',
        '',
        '',
        '',
        { formula: `SUM(E${startRowIndex}:E${totalRowIndex - 1})` },
        ''
      ]);

      worksheet.mergeCells(`A${totalRowIndex}:D${totalRowIndex}`);
      totalRow.height = 22;
      totalRow.eachCell((cell, colNumber) => {
        cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: '1E3A8A' } };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'F8FAFC' }
        };
        cell.border = {
          top: { style: 'medium', color: { argb: '1E3A8A' } },
          bottom: { style: 'double', color: { argb: '1E3A8A' } },
          left: { style: 'thin', color: { argb: 'E2E8F0' } },
          right: { style: 'thin', color: { argb: 'E2E8F0' } }
        };
        if (colNumber === 5) {
          cell.alignment = { vertical: 'middle', horizontal: 'right' };
          cell.numFmt = '#,##0';
        } else {
          cell.alignment = { vertical: 'middle', horizontal: 'left' };
        }
      });

      // Auto-fit Columns
      worksheet.columns.forEach((column) => {
        let maxLen = 0;
        column.eachCell?.({ includeEmpty: true }, (cell) => {
          const val = cell.value;
          if (val) {
            let strLen = 0;
            if (typeof val === 'object' && 'formula' in val) {
              strLen = 10;
            } else {
              strLen = String(val).length;
            }
            if (strLen > maxLen) maxLen = strLen;
          }
        });
        column.width = Math.max(maxLen + 4, 12);
      });

      // Write and Save File
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `Laporan_WI_${wi.name.replace(/\s+/g, '_')}.xlsx`);
      toast.success(`Laporan individu untuk ${wi.name} berhasil diekspor ke Excel!`);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Gagal mengekspor laporan.");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <Card className="shadow-sm border-slate-200 bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-bold text-blue-900">Pencarian & Penyaringan Lanjutan</CardTitle>
          <CardDescription>Saring tabel rekapitulasi bulanan secara dinamis berdasarkan rentang tanggal, pola pendanaan, dan parameter widyaiswara.</CardDescription>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-5 gap-4 items-end">
          <div className="space-y-1">
            <Label className="text-xs font-bold text-slate-500 uppercase">Cari Widyaiswara</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Cari nama atau NIP..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-50 border-slate-200 text-slate-800 focus:ring-blue-500 focus:border-blue-500 rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-bold text-slate-500 uppercase">Pola Pendanaan</Label>
            <Select value={filterPola} onValueChange={setFilterPola}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="ALL">Semua Pola</SelectItem>
                <SelectItem value="APBD">APBD</SelectItem>
                <SelectItem value="Kontribusi">Kontribusi</SelectItem>
                <SelectItem value="Kemitraan">Kemitraan</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-bold text-slate-500 uppercase">Tanggal Mulai</Label>
            <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-bold text-slate-500 uppercase">Tanggal Selesai</Label>
            <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>

          <Button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700 text-white w-full">Terapkan Filter</Button>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-slate-200 bg-white">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="text-lg font-bold text-blue-900">Tabel Rekapitulasi Bulanan</CardTitle>
            <CardDescription>Rincian detail jam pelajaran (JP) mengajar per Widyaiswara.</CardDescription>
          </div>
          <Button onClick={handleExportGlobal} className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
            <Download className="h-4 w-4" /> Ekspor Rekap Global
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/70">
                <TableHead className="font-semibold pl-6">NIP</TableHead>
                <TableHead className="font-semibold">Nama Widyaiswara</TableHead>
                <TableHead className="font-semibold">Jabatan</TableHead>
                <TableHead className="text-center font-semibold">APBD</TableHead>
                <TableHead className="text-center font-semibold">Kontribusi</TableHead>
                <TableHead className="text-center font-semibold">Kemitraan</TableHead>
                <TableHead className="text-center font-semibold">Grand Total</TableHead>
                <TableHead className="pr-6 text-right font-semibold">Ekspor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedWis.map((wi) => (
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
                  <TableCell className="text-center font-medium text-slate-500">{wi.apbd} JP</TableCell>
                  <TableCell className="text-center font-medium text-slate-500">{wi.kontribusi} JP</TableCell>
                  <TableCell className="text-center font-medium text-slate-500">{wi.kemitraan} JP</TableCell>
                  <TableCell className="text-center font-bold text-slate-900">{wi.grandTotal} JP</TableCell>
                  <TableCell className="pr-6 text-right">
                    <Button size="sm" variant="outline" onClick={() => handleExportIndividual(wi)} className="border-blue-200 text-blue-600 hover:bg-blue-50 ml-auto flex items-center gap-1.5">
                      <Download className="h-3.5 w-3.5" /> Ekspor Laporan
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="p-4 border-t border-slate-100 flex items-center justify-between">
            <div className="text-xs text-slate-500">
              Menampilkan {filteredWis.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0} hingga {Math.min(currentPage * rowsPerPage, filteredWis.length)} dari {filteredWis.length} data
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Sebelumnya
              </Button>
              <span className="text-xs font-semibold text-slate-600">
                Halaman {currentPage} dari {totalPages || 1}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0}
              >
                Selanjutnya
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}