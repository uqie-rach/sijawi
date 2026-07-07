"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useWTMS } from '@/context/wtms-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Combobox } from '@/components/ui/combobox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Calendar, Clock, MapPin, UserCheck, Plus, Trash2, Edit, CalendarDays, TableProperties, Layers, ChevronLeft, ChevronRight, Zap, Filter, ArrowUpDown, ArrowUp, ArrowDown, X } from 'lucide-react';

interface SchedulingWorkspaceClientProps {
  batchId?: string;
  initialBatch?: any;
  initialMapels: any[];
  initialWis: any[];
  initialLokasis: any[];
  initialSessions: any[];
  allBatches: any[];
}

// Enum untuk field sorting
type SortField = 'date' | 'startTime' | 'jpCount' | 'mapelName' | 'format';
type SortDirection = 'asc' | 'desc';

export function SchedulingWorkspaceClient({
  batchId,
  initialBatch,
  initialMapels,
  initialWis,
  initialLokasis,
  initialSessions,
  allBatches,
}: SchedulingWorkspaceClientProps) {
  const router = useRouter();
  const {
    widyaswaras,
    kategoriList,
    mapelList,
    lokasiList,
    batches,
    sessions,
    addSession,
    updateSession,
    deleteSession,
  } = useWTMS();

  const [viewMode, setViewMode] = useState<'calendar' | 'day' | 'table'>('table');

  const activeBatch = batchId ? (batches.find(b => b.id === batchId) || initialBatch) : null;
  const batchStartDate = activeBatch ? new Date(activeBatch.startDate) : new Date(2026, 0, 31);
  const [selectedDayDate, setSelectedDayDate] = useState<string>(activeBatch?.startDate || '2026-01-31');
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date(batchStartDate.getFullYear(), batchStartDate.getMonth(), 1));

  const activeMapels = mapelList.length ? mapelList : initialMapels;
  const activeWis = widyaswaras.length ? widyaswaras : initialWis;
  const activeLokasis = lokasiList.length ? lokasiList : initialLokasis;
  const activeSessions = sessions.length ? sessions : initialSessions;

  const batchSessions = batchId
    ? activeSessions.filter(s => s.batchId === batchId)
    : activeSessions;

  // =================== FILTER & SORT STATE ===================
  const [filterDateStart, setFilterDateStart] = useState<string>('');
  const [filterDateEnd, setFilterDateEnd] = useState<string>('');
  const [filterFormats, setFilterFormats] = useState<string[]>([]);
  const [filterWIIds, setFilterWIIds] = useState<string[]>([]);
  const [filterMapelIds, setFilterMapelIds] = useState<string[]>([]);
  const [filterLokasiIds, setFilterLokasiIds] = useState<string[]>([]);
  const [filterJpMin, setFilterJpMin] = useState<string>('');
  const [filterJpMax, setFilterJpMax] = useState<string>('');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [showFilterBar, setShowFilterBar] = useState(false);

  // Toggle format filter
  const toggleFormatFilter = (format: string) => {
    setFilterFormats(prev =>
      prev.includes(format) ? prev.filter(f => f !== format) : [...prev, format]
    );
  };

  // Toggle WI filter
  const toggleWIFilter = (wiId: string) => {
    setFilterWIIds(prev =>
      prev.includes(wiId) ? prev.filter(id => id !== wiId) : [...prev, wiId]
    );
  };

  // Toggle Mapel filter
  const toggleMapelFilter = (mapelId: string) => {
    setFilterMapelIds(prev =>
      prev.includes(mapelId) ? prev.filter(id => id !== mapelId) : [...prev, mapelId]
    );
  };

  // Toggle Lokasi filter
  const toggleLokasiFilter = (lokId: string) => {
    setFilterLokasiIds(prev =>
      prev.includes(lokId) ? prev.filter(id => id !== lokId) : [...prev, lokId]
    );
  };

  // Reset semua filter
  const resetAllFilters = () => {
    setFilterDateStart('');
    setFilterDateEnd('');
    setFilterFormats([]);
    setFilterWIIds([]);
    setFilterMapelIds([]);
    setFilterLokasiIds([]);
    setFilterJpMin('');
    setFilterJpMax('');
    setSortField('date');
    setSortDirection('asc');
  };

  // Hitung jumlah filter aktif
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filterDateStart) count++;
    if (filterDateEnd) count++;
    if (filterFormats.length > 0) count++;
    if (filterWIIds.length > 0) count++;
    if (filterMapelIds.length > 0) count++;
    if (filterLokasiIds.length > 0) count++;
    if (filterJpMin) count++;
    if (filterJpMax) count++;
    return count;
  }, [filterDateStart, filterDateEnd, filterFormats, filterWIIds, filterMapelIds, filterLokasiIds, filterJpMin, filterJpMax]);

  // Handle sort toggle
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Render sort icon
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-3 w-3 text-slate-400 ml-1" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="h-3 w-3 text-blue-600 ml-1" />
      : <ArrowDown className="h-3 w-3 text-blue-600 ml-1" />;
  };

  // Filtered & Sorted Sessions
  const filteredAndSortedSessions = useMemo(() => {
    let result = [...batchSessions];

    // Filter by date start
    if (filterDateStart) {
      result = result.filter(s => s.date >= filterDateStart);
    }

    // Filter by date end
    if (filterDateEnd) {
      result = result.filter(s => s.date <= filterDateEnd);
    }

    // Filter by formats
    if (filterFormats.length > 0) {
      result = result.filter(s => filterFormats.includes(s.format));
    }

    // Filter by Widyaiswara IDs
    if (filterWIIds.length > 0) {
      result = result.filter(s => 
        (s.wiIds || []).some(id => filterWIIds.includes(id))
      );
    }

    // Filter by Mapel IDs
    if (filterMapelIds.length > 0) {
      result = result.filter(s => filterMapelIds.includes(s.mapelId));
    }

    // Filter by Lokasi IDs
    if (filterLokasiIds.length > 0) {
      result = result.filter(s => filterLokasiIds.includes(s.lokasiId || ''));
    }

    // Filter by JP min
    if (filterJpMin) {
      const min = parseInt(filterJpMin);
      if (!isNaN(min)) {
        result = result.filter(s => s.jpCount >= min);
      }
    }

    // Filter by JP max
    if (filterJpMax) {
      const max = parseInt(filterJpMax);
      if (!isNaN(max)) {
        result = result.filter(s => s.jpCount <= max);
      }
    }

    // Sorting
    result.sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'date':
          comparison = a.date.localeCompare(b.date);
          break;
        case 'startTime':
          comparison = a.startTime.localeCompare(b.startTime);
          break;
        case 'jpCount':
          comparison = a.jpCount - b.jpCount;
          break;
        case 'mapelName': {
          const mapelA = activeMapels.find(m => m.id === a.mapelId);
          const mapelB = activeMapels.find(m => m.id === b.mapelId);
          const nameA = mapelA?.name || '';
          const nameB = mapelB?.name || '';
          comparison = nameA.localeCompare(nameB);
          break;
        }
        case 'format':
          comparison = a.format.localeCompare(b.format);
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [batchSessions, filterDateStart, filterDateEnd, filterFormats, filterWIIds, filterMapelIds, filterLokasiIds, filterJpMin, filterJpMax, sortField, sortDirection, activeMapels]);

  const [sessionForm, setSessionForm] = useState({
    batchId: batchId || '',
    mapelId: '',
    wiIds: [] as string[],
    date: activeBatch?.startDate || '2026-01-31',
    startTime: '08:00',
    endTime: '09:30',
    format: 'Klasikal' as 'Klasikal' | 'Virtual' | 'Asinkron',
    lokasiId: '',
    jpKe: '1-2',
    jpCount: '2'
  });

  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({
    open: false,
    title: '',
    description: '',
    onConfirm: () => { }
  });

  useEffect(() => {
    if (typeof window !== 'undefined' && !editingSessionId) {
      const draft = localStorage.getItem('draft_sessionForm');
      if (draft) {
        setSessionForm(JSON.parse(draft));
      }
    }
  }, [editingSessionId]);

  const updateForm = (fields: Partial<typeof sessionForm>) => {
    const newVal = { ...sessionForm, ...fields };
    setSessionForm(newVal);
    if (!editingSessionId) {
      localStorage.setItem('draft_sessionForm', JSON.stringify(newVal));
    }
  };

  useEffect(() => {
    if (sessionForm.startTime && sessionForm.jpCount) {
      const [h, m] = sessionForm.startTime.split(':').map(Number);
      const totalMinutes = h * 60 + m + parseInt(sessionForm.jpCount) * 45;
      const endH = Math.floor(totalMinutes / 60) % 24;
      const endM = totalMinutes % 60;
      const endStr = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
      if (sessionForm.endTime !== endStr) {
        setSessionForm(prev => ({ ...prev, endTime: endStr }));
      }
    }
  }, [sessionForm.startTime, sessionForm.jpCount]);

  const currentBatchSelectionId = batchId || sessionForm.batchId;
  const currentBatchObj = batches.find(b => b.id === currentBatchSelectionId) || (currentBatchSelectionId === initialBatch?.id ? initialBatch : null);
  const currentCategory = currentBatchObj ? kategoriList.find(k => k.id === currentBatchObj.kategoriId) : null;

  const filteredMapels = currentBatchObj
    ? activeMapels.filter(m => m.kategoriId === currentBatchObj.kategoriId)
    : activeMapels;

  const filteredWisList = currentCategory
    ? activeWis.filter(wi => wi.level >= currentCategory.minWeight)
    : activeWis;

  const trackingMapelStatus = filteredMapels.map(mapel => {
    const scheduledSessions = activeSessions.filter(s => s.batchId === currentBatchSelectionId && s.mapelId === mapel.id);
    const scheduledJp = scheduledSessions.reduce((sum, s) => sum + Number(s.jpCount), 0);
    const remainingJp = Math.max(0, Number(mapel.jpTotal) - scheduledJp);
    return {
      ...mapel,
      scheduledJp,
      remainingJp,
      isFullyScheduled: remainingJp <= 0
    };
  });

  const triggerConfirmation = (title: string, description: string, onConfirm: () => void) => {
    setConfirmDialog({
      open: true,
      title,
      description,
      onConfirm
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetBatchId = currentBatchSelectionId;
    if (!targetBatchId || !sessionForm.mapelId || sessionForm.wiIds.length === 0) {
      return;
    }

    const performSave = () => {
      const payload = {
        batchId: targetBatchId,
        mapelId: sessionForm.mapelId,
        wiIds: sessionForm.wiIds,
        wiId: sessionForm.wiIds[0],
        date: sessionForm.date,
        startTime: sessionForm.startTime,
        endTime: sessionForm.endTime,
        format: sessionForm.format,
        lokasiId: sessionForm.format === 'Klasikal' ? sessionForm.lokasiId : undefined,
        jpKe: sessionForm.jpKe,
        jpCount: parseInt(sessionForm.jpCount)
      };

      if (editingSessionId) {
        const res = updateSession(editingSessionId, payload as any);
        if (res.success) {
          setIsDialogOpen(false);
          setEditingSessionId(null);
        }
      } else {
        const res = addSession(payload as any);
        if (res.success) {
          localStorage.removeItem('draft_sessionForm');
          setIsDialogOpen(false);
        }
      }
    };

    if (editingSessionId) {
      triggerConfirmation(
        "Konfirmasi Perubahan Jadwal",
        "Apakah Anda yakin ingin memperbarui alokasi sesi ini?",
        performSave
      );
    } else {
      performSave();
    }
  };

  const triggerEdit = (session: any) => {
    setEditingSessionId(session.id);
    setSessionForm({
      batchId: session.batchId,
      mapelId: session.mapelId,
      wiIds: session.wiIds || [session.wiId].filter(Boolean),
      date: session.date,
      startTime: session.startTime,
      endTime: session.endTime,
      format: session.format,
      lokasiId: session.lokasiId || '',
      jpKe: session.jpKe,
      jpCount: String(session.jpCount)
    });
    setIsDialogOpen(true);
  };

  const isLocationClashed = (lokId: string) => {
    if (sessionForm.format !== 'Klasikal' || !sessionForm.date || !sessionForm.startTime || !sessionForm.endTime) return false;
    return activeSessions.some(s =>
      s.id !== editingSessionId &&
      s.format === 'Klasikal' &&
      s.lokasiId === lokId &&
      s.date === sessionForm.date &&
      (
        (sessionForm.startTime >= s.startTime && sessionForm.startTime < s.endTime) ||
        (sessionForm.endTime > s.startTime && sessionForm.endTime <= s.endTime) ||
        (sessionForm.startTime <= s.startTime && sessionForm.endTime >= s.endTime)
      )
    );
  };

  const mapelOptions = filteredMapels.map(m => {
    const statusObj = trackingMapelStatus.find(status => status.id === m.id);
    const isExceeded = statusObj ? statusObj.isFullyScheduled : false;
    return {
      value: m.id,
      label: `${m.name} (${m.jpTotal} JP) ${isExceeded ? ' - [Kapasitas Terpenuhi]' : ''}`,
      disabled: isExceeded
    };
  });

  const lokasiOptions = activeLokasis.map(l => {
    const clashed = isLocationClashed(l.id);
    return {
      value: l.id,
      label: `${l.name} ${clashed ? ' - [Bentrok Terdeteksi]' : ''}`,
      disabled: clashed
    };
  });

  const batchOptions = allBatches.map(b => ({
    value: b.id,
    label: b.name
  }));

  const year = calendarMonth.getFullYear();
  const month = calendarMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const calendarDaysList: (Date | null)[] = [];
  for (let i = 0; i < firstDayIndex; i++) {
    calendarDaysList.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDaysList.push(new Date(year, month, i));
  }

  const formatDateString = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const getMonthName = (monthIdx: number) => {
    return [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ][monthIdx];
  };

  return (
    <div className="grid lg:grid-cols-4 gap-8 animate-in fade-in duration-200">
      {/* Sidebar Navigation */}
      <div className="space-y-6 lg:col-span-1">
        {allBatches && allBatches.length > 0 && (
          <Card className="shadow-sm border-slate-200 bg-white">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-blue-600">
                <Layers className="h-4 w-4 text-blue-600" />
                Navigasi Angkatan
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <div className="space-y-1 max-h-[220px] overflow-y-auto pr-1">
                {allBatches.map(b => (
                  <button
                    key={b.id}
                    onClick={() => router.push(`/admin/scheduling/${b.id}`)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${b.id === batchId
                      ? 'bg-blue-50 text-blue-600 border border-blue-200'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                  >
                    <span className="truncate max-w-[130px]">{b.name}</span>
                    <span className="text-[9px] opacity-75">{b.startDate}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Smart JP Tracking Sidebar Widget */}
        {currentBatchSelectionId && (
          <Card className="shadow-sm border-slate-200 bg-white">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-3">
              <CardTitle className="text-sm font-bold text-blue-600">Pelacak Alokasi JP</CardTitle>
              <CardDescription>Sisa kapasitas untuk kategori terpilih.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-3 max-h-[300px] overflow-y-auto">
              {trackingMapelStatus.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">Tidak ada mata pelajaran terdaftar.</p>
              ) : (
                trackingMapelStatus.map(m => (
                  <div key={m.id} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-700 truncate max-w-[120px]" title={m.name}>{m.name}</span>
                      <span className="text-[10px] font-bold text-slate-500">{m.scheduledJp}/{m.jpTotal} JP</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={(m.scheduledJp / m.jpTotal) * 100} className="h-1.5 flex-1 bg-slate-100" />
                      {m.isFullyScheduled ? (
                        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[9px] font-bold">Selesai</Badge>
                      ) : (
                        <span className="text-[9px] font-bold text-slate-500">sisa {m.remainingJp}</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Main Workspace Workspace */}
      <div className="lg:col-span-3 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${viewMode === 'table' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              <TableProperties className="h-3.5 w-3.5" />
              Matriks Tabel
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${viewMode === 'calendar' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              <CalendarDays className="h-3.5 w-3.5" />
              Tampilan Kalender
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${viewMode === 'day' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              <Clock className="h-3.5 w-3.5" />
              Lini Masa Hari
            </button>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingSessionId(null);
                setSessionForm({
                  batchId: batchId || '',
                  mapelId: '',
                  wiIds: [],
                  date: activeBatch?.startDate || '2026-01-31',
                  startTime: '08:00',
                  endTime: '09:30',
                  format: 'Klasikal',
                  lokasiId: '',
                  jpKe: '1-2',
                  jpCount: '2'
                });
              }} className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 text-xs font-semibold py-5 px-4 shadow-md shadow-blue-100">
                <Plus className="h-4 w-4" /> Alokasikan Sesi Jadwal
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white max-w-4xl p-0 overflow-hidden">
              <DialogHeader className="p-6 pb-0">
                <DialogTitle className="text-xl font-bold text-blue-600">
                  {editingSessionId ? 'Edit Alokasi Sesi' : 'Alokasikan Sesi Baru'}
                </DialogTitle>
                <DialogDescription>Atur pemetaan instruktur, batasan ketersediaan ruang kelas, dan parameter operasional.</DialogDescription>
              </DialogHeader>

              <div className="grid md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-slate-100 p-6 gap-6">
                {/* Form Inputs (3 Cols) */}
                <form onSubmit={handleSubmit} className="md:col-span-3 space-y-4">
                  {!batchId && (
                    <div className="space-y-1">
                      <Label>Angkatan Pelatihan</Label>
                      <Combobox options={batchOptions} value={sessionForm.batchId} onValueChange={val => updateForm({ batchId: val })} placeholder="Pilih angkatan..." />
                    </div>
                  )}

                  <div className="space-y-1">
                    <Label>Mata Pelatihan (Mapel)</Label>
                    <Combobox options={mapelOptions} value={sessionForm.mapelId} onValueChange={val => updateForm({ mapelId: val })} placeholder="Cari mata pelajaran..." />
                  </div>

                  {/* Multi-WI Search check badging element implemented! */}
                  <div className="space-y-2 border border-slate-100 p-3.5 rounded-xl bg-slate-50/50">
                    <Label className="text-xs font-bold text-blue-900 block mb-1">Daftar Pengajar (Multi-Select Widyaiswara)</Label>
                    <div className="grid grid-cols-2 gap-2 max-h-[140px] overflow-y-auto">
                      {filteredWisList.map(wi => {
                        const isChecked = sessionForm.wiIds.includes(wi.id);
                        return (
                          <label key={wi.id} className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer hover:bg-slate-100 p-1.5 rounded transition-colors">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                const newVal = isChecked
                                  ? sessionForm.wiIds.filter(id => id !== wi.id)
                                  : [...sessionForm.wiIds, wi.id];
                                updateForm({ wiIds: newVal });
                              }}
                              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                            />
                            <span className="truncate">{wi.name}, {wi.gelar}</span>
                          </label>
                        );
                      })}
                    </div>
                    {sessionForm.wiIds.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1.5 border-t border-slate-200">
                        {sessionForm.wiIds.map(val => {
                          const opt = activeWis.find(o => o.id === val);
                          if (!opt) return null;
                          return (
                            <Badge key={val} variant="secondary" className="bg-blue-50 text-blue-800 border-blue-100 hover:bg-blue-100 flex items-center gap-1 text-[10px] font-bold rounded-lg shadow-sm">
                              <span>{opt.name}</span>
                            </Badge>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1 relative">
                      <Label>Tanggal</Label>
                      <div className="flex gap-1">
                        <Input type="date" min={activeBatch?.startDate} max={activeBatch?.endDate} value={sessionForm.date} onChange={e => updateForm({ date: e.target.value })} required className="pr-1 text-xs" />
                        <Button type="button" variant="outline" size="icon" onClick={() => updateForm({ date: new Date().toISOString().split('T')[0] })} title="Pintasan Hari Ini" className="h-9 w-9 shrink-0 border-blue-200 hover:bg-blue-50 text-blue-600">
                          <Zap className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label>Waktu Mulai</Label>
                      <Input type="time" value={sessionForm.startTime} onChange={e => updateForm({ startTime: e.target.value })} required />
                    </div>
                    <div className="space-y-1">
                      <Label>Waktu Selesai</Label>
                      <Input type="time" value={sessionForm.endTime} disabled className="bg-slate-100/80 text-slate-500 font-mono" />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <Label>Format</Label>
                      <Select value={sessionForm.format} onValueChange={(val: any) => updateForm({ format: val })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="Klasikal">Klasikal</SelectItem>
                          <SelectItem value="Virtual">Virtual</SelectItem>
                          <SelectItem value="Asinkron">Asinkron</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label>JP Ke</Label>
                      <Input placeholder="1-2" value={sessionForm.jpKe} onChange={e => updateForm({ jpKe: e.target.value })} required />
                    </div>
                    <div className="space-y-1">
                      <Label>Jumlah JP</Label>
                      <Select value={sessionForm.jpCount} onValueChange={val => updateForm({ jpCount: val })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="1">1 JP</SelectItem>
                          <SelectItem value="2">2 JP</SelectItem>
                          <SelectItem value="3">3 JP</SelectItem>
                          <SelectItem value="4">4 JP</SelectItem>
                          <SelectItem value="5">5 JP</SelectItem>
                          <SelectItem value="6">6 JP</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {sessionForm.format === 'Klasikal' && (
                    <div className="space-y-1">
                      <Label>Lokasi / Ruangan</Label>
                      <Combobox options={lokasiOptions} value={sessionForm.lokasiId} onValueChange={val => updateForm({ lokasiId: val })} placeholder="Cari lokasi..." />
                    </div>
                  )}

                  <DialogFooter className="pt-2">
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white w-full py-5 text-sm font-semibold">
                      Simpan Alokasi Sesi
                    </Button>
                  </DialogFooter>
                </form>

                {/* Real-time JP Tracking Widget (2 Cols) */}
                <div className="md:col-span-2 pl-4 space-y-4">
                  <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Sisa Kapasitas Belum Dialokasikan</h4>
                  <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
                    {trackingMapelStatus.map(status => (
                      <div key={status.id} className="text-xs space-y-1">
                        <div className="flex justify-between font-medium">
                          <span className="truncate max-w-[140px] text-slate-700" title={status.name}>{status.name}</span>
                          <span className="text-slate-500 font-bold">{status.scheduledJp}/{status.jpTotal} JP</span>
                        </div>
                        <Progress value={(status.scheduledJp / status.jpTotal) * 100} className="h-1 bg-slate-100" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* View Layout Switch Components */}
        {viewMode === 'calendar' && (
          <Card className="shadow-sm border-slate-200 bg-white">
            <CardHeader className="border-b border-slate-100 flex flex-row justify-between items-center bg-slate-50/50 px-6 py-4">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-blue-600">
                <CalendarDays className="h-4.5 w-4.5 text-blue-600" />
                Tampilan Kalender Bulanan Aktif {batchId ? `(Angkatan: ${activeBatch?.name})` : '(Semua Angkatan)'}
              </CardTitle>
              <div className="flex items-center gap-3">
                <button onClick={() => setCalendarMonth(new Date(year, month - 1, 1))} className="p-1 rounded border border-slate-200 hover:bg-slate-50">
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <span className="text-xs font-bold text-slate-700 min-w-[100px] text-center">
                  {getMonthName(month)} {year}
                </span>
                <button onClick={() => setCalendarMonth(new Date(year, month + 1, 1))} className="p-1 rounded border border-slate-200 hover:bg-slate-50">
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 uppercase mb-2">
                <div>Min</div><div>Sen</div><div>Sel</div><div>Rab</div><div>Kam</div><div>Jum</div><div>Sab</div>
              </div>
              <div className="grid grid-cols-7 gap-1.5 min-h-[300px]">
                {calendarDaysList.map((day, index) => {
                  if (!day) return <div key={`empty-${index}`} className="bg-slate-50/40 rounded border border-slate-100/50"></div>;
                  const dateStr = formatDateString(day);
                  const dayEvents = batchSessions.filter(s => s.date === dateStr);
                  const isDayInBatchRange = batchId ? (dateStr >= activeBatch?.startDate && dateStr <= activeBatch?.endDate) : true;

                  return (
                    <div
                      key={dateStr}
                      onClick={() => {
                        setSelectedDayDate(dateStr);
                        setViewMode('day');
                      }}
                      className={`min-h-[75px] border rounded p-1.5 flex flex-col justify-between transition-all cursor-pointer ${isDayInBatchRange
                        ? 'bg-white border-slate-200 hover:border-blue-400 hover:bg-slate-50/30'
                        : 'bg-slate-50/50 border-slate-100 opacity-40 hover:bg-slate-100/40'
                        }`}
                    >
                      <span className={`text-[11px] font-extrabold ${isDayInBatchRange ? 'text-slate-800' : 'text-slate-400'}`}>
                        {day.getDate()}
                      </span>
                      <div className="space-y-1 max-h-[50px] overflow-y-auto">
                        {dayEvents.map(ev => {
                          const mapel = activeMapels.find(m => m.id === ev.mapelId);
                          return (
                            <div
                              key={ev.id}
                              onClick={(e) => { e.stopPropagation(); triggerEdit(ev); }}
                              className={`text-[9px] px-1 py-0.5 rounded truncate font-medium border ${ev.format === 'Klasikal' ? 'bg-blue-50 text-blue-800 border-blue-100' :
                                ev.format === 'Virtual' ? 'bg-purple-50 text-purple-800 border-purple-100' :
                                  'bg-amber-50 text-amber-800 border-amber-100'
                                }`}
                              title={`${mapel?.name || 'Mata Pelajaran'} (${ev.startTime} - ${ev.endTime})`}
                            >
                              {mapel?.name || 'Mata Pelajaran'}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {viewMode === 'day' && (
          <Card className="shadow-sm border-slate-200 bg-white">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 py-4">
              <div>
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-blue-600">
                  <Clock className="h-4 w-4 text-blue-600" />
                  Tampilan Lini Masa Jam Detail
                </CardTitle>
                <CardDescription className="text-xs">Periksa alokasi jam operasional secara berdampingan.</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-xs font-bold text-slate-500 whitespace-nowrap">Pilih Tanggal:</Label>
                <Input type="date" min={activeBatch?.startDate} max={activeBatch?.endDate} value={selectedDayDate} onChange={e => setSelectedDayDate(e.target.value)} className="h-8 py-0 px-2 text-xs w-[140px]" />
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {batchSessions.filter(s => s.date === selectedDayDate).length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Calendar className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                  <p className="text-xs font-semibold">Tidak ada sesi yang dijadwalkan pada {selectedDayDate}.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {batchSessions.filter(s => s.date === selectedDayDate).map(session => {
                    const mapel = activeMapels.find(m => m.id === session.mapelId);

                    // Unpack multi-WI names
                    const resolvedWis = (session.wiIds || []).map((id: any) => activeWis.find(w => w.id === id)).filter(Boolean);
                    const wiNames = resolvedWis.map((w: { name: any; gelar: any; }) => `${w.name}, ${w.gelar}`).join(', ');

                    const lok = activeLokasis.find(l => l.id === session.lokasiId);

                    return (
                      <div key={session.id} className="p-4 border border-slate-100 rounded-xl bg-slate-50/50 hover:border-blue-200 transition-all flex justify-between items-center">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge className={`text-[9px] font-bold ${session.format === 'Klasikal' ? 'bg-blue-100 text-blue-800' :
                              session.format === 'Virtual' ? 'bg-purple-100 text-purple-800' :
                                'bg-amber-100 text-amber-800'
                              }`}>
                              {session.format}
                            </Badge>
                            <span className="text-xs font-extrabold text-slate-600 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {session.startTime} - {session.endTime} ({session.jpCount} JP, JP ke: {session.jpKe})
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-900">{mapel?.name}</h4>
                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            <span className="flex items-start gap-1">
                              <UserCheck className="h-3.5 w-3.5 text-slate-400 mt-0.5 shrink-0" />
                              <span>Widyaiswara: <strong>{wiNames || 'Tidak Diketahui'}</strong></span>
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5 text-slate-400" />
                              Ruangan: <strong>{session.format === 'Klasikal' ? (lok?.name || 'Ruangan') : session.format}</strong>
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button size="icon" variant="ghost" onClick={() => triggerEdit(session)} className="text-blue-600">
                            <Edit className="h-4.5 w-4.5" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => {
                            triggerConfirmation(
                              "Hapus Sesi Terjadwal",
                              "Apakah Anda yakin ingin menghapus sesi terjadwal ini secara permanen?",
                              () => deleteSession(session.id)
                            );
                          }} className="text-red-500">
                            <Trash2 className="h-4.5 w-4.5" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {viewMode === 'table' && (
          <Card className="shadow-sm border-slate-200 bg-white">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-4 px-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-blue-600">
                  <TableProperties className="h-4.5 w-4.5 text-blue-600" />
                  Matriks Tabel Jadwal Sesi
                </CardTitle>

                {/* Filter Toggle Button */}
                <div className="flex items-center gap-2">
                  <Button
                    variant={showFilterBar ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowFilterBar(!showFilterBar)}
                    className={`text-xs font-semibold gap-1.5 ${showFilterBar ? 'bg-blue-600 text-white' : 'border-slate-200 text-slate-600'}`}
                  >
                    <Filter className="h-3.5 w-3.5" />
                    Filter {activeFilterCount > 0 && <span className="bg-white text-blue-600 rounded-full h-4.5 w-4.5 text-[10px] flex items-center justify-center font-bold">{activeFilterCount}</span>}
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

              {/* Advanced Filter Bar */}
              {showFilterBar && (
                <div className="mt-4 p-4 bg-slate-50/80 border border-slate-200 rounded-xl space-y-4 animate-in slide-in-from-top-2 duration-200">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {/* Rentang Tanggal */}
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold uppercase text-slate-500">Tanggal Mulai</Label>
                      <Input
                        type="date"
                        min={activeBatch?.startDate}
                        max={activeBatch?.endDate}
                        value={filterDateStart}
                        onChange={e => setFilterDateStart(e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold uppercase text-slate-500">Tanggal Akhir</Label>
                      <Input
                        type="date"
                        min={activeBatch?.startDate}
                        max={activeBatch?.endDate}
                        value={filterDateEnd}
                        onChange={e => setFilterDateEnd(e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>

                    {/* Filter Format */}
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold uppercase text-slate-500">Format</Label>
                      <div className="flex flex-wrap gap-1.5">
                        {['Klasikal', 'Virtual', 'Asinkron'].map(format => {
                          const isActive = filterFormats.includes(format);
                          return (
                            <button
                              key={format}
                              onClick={() => toggleFormatFilter(format)}
                              className={`px-2 py-0.5 text-[10px] font-bold rounded border transition-all ${
                                isActive
                                  ? 'bg-blue-50 text-blue-600 border-blue-200 shadow-sm'
                                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                              }`}
                            >
                              {format}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Filter JP Range */}
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold uppercase text-slate-500">Rentang JP</Label>
                      <div className="flex items-center gap-1.5">
                        <Input
                          type="number"
                          placeholder="Min"
                          min="1"
                          max="10"
                          value={filterJpMin}
                          onChange={e => setFilterJpMin(e.target.value)}
                          className="h-8 w-16 text-xs"
                        />
                        <span className="text-xs text-slate-400">-</span>
                        <Input
                          type="number"
                          placeholder="Max"
                          min="1"
                          max="10"
                          value={filterJpMax}
                          onChange={e => setFilterJpMax(e.target.value)}
                          className="h-8 w-16 text-xs"
                        />
                      </div>
                    </div>

                    {/* Filter Lokasi */}
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold uppercase text-slate-500">Lokasi</Label>
                      <div className="flex flex-wrap gap-1 max-h-[60px] overflow-y-auto">
                        {activeLokasis.map(lok => {
                          const isActive = filterLokasiIds.includes(lok.id);
                          return (
                            <button
                              key={lok.id}
                              onClick={() => toggleLokasiFilter(lok.id)}
                              className={`px-2 py-0.5 text-[9px] font-bold rounded border transition-all ${
                                isActive
                                  ? 'bg-blue-50 text-blue-600 border-blue-200 shadow-sm'
                                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                              }`}
                              title={lok.name}
                            >
                              {lok.name.length > 12 ? lok.name.substring(0, 12) + '...' : lok.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Filter Widyaiswara */}
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold uppercase text-slate-500">Widyaiswara</Label>
                      <div className="flex flex-wrap gap-1 max-h-[60px] overflow-y-auto">
                        {activeWis.map(wi => {
                          const isActive = filterWIIds.includes(wi.id);
                          return (
                            <button
                              key={wi.id}
                              onClick={() => toggleWIFilter(wi.id)}
                              className={`px-2 py-0.5 text-[9px] font-bold rounded border transition-all ${
                                isActive
                                  ? 'bg-blue-50 text-blue-600 border-blue-200 shadow-sm'
                                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                              }`}
                              title={wi.name}
                            >
                              {wi.name.length > 15 ? wi.name.substring(0, 15) + '...' : wi.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Filter Mapel */}
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold uppercase text-slate-500">Mata Pelajaran</Label>
                      <div className="flex flex-wrap gap-1 max-h-[60px] overflow-y-auto">
                        {activeMapels.map(mapel => {
                          const isActive = filterMapelIds.includes(mapel.id);
                          return (
                            <button
                              key={mapel.id}
                              onClick={() => toggleMapelFilter(mapel.id)}
                              className={`px-2 py-0.5 text-[9px] font-bold rounded border transition-all ${
                                isActive
                                  ? 'bg-blue-50 text-blue-600 border-blue-200 shadow-sm'
                                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                              }`}
                              title={mapel.name}
                            >
                              {mapel.name.length > 15 ? mapel.name.substring(0, 15) + '...' : mapel.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Active Filter Badges */}
                  {activeFilterCount > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-200">
                      <span className="text-[9px] font-bold text-slate-400">Filter Aktif:</span>
                      {filterDateStart && (
                        <Badge variant="secondary" className="text-[9px] bg-blue-50 text-blue-600 border-blue-200">
                          Dari {filterDateStart}
                        </Badge>
                      )}
                      {filterDateEnd && (
                        <Badge variant="secondary" className="text-[9px] bg-blue-50 text-blue-600 border-blue-200">
                          Sampai {filterDateEnd}
                        </Badge>
                      )}
                      {filterFormats.map(f => (
                        <Badge key={f} variant="secondary" className="text-[9px] bg-purple-50 text-purple-600 border-purple-200">
                          {f}
                        </Badge>
                      ))}
                      {filterWIIds.length > 0 && (
                        <Badge variant="secondary" className="text-[9px] bg-emerald-50 text-emerald-600 border-emerald-200">
                          {filterWIIds.length} WI
                        </Badge>
                      )}
                      {filterMapelIds.length > 0 && (
                        <Badge variant="secondary" className="text-[9px] bg-amber-50 text-amber-600 border-amber-200">
                          {filterMapelIds.length} Mapel
                        </Badge>
                      )}
                      {filterLokasiIds.length > 0 && (
                        <Badge variant="secondary" className="text-[9px] bg-sky-50 text-sky-600 border-sky-200">
                          {filterLokasiIds.length} Lokasi
                        </Badge>
                      )}
                      {(filterJpMin || filterJpMax) && (
                        <Badge variant="secondary" className="text-[9px] bg-rose-50 text-rose-600 border-rose-200">
                          JP: {filterJpMin || '1'}-{filterJpMax || '10'}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Hasil Filter Counter */}
              {showFilterBar && (
                <div className="mt-3 text-[10px] font-bold text-slate-500">
                  Menampilkan {filteredAndSortedSessions.length} dari {batchSessions.length} sesi
                  {activeFilterCount > 0 && ' (difilter)'}
                </div>
              )}
            </CardHeader>
            <CardContent className="p-0">
              {filteredAndSortedSessions.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Filter className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                  <p className="text-xs font-semibold">
                    {showFilterBar && activeFilterCount > 0
                      ? 'Tidak ada sesi yang cocok dengan filter yang diterapkan.'
                      : 'Belum ada sesi yang dialokasikan.'}
                  </p>
                  {showFilterBar && activeFilterCount > 0 && (
                    <Button
                      variant="link"
                      size="sm"
                      onClick={resetAllFilters}
                      className="text-blue-600 text-xs mt-2"
                    >
                      Reset Semua Filter
                    </Button>
                  )}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/40">
                      <TableHead className="pl-6 text-xs font-bold uppercase text-slate-500 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('date')}>
                        <div className="flex items-center gap-1">
                          Tanggal <SortIcon field="date" />
                        </div>
                      </TableHead>
                      <TableHead className="text-xs font-bold uppercase text-slate-500 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('mapelName')}>
                        <div className="flex items-center gap-1">
                          Mata Pelajaran (Mapel) <SortIcon field="mapelName" />
                        </div>
                      </TableHead>
                      <TableHead className="text-xs font-bold uppercase text-slate-500">
                        Widyaiswara
                      </TableHead>
                      <TableHead className="text-xs font-bold uppercase text-slate-500 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('format')}>
                        <div className="flex items-center gap-1">
                          Format & Ruangan <SortIcon field="format" />
                        </div>
                      </TableHead>
                      <TableHead className="text-xs font-bold uppercase text-slate-500 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('jpCount')}>
                        <div className="flex items-center gap-1">
                          JP Ke & Jumlah JP <SortIcon field="jpCount" />
                        </div>
                      </TableHead>
                      <TableHead className="pr-6 text-right text-xs font-bold uppercase text-slate-500">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAndSortedSessions.map(session => {
                      const mapel = activeMapels.find(m => m.id === session.mapelId);

                      // Unpack multiple Widyaiswaras with titles
                      const resolvedWis = (session.wiIds || []).map((id: any) => activeWis.find(w => w.id === id)).filter(Boolean);
                      const wiNames = resolvedWis.map((w: { name: any; gelar: any; }) => `${w.name}, ${w.gelar}`).join(', ');

                      const lok = activeLokasis.find(l => l.id === session.lokasiId);

                      return (
                        <TableRow key={session.id} className="hover:bg-slate-50/30 transition-colors">
                          <TableCell className="pl-6 font-semibold text-slate-900 text-xs">
                            <div className="flex items-center gap-1.5">
                              {new Date(session.date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold text-slate-900 text-xs">{mapel?.name}</TableCell>
                          <TableCell className="text-xs text-slate-600 font-medium max-w-[200px] truncate" title={wiNames}>
                            {wiNames}
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <Badge className={`text-[9px] font-bold ${session.format === 'Klasikal' ? 'bg-blue-100 text-blue-800' :
                                session.format === 'Virtual' ? 'bg-purple-100 text-purple-800' :
                                  'bg-amber-100 text-amber-800'
                                }`}>{session.format}</Badge>
                              {session.format === 'Klasikal' && <p className="text-[10px] text-slate-500 font-medium">{lok?.name || 'Ruangan'}</p>}
                            </div>
                          </TableCell>
                          <TableCell className="text-xs">
                            <span className="font-semibold text-slate-700">{session.jpCount} JP</span>
                            <span className="text-slate-400 text-[10px] ml-1">(JP Ke: {session.jpKe})</span>
                          </TableCell>
                          <TableCell className="pr-6 text-right">
                            <div className="flex justify-end gap-1.5">
                              <Button size="icon" variant="ghost" onClick={() => triggerEdit(session)} className="text-blue-600 h-8 w-8"><Edit className="h-4 w-4" /></Button>
                              <Button size="icon" variant="ghost" onClick={() => {
                                triggerConfirmation(
                                  "Hapus Sesi Terjadwal",
                                  "Apakah Anda yakin ingin menghapus sesi terjadwal ini secara permanen?",
                                  () => deleteSession(session.id)
                                );
                              }} className="text-red-500 h-8 w-8"><Trash2 className="h-4 w-4" /></Button>
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
        )}
      </div>

      <AlertDialog open={confirmDialog.open} onOpenChange={open => setConfirmDialog(prev => ({ ...prev, open }))}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900 font-bold text-lg">{confirmDialog.title}</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 text-sm">{confirmDialog.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-200 text-slate-700 hover:bg-slate-50">Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDialog.onConfirm} className="bg-blue-600 hover:bg-blue-700 text-white">Konfirmasi</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}