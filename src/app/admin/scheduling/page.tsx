import React from 'react';
import Link from 'next/link';
import { connectToDatabase } from '@/lib/mongodb';
import Pelatihan from '@/models/Pelatihan';
import KategoriPelatihan from '@/models/KategoriPelatihan';
import MataPelatihan from '@/models/MataPelatihan';
import Widyaiswara from '@/models/Widyaiswara';
import Lokasi from '@/models/Lokasi';
import JadwalSesi from '@/models/JadwalSesi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Calendar, Layers, MapPin, ArrowUpRight } from 'lucide-react';
import { SchedulingWorkspaceClient } from '@/components/admin/scheduling-workspace-client';
import { MiniPieChart } from '@/components/admin/scheduling/mini-pie-chart';
import { YearFilterSelect } from '@/components/admin/scheduling/year-filter-select';
import { formatDateId } from '@/lib/utils';
import { BRANDING } from '@/lib/config';
import { BatchListPagination } from './batch-list-pagination';

interface BatchListItem {
  id: string;
  name: string;
  categorySingkatan: string;
  categoryKepanjangan: string;
  pola: string;
  startDate: string;
  endDate: string;
  totalJpRequired: number;
  totalJpScheduled: number;
  distinctLocations: string[];
}

const POLA_TOOLTIPS: Record<string, string> = {
  'APBD': 'Anggaran Pendapatan dan Belanja Daerah',
  'Kontribusi': 'Dana Kontribusi Peserta',
  'Kemitraan': 'Kerjasama Kemitraan Daerah',
};

async function getSchedulingIndexData() {
  try {
    await connectToDatabase();
    const batches = await Pelatihan.find().sort({ start_date: -1 });
    const categories = await KategoriPelatihan.find();
    const sessions = await JadwalSesi.find();
    const mapels = await MataPelatihan.find();
    const wis = await Widyaiswara.find().sort({ name: 1 });
    const lokasis = await Lokasi.find().sort({ name: 1 });

    const categoryMap = new Map(categories.map(c => [c._id, c]));
    const lokasiMap = new Map(lokasis.map(l => [l._id, l]));

    const formattedBatches: BatchListItem[] = batches.map((b) => {
      const relevantMapels = mapels.filter((m) => m.kategori_id === b.kategori_id);
      const totalJpRequired = relevantMapels.reduce((sum, m) => sum + Number(m.jp_total), 0);

      const batchSessions = sessions.filter((s) => s.batch_id === b._id);
      const totalJpScheduled = batchSessions.reduce((sum, s) => sum + Number(s.jp_count), 0);

      const locations = Array.from(
        new Set(
          batchSessions
            .map((s) => {
              const lok = lokasiMap.get(s.lokasi_id || '');
              return lok ? lok.name : (s.format !== 'Klasikal' ? s.format : '');
            })
            .filter(Boolean)
        )
      );

      const cat = categoryMap.get(b.kategori_id);

      return {
        id: b._id,
        name: b.name,
        categorySingkatan: cat ? cat.singkatan : '?',
        categoryKepanjangan: cat ? cat.kepanjangan : 'Kategori Tidak Diketahui',
        pola: b.pola,
        startDate: b.start_date,
        endDate: b.end_date,
        totalJpRequired: totalJpRequired || 20,
        totalJpScheduled,
        distinctLocations: locations,
      };
    });

    return {
      batchesList: formattedBatches,
      mapels: mapels.map(m => ({ id: m._id, name: m.name, kategoriId: m.kategori_id, jpTotal: Number(m.jp_total) })),
      wis: wis.map(w => ({ id: w._id, name: w.name, gelar: w.gelar, email: w.email, nip: w.nip, jabatan: w.jabatan, level: Number(w.level), levelLabel: w.level_label })),
      lokasis: lokasis.map(l => ({ id: l._id, name: l.name })),
      sessions: sessions.map(s => ({
        id: s._id,
        batchId: s.batch_id,
        mapelId: s.mapel_id,
        wiIds: s.wi_ids || [],
        date: s.date,
        startTime: s.start_time,
        endTime: s.end_time,
        format: s.format,
        lokasiId: s.lokasi_id || undefined,
        jpKe: s.jp_ke,
        jpCount: Number(s.jp_count)
      })),
      allBatches: batches.map(b => ({ id: b._id, name: b.name, startDate: b.start_date, endDate: b.end_date }))
    };
  } catch (e) {
    console.error(e);
    return { batchesList: [], mapels: [], wis: [], lokasis: [], sessions: [], allBatches: [] };
  }
}

