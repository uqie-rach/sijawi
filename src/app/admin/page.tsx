"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWTMS } from '@/context/wtms-context';
import { useWidyaswaras, usePelatihan, useScheduling, useReports } from '@/hooks/use-wtms-api';
import { 
  LayoutDashboard, Database, CalendarDays, BarChart3, LogOut, Plus, Trash2, 
  Clock, MapPin, UserCheck, Calendar, TrendingUp, CheckCircle2, Info, Sliders, GraduationCap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Combobox } from '@/components/ui/combobox';
import { CalendarView } from '@/components/calendar-view';

export default function AdminDashboard() {
  const router = useRouter();
  const { 
    userRole, setUserRole, kategoriList, mapelList, lokasiList, 
    addWidyaswara, addKategori, addMapel, addLokasi, addBatch 
  } = useWTMS();

  React.useEffect(() => {
    if (userRole !== 'admin') setUserRole('admin');
  }, [userRole, setUserRole]);

  const [activeTab, setActiveTab] = useState<'overview' | 'master' | 'scheduling' | 'reports' | 'calendar'>('overview');

  const { widyaswaras: wiData } = useWidyaswaras();
  const { batches: batchData } = usePelatihan();
  const { sessions: allSessions, deleteSession, addSession } = useScheduling();
  const reportData = useReports();

  const [selectedBatchId, setSelectedBatchId] = useState<string>(batchData[0]?.id || '');
  const { sessions: batchSessions, mapelStatus } = useScheduling(selectedBatchId);
  const activeBatch = batchData.find(b => b.id === selectedBatchId);

  const [wiForm, setWiForm] = useState({ name: '', nip: '', jabatan: 'WI Ahli Pertama', gelar: '', email: '', level: '3' });
  const [batchForm, setBatchForm] = useState({ name: '', kategoriId: '', pola: 'APBD' as any, startDate: '2026-03-01', endDate: '2026-03-15' });
  const [sessionForm, setSessionForm] = useState({
    mapelId: '', wiId: '', kelompok: 'Kelompok A', date: '2026-03-02', 
    startTime: '08:00', endTime: '09:30', format: 'Klasikal' as any, lokasiId: '', jpKe: '1-2', jpCount: '2'
  });

  const [isWiDialogOpen, setIsWiDialogOpen] = useState(false);
  const [isBatchDialogOpen, setIsBatchDialogOpen] = useState(false);
  const [isSessionDialogOpen, setIsSessionDialogOpen] = useState(false);

  const handleAddWi = (e: React.FormEvent) => {
    e.preventDefault();
    const levelNum = parseInt(wiForm.level);
    addWidyaswara({ ...wiForm, level: levelNum, levelLabel: 'N/A' });
    setIsWiDialogOpen(false);
  };

  const handleAddSession = (e: React.FormEvent) => {
    e.preventDefault();
    const res = addSession({
      ...sessionForm,
      batchId: selectedBatchId,
      jpCount: parseInt(sessionForm.jpCount)
    });
    if (res.success) setIsSessionDialogOpen(false);
  };

  const wiOptions = wiData.map(wi => ({
    value: wi.id,
    label: `${wi.name}, ${wi.gelar} (${wi.nip})`,
    keywords: `${wi.name} ${wi.nip} ${wi.jabatan}`
  }));

  const mapelOptions = mapelList.filter(m => activeBatch && m.kategoriId === activeBatch.kategoriId).map(m => ({
    value: m.id,
    label: `${m.name} (${m.jpTotal} JP)`
  }));

  const lokasiOptions = lokasiList.map(l => ({
    value: l.id,
    label: l.name
  }));

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      <aside className="w-full md:w-64 bg-slate-900 text-white flex flex-col justify-between border-r border-slate-800">
        <div>
          <div className="p-6 border-b border-slate-800 flex items-center gap-3">
            <div className="bg-blue-600 p-1.5 rounded-lg"><GraduationCap className="h-5 w-5" /></div>
            <div>
              <h2 className="font-bold text-lg tracking-tight">WTMS Admin</h2>
              <p className="text-xs text-slate-400">Super Admin Console</p>
            </div>
          </div>
          <nav className="p-4 space-y-1">
            {[
              { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
              { id: 'master', label: 'Master Data', icon: Database },
              { id: 'scheduling', label: 'Scheduling Engine', icon: CalendarDays },
              { id: 'calendar', label: 'Global Calendar', icon: Calendar },
              { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === item.id ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="p-4 border-t border-slate-800">
          <Button variant="destructive" onClick={() => router.push('/')} className="w-full flex items-center justify-center gap-2">
            <LogOut className="h-4 w-4" /> Exit Admin
          </Button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-y-auto">
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 capitalize">{activeTab}</h1>
            <p className="text-sm text-slate-500">Super Admin Workspace</p>
          </div>
          <Badge className="bg-blue-50 text-blue-700 border-blue-200">Total {reportData.totalJp} JP Scheduled</Badge>
        </header>

        <div className="p-8 space-y-8">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid sm:grid-cols-4 gap-6">
                <Card><CardHeader className="pb-2"><CardTitle className="text-2xl">{wiData.length}</CardTitle><CardDescription>Instructors</CardDescription></CardHeader></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-2xl">{batchData.length}</CardTitle><CardDescription>Active Batches</CardDescription></CardHeader></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-2xl">{allSessions.length}</CardTitle><CardDescription>Total Sessions</CardDescription></CardHeader></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-2xl">{reportData.totalJp}</CardTitle><CardDescription>Scheduled JP</CardDescription></CardHeader></Card>
              </div>
              <Card>
                <Table>
                  <TableHeader><TableRow><TableHead>WI Name</TableHead><TableHead>NIP</TableHead><TableHead>Jabatan</TableHead><TableHead>Level</TableHead><TableHead>JP (Current)</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {wiData.map(wi => (
                      <TableRow key={wi.id}>
                        <TableCell className="font-bold">{wi.name}, {wi.gelar}</TableCell>
                        <TableCell className="text-slate-500 font-mono text-xs">{wi.nip}</TableCell>
                        <TableCell><Badge variant="outline">{wi.jabatan}</Badge></TableCell>
                        <TableCell>Level {wi.level}</TableCell>
                        <TableCell className="font-bold text-blue-600">{wi.jpCurrentMonth} JP</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </div>
          )}

          {activeTab === 'master' && (
            <Tabs defaultValue="wi">
              <div className="flex justify-between items-center mb-6">
                <TabsList><TabsTrigger value="wi">Widyaswara</TabsTrigger><TabsTrigger value="batches">Batches</TabsTrigger></TabsList>
                <Button onClick={() => setIsWiDialogOpen(true)} className="bg-blue-600"><Plus className="mr-2 h-4 w-4" /> Add WI</Button>
              </div>
              <TabsContent value="wi">
                <Card>
                  <Table>
                    <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>NIP</TableHead><TableHead>Jabatan</TableHead><TableHead>Email</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {wiData.map(wi => (
                        <TableRow key={wi.id}>
                          <TableCell className="font-bold">{wi.name}</TableCell>
                          <TableCell className="font-mono text-xs">{wi.nip}</TableCell>
                          <TableCell>{wi.jabatan}</TableCell>
                          <TableCell>{wi.email}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              </TabsContent>
            </Tabs>
          )}

          {activeTab === 'scheduling' && (
            <div className="space-y-6">
              <Card className="p-6">
                <Label>Select Batch</Label>
                <Select value={selectedBatchId} onValueChange={setSelectedBatchId}>
                  <SelectTrigger className="w-full sm:w-80 mt-1"><SelectValue placeholder="Select batch" /></SelectTrigger>
                  <SelectContent>{batchData.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
                </Select>
              </Card>
              {activeBatch && (
                <div className="grid lg:grid-cols-3 gap-8">
                  <div className="space-y-6">
                    <Card><CardHeader><CardTitle className="text-sm">JP Progress</CardTitle></CardHeader>
                      <CardContent className="space-y-4">
                        {mapelStatus.map(m => (
                          <div key={m.id} className="space-y-1">
                            <div className="flex justify-between text-xs font-bold"><span>{m.name}</span><span>{m.scheduledJp}/{m.jpTotal} JP</span></div>
                            <Progress value={(m.scheduledJp / m.jpTotal) * 100} className="h-2" />
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                  <div className="lg:col-span-2 space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold">Scheduled Sessions</h3>
                      <Button onClick={() => setIsSessionDialogOpen(true)} className="bg-blue-600"><Plus className="mr-2 h-4 w-4" /> Assign</Button>
                    </div>
                    {batchSessions.map(s => (
                      <Card key={s.id} className="p-4 flex justify-between items-center">
                        <div>
                          <div className="flex gap-2 items-center mb-1">
                            <Badge className="bg-slate-100 text-slate-700">{s.kelompok}</Badge>
                            <span className="text-xs text-slate-500">{s.date} {s.startTime}-{s.endTime}</span>
                          </div>
                          <h4 className="font-bold">{s.mapelName}</h4>
                          <p className="text-xs text-slate-500">{s.wiName} • {s.lokasiName}</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => deleteSession(s.id)} className="text-red-500"><Trash2 className="h-4 w-4" /></Button>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'calendar' && <CalendarView sessions={allSessions} />}

          {activeTab === 'reports' && (
            <Card className="p-20 text-center text-slate-400">Advanced Analytics Hub</Card>
          )}
        </div>

        <Dialog open={isWiDialogOpen} onOpenChange={setIsWiDialogOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Widyaswara</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2"><Label>Full Name</Label><Input value={wiForm.name} onChange={e => setWiForm({...wiForm, name: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>NIP</Label><Input value={wiForm.nip} onChange={e => setWiForm({...wiForm, nip: e.target.value})} /></div>
                <div className="space-y-2"><Label>Jabatan</Label>
                  <Select value={wiForm.jabatan} onValueChange={(v: any) => setWiForm({...wiForm, jabatan: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="WI Ahli Pertama">WI Ahli Pertama</SelectItem>
                      <SelectItem value="WI Ahli Muda">WI Ahli Muda</SelectItem>
                      <SelectItem value="WI Ahli Madya">WI Ahli Madya</SelectItem>
                      <SelectItem value="WI Ahli Utama">WI Ahli Utama</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2"><Label>Competency Level (1-5)</Label><Input type="number" value={wiForm.level} onChange={e => setWiForm({...wiForm, level: e.target.value})} /></div>
              <DialogFooter><Button onClick={handleAddWi} className="bg-blue-600">Save WI</Button></DialogFooter>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isSessionDialogOpen} onOpenChange={setIsSessionDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Assign Session</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2"><Label>Mata Pelatihan</Label><Combobox options={mapelOptions} value={sessionForm.mapelId} onValueChange={v => setSessionForm({...sessionForm, mapelId: v})} /></div>
              <div className="space-y-2"><Label>Widyaswara</Label><Combobox options={wiOptions} value={sessionForm.wiId} onValueChange={v => setSessionForm({...sessionForm, wiId: v})} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Kelompok/Group</Label><Input value={sessionForm.kelompok} onChange={e => setSessionForm({...sessionForm, kelompok: e.target.value})} /></div>
                <div className="space-y-2"><Label>Date</Label><Input type="date" value={sessionForm.date} onChange={e => setSessionForm({...sessionForm, date: e.target.value})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Start</Label><Input type="time" value={sessionForm.startTime} onChange={e => setSessionForm({...sessionForm, startTime: e.target.value})} /></div>
                <div className="space-y-2"><Label>End</Label><Input type="time" value={sessionForm.endTime} onChange={e => setSessionForm({...sessionForm, endTime: e.target.value})} /></div>
              </div>
              <div className="space-y-2"><Label>Location</Label><Combobox options={lokasiOptions} value={sessionForm.lokasiId} onValueChange={v => setSessionForm({...sessionForm, lokasiId: v})} /></div>
              <DialogFooter><Button onClick={handleAddSession} className="bg-blue-600 w-full">Schedule</Button></DialogFooter>
            </div>
          </DialogContent>
        </Dialog>

        <MadeWithDyad />
      </main>
    </div>
  );
}