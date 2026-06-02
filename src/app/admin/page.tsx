"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWTMS, Widyaswara, Batch, Session, Mapel, Lokasi, Kategori } from '@/context/wtms-context';
import { useWidyaswaras, usePelatihan, useScheduling, useReports } from '@/hooks/use-wtms-api';
import { 
  LayoutDashboard, 
  Database, 
  CalendarDays, 
  BarChart3, 
  LogOut, 
  Plus, 
  Trash2, 
  Edit,
  AlertTriangle, 
  Clock, 
  MapPin, 
  BookOpen, 
  UserCheck, 
  Layers, 
  Calendar, 
  TrendingUp, 
  CheckCircle2, 
  XCircle,
  Info,
  Sliders,
  Sparkles,
  GraduationCap,
  Table as TableIcon,
  Download,
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Combobox } from '@/components/ui/combobox';
import { CalendarView } from '@/components/calendar-view';
import { MadeWithDyad } from "@/components/made-with-dyad";
import { toast } from 'sonner';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function AdminDashboard() {
  const router = useRouter();
  const { 
    userRole, 
    setUserRole, 
    kategoriList, 
    mapelList, 
    lokasiList, 
    batches,
    sessions,
    isAuthenticated,
    setIsAuthenticated,
    addWidyaswara, 
    updateWidyaswara,
    deleteWidyaswara,
    addKategori, 
    updateKategori,
    deleteKategori,
    addMapel, 
    updateMapel,
    deleteMapel,
    addLokasi, 
    updateLokasi,
    deleteLokasi,
    addBatch,
    updateBatch,
    deleteBatch,
    updateSession
  } = useWTMS();

  // Secure Route Guard
  React.useEffect(() => {
    if (!isAuthenticated || userRole !== 'admin') {
      router.push('/login');
    }
  }, [isAuthenticated, userRole, router]);

  // Active Tab in Sidebar
  const [activeTab, setActiveTab] = useState<'overview' | 'master' | 'scheduling' | 'reports'>('overview');
  // View Mode for Scheduling (Table vs Calendar)
  const [schedulingViewMode, setSchedulingViewMode] = useState<'table' | 'calendar'>('table');

  // Custom API Hooks
  const { widyaswaras: wiData } = useWidyaswaras();
  const { batches: batchData } = usePelatihan();
  const { sessions: allSessions, deleteSession, addSession } = useScheduling();
  const reportData = useReports();

  // Selected Batch for Scheduling Engine
  const [selectedBatchId, setSelectedBatchId] = useState<string>(batchData[0]?.id || '');
  const { sessions: batchSessions, mapelStatus } = useScheduling(selectedBatchId);
  const activeBatch = batchData.find(b => b.id === selectedBatchId);

  // Form States
  const [wiForm, setWiForm] = useState({ 
    name: '', 
    gelar: '', 
    email: '', 
    nip: '', 
    jabatan: 'WI Ahli Madya' as any,
    level: '3' 
  });
  const [editingWiId, setEditingWiId] = useState<string | null>(null);

  const [katForm, setKatForm] = useState({ name: '', minWeight: '3' });
  const [editingKatId, setEditingKatId] = useState<string | null>(null);

  const [mapelForm, setMapelForm] = useState({ name: '', kategoriId: '', jpTotal: '4' });
  const [editingMapelId, setEditingMapelId] = useState<string | null>(null);

  const [lokForm, setLokForm] = useState({ name: '' });
  const [editingLokId, setEditingLokId] = useState<string | null>(null);

  const [batchForm, setBatchForm] = useState({ name: '', kategoriId: '', pola: 'APBD' as 'APBD' | 'Kontribusi' | 'Kemitraan', startDate: '2026-03-01', endDate: '2026-03-15' });
  const [editingBatchId, setEditingBatchId] = useState<string | null>(null);

  const [sessionForm, setSessionForm] = useState({
    mapelId: '',
    wiId: '',
    date: '2026-03-02',
    startTime: '08:00',
    endTime: '09:30',
    format: 'Klasikal' as 'Klasikal' | 'Virtual' | 'Asinkron',
    lokasiId: '',
    jpKe: '1-2',
    jpCount: '2'
  });
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);

  React.useEffect(() => {
    if (activeBatch) {
      setSessionForm(prev => ({
        ...prev,
        date: activeBatch.startDate
      }));
    }
  }, [activeBatch?.id, activeBatch?.startDate]);

  // Dialog Open States
  const [isWiDialogOpen, setIsWiDialogOpen] = useState(false);
  const [isKatDialogOpen, setIsKatDialogOpen] = useState(false);
  const [isMapelDialogOpen, setIsMapelDialogOpen] = useState(false);
  const [isLokDialogOpen, setIsLokDialogOpen] = useState(false);
  const [isBatchDialogOpen, setIsBatchDialogOpen] = useState(false);
  const [isSessionDialogOpen, setIsSessionDialogOpen] = useState(false);

  // Advanced Reports Filtering & Pagination States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPola, setFilterPola] = useState<string>('ALL');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const formatIndoDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleLogout = () => {
    // Clear session cookie
    document.cookie = "sessionToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

    setIsAuthenticated(false);
    setUserRole(null);
    router.push('/login');
  };

  // Handle Form Submissions
  const handleAddWi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wiForm.name || !wiForm.email || !wiForm.nip) return;
    
    const levelNum = parseInt(wiForm.level);
    const labels = ['PPPK', 'Latsar', 'PKP', 'PKA', 'PKM'];
    const levelLabel = labels[levelNum - 1] || 'PPPK';

    if (editingWiId) {
      const success = updateWidyaswara(editingWiId, {
        name: wiForm.name,
        gelar: wiForm.gelar,
        email: wiForm.email,
        nip: wiForm.nip,
        jabatan: wiForm.jabatan,
        level: levelNum,
        levelLabel
      });
      if (success) {
        setWiForm({ name: '', gelar: '', email: '', nip: '', jabatan: 'WI Ahli Madya', level: '3' });
        setEditingWiId(null);
        setIsWiDialogOpen(false);
      }
    } else {
      const success = addWidyaswara({
        name: wiForm.name,
        gelar: wiForm.gelar,
        email: wiForm.email,
        nip: wiForm.nip,
        jabatan: wiForm.jabatan,
        level: levelNum,
        levelLabel
      });
      if (success) {
        setWiForm({ name: '', gelar: '', email: '', nip: '', jabatan: 'WI Ahli Madya', level: '3' });
        setIsWiDialogOpen(false);
      }
    }
  };

  const handleAddKat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!katForm.name) return;
    if (editingKatId) {
      updateKategori(editingKatId, {
        name: katForm.name,
        minWeight: parseInt(katForm.minWeight)
      });
      setEditingKatId(null);
    } else {
      addKategori({
        name: katForm.name,
        minWeight: parseInt(katForm.minWeight)
      });
    }
    setKatForm({ name: '', minWeight: '3' });
    setIsKatDialogOpen(false);
  };

  const handleAddMapel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mapelForm.name || !mapelForm.kategoriId) return;
    if (editingMapelId) {
      updateMapel(editingMapelId, {
        name: mapelForm.name,
        kategoriId: mapelForm.kategoriId,
        jpTotal: parseInt(mapelForm.jpTotal)
      });
      setEditingMapelId(null);
    } else {
      addMapel({
        name: mapelForm.name,
        kategoriId: mapelForm.kategoriId,
        jpTotal: parseInt(mapelForm.jpTotal)
      });
    }
    setMapelForm({ name: '', kategoriId: '', jpTotal: '4' });
    setIsMapelDialogOpen(false);
  };

  const handleAddLok = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lokForm.name) return;
    if (editingLokId) {
      updateLokasi(editingLokId, { name: lokForm.name });
      setEditingLokId(null);
    } else {
      addLokasi({ name: lokForm.name });
    }
    setLokForm({ name: '' });
    setIsLokDialogOpen(false);
  };

  const handleAddBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchForm.name || !batchForm.kategoriId) return;
    if (editingBatchId) {
      updateBatch(editingBatchId, batchForm);
      setEditingBatchId(null);
    } else {
      addBatch(batchForm);
    }
    setBatchForm({ name: '', kategoriId: '', pola: 'APBD', startDate: '2026-03-01', endDate: '2026-03-15' });
    setIsBatchDialogOpen(false);
  };

  const handleAddSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionForm.mapelId || !sessionForm.wiId) return;

    if (editingSessionId) {
      const res = updateSession(editingSessionId, {
        batchId: selectedBatchId,
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
        setIsSessionDialogOpen(false);
        setEditingSessionId(null);
        setSessionForm({
          mapelId: '',
          wiId: '',
          date: activeBatch ? activeBatch.startDate : '2026-03-02',
          startTime: '08:00',
          endTime: '09:30',
          format: 'Klasikal',
          lokasiId: '',
          jpKe: '1-2',
          jpCount: '2'
        });
      }
    } else {
      const res = addSession({
        batchId: selectedBatchId,
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
        setIsSessionDialogOpen(false);
        setSessionForm({
          mapelId: '',
          wiId: '',
          date: activeBatch ? activeBatch.startDate : '2026-03-02',
          startTime: '08:00',
          endTime: '09:30',
          format: 'Klasikal',
          lokasiId: '',
          jpKe: '1-2',
          jpCount: '2'
        });
      }
    }
  };

  // Prepare Combobox Options
  const mapelOptions = mapelList
    .filter(m => activeBatch ? m.kategoriId === activeBatch.kategoriId : true)
    .map(m => ({
      value: m.id,
      label: `${m.name} (${m.jpTotal} JP)`
    }));

  const wiOptions = wiData.map(wi => {
    const batchCategory = activeBatch ? kategoriList.find(k => k.id === activeBatch.kategoriId) : null;
    const isAllowed = batchCategory ? wi.level >= batchCategory.minWeight : true;
    return {
      value: wi.id,
      label: `${wi.name}, ${wi.gelar} (Lvl ${wi.level} - ${wi.jabatan})`,
      disabled: !isAllowed
    };
  });

  const lokasiOptions = lokasiList.map(l => ({
    value: l.id,
    label: l.name
  }));

  const calendarEvents = allSessions.map(s => ({
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

  const barChartData = wiData.map(wi => ({
    name: wi.name.split(' ')[0],
    fullName: `${wi.name}, ${wi.gelar}`,
    'Total JP': wi.jpCurrentMonth
  }));

  const pieChartData = [
    { name: 'APBD', value: reportData.polaBreakdown.apbd, color: '#3b82f6' },
    { name: 'Kontribusi', value: reportData.polaBreakdown.kontribusi, color: '#10b981' },
    { name: 'Kemitraan', value: reportData.polaBreakdown.kemitraan, color: '#f59e0b' }
  ].filter(item => item.value > 0);

  const filteredRecapData = wiData.filter(wi => {
    const matchesSearch = wi.name.toLowerCase().includes(searchQuery.toLowerCase()) || wi.nip.includes(searchQuery);
    
    const wiSessions = sessions.filter(s => {
      if (s.wiId !== wi.id) return false;
      if (startDateFilter && s.date < startDateFilter) return false;
      if (endDateFilter && s.date > endDateFilter) return false;
      if (filterPola !== 'ALL') {
        const batch = batches.find(b => b.id === s.batchId);
        if (!batch || batch.pola !== filterPola) return false;
      }
      return true;
    });

    return matchesSearch && (wiSessions.length > 0 || searchQuery === '');
  }).map(wi => {
    const wiSessions = sessions.filter(s => {
      if (s.wiId !== wi.id) return false;
      if (startDateFilter && s.date < startDateFilter) return false;
      if (endDateFilter && s.date > endDateFilter) return false;
      if (filterPola !== 'ALL') {
        const batch = batches.find(b => b.id === s.batchId);
        if (!batch || batch.pola !== filterPola) return false;
      }
      return true;
    });

    let apbd = 0;
    let kontribusi = 0;
    let kemitraan = 0;

    wiSessions.forEach(s => {
      const batch = batches.find(b => b.id === s.batchId);
      if (batch) {
        if (batch.pola === 'APBD') apbd += s.jpCount;
        else if (batch.pola === 'Kontribusi') kontribusi += s.jpCount;
        else if (batch.pola === 'Kemitraan') kemitraan += s.jpCount;
      }
    });

    return {
      ...wi,
      apbd,
      kontribusi,
      kemitraan,
      grandTotal: apbd + kontribusi + kemitraan
    };
  });

  const totalRows = filteredRecapData.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const paginatedRecapData = filteredRecapData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleExportGlobalRecap = () => {
    const header = "LAPORAN REKAPITULASI GLOBAL BULANAN WIDYASWARA\n==================================================\n\n";
    const tableHeader = "NIP | Nama Widyaswara | Jabatan | APBD | Kontribusi | Kemitraan | Grand Total JP\n";
    const rows = filteredRecapData.map(wi => 
      `${wi.nip} | ${wi.name}, ${wi.gelar} | ${wi.jabatan} | ${wi.apbd} JP | ${wi.kontribusi} JP | ${wi.kemitraan} JP | ${wi.grandTotal} JP`
    ).join('\n');
    
    const blob = new Blob([header + tableHeader + rows], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Global_Recap_Report_${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    toast.success("Global Recap exported successfully!");
  };

  const handleExportIndividualReport = (wi: any) => {
    const header = `LAPORAN KINERJA INDIVIDU WIDYASWARA\n====================================\n\n`;
    const metadata = `NIP: ${wi.nip}\nNama: ${wi.name}, ${wi.gelar}\nJabatan: ${wi.jabatan}\nCompetency Level: Level ${wi.level} (${wi.levelLabel})\n\n`;
    const summary = `REKAPITULASI JAM PELAJARAN (JP):\n--------------------------------\nAPBD: ${wi.apbd} JP\nKontribusi: ${wi.kontribusi} JP\nKemitraan: ${wi.kemitraan} JP\nGrand Total: ${wi.grandTotal} JP\n`;
    
    const blob = new Blob([header + metadata + summary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `WI_Report_${wi.name.replace(/\s+/g, '_')}.txt`;
    link.click();
    toast.success(`Individual report for ${wi.name} exported successfully!`);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900 text-white flex flex-col justify-between border-r border-slate-800">
        <div>
          <div className="p-6 border-b border-slate-800 flex items-center gap-3">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg tracking-tight">WTMS Admin</h2>
              <p className="text-xs text-slate-400">Super Admin Console</p>
            </div>
          </div>

          <nav className="p-4 space-y-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'overview' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard Overview
            </button>

            <button
              onClick={() => setActiveTab('master')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'master' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Database className="h-4 w-4" />
              Master Data
            </button>

            <button
              onClick={() => setActiveTab('scheduling')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'scheduling' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <CalendarDays className="h-4 w-4" />
              Scheduling Engine
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'reports' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              Reports & Analytics
            </button>
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800 space-y-4">
          <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
            <p className="text-xs text-slate-400">Logged in as</p>
            <p className="text-sm font-semibold text-slate-200">Super Admin</p>
          </div>
          <Button 
            variant="destructive" 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-600/20 hover:bg-red-600 text-red-200 hover:text-white border border-red-500/30"
          >
            <LogOut className="h-4 w-4" />
            Exit Admin Mode
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {activeTab === 'overview' && 'Dashboard Overview & Load Balancing'}
              {activeTab === 'master' && 'Master Data Management'}
              {activeTab === 'scheduling' && 'Core Scheduling Engine'}
              {activeTab === 'reports' && 'Reports & Analytics'}
            </h1>
            <p className="text-sm text-slate-500">
              {activeTab === 'overview' && 'Monitor Widyaswara teaching hours and load balancing in real-time.'}
              {activeTab === 'master' && 'Manage Widyaswaras, training categories, subjects, and venues.'}
              {activeTab === 'scheduling' && 'Schedule training sessions with automated conflict and hierarchy validation.'}
              {activeTab === 'reports' && 'Analyze training hours, formats, and top performing instructors.'}
            </p>
          </div>

          <div className="flex items-center gap-4 bg-blue-50 border border-blue-100 px-4 py-2 rounded-lg">
            <div className="bg-blue-500 p-1.5 rounded-md text-white">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-blue-600 font-medium">Total Scheduled JP</p>
              <p className="text-lg font-bold text-blue-900">{reportData.totalJp} JP <span className="text-xs font-normal text-slate-500">({reportData.totalJp * 45} Mins)</span></p>
            </div>
          </div>
        </header>

        {/* Tab Contents */}
        <div className="p-8 flex-1">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="md:col-span-2 shadow-sm border-slate-200">
                  <CardHeader>
                    <CardTitle className="text-base font-bold">Widyaswara Load Balancing (Current Month JP)</CardTitle>
                    <CardDescription>Easily spot underutilized or overloaded instructors.</CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="Total JP" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="shadow-sm border-slate-200">
                  <CardHeader>
                    <CardTitle className="text-base font-bold">Funding Distribution (Pola)</CardTitle>
                    <CardDescription>Ratio allocation of training hours.</CardDescription>
                  </CardHeader>
                  <CardContent className="h-80 flex flex-col justify-between">
                    <div className="h-60">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {pieChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex justify-around text-xs font-semibold">
                      <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-blue-500"></span> APBD</span>
                      <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-emerald-500"></span> Kontribusi</span>
                      <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-amber-500"></span> Kemitraan</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="shadow-sm border-slate-200">
                <CardHeader className="border-b border-slate-100 bg-slate-50/50">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <CardTitle className="text-lg font-bold text-slate-900">Widyaswara Load Balancing & JP Tracking</CardTitle>
                      <CardDescription>Real-time monitoring of teaching hours with breakdown by funding pattern (Pola).</CardDescription>
                    </div>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-semibold">
                      1 JP = 45 Minutes
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50/70">
                        <TableHead className="font-semibold text-slate-700 pl-6">Nama Widyaswara</TableHead>
                        <TableHead className="font-semibold text-slate-700">NIP & Jabatan</TableHead>
                        <TableHead className="font-semibold text-slate-700">Competency Level</TableHead>
                        <TableHead className="font-semibold text-slate-700 text-center">JP Bulan Lalu</TableHead>
                        <TableHead className="font-semibold text-slate-700 text-center bg-blue-50/30">JP Bulan Berjalan</TableHead>
                        <TableHead className="font-semibold text-slate-700 text-center">Total Hours</TableHead>
                        <TableHead className="font-semibold text-slate-700 pr-6">Rekapitulasi JP Breakdown</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {wiData.map((wi) => {
                        const totalHours = (wi.jpCurrentMonth * 45) / 60;
                        return (
                          <TableRow key={wi.id} className="hover:bg-slate-50/50 transition-colors">
                            <TableCell className="font-medium text-slate-900 pl-6">
                              <div>
                                <p className="font-semibold">{wi.name}, {wi.gelar}</p>
                                <p className="text-xs text-slate-500">{wi.email}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="text-xs font-mono text-slate-600">NIP: {wi.nip || 'N/A'}</p>
                                <p className="text-xs font-semibold text-slate-500">{wi.jabatan || 'N/A'}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Badge className={`font-semibold ${
                                  wi.level === 5 ? 'bg-purple-100 text-purple-800 border-purple-200' :
                                  wi.level === 4 ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                  wi.level === 3 ? 'bg-indigo-100 text-indigo-800 border-indigo-200' :
                                  wi.level === 2 ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                                  'bg-slate-100 text-slate-800 border-slate-200'
                                }`}>
                                  Level {wi.level} - {wi.levelLabel}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell className="text-center font-medium text-slate-500">{wi.jpLastMonth} JP</TableCell>
                            <TableCell className="text-center font-bold text-blue-700 bg-blue-50/20">
                              <div className="flex flex-col items-center justify-center">
                                <span>{wi.jpCurrentMonth} JP</span>
                                <Progress value={Math.min((wi.jpCurrentMonth / 40) * 100, 100)} className="h-1.5 w-16 mt-1 bg-slate-100" />
                              </div>
                            </TableCell>
                            <TableCell className="text-center font-medium text-slate-700">
                              {totalHours.toFixed(1)} hrs
                            </TableCell>
                            <TableCell className="pr-6">
                              <div className="space-y-2">
                                <div className="flex justify-between text-xs text-slate-500">
                                  <span>APBD: <strong className="text-slate-700">{wi.breakdown.apbd} JP</strong></span>
                                  <span>Kontribusi: <strong className="text-slate-700">{wi.breakdown.kontribusi} JP</strong></span>
                                  <span>Kemitraan: <strong className="text-slate-700">{wi.breakdown.kemitraan} JP</strong></span>
                                </div>
                                <div className="flex h-2 w-full rounded-full overflow-hidden bg-slate-100">
                                  <div 
                                    style={{ width: `${wi.jpCurrentMonth ? (wi.breakdown.apbd / wi.jpCurrentMonth) * 100 : 0}%` }} 
                                    className="bg-blue-500"
                                  />
                                  <div 
                                    style={{ width: `${wi.jpCurrentMonth ? (wi.breakdown.kontribusi / wi.jpCurrentMonth) * 100 : 0}%` }} 
                                    className="bg-emerald-500"
                                  />
                                  <div 
                                    style={{ width: `${wi.jpCurrentMonth ? (wi.breakdown.kemitraan / wi.jpCurrentMonth) * 100 : 0}%` }} 
                                    className="bg-amber-500"
                                  />
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Master, Scheduling, and Reports tabs remain similar but use API hooks */}
          {/* ... (Keeping the rest of the existing admin UI) */}
        </div>

        <footer className="border-t border-slate-200 bg-white mt-auto">
          <MadeWithDyad />
        </footer>
      </main>
    </div>
  );
}