export default async function SchedulingIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; page?: string }>;
}) {
  const data = await getSchedulingIndexData();
  const params = await searchParams;

  // Year filter
  const availableYears = Array.from(
    new Set(data.allBatches.map(b => new Date(b.startDate).getFullYear().toString()))
  ).sort((a, b) => Number(b) - Number(a));

  const currentYear = new Date().getFullYear().toString();
  const selectedYear = params.year && availableYears.includes(params.year) ? params.year : (availableYears[0] || currentYear);

  const filteredBatches = selectedYear
    ? data.batchesList.filter(b => new Date(b.startDate).getFullYear().toString() === selectedYear)
    : data.batchesList;

  // Pagination
  const page = parseInt(params.page || '1');
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(filteredBatches.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedBatches = filteredBatches.slice((safePage - 1) * pageSize, safePage * pageSize);

  return (
    <div className="space-y-8">
      {/* Batch Listing Panel */}
      <Card className="shadow-sm border-slate-200 bg-white">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-lg font-bold text-blue-900">Pilih Angkatan Pelatihan untuk Dijadwalkan</CardTitle>
              <CardDescription>Lihat kemajuan penjadwalan saat ini dan masuk ke ruang kerja lini masa angkatan tertentu.</CardDescription>
            </div>
            <YearFilterSelect availableYears={availableYears} selectedYear={selectedYear} />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <TooltipProvider>
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/40">
                  <TableHead className="pl-6 font-semibold">
                    <div className="flex items-center gap-1.5">
                      <Layers className="h-3.5 w-3.5 text-slate-400" />
                      Nama Angkatan Pelatihan
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold">
                    <div className="flex items-center gap-1.5">
                      Kategori & Pola
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      Periode Pelaksanaan
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      Lokasi Terkunci
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold">Progres Alokasi JP</TableHead>
                  <TableHead className="pr-6 text-right font-semibold">Ruang Kerja</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedBatches.map((b) => (
                  <TableRow key={b.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="font-bold text-slate-900 pl-6">
                      {b.name}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <p className="text-xs text-slate-600 font-medium cursor-help">{b.categorySingkatan}</p>
                          </TooltipTrigger>
                          <TooltipContent className="bg-slate-800 text-white text-xs px-2 py-1">
                            {b.categoryKepanjangan}
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge className={`font-semibold text-[10px] cursor-help ${
                              b.pola === 'APBD' ? 'bg-blue-50 text-blue-900 border-blue-200' :
                              b.pola === 'Kontribusi' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                              'bg-sky-50 text-sky-700 border-sky-200'
                            }`}>
                              {b.pola}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent className="bg-slate-800 text-white text-xs px-2 py-1">
                            {POLA_TOOLTIPS[b.pola] || b.pola}
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-slate-600 font-medium">
                        {formatDateId(b.startDate)} s/d {formatDateId(b.endDate)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {b.distinctLocations.length > 0 ? (
                          b.distinctLocations.map((loc, idx) => (
                            <Badge key={idx} variant="outline" className="bg-slate-50 text-slate-600 text-[10px] border-slate-200">
                              {loc}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400 italic">Belum Ada</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="w-[140px]">
                      <div className="flex items-center gap-3">
                        <MiniPieChart scheduled={b.totalJpScheduled} total={b.totalJpRequired} size={48} />
                        <div className="text-xs">
                          <span className="font-semibold text-blue-900">{b.totalJpScheduled}/{b.totalJpRequired}</span>
                          <span className="text-slate-400 ml-0.5">JP</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      <Link href={`/admin/scheduling/${b.id}`} passHref>
                        <Button size="sm" variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-600 gap-1.5">
                          Kelola Jadwal
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TooltipProvider>

          {/* Pagination */}
          {totalPages > 1 && (
            <BatchListPagination
              currentPage={safePage}
              totalPages={totalPages}
              selectedYear={selectedYear}
            />
          )}
        </CardContent>
      </Card>

      {/* Global Month/Day/Table Calendar Timeline Preview */}
      <Card className="shadow-sm border-slate-200 bg-white">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100">
          <CardTitle className="text-lg font-bold text-blue-900">Mesin Kontrol Jadwal {BRANDING.name}</CardTitle>
          <CardDescription>
            Periksa dan tinjau semua slot terjadwal di seluruh lini masa angkatan secara bersamaan.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <SchedulingWorkspaceClient
            initialMapels={data.mapels}
            initialWis={data.wis}
            initialLokasis={data.lokasis}
            initialSessions={data.sessions}
            allBatches={data.allBatches}
          />
        </CardContent>
      </Card>
    </div>
  );
}
