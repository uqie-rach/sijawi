"use client";

import React, { useState } from 'react';
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
import { Calendar, Clock, MapPin, UserCheck, Plus, Trash2, Edit, ListFilter, CalendarDays, TableProperties, Layers, ChevronLeft, ChevronRight } from 'lucide-react';

interface SchedulingWorkspaceClientProps {
  batchId?: string;
  initialBatch?: any;
  initialMapels: any[];
  initialWis: any[];
  initialLokasis: any[];
  initialSessions: any[];
  allBatches: any[];
}

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

  // Switch between views: 'calendar' | 'day' | 'table'
  const [viewMode, setViewMode] = useState<'calendar' | 'day' | 'table'>('calendar');

  const activeBatch = batchId ? (batches.find(b => b.id === batchId) || initialBatch) : null;
  const batchStartDate = activeBatch ? new Date(activeBatch.startDate) : new Date(2026, 2, 1); // Default to March 2026 for demo data
  const [selectedDayDate, setSelectedDayDate] = useState<string>(activeBatch?.startDate || '2026-03-02');
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date(batchStartDate.getFullYear(), batchStartDate.getMonth(), 1));

  // Load contextual active lists (syncing context with SSR initial state fallback)
  const activeMapels = mapelList.length ? mapelList : initialMapels;
  const activeWis = widyaswaras.length ? widyaswaras : initialWis;
  const activeLokasis = lokasiList.length ? lokasiList : initialLokasis;
  const activeSessions = sessions.length ? sessions : initialSessions;

  // Filter current active sessions (by batchId if specified, otherwise show all)
  const batchSessions = batchId 
    ? activeSessions.filter(s => s.batchId === batchId)
    : activeSessions;

  // States for session Form
  const [sessionForm, setSessionForm] = useState({
    batchId: batchId || '',
    mapelId: '',
    wiId: '',
    date: activeBatch?.startDate || '2026-03-02',
    startTime: '08:00',
    endTime: '09:30',
    format: 'Klasikal' as 'Klasikal' | 'Virtual' | 'Asinkron',
    lokasiId: '',
    jpKe: '1-2',
    jpCount: '2'
  });

  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Filter mapels belonging to the current category if inside a batch context
  const relevantMapels = activeBatch 
    ? activeMapels.filter(m => m.kategoriId === activeBatch.kategoriId)
    : activeMapels;

  // Mapel status tracking for this batch (only shown if batchId is provided)
  const mapelStatus = activeBatch ? relevantMapels.map(mapel => {
    const scheduledSessions = batchSessions.filter(s => s.mapelId === mapel.id);
    const scheduledJp = scheduledSessions.reduce((sum, s) => sum + Number(s.jpCount), 0);
    const remainingJp = Number(mapel.jpTotal) - scheduledJp;
    return {
      ...mapel,
      scheduledJp,
      remainingJp,
      isFullyScheduled: remainingJp <= 0
    };
  }) : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetBatchId = batchId || sessionForm.batchId;
    if (!targetBatchId || !sessionForm.mapelId || !sessionForm.wiId) return;

    if (editingSessionId) {
      const res = updateSession(editingSessionId, {
        batchId: targetBatchId,
        mapelId: sessionForm.mapelId,
        wiId: sessionForm.wiId,
        date: sessionForm.date,
        startTime: sessionForm.startTime,
        endTime: sessionForm.endTime,
        format: sessionForm.format,
        lokasiId: sessionForm.format === 'Klasikal' ? sessionForm.lokasiId : undefined,
        jpKe: sessionForm.jpKe,
        jpCount: parseInt(sessionForm.jpCount)
      });
      if (res.success) {
        setIsDialogOpen(false);
        setEditingSessionId(null);
      }
    } else {
      const res = addSession({
        batchId: targetBatchId,
        mapelId: sessionForm.mapelId,
        wiId: sessionForm.wiId,
        date: sessionForm.date,
        startTime: sessionForm.startTime,
        endTime: sessionForm.endTime,
        format: sessionForm.format,
        lokasiId: sessionForm.format === 'Klasikal' ? sessionForm.lokasiId : undefined,
        jpKe: sessionForm.jpKe,
        jpCount: parseInt(sessionForm.jpCount)
      });
      if (res.success) {
        setIsDialogOpen(false);
      }
    }
  };

  // Helper to trigger edit form initialization
  const triggerEdit = (session: any) => {
    setEditingSessionId(session.id);
    setSessionForm({
      batchId: session.batchId,
      mapelId: session.mapelId,
      wiId: session.wiId,
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

  // Combobox Options
  const mapelOptions = relevantMapels.map(m => ({
    value: m.id,
    label: `${m.name} (${m.jpTotal} JP)`
  }));

  const wiOptions = activeWis.map(wi => ({
    value: wi.id,
    label: `${wi.name}, ${wi.gelar} (Lvl ${wi.level} - ${wi.jabatan})`
  }));

  const lokasiOptions = activeLokasis.map(l => ({
    value: l.id,
    label: l.name
  }));

  const batchOptions = allBatches.map(b => ({
    value: b.id,
    label: b.name
  }));

  // Calendar render helper logic
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
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ][monthIdx];
  };

  return (
    <div className="grid lg:grid-cols-4 gap-8">
      {/* Sidebar Navigation: List of Other Batches & Subject Status */}
      <div className="space-y-6 lg:col-span-1">
        {/* Navigation Sidebar: Other Batches */}
        <Card className="shadow-sm border-slate-200 bg-white">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-800">
              <Layers className="h-4 w-4 text-blue-500" />
              Navigate Batches
            </CardTitle>
            <CardDescription className="text-xs">Quick jump between core scheduling workspaces.</CardDescription>
          </CardHeader>
          <CardContent className="p-3">
            <div className="space-y-1 max-h-[220px] overflow-y-auto pr-1">
              {allBatches.map(b => (
                <button
                  key={b.id}
                  onClick={() => router.push(`/admin/scheduling/${b.id}`)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${
                    b.id === batchId 
                      ? 'bg-blue-50 text-blue-700 border border-blue-200' 
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

        {/* Sidebar: Mapel JP status - only shown when batchId is selected */}
        {activeBatch && (
          <Card className="shadow-sm border-slate-200 bg-white">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-sm font-bold text-slate-800">Subject JP Accumulation</CardTitle>
              <CardDescription className="text-xs">Required vs. allocated parameters.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {mapelStatus.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">No subjects registered for this category.</p>
              ) : (
                mapelStatus.map(m => {
                  const percentage = (m.scheduledJp / m.jpTotal) * 100;
                  return (
                    <div key={m.id} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-slate-700 truncate max-w-[120px]" title={m.name}>{m.name}</span>
                        <span className="text-[10px] font-bold text-slate-500">{m.scheduledJp}/{m.jpTotal} JP</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={percentage} className="h-1.5 flex-1 bg-slate-100" />
                        {m.isFullyScheduled ? (
                          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 text-[9px] px-1 py-0 font-bold">Done</Badge>
                        ) : (
                          <span className="text-[9px] font-bold text-slate-400">{m.remainingJp} left</span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Main Workspace Workspace: Supports granular views */}
      <div className="lg:col-span-3 space-y-6">
        {/* View Mode Switching Controls Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                viewMode === 'calendar' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarDays className="h-3.5 w-3.5" />
              Calendar View
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                viewMode === 'day' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              Day Timeline
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TableProperties className="h-3.5 w-3.5" />
              Table Matrix
            </button>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingSessionId(null);
                setSessionForm({
                  batchId: batchId || '',
                  mapelId: '',
                  wiId: '',
                  date: activeBatch?.startDate || '2026-03-02',
                  startTime: '08:00',
                  endTime: '09:30',
                  format: 'Klasikal',
                  lokasiId: '',
                  jpKe: '1-2',
                  jpCount: '2'
                });
              }} className="bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-2 text-xs font-semibold py-5 px-4 shadow-md shadow-blue-100">
                <Plus className="h-4 w-4" /> Assign Slot Session
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingSessionId ? 'Edit Session Slot' : 'Assign Session Slot'}</DialogTitle>
                <DialogDescription>Setup instructor mapping, date ranges and formatting operational limits.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 py-3">
                {!batchId && (
                  <div className="space-y-1">
                    <Label>Batch Pelatihan</Label>
                    <Combobox options={batchOptions} value={sessionForm.batchId} onValueChange={val => setSessionForm({ ...sessionForm, batchId: val })} placeholder="Select batch..." />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label>Subject (Mapel)</Label>
                    <Combobox options={mapelOptions} value={sessionForm.mapelId} onValueChange={val => setSessionForm({ ...sessionForm, mapelId: val })} placeholder="Search subject..." />
                  </div>
                  <div className="space-y-1">
                    <Label>Widyaswara (WI)</Label>
                    <Combobox options={wiOptions} value={sessionForm.wiId} onValueChange={val => setSessionForm({ ...sessionForm, wiId: val })} placeholder="Search instructor..." />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <Label>Date</Label>
                    <Input type="date" min={activeBatch?.startDate} max={activeBatch?.endDate} value={sessionForm.date} onChange={e => setSessionForm({ ...sessionForm, date: e.target.value })} required />
                  </div>
                  <div className="space-y-1">
                    <Label>Start Time</Label>
                    <Input type="time" value={sessionForm.startTime} onChange={e => setSessionForm({ ...sessionForm, startTime: e.target.value })} required />
                  </div>
                  <div className="space-y-1">
                    <Label>End Time</Label>
                    <Input type="time" value={sessionForm.endTime} onChange={e => setSessionForm({ ...sessionForm, endTime: e.target.value })} required />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <Label>Format</Label>
                    <Select value={sessionForm.format} onValueChange={(val: any) => setSessionForm({ ...sessionForm, format: val })}>
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
                    <Input placeholder="1-2" value={sessionForm.jpKe} onChange={e => setSessionForm({ ...sessionForm, jpKe: e.target.value })} required />
                  </div>
                  <div className="space-y-1">
                    <Label>JP Count</Label>
                    <Select value={sessionForm.jpCount} onValueChange={val => setSessionForm({ ...sessionForm, jpCount: val })}>
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
                    <Label>Location / Room</Label>
                    <Combobox options={lokasiOptions} value={sessionForm.lokasiId} onValueChange={val => setSessionForm({ ...sessionForm, lokasiId: val })} placeholder="Search location..." />
                  </div>
                )}
                <DialogFooter className="pt-4">
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white w-full">Save Allocated Session</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Render dynamically depending on selected viewMode */}
        {viewMode === 'calendar' && (
          <Card className="shadow-sm border-slate-200 bg-white">
            <CardHeader className="border-b border-slate-100 flex flex-row justify-between items-center bg-slate-50/50 px-6 py-4">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <CalendarDays className="h-4.5 w-4.5 text-blue-600" />
                Active Calendar Month View {batchId ? `(Batch: ${activeBatch?.name})` : '(All Batches)'}
              </CardTitle>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCalendarMonth(new Date(year, month - 1, 1))}
                  className="p-1 rounded border border-slate-200 hover:bg-slate-50"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <span className="text-xs font-bold text-slate-700 min-w-[100px] text-center">
                  {getMonthName(month)} {year}
                </span>
                <button
                  onClick={() => setCalendarMonth(new Date(year, month + 1, 1))}
                  className="p-1 rounded border border-slate-200 hover:bg-slate-50"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 uppercase mb-2">
                <div>Sun</div>
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div>Sat</div>
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
                      className={`min-h-[75px] border rounded p-1.5 flex flex-col justify-between transition-all cursor-pointer ${
                        isDayInBatchRange 
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
                              onClick={(e) => {
                                e.stopPropagation();
                                triggerEdit(ev);
                              }}
                              className={`text-[9px] px-1 py-0.5 rounded truncate font-medium border ${
                                ev.format === 'Klasikal' ? 'bg-blue-50 text-blue-800 border-blue-100' :
                                ev.format === 'Virtual' ? 'bg-purple-50 text-purple-800 border-purple-100' :
                                'bg-amber-50 text-amber-800 border-amber-100'
                              }`}
                              title={`${mapel?.name || 'Subject'} (${ev.startTime} - ${ev.endTime})`}
                            >
                              {mapel?.name || 'Subject'}
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
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  Granular Hourly Timeline View
                </CardTitle>
                <CardDescription className="text-xs">Examine operational hourly allocations stacking rules side-by-side.</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-xs font-bold text-slate-500 whitespace-nowrap">Active Date Selector:</Label>
                <Input
                  type="date"
                  min={activeBatch?.startDate}
                  max={activeBatch?.endDate}
                  value={selectedDayDate}
                  onChange={e => setSelectedDayDate(e.target.value)}
                  className="h-8 py-0 px-2 text-xs w-[140px]"
                />
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {batchSessions.filter(s => s.date === selectedDayDate).length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Calendar className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                  <p className="text-xs font-semibold">No assigned sessions on {selectedDayDate}.</p>
                  <p className="text-[11px] opacity-80">Click 'Assign Slot Session' to populate schedules.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {batchSessions.filter(s => s.date === selectedDayDate).map(session => {
                    const mapel = activeMapels.find(m => m.id === session.mapelId);
                    const wi = activeWis.find(w => w.id === session.wiId);
                    const lok = activeLokasis.find(l => l.id === session.lokasiId);

                    return (
                      <div
                        key={session.id}
                        className="p-4 border border-slate-100 rounded-xl bg-slate-50/50 hover:border-blue-200 transition-all flex justify-between items-center"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge className={`text-[9px] font-bold ${
                              session.format === 'Klasikal' ? 'bg-blue-100 text-blue-800' :
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
                            <span className="flex items-center gap-1">
                              <UserCheck className="h-3.5 w-3.5 text-slate-400" />
                              WI: <strong>{wi ? `${wi.name}, ${wi.gelar}` : 'Unknown'}</strong>
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5 text-slate-400" />
                              Room: <strong>{session.format === 'Klasikal' ? (lok?.name || 'Venue') : session.format}</strong>
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <Button size="icon" variant="ghost" onClick={() => triggerEdit(session)} className="text-blue-600">
                            <Edit className="h-4.5 w-4.5" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => { if (confirm('Delete?')) deleteSession(session.id); }} className="text-red-500">
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
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <TableProperties className="h-4.5 w-4.5 text-blue-600" />
                Schedules Table Grid Matrix
              </CardTitle>
              <CardDescription className="text-xs">Full tabulated structural details of batch allocations.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {batchSessions.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Calendar className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                  <p className="text-xs font-semibold">No assigned sessions for this batch yet.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/40">
                      <TableHead className="pl-6 text-xs font-bold uppercase text-slate-500">Date</TableHead>
                      <TableHead className="text-xs font-bold uppercase text-slate-500">Subject (Mapel)</TableHead>
                      <TableHead className="text-xs font-bold uppercase text-slate-500">Instructor (WI)</TableHead>
                      <TableHead className="text-xs font-bold uppercase text-slate-500">Format & Room</TableHead>
                      <TableHead className="text-xs font-bold uppercase text-slate-500">JP Ke & Count</TableHead>
                      <TableHead className="pr-6 text-right text-xs font-bold uppercase text-slate-500">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {batchSessions.map(session => {
                      const mapel = activeMapels.find(m => m.id === session.mapelId);
                      const wi = activeWis.find(w => w.id === session.wiId);
                      const lok = activeLokasis.find(l => l.id === session.lokasiId);

                      return (
                        <TableRow key={session.id} className="hover:bg-slate-50/30 transition-colors">
                          <TableCell className="pl-6 font-semibold text-slate-900 text-xs">{session.date}</TableCell>
                          <TableCell className="font-semibold text-slate-900 text-xs">{mapel?.name}</TableCell>
                          <TableCell className="text-xs text-slate-600 font-medium">
                            {wi ? `${wi.name}, ${wi.gelar}` : 'Unknown'}
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <Badge className={`text-[9px] font-bold ${
                                session.format === 'Klasikal' ? 'bg-blue-100 text-blue-800' :
                                session.format === 'Virtual' ? 'bg-purple-100 text-purple-800' :
                                'bg-amber-100 text-amber-800'
                              }`}>
                                {session.format}
                              </Badge>
                              {session.format === 'Klasikal' && (
                                <p className="text-[10px] text-slate-500 font-medium">{lok?.name || 'Classroom'}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-xs">
                            <span className="font-semibold text-slate-700">{session.jpCount} JP</span>
                            <span className="text-slate-400 text-[10px] ml-1">(JP Ke: {session.jpKe})</span>
                          </TableCell>
                          <TableCell className="pr-6 text-right">
                            <div className="flex justify-end gap-1.5">
                              <Button size="icon" variant="ghost" onClick={() => triggerEdit(session)} className="text-blue-600 h-8 w-8">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="ghost" onClick={() => { if (confirm('Delete?')) deleteSession(session.id); }} className="text-red-500 h-8 w-8">
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
        )}
      </div>
    </div>
  );
}