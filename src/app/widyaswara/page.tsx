"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWTMS, Session } from '@/context/wtms-context';
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
  Table as TableIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CalendarView } from '@/components/calendar-view';
import { MadeWithDyad } from "@/components/made-with-dyad";

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

  // Get current active Widyaswara profile
  const activeWi = widyaswaras.find(w => w.id === selectedWiId) || widyaswaras[0];

  // Get all sessions with details
  const { sessions: allSessions } = useScheduling();

  // Filter sessions for this specific Widyaswara
  const wiSessions = allSessions.filter(s => s.wiId === activeWi?.id);

  // Sort sessions by date and start time
  const sortedSessions = [...wiSessions].sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.startTime.compare(b.startTime);
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
    // Clear session cookie
    document.cookie = "sessionToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    
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
  const calendarEvents = wiSessions.map(s => ({
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

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Top Navigation Bar */}
      <header className="bg-slate-900 text-white border-b border-slate-800 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-md">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-xl tracking-tight">WTMS Widyaswara Portal</h1>
            <p className="text-xs text-slate-400">Personalized Schedule & Compliance View</p>
          </div>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
            <span className="text-xs text-slate-400 font-medium">Viewing Profile:</span>
            <Select value={activeWi.id} onValueChange={setSelectedWiId}>
              <SelectTrigger className="h-8 bg-transparent border-none text-white font-semibold focus:ring-0 p-0 gap-1">
                <SelectValue placeholder="Select profile" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-800 text-white">
                {widyaswaras.map(w => (
                  <SelectItem key={w.id} value={w.id} className="hover:bg-slate-800 focus:bg-slate-800">
                    {w.name}, {w.gelar}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button 
            variant="destructive" 
            onClick={handleLogout}
            className="bg-red-600/20 hover:bg-red-600 text-red-200 hover:text-white border border-red-500/30 flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-6 py-8 max-w-5xl space-y-8">
        
        {/* Widyaswara Profile Card */}
        <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 h-24"></div>
          <CardContent className="p-6 -mt-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-full bg-slate-100 border-4 border-white shadow-md flex items-center justify-center text-indigo-600">
                <User className="h-10 w-10" />
              </div>
              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-slate-900">{activeWi.name}, {activeWi.gelar}</h2>
                <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                  <span className="flex items-center gap-1">
                    <Mail className="h-4 w-4 text-slate-400" />
                    {activeWi.email}
                  </span>
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-300"></span>
                  <span className="flex items-center gap-1">
                    <Award className="h-4 w-4 text-slate-400" />
                    Competency Level {activeWi.level} ({activeWi.levelLabel})
                  </span>
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  <span className="font-mono">NIP: {activeWi.nip || 'N/A'}</span>
                  <span className="mx-2">•</span>
                  <span>Jabatan: {activeWi.jabatan || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 w-full md:w-auto justify-around">
              <div className="text-center px-4">
                <p className="text-xs text-slate-500 font-medium">Bulan Lalu</p>
                <p className="text-xl font-bold text-slate-700">{activeWi.jpLastMonth} JP</p>
              </div>
              <div className="h-8 w-px bg-slate-200 self-center"></div>
              <div className="text-center px-4">
                <p className="text-xs text-indigo-600 font-semibold">Bulan Berjalan</p>
                <p className="text-xl font-extrabold text-indigo-600">{totalJp} JP</p>
              </div>
              <div className="h-8 w-px bg-slate-200 self-center"></div>
              <div className="text-center px-4">
                <p className="text-xs text-slate-500 font-medium">Total Jam</p>
                <p className="text-xl font-bold text-slate-700">{((totalJp * 45) / 60).toFixed(1)} hrs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Schedule Section */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-indigo-600" />
              Your Teaching Schedule (Read-Only)
            </h3>
            
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 font-semibold">
                {wiSessions.length} Sessions Scheduled
              </Badge>

              {/* View Mode Toggle */}
              <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
                <button
                  onClick={() => setViewMode('table')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                    viewMode === 'table'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <TableIcon className="h-3.5 w-3.5" />
                  Table View
                </button>
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                    viewMode === 'calendar'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Calendar className="h-3.5 w-3.5" />
                  Calendar View
                </button>
              </div>
            </div>
          </div>

          {wiSessions.length === 0 ? (
            <Card className="border-dashed border-slate-300 shadow-none py-16 text-center bg-white">
              <CardContent className="space-y-3">
                <Calendar className="h-12 w-12 text-slate-300 mx-auto" />
                <p className="text-slate-600 font-semibold text-lg">No sessions scheduled yet.</p>
                <p className="text-sm text-slate-400 max-w-md mx-auto">
                  You currently have no teaching assignments scheduled for this month. Please contact the Super Admin if you believe this is an error.
                </p>
              </CardContent>
            </Card>
          ) : viewMode === 'calendar' ? (
            <CalendarView events={calendarEvents} title={`Personal Schedule - ${activeWi.name}`} />
          ) : (
            <div className="space-y-8">
              {Object.entries(sessionsByDate).map(([date, sessions]) => (
                <div key={date} className="space-y-4">
                  {/* Date Header */}
                  <div className="flex items-center gap-3">
                    <div className="bg-indigo-100 text-indigo-800 font-bold px-3 py-1 rounded-lg text-sm border border-indigo-200">
                      {new Date(date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                    <div className="h-px bg-slate-200 flex-1"></div>
                  </div>

                  {/* Sessions on this Date */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {sessions.map(session => (
                      <Card key={session.id} className="bg-white border-slate-200 hover:border-indigo-300 transition-all duration-200 shadow-sm">
                        <CardHeader className="pb-3 border-b border-slate-50">
                          <div className="flex justify-between items-start gap-2">
                            <Badge className={`font-semibold ${
                              session.format === 'Klasikal' ? 'bg-blue-100 text-blue-800 border-blue-200' :
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
                          <CardTitle className="text-base font-bold text-slate-900 mt-2">{session.mapelName}</CardTitle>
                          <CardDescription className="text-xs font-medium text-indigo-600 flex items-center gap-1">
                            <BookOpen className="h-3.5 w-3.5" />
                            {session.batchName}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-3">
                          <div className="flex items-center justify-between text-xs text-slate-600">
                            <span className="flex items-center gap-1 font-medium">
                              <MapPin className="h-4 w-4 text-slate-400" />
                              Venue: <strong className="text-slate-800">{session.lokasiName}</strong>
                            </span>
                            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">
                              JP Ke: {session.jpKe} ({session.jpCount} JP)
                            </span>
                          </div>

                          <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-2.5 flex items-center gap-2 text-xs text-emerald-800">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            <span>Hierarchy & schedule verified by WTMS Engine.</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Banner */}
        <Card className="bg-blue-50 border-blue-100 shadow-none">
          <CardContent className="p-4 flex gap-3 text-sm text-blue-800">
            <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">Need to request a schedule change?</p>
              <p className="text-xs text-blue-700">
                This portal is read-only. To request rescheduling, venue changes, or format adjustments, please contact the Super Admin or Training Coordinator.
              </p>
            </div>
          </CardContent>
        </Card>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white mt-auto">
        <MadeWithDyad />
      </footer>
    </div>
  );
}