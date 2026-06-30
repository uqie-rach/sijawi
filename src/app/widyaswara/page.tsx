"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWTMS } from '@/context/wtms-context';
import { useScheduling } from '@/hooks/use-wtms-api';
import {
  GraduationCap,
  Calendar,
  Clock,
  MapPin,
  BookOpen,
  User,
  Mail,
  Award,
  CheckCircle2,
  Table as TableIcon,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { CalendarView } from '@/components/calendar-view';
import { WidyaswaraSidebar } from '@/components/widyaswara/sidebar';
import { MadeWithDyad } from "@/components/made-with-dyad";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { BRANDING } from '@/lib/config';

export default function WidyaswaraDashboard() {
  const router = useRouter();
  const {
    userRole,
    widyaswaras,
    selectedWiId,
    setSelectedWiId,
    isAuthenticated,
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
      {/* OUTER COLLAPSIBLE SIDEBAR */}
      <WidyaswaraSidebar activeWiName={activeWi.name} />

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