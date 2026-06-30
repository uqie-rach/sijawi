"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWTMS } from '@/context/wtms-context';
import { useScheduling } from '@/hooks/use-wtms-api';
import {
  GraduationCap,
  LogOut,
  Calendar,
  Clock,
  MapPin,
  BookOpen,
  User,
  Mail,
  Award,
  Info,
  CheckCircle2,
  Table as TableIcon,
  LayoutDashboard,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CalendarView } from '@/components/calendar-view';
import { MadeWithDyad } from "@/components/made-with-dyad";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { BRANDING } from '@/lib/config';

export default function WidyaswaraDashboard() {
  const router = useRouter();
  const {
    userRole,
    setUserRole,
    widyaswaras,
    selectedWiId,
    setSelectedWiId,
    isAuthenticated,
    setIsAuthenticated
  } = useWTMS();

  // Secure Route Guard
  React.useEffect(() => {
    if (!isAuthenticated || userRole !== 'wi') {
      router.push('/login');
    }
  }, [isAuthenticated, userRole, router]);

  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('calendar');
  const [scheduleFilter, setScheduleFilter] = useState<'personal' | 'global'>('personal');
  const [selectedDayDate, setSelectedDayDate] = useState<string>('2026-02-02');

  const activeWi = widyaswaras.find(w => w.id === selectedWiId) || widyaswaras[0];
  const { sessions: allSessions } = useScheduling();

  // Multi-WI filter logic applied!
  const wiSessions = allSessions.filter(s => s.wiIds && s.wiIds.includes(activeWi?.id));
  const activeScheduleSessions = scheduleFilter === 'personal' ? wiSessions : allSessions;

  const sortedSessions = [...activeScheduleSessions].sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.startTime.localeCompare(b.startTime);
  });

  const sessionsByDate: Record<string, typeof sortedSessions> = {};
  sortedSessions.forEach(session => {
    if (!sessionsByDate[session.date]) {
      sessionsByDate[session.date] = [];
    }
    sessionsByDate[session.date].push(session);
  });

  const handleLogout = () => {
    document.cookie = "sessionToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax";
    setIsAuthenticated(false);
    setUserRole(null);
    setSelectedWiId(null);
    router.push('/login');
  };

  if (!isAuthenticated || userRole !== 'wi') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-slate-500">Redirecting to login...</p>
      </div>
    );
  }

  if (!activeWi) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-slate-500">Loading profile...</p>
      </div>
    );
  }

  const totalJp = wiSessions.reduce((sum, s) => sum + s.jpCount, 0);

  const calendarEvents = activeScheduleSessions.map(s => ({
    id: s.id,
    title: s.mapelName,
    batchName: s.batchName,
    wiName: s.wiName,
    date: s.date,
    startTime: s.startTime,
    endTime: s.endTime,
    format: s.format,
    lokasiName: s.lokasiName,
    jpCount: s.jpCount,
    jpKe: s.jpKe
  }));

  const chartData = [
    { name: 'Bulan Lalu', 'Scheduled JP': activeWi.jpLastMonth },
    { name: 'Bulan Berjalan', 'Scheduled JP': totalJp }
  ];

  const upcomingTimelineSessions = [...wiSessions]
    .filter(s => new Date(s.date) >= new Date(2026, 0, 1))
    .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))
    .slice(0, 3);

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* OUTER SIDEBAR */}
      <aside className="w-64 bg-white text-slate-800 flex flex-col justify-between border-r border-slate-200 shrink-0 hidden md:flex">
        <div>
          <div className="p-6 border-b border-slate-100 flex items-center gap-3">
            <div className="bg-blue-600 p-1.5 rounded-xl shadow-md shadow-blue-500/20">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="font-black text-lg tracking-tight text-blue-600">{BRANDING.name}</h2>
              <p className="text-[10px] text-slate-500 font-medium">Portal Widyaiswara</p>
            </div>
          </div>

          <nav className="p-4 space-y-1">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all bg-blue-50 text-blue-600 shadow-sm">
              <LayoutDashboard className="h-4 w-4" />
              Ikhtisar
            </button>
          </nav>
        </div>

        <div className="p-4 border-t border-slate-100 space-y-4">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <p className="text-[10px] text-slate-500 font-semibold">Masuk sebagai</p>
            <p className="text-xs font-bold text-slate-800 truncate">{activeWi.name}</p>
          </div>
          <Button
            variant="destructive"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 py-2.5 text-xs font-bold transition-all rounded-xl"
          >
            <LogOut className="h-3.5 w-3.5" />
            Keluar Portal
          </Button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* ATTRACTIVE MODERN HEADER */}
        <header className="relative bg-white border-b border-slate-200 text-slate-800 px-8 py-6 shrink-0">
          <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase mb-2 w-fit border border-blue-200 text-blue-600">
                <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                {BRANDING.fullName}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">Portal {BRANDING.name}</h1>
              <p className="text-sm text-slate-500 mt-1 max-w-xl">{BRANDING.tagline}</p>
            </div>

            <div className="flex items-center gap-3 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-500 font-semibold whitespace-nowrap">Profil Aktif:</span>
              <Select value={activeWi.id} onValueChange={setSelectedWiId}>
                <SelectTrigger className="h-8 bg-white border border-slate-200 text-slate-800 font-bold focus:ring-0 px-2.5 py-1 gap-1 text-xs rounded-lg">
                  <SelectValue placeholder="Pilih profil" />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200 text-slate-800">
                  {widyaswaras.map(w => (
                    <SelectItem key={w.id} value={w.id} className="hover:bg-slate-100 focus:bg-slate-100 text-xs font-semibold">
                      {w.name}, {w.gelar}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </header>

        {/* Dashboard Workspace */}
        <div className="flex-1 p-8 overflow-y-auto grid lg:grid-cols-4 gap-8 bg-slate-50/50">
          <div className="lg:col-span-3 space-y-8">
            {/* Widyaiswara Profile Details */}
            <Card className="bg-white border-slate-200 shadow-sm overflow-hidden rounded-xl">
              <CardContent className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-900 shadow-sm shrink-0">
                    <User className="h-8 w-8" />
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-xl font-extrabold text-slate-900">{activeWi.name}, {activeWi.gelar}</h2>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3.5 w-3.5 text-slate-400" />
                        {activeWi.email}
                      </span>
                      <span className="h-1 w-1 rounded-full bg-slate-300"></span>
                      <span className="flex items-center gap-1 font-semibold text-blue-900">
                        <Award className="h-3.5 w-3.5 text-sky-500" />
                        Tingkat Kompetensi {activeWi.level} ({activeWi.levelLabel})
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">
                      <span className="font-mono">NIP: {activeWi.nip || 'N/A'}</span>
                      <span className="mx-2">•</span>
                      <span>Jabatan: {activeWi.jabatan || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 bg-slate-50 p-4 rounded-xl border border-slate-150 w-full md:w-auto justify-around shadow-sm">
                  <div className="text-center px-3">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Bulan Lalu</p>
                    <p className="text-base font-extrabold text-slate-700 mt-1">{activeWi.jpLastMonth} JP</p>
                  </div>
                  <div className="h-6 w-px bg-slate-200 self-center"></div>
                  <div className="text-center px-3">
                    <p className="text-[10px] text-blue-900 font-bold uppercase tracking-wider">Bulan Ini</p>
                    <p className="text-base font-black text-blue-900 mt-1">{totalJp} JP</p>
                  </div>
                  <div className="h-6 w-px bg-slate-200 self-center"></div>
                  <div className="text-center px-3">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total Jam</p>
                    <p className="text-base font-extrabold text-slate-700 mt-1">{((totalJp * 45) / 60).toFixed(1)} jam</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* CHARTS VISUALIZATION */}
            <Card className="shadow-sm border-slate-200 bg-white rounded-xl">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50">
                <CardTitle className="text-sm font-bold flex items-center gap-1.5 text-slate-800">
                  <TrendingUp className="h-4.5 w-4.5 text-blue-600" />
                  Pelacakan Kinerja JP Widyaiswara
                </CardTitle>
                <CardDescription className="text-xs">
                  Perbandingan JP bulanan terjadwal relatif terhadap kinerja operasional sebelumnya.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" stroke="#64748b" fontSize={11} fontWeight={600} />
                      <YAxis stroke="#64748b" fontSize={11} fontWeight={600} />
                      <Tooltip cursor={{ fill: '#f1f5f9' }} />
                      <Legend verticalAlign="top" height={36} iconType="circle" />
                      <Bar dataKey="Scheduled JP" fill="url(#colorJp)" radius={[6, 6, 0, 0]} barSize={55} />
                      <defs>
                        <linearGradient id="colorJp" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563eb" stopOpacity={0.95} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.8} />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Schedules Workspace */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Calendar className="h-4.5 w-4.5 text-blue-600" />
                    Portal Jadwal Mengajar
                  </h3>
                  <p className="text-xs text-slate-500">Periksa alokasi sesi mengajar Anda sendiri atau jadwal global lembaga.</p>
                </div>

                <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
                  <button
                    onClick={() => setScheduleFilter('personal')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      scheduleFilter === 'personal' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Jadwal Saya
                  </button>
                  <button
                    onClick={() => setScheduleFilter('global')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      scheduleFilter === 'global' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Jadwal Global
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl shadow-sm">
                <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 font-bold px-2.5 py-1 text-xs">
                  {scheduleFilter === 'personal' ? 'Hanya Sesi Saya' : 'Semua Aliran Sesi Mengajar'} ({activeScheduleSessions.length} sesi)
                </Badge>

                <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
                  <button
                    onClick={() => setViewMode('table')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all ${
                      viewMode === 'table' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <TableIcon className="h-3.5 w-3.5" />
                    Tabel
                  </button>
                  <button
                    onClick={() => setViewMode('calendar')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all ${
                      viewMode === 'calendar' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Calendar className="h-3.5 w-3.5" />
                    Kalender
                  </button>
                </div>
              </div>

              {activeScheduleSessions.length === 0 ? (
                <Card className="border-dashed border-slate-300 shadow-none py-16 text-center bg-white rounded-xl">
                  <CardContent className="space-y-3">
                    <Calendar className="h-12 w-12 text-slate-300 mx-auto" />
                    <p className="text-slate-600 font-bold text-base">Tidak ada alokasi sesi mengajar.</p>
                  </CardContent>
                </Card>
              ) : viewMode === 'calendar' ? (
                <CalendarView events={calendarEvents} title={`${scheduleFilter === 'personal' ? 'Sesi Saya' : 'Lembaga Global'} Kalender Mengajar`} />
              ) : (
                <div className="space-y-8">
                  {Object.entries(sessionsByDate).map(([date, sessions]) => (
                    <div key={date} className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-50 border border-blue-100 text-blue-600 font-extrabold px-3 py-1.5 rounded-xl text-xs">
                          {new Date(date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                        <div className="h-px bg-slate-200 flex-1" />
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        {sessions.map(session => {
                          const isOwnSession = session.wiIds && session.wiIds.includes(activeWi.id);
                          return (
                            <Card
                              key={session.id}
                              className={`bg-white border transition-all duration-200 shadow-sm rounded-xl relative ${
                                isOwnSession ? 'border-blue-400 ring-1 ring-blue-100 bg-gradient-to-tr from-white to-blue-50/10' : 'border-slate-200'
                              }`}
                            >
                              {isOwnSession && (
                                <span className="absolute -top-2.5 -right-2.5 bg-blue-600 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full shadow-md">
                                  Sesi Saya
                                </span>
                              )}

                              <CardHeader className="pb-3 border-b border-slate-50">
                                <div className="flex justify-between items-start gap-2">
                                  <Badge className={`font-semibold ${
                                    session.format === 'Klasikal' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                    session.format === 'Virtual' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                                    'bg-sky-100 text-sky-800 border-sky-200'
                                  }`}>
                                    {session.format}
                                  </Badge>
                                  <div className="flex items-center gap-1 text-xs text-slate-500 font-semibold">
                                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                                    {session.startTime} - {session.endTime}
                                  </div>
                                </div>
                                <CardTitle className="text-sm font-bold text-slate-900 mt-2">{session.mapelName}</CardTitle>
                                <CardDescription className="text-xs font-semibold text-blue-600 flex items-center gap-1">
                                  <BookOpen className="h-3.5 w-3.5" />
                                  {session.batchName}
                                </CardDescription>
                              </CardHeader>
                              <CardContent className="pt-4 space-y-3">
                                <div className="flex flex-col gap-1.5 text-xs text-slate-600">
                                  <span className="flex items-start gap-1">
                                    <User className="h-3.5 w-3.5 text-slate-400 mt-0.5 shrink-0" />
                                    <span>Widyaiswara: <strong className="text-slate-800">{session.wiName}</strong></span>
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                                    Venue: <strong className="text-slate-800 truncate">{session.lokasiName}</strong>
                                  </span>
                                </div>

                                <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                                  <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">
                                    JP Ke: {session.jpKe} ({session.jpCount} JP)
                                  </span>
                                  <div className="bg-emerald-50 border border-emerald-100 rounded px-2 py-0.5 flex items-center gap-1 text-[10px] text-emerald-800 font-semibold">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                    <span>Terverifikasi</span>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDE TIMELINE FOCUS */}
          <div className="lg:col-span-1 space-y-8">
            <Card className="shadow-sm border-slate-200 bg-white rounded-xl">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-4 px-6">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">Agenda Hari Ini</CardTitle>
                <CardDescription className="text-xs">Agenda harian pada tanggal yang dipilih.</CardDescription>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pilih Tanggal</span>
                  <input
                    type="date"
                    value={selectedDayDate}
                    onChange={e => setSelectedDayDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none"
                  />
                </div>

                <div className="space-y-3 pt-2">
                  {wiSessions.filter(s => s.date === selectedDayDate).length === 0 ? (
                    <p className="text-xs text-slate-400 italic text-center py-4">Tidak ada alokasi sesi mengajar.</p>
                  ) : (
                    wiSessions.filter(s => s.date === selectedDayDate).map(session => (
                      <div key={session.id} className="p-3 border border-slate-100 rounded-xl bg-slate-50/50 hover:border-blue-200 transition-all">
                        <div className="flex gap-1.5 items-center mb-1">
                          <Badge className="text-[8px] font-bold">{session.format}</Badge>
                          <span className="text-[10px] font-bold text-slate-500">{session.startTime}</span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{session.mapelName}</h4>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-slate-200 bg-white rounded-xl">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-4 px-6">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">Agenda Mendatang</CardTitle>
                <CardDescription className="text-xs">Tinjau 3 sesi pelatihan mendatang.</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {upcomingTimelineSessions.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center">Belum ada agenda mendatang.</p>
                ) : (
                  <div className="relative border-l border-slate-200 pl-4 space-y-6">
                    {upcomingTimelineSessions.map(s => (
                      <div key={s.id} className="relative">
                        <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-blue-600 border border-white" />
                        <div className="space-y-1">
                          <p className="text-[9px] font-bold text-slate-400 uppercase">
                            {new Date(s.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} • {s.startTime}
                          </p>
                          <h4 className="text-xs font-extrabold text-slate-800 line-clamp-1">{s.mapelName}</h4>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
</dyad-file>

### 9. `src/components/admin/scheduling-workspace-client.tsx`
Let's replace:
- `bg-amber-50 text-amber-800 border-amber-200` -> `bg-sky-50 text-sky-800 border-sky-200`
- `bg-amber-100 text-amber-800` -> `bg-sky-100 text-sky-800`
- `bg-amber-50 text-amber-800 border-amber-100` -> `bg-sky-50 text-sky-800 border-sky-100`
- `bg-amber-500` in progress bar -> `bg-sky-500`

Let's write `src/components/admin/scheduling-workspace-client.tsx`:
<dyad-write path="src/components/admin/scheduling-workspace-client.tsx" description="Mengganti warna lencana format Asinkron dan bar kemajuan dari amber menjadi sky blue agar selaras dengan tema biru utama.">
"use client";

import React, { useState, useEffect } from 'react';
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
import { Calendar, Clock, MapPin, UserCheck, Plus, Trash2, Edit, CalendarDays, TableProperties, Layers, ChevronLeft, ChevronRight, Zap } from 'lucide-react';

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

  const [sessionForm, setSessionForm] = useState({
    batchId: batchId || '',
    mapelId: '',
    wiIds: [] as string[], // array of selected WI IDs
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
        wiIds: sessionForm.wiIds, // multi-select pengajar
        wiId: sessionForm.wiIds[0], // fallback
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
                                  'bg-sky-50 text-sky-800 border-sky-100'
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
                                'bg-sky-100 text-sky-800'
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
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-blue-600">
                <TableProperties className="h-4.5 w-4.5 text-blue-600" />
                Matriks Tabel Jadwal Sesi
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {batchSessions.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Calendar className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                  <p className="text-xs font-semibold">Belum ada sesi yang dialokasikan.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/40">
                      <TableHead className="pl-6 text-xs font-bold uppercase text-slate-500">Tanggal</TableHead>
                      <TableHead className="text-xs font-bold uppercase text-slate-500">Mata Pelajaran (Mapel)</TableHead>
                      <TableHead className="text-xs font-bold uppercase text-slate-500">Widyaiswara</TableHead>
                      <TableHead className="text-xs font-bold uppercase text-slate-500">Format & Ruangan</TableHead>
                      <TableHead className="text-xs font-bold uppercase text-slate-500">JP Ke & Jumlah JP</TableHead>
                      <TableHead className="pr-6 text-right text-xs font-bold uppercase text-slate-500">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {batchSessions.map(session => {
                      const mapel = activeMapels.find(m => m.id === session.mapelId);

                      // Unpack multiple Widyaiswaras with titles
                      const resolvedWis = (session.wiIds || []).map((id: any) => activeWis.find(w => w.id === id)).filter(Boolean);
                      const wiNames = resolvedWis.map((w: { name: any; gelar: any; }) => `${w.name}, ${w.gelar}`).join(', ');

                      const lok = activeLokasis.find(l => l.id === session.lokasiId);

                      return (
                        <TableRow key={session.id} className="hover:bg-slate-50/30 transition-colors">
                          <TableCell className="pl-6 font-semibold text-slate-900 text-xs">{session.date}</TableCell>
                          <TableCell className="font-semibold text-slate-900 text-xs">{mapel?.name}</TableCell>
                          <TableCell className="text-xs text-slate-600 font-medium max-w-[200px] truncate" title={wiNames}>
                            {wiNames}
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <Badge className={`text-[9px] font-bold ${session.format === 'Klasikal' ? 'bg-blue-100 text-blue-800' :
                                session.format === 'Virtual' ? 'bg-purple-100 text-purple-800' :
                                  'bg-sky-100 text-sky-800'
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