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
  ChevronLeft,
  ChevronRight,
  Info,
  CheckCircle2,
  Table as TableIcon,
  LayoutDashboard,
  CalendarDays,
  Sparkles,
  Zap,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CalendarView } from '@/components/calendar-view';
import { MadeWithDyad } from "@/components/made-with-dyad";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

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

  // View Mode for Schedule (Table vs Calendar)
  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('calendar');

  // Schedule Filter (Personal vs Global)
  const [scheduleFilter, setScheduleFilter] = useState<'personal' | 'global'>('personal');

  // Select Day for Day View Sidebar
  const [selectedDayDate, setSelectedDayDate] = useState<string>('2026-03-02');

  // Get current active Widyaiswara profile
  const activeWi = widyaswaras.find(w => w.id === selectedWiId) || widyaswaras[0];

  // Get all sessions with details
  const { sessions: allSessions } = useScheduling();

  // Filter sessions
  const wiSessions = allSessions.filter(s => s.wiId === activeWi?.id);
  const activeScheduleSessions = scheduleFilter === 'personal' ? wiSessions : allSessions;

  // Sort sessions by date and start time
  const sortedSessions = [...activeScheduleSessions].sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.startTime.localeCompare(b.startTime);
  });

  // Group sessions by date for a clean timeline view
  const sessionsByDate: Record<string, typeof sortedSessions> = {};
  sortedSessions.forEach(session => {
    if (!sessionsByDate[session.date]) {
      sessionsByDate[session.date] = [];
    }
    sessionsByDate[session.date].push(session);
  });

  const handleLogout = () => {
    // Clear sessionToken cookie
    document.cookie = "sessionToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax";

    setIsAuthenticated(false);
    setUserRole(null);
    setSelectedWiId(null);
    router.push('/login');
  };

  if (!isAuthenticated || userRole !== 'wi') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-500">Redirecting to login...</p>
      </div>
    );
  }

  if (!activeWi) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-500">Loading profile...</p>
      </div>
    );
  }

  // Calculate total JP scheduled for this WI
  const totalJp = wiSessions.reduce((sum, s) => sum + s.jpCount, 0);

  // Prepare Calendar Events
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

  // Chart data: Monthly JP target comparison
  const chartData = [
    {
      name: 'Last Month',
      'Scheduled JP': activeWi.jpLastMonth,
    },
    {
      name: 'Current Month',
      'Scheduled JP': totalJp,
    }
  ];

  // Get upcoming schedules for visual timeline
  const upcomingTimelineSessions = [...wiSessions]
    .filter(s => new Date(s.date) >= new Date(2026, 2, 1)) // Focus on March 2026
    .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))
    .slice(0, 3);

  return (
    <div className="min-h-screen flex bg-slate-100">

      {/* 2. OUTER SIDEBAR (Sidebar Utama) */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col justify-between border-r border-slate-800 shrink-0 hidden md:flex">
        <div>
          <div className="p-6 border-b border-slate-800 flex items-center gap-3">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-base tracking-tight">WTMS WI</h2>
              <p className="text-[10px] text-slate-400">Widyaiswara Portal</p>
            </div>
          </div>

          <nav className="p-4 space-y-1">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors bg-indigo-600 text-white shadow-md shadow-indigo-600/10">
              <LayoutDashboard className="h-4 w-4" />
              Overview
            </button>
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800 space-y-4">
          <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-700/50">
            <p className="text-[10px] text-slate-400">Logged in as</p>
            <p className="text-xs font-semibold text-slate-200 truncate">{activeWi.name}</p>
          </div>
          <Button
            variant="destructive"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-600/25 hover:bg-red-600 text-red-200 hover:text-white border border-red-500/20 py-2.5 text-xs font-semibold transition-all"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out Portal
          </Button>
        </div>
      </aside>

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* 3. ATTRAKTIF GRADIENT HEADER */}
        <header className="relative bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white px-8 py-6 shadow-lg overflow-hidden shrink-0">
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-500/35 rounded-full blur-3xl" />

          <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase mb-2 w-fit border border-white/20">
                <Sparkles className="h-3.5 w-3.5 text-amber-300 animate-pulse" />
                Civil Service Training Engine
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Widyaiswara Dashboard</h1>
              <p className="text-sm text-indigo-100 mt-1 max-w-xl">
                Monitor scheduled learning hours, competency load-balancing targets, and real-time agenda constraints.
              </p>
            </div>

            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/15 shadow-inner">
              <span className="text-xs text-indigo-200 font-semibold whitespace-nowrap">Viewing Profile:</span>
              <Select value={activeWi.id} onValueChange={setSelectedWiId}>
                <SelectTrigger className="h-8 bg-slate-900/60 border-none text-white font-bold focus:ring-0 px-2.5 py-1 gap-1 text-xs rounded-lg">
                  <SelectValue placeholder="Select profile" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-white">
                  {widyaswaras.map(w => (
                    <SelectItem key={w.id} value={w.id} className="hover:bg-slate-800 focus:bg-slate-800 text-xs font-semibold">
                      {w.name}, {w.gelar}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </header>

        {/* Dashboard Workspace */}
        <div className="flex-1 p-8 overflow-y-auto grid lg:grid-cols-4 gap-8">

          {/* LEFT SIDE: MAIN DASHBOARD AREA (3 COLS) */}
          <div className="lg:col-span-3 space-y-8">

            {/* Widyaiswara Profile Details */}
            <Card className="bg-white border-slate-200 shadow-sm overflow-hidden rounded-xl">
              <CardContent className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm shrink-0">
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
                      <span className="flex items-center gap-1 font-semibold text-indigo-600">
                        <Award className="h-3.5 w-3.5 text-indigo-500" />
                        Competency Level {activeWi.level} ({activeWi.levelLabel})
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">
                      <span className="font-mono">NIP: {activeWi.nip || 'N/A'}</span>
                      <span className="mx-2">•</span>
                      <span>Jabatan: {activeWi.jabatan || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Quick Stats Block */}
                <div className="flex gap-4 bg-slate-50 p-4 rounded-xl border border-slate-150 w-full md:w-auto justify-around shadow-sm">
                  <div className="text-center px-3">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Last Month</p>
                    <p className="text-base font-extrabold text-slate-700 mt-1">{activeWi.jpLastMonth} JP</p>
                  </div>
                  <div className="h-6 w-px bg-slate-200 self-center"></div>
                  <div className="text-center px-3">
                    <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">Current Month</p>
                    <p className="text-base font-black text-indigo-600 mt-1">{totalJp} JP</p>
                  </div>
                  <div className="h-6 w-px bg-slate-200 self-center"></div>
                  <div className="text-center px-3">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total Hours</p>
                    <p className="text-base font-extrabold text-slate-700 mt-1">{((totalJp * 45) / 60).toFixed(1)} hrs</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 3. CHARTS VISUALIZATION CONTAINER */}
            <Card className="shadow-sm border-slate-200 bg-white rounded-xl">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50">
                <CardTitle className="text-sm font-bold flex items-center gap-1.5 text-slate-800">
                  <TrendingUp className="h-4.5 w-4.5 text-indigo-600" />
                  Widyaiswara JP Performance Tracking
                </CardTitle>
                <CardDescription className="text-xs">
                  Monthly scheduled JP comparison relative to previous operational performance period.
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
                          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.95} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.8} />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Schedules Workspace (Personal vs Global) */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Calendar className="h-4.5 w-4.5 text-indigo-600" />
                    Teaching Schedules Portal
                  </h3>
                  <p className="text-xs text-slate-500">Examine operational scheduled slots from either a personal or global center perspective.</p>
                </div>

                {/* 1. PERSONAL VS GLOBAL TOGGLE */}
                <div className="flex items-center gap-2 bg-slate-200/80 p-1 rounded-xl border border-slate-300">
                  <button
                    onClick={() => setScheduleFilter('personal')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${scheduleFilter === 'personal'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                      }`}
                  >
                    Personal Schedule
                  </button>
                  <button
                    onClick={() => setScheduleFilter('global')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${scheduleFilter === 'global'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                      }`}
                  >
                    Global Schedules
                  </button>
                </div>
              </div>

              {/* View layout selectors */}
              <div className="flex justify-between items-center bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl shadow-sm">
                <Badge variant="outline" className="bg-indigo-50/50 text-indigo-700 border-indigo-150 font-bold px-2.5 py-1 text-xs">
                  {scheduleFilter === 'personal' ? 'My Schedule Only' : 'All WIs Schedule Feed'} ({activeScheduleSessions.length} sessions)
                </Badge>

                <div className="flex items-center bg-slate-200/60 p-1 rounded-lg border border-slate-300">
                  <button
                    onClick={() => setViewMode('table')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all ${viewMode === 'table' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                      }`}
                  >
                    <TableIcon className="h-3.5 w-3.5" />
                    Table View
                  </button>
                  <button
                    onClick={() => setViewMode('calendar')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all ${viewMode === 'calendar' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                      }`}
                  >
                    <Calendar className="h-3.5 w-3.5" />
                    Calendar View
                  </button>
                </div>
              </div>

              {activeScheduleSessions.length === 0 ? (
                <Card className="border-dashed border-slate-300 shadow-none py-16 text-center bg-white rounded-xl">
                  <CardContent className="space-y-3">
                    <Calendar className="h-12 w-12 text-slate-300 mx-auto" />
                    <p className="text-slate-600 font-bold text-base">No scheduled slots matches current context.</p>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      Please contact Super Admins if you expect learning sessions scheduled within current month timeframe.
                    </p>
                  </CardContent>
                </Card>
              ) : viewMode === 'calendar' ? (
                <div className="relative">
                  <CalendarView events={calendarEvents} title={`${scheduleFilter === 'personal' ? 'My Personal' : 'Global Center'} Schedule Feed`} />
                </div>
              ) : (
                <div className="space-y-8">
                  {Object.entries(sessionsByDate).map(([date, sessions]) => (
                    <div key={date} className="space-y-4">
                      {/* Date Header banner */}
                      <div className="flex items-center gap-3">
                        <div className="bg-indigo-50 border border-indigo-100 text-indigo-800 font-extrabold px-3 py-1.5 rounded-xl text-xs">
                          {new Date(date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                        <div className="h-px bg-slate-200 flex-1" />
                      </div>

                      {/* Session slots mapped */}
                      <div className="grid md:grid-cols-2 gap-6">
                        {sessions.map(session => {
                          const isOwnSession = session.wiId === activeWi.id;
                          return (
                            <Card
                              key={session.id}
                              className={`bg-white border transition-all duration-200 shadow-sm rounded-xl relative ${isOwnSession
                                  ? 'border-indigo-400 ring-1 ring-indigo-100 bg-gradient-to-tr from-white to-indigo-50/10'
                                  : 'border-slate-200'
                                }`}
                            >
                              {/* Own Session Label Overlay */}
                              {isOwnSession && (
                                <span className="absolute -top-2.5 -right-2.5 bg-indigo-600 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full shadow-md">
                                  My Session
                                </span>
                              )}

                              <CardHeader className="pb-3 border-b border-slate-50">
                                <div className="flex justify-between items-start gap-2">
                                  <Badge className={`font-semibold ${session.format === 'Klasikal' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                      session.format === 'Virtual' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                                        'bg-amber-100 text-amber-800 border-amber-200'
                                    }`}>
                                    {session.format}
                                  </Badge>
                                  <div className="flex items-center gap-1 text-xs text-slate-500 font-semibold">
                                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                                    {session.startTime} - {session.endTime}
                                  </div>
                                </div>
                                <CardTitle className="text-sm font-bold text-slate-900 mt-2">{session.mapelName}</CardTitle>
                                <CardDescription className="text-xs font-semibold text-indigo-600 flex items-center gap-1">
                                  <BookOpen className="h-3.5 w-3.5" />
                                  {session.batchName}
                                </CardDescription>
                              </CardHeader>
                              <CardContent className="pt-4 space-y-3">
                                <div className="flex flex-col gap-1.5 text-xs text-slate-600">
                                  <span className="flex items-center gap-1">
                                    <User className="h-3.5 w-3.5 text-slate-400" />
                                    Widyaiswara: <strong className="text-slate-800 truncate">{session.wiName}</strong>
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
                                    <span>Verified</span>
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

            {/* Read-Only Info banner footer */}
            <Card className="bg-blue-50 border-blue-100 shadow-none rounded-xl">
              <CardContent className="p-4 flex gap-3 text-sm text-blue-800">
                <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold">Need to request a schedule adjustment?</p>
                  <p className="text-xs text-blue-700">
                    This portal operates in secure read-only mode for instructors. To coordinate schedule revisions, venue switches, or formats, please contact Super Admins.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 2. RIGHT SIDE: INNER SIDEBAR AREA (1 COL) */}
          <div className="lg:col-span-1 space-y-8">

            {/* Day View Timeline Component */}
            <Card className="shadow-sm border-slate-200 bg-white rounded-xl">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-4 px-6">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">Day View Focus</CardTitle>
                <CardDescription className="text-xs">Timeline agenda for active date focus.</CardDescription>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Target Day</span>
                  <input
                    type="date"
                    value={selectedDayDate}
                    onChange={e => setSelectedDayDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-3 pt-2">
                  {wiSessions.filter(s => s.date === selectedDayDate).length === 0 ? (
                    <p className="text-xs text-slate-400 italic text-center py-4">No schedule slots assigned for {selectedDayDate}.</p>
                  ) : (
                    wiSessions.filter(s => s.date === selectedDayDate).map(s => (
                      <div key={s.id} className="p-3 bg-slate-50 rounded-lg border border-slate-150 space-y-1.5 relative hover:border-indigo-200 transition-all">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">{s.startTime} - {s.endTime}</span>
                          <span className="text-[9px] text-slate-400 font-bold">{s.jpCount} JP</span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-950 line-clamp-1">{s.mapelName}</h4>
                        <p className="text-[9px] text-slate-400 flex items-center gap-1"><MapPin className="h-3 w-3 shrink-0" /> {s.lokasiName}</p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Schedules Timeline Component */}
            <Card className="shadow-sm border-slate-200 bg-white rounded-xl">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-4 px-6">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">Upcoming Agenda</CardTitle>
                <CardDescription className="text-xs">Schedules upcoming timeline agenda.</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {upcomingTimelineSessions.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center">No upcoming agenda scheduled.</p>
                ) : (
                  <div className="relative border-l border-slate-200 pl-4 space-y-6">
                    {upcomingTimelineSessions.map((s, idx) => (
                      <div key={s.id} className="relative">
                        {/* Bullet point dot */}
                        <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-indigo-600 border border-white shadow-sm" />

                        <div className="space-y-1">
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                            {new Date(s.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} • {s.startTime}
                          </p>
                          <h4 className="text-xs font-extrabold text-slate-800 line-clamp-1">{s.mapelName}</h4>
                          <p className="text-[10px] text-slate-500 font-medium truncate flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                            {s.lokasiName}
                          </p>
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