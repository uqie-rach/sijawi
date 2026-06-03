"use client";

import React, { useState } from 'react';
import { useWTMS } from '@/context/wtms-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Combobox } from '@/components/ui/combobox';
import { Calendar, Clock, MapPin, UserCheck, Plus, Trash2, Edit } from 'lucide-react';

interface SchedulingWorkspaceClientProps {
  batchId: string;
  initialBatch: any;
  initialMapels: any[];
  initialWis: any[];
  initialLokasis: any[];
  initialSessions: any[];
}

export function SchedulingWorkspaceClient({
  batchId,
  initialBatch,
  initialMapels,
  initialWis,
  initialLokasis,
  initialSessions,
}: SchedulingWorkspaceClientProps) {
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

  // Load contextual active lists (syncing context with SSR initial state fallback)
  const activeBatch = batches.find(b => b.id === batchId) || initialBatch;
  const activeMapels = mapelList.length ? mapelList : initialMapels;
  const activeWis = widyaswaras.length ? widyaswaras : initialWis;
  const activeLokasis = lokasiList.length ? lokasiList : initialLokasis;
  const activeSessions = sessions.length ? sessions : initialSessions;

  // Filter current active sessions for this batch
  const batchSessions = activeSessions.filter(s => s.batchId === batchId);

  // States for session Form
  const [sessionForm, setSessionForm] = useState({
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

  // Filter mapels belonging to this batch's category
  const relevantMapels = activeMapels.filter(m => m.kategoriId === activeBatch?.kategoriId);

  // Mapel status tracking for this batch
  const mapelStatus = relevantMapels.map(mapel => {
    const scheduledSessions = batchSessions.filter(s => s.mapelId === mapel.id);
    const scheduledJp = scheduledSessions.reduce((sum, s) => sum + Number(s.jpCount), 0);
    const remainingJp = Number(mapel.jpTotal) - scheduledJp;
    return {
      ...mapel,
      scheduledJp,
      remainingJp,
      isFullyScheduled: remainingJp <= 0
    };
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionForm.mapelId || !sessionForm.wiId) return;

    if (editingSessionId) {
      const res = updateSession(editingSessionId, {
        batchId,
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
        batchId,
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

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Sidebar: Mapel JP status */}
      <div className="space-y-6">
        <Card className="shadow-sm border-slate-200 bg-white">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50">
            <CardTitle className="text-base font-bold">Subject (Mapel) JP Status</CardTitle>
            <CardDescription>Aggregate requirements vs. allocated slots for this specific category.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {mapelStatus.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">No subjects registered for this category.</p>
            ) : (
              mapelStatus.map(m => {
                const percentage = (m.scheduledJp / m.jpTotal) * 100;
                return (
                  <div key={m.id} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold text-slate-800">{m.name}</span>
                      <span className="text-xs font-bold text-slate-500">{m.scheduledJp} / {m.jpTotal} JP</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress value={percentage} className="h-2 flex-1 bg-slate-100" />
                      {m.isFullyScheduled ? (
                        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px] font-bold">Complete</Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] font-bold text-slate-500">{m.remainingJp} JP Left</Badge>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Timeline Workspace Content */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-900">Allocated Slots Timeline</h3>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingSessionId(null);
                setSessionForm({
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
              }} className="bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-2">
                <Plus className="h-4 w-4" /> Assign Session
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingSessionId ? 'Edit Session' : 'Assign Session'}</DialogTitle>
                <DialogDescription>Assign instructor, date and formatting rules for a session.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 py-4">
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
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white w-full">Save Session</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {batchSessions.length === 0 ? (
          <Card className="border-dashed border-slate-300 py-12 text-center bg-white">
            <CardContent className="space-y-3">
              <Calendar className="h-10 w-10 text-slate-400 mx-auto" />
              <p className="text-slate-600 font-medium">No sessions scheduled for this batch yet.</p>
              <p className="text-xs text-slate-400">Click "Assign Session" to insert the first session.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {batchSessions.map(session => {
              const mapel = activeMapels.find(m => m.id === session.mapelId);
              const wi = activeWis.find(w => w.id === session.wiId);
              const lok = activeLokasis.find(l => l.id === session.lokasiId);

              return (
                <Card key={session.id} className="shadow-sm border-slate-200 hover:border-blue-300 transition-all bg-white">
                  <CardContent className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={`font-semibold ${
                          session.format === 'Klasikal' ? 'bg-blue-100 text-blue-800' :
                          session.format === 'Virtual' ? 'bg-purple-100 text-purple-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {session.format}
                        </Badge>
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {session.date}
                        </span>
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {session.startTime} - {session.endTime} ({session.jpCount} JP, JP Ke: {session.jpKe})
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900">{mapel?.name || 'Subject'}</h4>
                      <div className="flex items-center gap-4 text-xs text-slate-600">
                        <span className="flex items-center gap-1 font-medium">
                          <UserCheck className="h-3.5 w-3.5 text-slate-400" />
                          {wi ? `${wi.name}, ${wi.gelar}` : 'Unknown WI'}
                        </span>
                        <span className="flex items-center gap-1 font-medium">
                          <MapPin className="h-3.5 w-3.5 text-slate-400" />
                          {session.format === 'Klasikal' ? (lok?.name || 'In-Person') : session.format}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button size="icon" variant="ghost" onClick={() => {
                        setEditingSessionId(session.id);
                        setSessionForm({
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
                      }} className="text-blue-600 hover:bg-blue-50">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => { if (confirm('Delete?')) deleteSession(session.id); }} className="text-red-500 hover:bg-red-50">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}