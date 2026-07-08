'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TableProperties, Filter, Edit, Trash2, ArrowUpDown, ArrowUp, ArrowDown, X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Session, Mapel, Widyaiswara, Lokasi } from '@/context/wtms-context';
import type { SortField, SortDirection } from '@/hooks/use-schedule-filters';
import { formatDateId } from '@/lib/utils';

interface TableViewProps {
  filteredSessions: Session[];
  batchSessions: Session[];
  activeMapels: Mapel[];
  activeWis: Widyaiswara[];
  activeLokasis: Lokasi[];
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  onEditSession: (session: Session) => void;
  onDeleteSession: (sessionId: string) => void;
  showFilterBar: boolean;
  setShowFilterBar: (show: boolean) => void;
  activeFilterCount: number;
  resetAllFilters: () => void;
  children?: React.ReactNode;
}

const PAGE_SIZE = 10;

function SortIcon({
  field,
  currentField,
  direction,
}: {
  field: SortField;
  currentField: SortField;
  direction: SortDirection;
}) {
  if (currentField !== field) {
    return <ArrowUpDown className="h-3 w-3 text-slate-400 ml-1" />;
  }
  return direction === 'asc' ? (
    <ArrowUp className="h-3 w-3 text-blue-600 ml-1" />
  ) : (
    <ArrowDown className="h-3 w-3 text-blue-600 ml-1" />
  );
}

