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

  const handleExportGlobal = () => {
    const header = "LAPORAN REKAPITULASI GLOBAL BULANAN WIDYAISWARA\n==================================================\n\n";
    const tableHeader = "NIP | Nama Widyaiswara | Jabatan | APBD | Kontribusi | Kemitraan | Grand Total JP\n";
    const rows = filteredWis.map(wi => 
      `${wi.nip} | ${wi.name}, ${wi.gelar} | ${wi.jabatan} | ${wi.apbd} JP | ${wi.kontribusi} JP | ${wi.kemitraan} JP | ${wi.grandTotal} JP`
    ).join('\n');
    
    const blob = new Blob([header + tableHeader + rows], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Global_Recap_Report_${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    toast.success("Global Recap exported successfully!");
  };

  const handleExportIndividual = (wi: any) => {
    const header = `LAPORAN KINERJA INDIVIDU WIDYAISWARA\n====================================\n\n`;
    const metadata = `NIP: ${wi.nip}\nNama: ${wi.name}, ${wi.gelar}\nJabatan: ${wi.jabatan}\nCompetency Level: Level ${wi.level} (${wi.levelLabel})\n\n`;
    const summary = `REKAPITULASI JAM PELAJARAN (JP):\n--------------------------------\nAPBD: ${wi.apbd} JP\nKontribusi: ${wi.kontribusi} JP\nKemitraan: ${wi.kemitraan} JP\nGrand Total: ${wi.grandTotal} JP\n`;
    
    const blob = new Blob([header + metadata + summary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `WI_Report_${wi.name.replace(/\s+/g, '_')}.txt`;
    link.click();
    toast.success(`Individual report for ${wi.name} exported successfully!`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <Card className="shadow-sm border-slate-200 bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-bold text-blue-900">Advanced Filtering & Search</CardTitle>
          <CardDescription>Filter the monthly recap table dynamically by ranges, patterns, and instructor parameters.</CardDescription>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-5 gap-4 items-end">
          <div className="space-y-1">
            <Label className="text-xs font-bold text-slate-500 uppercase">Search Widyaiswara</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Search name or NIP..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-bold text-slate-500 uppercase">Funding Pola</Label>
            <Select value={filterPola} onValueChange={setFilterPola}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="ALL">All Patterns</SelectItem>
                <SelectItem value="APBD">APBD</SelectItem>
                <SelectItem value="Kontribusi">Kontribusi</SelectItem>
                <SelectItem value="Kemitraan">Kemitraan</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-bold text-slate-500 uppercase">Start Date</Label>
            <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-bold text-slate-500 uppercase">End Date</Label>
            <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>

          <Button onClick={handleSearch} className="bg-blue-900 hover:bg-blue-800 text-white w-full">Apply Filters</Button>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-slate-200 bg-white">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="text-lg font-bold text-blue-900">Monthly Recap Table</CardTitle>
            <CardDescription>Detailed breakdown of teaching hours per Widyaiswara.</CardDescription>
          </div>
          <Button onClick={handleExportGlobal} className="bg-blue-900 hover:bg-blue-800 text-white flex items-center gap-2">
            <Download className="h-4 w-4" /> Export Global Recap
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
                <TableHead className="pr-6 text-right font-semibold">Export</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedWis.map((wi) => (
                <TableRow key={wi.id} className="hover:bg-slate-50/50 transition-colors">
                  <TableCell className="font-mono text-xs pl-6">{wi.nip}</TableCell>
                  <TableCell className="font-semibold text-slate-900">{wi.name}, {wi.gelar}</TableCell>
                  <TableCell className="text-slate-600 text-xs font-medium">{wi.jabatan}</TableCell>
                  <TableCell className="text-center font-medium text-blue-900">{wi.apbd} JP</TableCell>
                  <TableCell className="text-center font-medium text-emerald-600">{wi.kontribusi} JP</TableCell>
                  <TableCell className="text-center font-medium text-amber-600">{wi.kemitraan} JP</TableCell>
                  <TableCell className="text-center font-bold text-slate-900">{wi.grandTotal} JP</TableCell>
                  <TableCell className="pr-6 text-right">
                    <Button size="sm" variant="outline" onClick={() => handleExportIndividual(wi)} className="border-blue-200 text-blue-900 hover:bg-blue-50 ml-auto flex items-center gap-1.5">
                      <Download className="h-3.5 w-3.5" /> Export Report
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="p-4 border-t border-slate-100 flex items-center justify-between">
            <div className="text-xs text-slate-500">
              Showing {Math.min((currentPage - 1) * rowsPerPage + 1, totalRows)} to {Math.min(currentPage * rowsPerPage, totalRows)} of {totalRows} entries
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)}>
                <ChevronLeft className="h-4 w-4" /> Previous
              </Button>
              <span className="text-xs font-semibold text-slate-700">Page {currentPage} of {totalPages || 1}</span>
              <Button variant="outline" size="sm" disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(prev => prev + 1)}>
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}