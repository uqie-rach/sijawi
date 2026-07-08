'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TableProperties, Filter, Edit, Trash2, ArrowUpDown, ArrowUp, ArrowDown, X } from 'lucide-react';
import type { Session, Mapel, Widyaiswara, Lokasi } from '@/context/wtms-context';
import type { SortField, SortDirection } from '@/hooks/use-schedule-filters';

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
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/30">
                <TableHead
                  className="pl-6 font-bold text-slate-500 cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => onSort('date')}
                >
                  <div className="flex items-center gap-1 text-[11px]">
                    Tanggal <SortIcon field="date" currentField={sortField} direction={sortDirection} />
                  </div>
                </TableHead>
                <TableHead
                  className="font-bold text-slate-500 cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => onSort('mapelName')}
                >
                  <div className="flex items-center gap-1 text-[11px]">
                    Mata Pelajaran{' '}
                    <SortIcon field="mapelName" currentField={sortField} direction={sortDirection} />
                  </div>
                </TableHead>
                <TableHead className="font-bold text-slate-500 text-[11px]">Widyaiswara</TableHead>
                <TableHead
                  className="font-bold text-slate-500 cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => onSort('format')}
                >
                  <div className="flex items-center gap-1 text-[11px]">
                    Format & Ruangan{' '}
                    <SortIcon field="format" currentField={sortField} direction={sortDirection} />
                  </div>
                </TableHead>
                <TableHead
                  className="font-bold text-slate-500 cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => onSort('jpCount')}
                >
                  <div className="flex items-center gap-1 text-[11px]">
                    JP <SortIcon field="jpCount" currentField={sortField} direction={sortDirection} />
                  </div>
                </TableHead>
                <TableHead className="pr-6 text-right font-bold text-slate-500 text-[11px]">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSessions.map(session => {
                const mapel = activeMapels.find(m => m.id === session.mapelId);
                const resolvedWis = (session.wiIds || [])
                  .map((id: string) => activeWis.find(w => w.id === id))
                  .filter(Boolean) as Widyaiswara[];
                const wiNames = resolvedWis.map(w => `${w.name}, ${w.gelar}`).join(', ');
                const lok = activeLokasis.find(l => l.id === session.lokasiId);

                return (
                  <TableRow key={session.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="pl-6 font-semibold text-slate-800 text-xs py-3">
                      {new Date(session.date).toLocaleDateString('id-ID', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
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
        )}
      </CardContent>
    </Card>
  );
}