export function TableView({
  filteredSessions, batchSessions,
  activeMapels, activeWis, activeLokasis,
  sortField, sortDirection, onSort,
  onEditSession, onDeleteSession,
  showFilterBar, setShowFilterBar, activeFilterCount, resetAllFilters,
  children,
}: TableViewProps) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(filteredSessions.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginatedSessions = filteredSessions.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // Reset page when filtered data changes
  React.useEffect(() => {
    setPage(1);
  }, [filteredSessions.length]);

  return (
    <Card className="shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-slate-200 bg-white rounded-lg">
      <CardHeader className="border-b border-slate-200 py-4 px-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-blue-600">
            <TableProperties className="h-4.5 w-4.5 text-blue-600" />
            Matriks Tabel Jadwal Sesi
          </CardTitle>

          <div className="flex items-center gap-2">
            <Button
              variant={showFilterBar ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowFilterBar(!showFilterBar)}
              className={`text-xs font-semibold gap-1.5 ${
                showFilterBar ? 'bg-blue-600 text-white' : 'border-slate-200 text-slate-600'
              }`}
            >
              <Filter className="h-3.5 w-3.5" />
              Filter
              {activeFilterCount > 0 && (
                <span className="bg-white text-blue-600 rounded-full h-4 w-4 text-[10px] flex items-center justify-center font-bold">
                  {activeFilterCount}
                </span>
              )}
            </Button>

            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetAllFilters}
                className="text-xs text-red-500 hover:text-red-600 font-semibold gap-1"
              >
                <X className="h-3 w-3" />
                Reset
              </Button>
            )}
          </div>
        </div>

        {children}
      </CardHeader>
      <CardContent className="p-0">
        {filteredSessions.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Filter className="h-10 w-10 mx-auto text-slate-200 mb-3" />
            <p className="text-xs font-semibold mb-2">
              {activeFilterCount > 0
                ? 'Tidak ada sesi yang cocok dengan filter.'
                : 'Belum ada sesi yang dialokasikan.'}
            </p>
            {activeFilterCount > 0 && (
              <Button variant="link" size="sm" onClick={resetAllFilters} className="text-blue-600 text-xs">
                Reset Semua Filter
              </Button>
            )}
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/30">
                  <TableHead
                    className="pl-6 font-bold text-slate-500 cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => onSort('date')}
                  >
                    <div className="flex items-center gap-1 text-[11px]">
                      <CalendarIcon className="h-3 w-3 text-slate-400" />
                      Tanggal <SortIcon field="date" currentField={sortField} direction={sortDirection} />
                    </div>
                  </TableHead>
                  <TableHead
                    className="font-bold text-slate-500 cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => onSort('mapelName')}
                  >
                    <div className="flex items-center gap-1 text-[11px]">
                      <BookIcon className="h-3 w-3 text-slate-400" />
                      Mata Pelajaran{' '}
                      <SortIcon field="mapelName" currentField={sortField} direction={sortDirection} />
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-slate-500 text-[11px]">
                    <div className="flex items-center gap-1">
                      <UserIcon className="h-3 w-3 text-slate-400" />
                      Widyaiswara
                    </div>
                  </TableHead>
                  <TableHead
                    className="font-bold text-slate-500 cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => onSort('format')}
                  >
                    <div className="flex items-center gap-1 text-[11px]">
                      <MapPinIcon className="h-3 w-3 text-slate-400" />
                      Format & Ruangan{' '}
                      <SortIcon field="format" currentField={sortField} direction={sortDirection} />
                    </div>
                  </TableHead>
                  <TableHead
                    className="font-bold text-slate-500 cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => onSort('jpCount')}
                  >
                    <div className="flex items-center gap-1 text-[11px]">
                      <ClockIcon className="h-3 w-3 text-slate-400" />
                      JP <SortIcon field="jpCount" currentField={sortField} direction={sortDirection} />
                    </div>
                  </TableHead>
                  <TableHead className="pr-6 text-right font-bold text-slate-500 text-[11px]">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedSessions.map(session => {
                  const mapel = activeMapels.find(m => m.id === session.mapelId);
                  const resolvedWis = (session.wiIds || [])
                    .map((id: string) => activeWis.find(w => w.id === id))
                    .filter(Boolean) as Widyaiswara[];
                  const wiNames = resolvedWis.map(w => `${w.name}, ${w.gelar}`).join(', ');
                  const lok = activeLokasis.find(l => l.id === session.lokasiId);

                  return (
                    <TableRow key={session.id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="pl-6 font-semibold text-slate-800 text-xs py-3">
                        {formatDateId(session.date)}
                      </TableCell>
                      <TableCell className="font-semibold text-slate-800 text-xs py-3">
                        {mapel?.name}
                      </TableCell>
                      <TableCell
                        className="text-xs text-slate-600 font-medium max-w-[200px] truncate py-3"
                        title={wiNames}
                      >
                        {wiNames}
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="space-y-1">
                          <Badge
                            className={`text-[9px] font-bold ${
                              session.format === 'Klasikal'
                                ? 'bg-blue-100 text-blue-800'
                                : session.format === 'Virtual'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {session.format}
                          </Badge>
                          {session.format === 'Klasikal' && (
                            <p className="text-[10px] text-slate-500 font-medium">
                              {lok?.name || 'Ruangan'}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs py-3">
                        <span className="font-semibold text-slate-700">{session.jpCount} JP</span>
                        <span className="text-slate-400 text-[10px] ml-1">({session.jpKe})</span>
                      </TableCell>
                      <TableCell className="pr-6 text-right py-3">
                        <div className="flex justify-end gap-1.5">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => onEditSession(session)}
                            className="text-blue-600 h-8 w-8"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => onDeleteSession(session.id)}
                            className="text-red-500 h-8 w-8"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-3 border-t border-slate-100 bg-slate-50/30">
                <span className="text-xs text-slate-500 font-medium">
                  Halaman {safePage} dari {totalPages} ({filteredSessions.length} sesi)
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={safePage <= 1}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 7) {
                      pageNum = i + 1;
                    } else if (safePage <= 4) {
                      pageNum = i + 1;
                    } else if (safePage >= totalPages - 3) {
                      pageNum = totalPages - 6 + i;
                    } else {
                      pageNum = safePage - 3 + i;
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === safePage ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPage(pageNum)}
                        className={`h-8 w-8 p-0 text-xs font-semibold ${
                          pageNum === safePage ? 'bg-blue-600 text-white' : 'text-slate-600'
                        }`}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={safePage >= totalPages}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

// Tiny inline icon components to avoid import clutter
function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function BookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
