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

// Recharts imports
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
  // 1. Widyaswara Form
  const [wiForm, setWiForm] = useState({ 
    name: '', 
    gelar: '', 
    email: '', 
    nip: '', 
    jabatan: 'WI Ahli Madya' as any,
    level: '3' 
  });
  const [editingWiId, setEditingWiId] = useState<string | null>(null);

  // 2. Kategori Form
  const [katForm, setKatForm] = useState({ name: '', minWeight: '3' });
  const [editingKatId, setEditingKatId] = useState<string | null>(null);

  // 3. Mapel Form
  const [mapelForm, setMapelForm] = useState({ name: '', kategoriId: '', jpTotal: '4' });
  const [editingMapelId, setEditingMapelId] = useState<string | null>(null);

  // 4. Lokasi Form
  const [lokForm, setLokForm] = useState({ name: '' });
  const [editingLokId, setEditingLokId] = useState<string | null>(null);

  // 5. Batch Form
  const [batchForm, setBatchForm] = useState({ name: '', kategoriId: '', pola: 'APBD' as 'APBD' | 'Kontribusi' | 'Kemitraan', startDate: '2026-03-01', endDate: '2026-03-15' });
  const [editingBatchId, setEditingBatchId] = useState<string | null>(null);

  // 6. Session Form
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

  // Update default date in session form when active batch changes
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

  // Helper to format date to Indonesian style
  const formatIndoDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
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

  // Prepare Calendar Events
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

  // Chart Data Preparation
  const barChartData = wiData.map(wi => ({
    name: wi.name.split(' ')[0], // Short name for X-axis
    fullName: `${wi.name}, ${wi.gelar}`,
    'Total JP': wi.jpCurrentMonth
  }));

  const pieChartData = [
    { name: 'APBD', value: reportData.polaBreakdown.apbd, color: '#3b82f6' },
    { name: 'Kontribusi', value: reportData.polaBreakdown.kontribusi, color: '#10b981' },
    { name: 'Kemitraan', value: reportData.polaBreakdown.kemitraan, color: '#f59e0b' }
  ].filter(item => item.value > 0);

  // Advanced Filtering for Monthly Recap Table
  const filteredRecapData = wiData.filter(wi => {
    const matchesSearch = wi.name.toLowerCase().includes(searchQuery.toLowerCase()) || wi.nip.includes(searchQuery);
    
    // Calculate dynamic JP based on filters
    const wiSessions = sessions.filter(s => {
      if (s.wiId !== wi.id) return false;
      
      // Date Range Filter
      if (startDateFilter && s.date < startDateFilter) return false;
      if (endDateFilter && s.date > endDateFilter) return false;
      
      // Pola Filter
      if (filterPola !== 'ALL') {
        const batch = batches.find(b => b.id === s.batchId);
        if (!batch || batch.pola !== filterPola) return false;
      }
      
      return true;
    });

    return matchesSearch && (wiSessions.length > 0 || searchQuery === '');
  }).map(wi => {
    // Calculate filtered JP breakdown
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

  // Pagination Logic
  const totalRows = filteredRecapData.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const paginatedRecapData = filteredRecapData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // Export Global Recap (Simulated .docx layout generation)
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

  // Export Individual WI Report (Simulated .docx layout generation)
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
          {/* Sidebar Header */}
          <div className="p-6 border-b border-slate-800 flex items-center gap-3">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg tracking-tight">WTMS Admin</h2>
              <p className="text-xs text-slate-400">Super Admin Console</p>
            </div>
          </div>

          {/* Navigation Links */}
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

        {/* Sidebar Footer */}
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

          {/* Quick Stats Banner */}
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
          
          {/* 1. OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Visual Charts Integration */}
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

              {/* Load Balancing Table */}
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
                        <TableHead className="font-semibold text-slate-700 text-center">JP Bulan Lalu (Static)</TableHead>
                        <TableHead className="font-semibold text-slate-700 text-center bg-blue-50/30">JP Bulan Berjalan (Dinamis)</TableHead>
                        <TableHead className="font-semibold text-slate-700 text-center">Total Hours (Current)</TableHead>
                        <TableHead className="font-semibold text-slate-700 pr-6">Rekapitulasi JP Breakdown (APBD | Kontribusi | Kemitraan)</TableHead>
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
                                    title={`APBD: ${wi.breakdown.apbd} JP`}
                                  />
                                  <div 
                                    style={{ width: `${wi.jpCurrentMonth ? (wi.breakdown.kontribusi / wi.jpCurrentMonth) * 100 : 0}%` }} 
                                    className="bg-emerald-500"
                                    title={`Kontribusi: ${wi.breakdown.kontribusi} JP`}
                                  />
                                  <div 
                                    style={{ width: `${wi.jpCurrentMonth ? (wi.breakdown.kemitraan / wi.jpCurrentMonth) * 100 : 0}%` }} 
                                    className="bg-amber-500"
                                    title={`Kemitraan: ${wi.breakdown.kemitraan} JP`}
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

          {/* 2. MASTER DATA TAB */}
          {activeTab === 'master' && (
            <div className="space-y-8">
              <Tabs defaultValue="wi" className="w-full">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <TabsList className="bg-slate-100 p-1 rounded-lg">
                    <TabsTrigger value="wi" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Widyaswara</TabsTrigger>
                    <TabsTrigger value="kategori" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Kategori Pelatihan</TabsTrigger>
                    <TabsTrigger value="mapel" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Mata Pelajaran (Mapel)</TabsTrigger>
                    <TabsTrigger value="lokasi" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Lokasi / Ruangan</TabsTrigger>
                    <TabsTrigger value="batches" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Pelatihan (Batches)</TabsTrigger>
                  </TabsList>

                  {/* Add Buttons based on active sub-tab */}
                  <div className="flex gap-2">
                    <Dialog open={isWiDialogOpen} onOpenChange={setIsWiDialogOpen}>
                      <DialogTrigger asChild>
                        <Button onClick={() => {
                          setEditingWiId(null);
                          setWiForm({ name: '', gelar: '', email: '', nip: '', jabatan: 'WI Ahli Madya', level: '3' });
                        }} className="bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-2">
                          <Plus className="h-4 w-4" /> Add Widyaswara
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-white">
                        <DialogHeader>
                          <DialogTitle>{editingWiId ? 'Edit Widyaswara' : 'Add New Widyaswara'}</DialogTitle>
                          <DialogDescription>Create or update instructor profile with competency level weight.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleAddWi} className="space-y-4 py-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="wi-name">Full Name (Without Gelar)</Label>
                              <Input id="wi-name" placeholder="e.g. John Doe" value={wiForm.name} onChange={e => setWiForm({...wiForm, name: e.target.value})} required />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="wi-gelar">Gelar / Degree</Label>
                              <Input id="wi-gelar" placeholder="e.g. M.Pd., S.T." value={wiForm.gelar} onChange={e => setWiForm({...wiForm, gelar: e.target.value})} />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="wi-nip">NIP (Unique ID)</Label>
                              <Input id="wi-nip" placeholder="e.g. 198803152010121001" value={wiForm.nip} onChange={e => setWiForm({...wiForm, nip: e.target.value})} required />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="wi-email">Email Address</Label>
                              <Input id="wi-email" type="email" placeholder="e.g. john.doe@gmail.com" value={wiForm.email} onChange={e => setWiForm({...wiForm, email: e.target.value})} required />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="wi-jabatan">Jabatan</Label>
                              <Select value={wiForm.jabatan} onValueChange={val => setWiForm({...wiForm, jabatan: val as any})}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select jabatan" />
                                </SelectTrigger>
                                <SelectContent className="bg-white">
                                  <SelectItem value="WI Ahli Pertama">WI Ahli Pertama</SelectItem>
                                  <SelectItem value="WI Ahli Muda">WI Ahli Muda</SelectItem>
                                  <SelectItem value="WI Ahli Madya">WI Ahli Madya</SelectItem>
                                  <SelectItem value="WI Ahli Utama">WI Ahli Utama</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="wi-level">Competency Level Weight</Label>
                              <Select value={wiForm.level} onValueChange={val => setWiForm({...wiForm, level: val})}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select level" />
                                </SelectTrigger>
                                <SelectContent className="bg-white">
                                  <SelectItem value="5">Level 5 - PKM (Pelatihan Kepemimpinan Nasional)</SelectItem>
                                  <SelectItem value="4">Level 4 - PKA (Pelatihan Kepemimpinan Administrator)</SelectItem>
                                  <SelectItem value="3">Level 3 - PKP (Pelatihan Kepemimpinan Pengawas)</SelectItem>
                                  <SelectItem value="2">Level 2 - Latsar (Pelatihan Dasar CPNS)</SelectItem>
                                  <SelectItem value="1">Level 1 - PPPK (Pelatihan PPPK)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <DialogFooter className="pt-4">
                            <Button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white w-full">Save Widyaswara</Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>

                    <Dialog open={isBatchDialogOpen} onOpenChange={setIsBatchDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" onClick={() => {
                          setEditingBatchId(null);
                          setBatchForm({ name: '', kategoriId: '', pola: 'APBD', startDate: '2026-03-01', endDate: '2026-03-15' });
                        }} className="border-slate-200 hover:bg-slate-50 flex items-center gap-2">
                          <Plus className="h-4 w-4" /> Create Batch
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-white">
                        <DialogHeader>
                          <DialogTitle>{editingBatchId ? 'Edit Training Batch' : 'Create Training Batch'}</DialogTitle>
                          <DialogDescription>Set up or update a training batch with specific category and funding pattern.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleAddBatch} className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="batch-name">Batch Name</Label>
                            <Input id="batch-name" placeholder="e.g. PKA Angkatan II" value={batchForm.name} onChange={e => setBatchForm({...batchForm, name: e.target.value})} required />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="batch-kategori">Training Category</Label>
                            <Select value={batchForm.kategoriId} onValueChange={val => setBatchForm({...batchForm, kategoriId: val})}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent className="bg-white">
                                {kategoriList.map(k => (
                                  <SelectItem key={k.id} value={k.id}>{k.name} (Min Level {k.minWeight})</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="batch-pola">Funding Pattern (Pola)</Label>
                            <Select value={batchForm.pola} onValueChange={(val: any) => setBatchForm({...batchForm, pola: val})}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select pattern" />
                              </SelectTrigger>
                              <SelectContent className="bg-white">
                                <SelectItem value="APBD">APBD</SelectItem>
                                <SelectItem value="Kontribusi">Kontribusi</SelectItem>
                                <SelectItem value="Kemitraan">Kemitraan</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="batch-start">Start Date</Label>
                              <Input id="batch-start" type="date" value={batchForm.startDate} onChange={e => setBatchForm({...batchForm, startDate: e.target.value})} required />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="batch-end">End Date</Label>
                              <Input id="batch-end" type="date" value={batchForm.endDate} onChange={e => setBatchForm({...batchForm, endDate: e.target.value})} required />
                            </div>
                          </div>
                          <DialogFooter className="pt-4">
                            <Button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white">Save Batch</Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                {/* Widyaswara Sub-tab */}
                <TabsContent value="wi">
                  <Card className="shadow-sm border-slate-200">
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="pl-6">Name</TableHead>
                            <TableHead>NIP</TableHead>
                            <TableHead>Jabatan</TableHead>
                            <TableHead>Competency Level</TableHead>
                            <TableHead>Allowed Training Categories</TableHead>
                            <TableHead className="pr-6 text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {wiData.map(wi => (
                            <TableRow key={wi.id}>
                              <TableCell className="font-semibold text-slate-900 pl-6">{wi.name}, {wi.gelar}</TableCell>
                              <TableCell className="text-slate-600 font-mono text-xs">{wi.nip || 'N/A'}</TableCell>
                              <TableCell className="text-slate-600 font-medium text-xs">{wi.jabatan || 'N/A'}</TableCell>
                              <TableCell>
                                <Badge className="bg-blue-100 text-blue-800 border-blue-200 font-semibold">
                                  Level {wi.level} - {wi.levelLabel}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-1">
                                  {kategoriList.filter(k => wi.level >= k.minWeight).map(k => (
                                    <Badge key={k.id} variant="secondary" className="text-xs bg-slate-100 text-slate-700">
                                      {k.name.split(' ')[0]}
                                    </Badge>
                                  ))}
                                </div>
                              </TableCell>
                              <TableCell className="pr-6 text-right space-x-2">
                                <Button size="sm" variant="ghost" onClick={() => {
                                  setEditingWiId(wi.id);
                                  setWiForm({
                                    name: wi.name,
                                    gelar: wi.gelar,
                                    email: wi.email,
                                    nip: wi.nip,
                                    jabatan: wi.jabatan,
                                    level: String(wi.level)
                                  });
                                  setIsWiDialogOpen(true);
                                }} className="text-blue-600 hover:text-blue-800">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => {
                                  if (confirm(`Are you sure you want to delete ${wi.name}?`)) {
                                    deleteWidyaswara(wi.id);
                                  }
                                }} className="text-red-600 hover:text-red-800">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Kategori Sub-tab */}
                <TabsContent value="kategori">
                  <div className="grid md:grid-cols-3 gap-6">
                    <Card className="md:col-span-2 shadow-sm border-slate-200">
                      <CardContent className="p-0">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="pl-6">Category Name</TableHead>
                              <TableHead>Minimum Competency Weight Required</TableHead>
                              <TableHead className="pr-6 text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {kategoriList.map(k => (
                              <TableRow key={k.id}>
                                <TableCell className="font-semibold text-slate-900 pl-6">{k.name}</TableCell>
                                <TableCell>
                                  <Badge className="bg-amber-100 text-amber-800 border-amber-200 font-semibold">
                                    Level {k.minWeight} or higher
                                  </Badge>
                                </TableCell>
                                <TableCell className="pr-6 text-right space-x-2">
                                  <Button size="sm" variant="ghost" onClick={() => {
                                    setEditingKatId(k.id);
                                    setKatForm({ name: k.name, minWeight: String(k.minWeight) });
                                    setIsKatDialogOpen(true);
                                  }} className="text-blue-600 hover:text-blue-800">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button size="sm" variant="ghost" onClick={() => {
                                    if (confirm(`Are you sure you want to delete category ${k.name}?`)) {
                                      deleteKategori(k.id);
                                    }
                                  }} className="text-red-600 hover:text-red-800">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>

                    <Card className="shadow-sm border-slate-200">
                      <CardHeader>
                        <CardTitle className="text-base font-bold">{editingKatId ? 'Edit Category' : 'Add Category'}</CardTitle>
                        <CardDescription>Create or update a training category with minimum competency weight.</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={handleAddKat} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="kat-name">Category Name</Label>
                            <Input id="kat-name" placeholder="e.g. PKP" value={katForm.name} onChange={e => setKatForm({...katForm, name: e.target.value})} required />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="kat-weight">Minimum Weight Required</Label>
                            <Select value={katForm.minWeight} onValueChange={val => setKatForm({...katForm, minWeight: val})}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select weight" />
                              </SelectTrigger>
                              <SelectContent className="bg-white">
                                <SelectItem value="5">Level 5 (PKM)</SelectItem>
                                <SelectItem value="4">Level 4 (PKA)</SelectItem>
                                <SelectItem value="3">Level 3 (PKP)</SelectItem>
                                <SelectItem value="2">Level 2 (Latsar)</SelectItem>
                                <SelectItem value="1">Level 1 (PPPK)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white">Save Category</Button>
                        </form>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Mapel Sub-tab */}
                <TabsContent value="mapel">
                  <div className="grid md:grid-cols-3 gap-6">
                    <Card className="md:col-span-2 shadow-sm border-slate-200">
                      <CardContent className="p-0">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="pl-6">Subject Name (Mapel)</TableHead>
                              <TableHead>Category</TableHead>
                              <TableHead>Total JP Allocation</TableHead>
                              <TableHead className="pr-6 text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {mapelList.map(m => {
                              const cat = kategoriList.find(k => k.id === m.kategoriId);
                              return (
                                <TableRow key={m.id}>
                                  <TableCell className="font-semibold text-slate-900 pl-6">{m.name}</TableCell>
                                  <TableCell className="text-slate-600">{cat ? cat.name.split(' ')[0] : 'Unknown'}</TableCell>
                                  <TableCell>
                                    <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 font-semibold">
                                      {m.jpTotal} JP ({m.jpTotal * 45} Mins)
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="pr-6 text-right space-x-2">
                                    <Button size="sm" variant="ghost" onClick={() => {
                                      setEditingMapelId(m.id);
                                      setMapelForm({ name: m.name, kategoriId: m.kategoriId, jpTotal: String(m.jpTotal) });
                                      setIsMapelDialogOpen(true);
                                    }} className="text-blue-600 hover:text-blue-800">
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={() => {
                                      if (confirm(`Are you sure you want to delete subject ${m.name}?`)) {
                                        deleteMapel(m.id);
                                      }
                                    }} className="text-red-600 hover:text-red-800">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>

                    <Card className="shadow-sm border-slate-200">
                      <CardHeader>
                        <CardTitle className="text-base font-bold">{editingMapelId ? 'Edit Subject' : 'Add Subject'}</CardTitle>
                        <CardDescription>Create or update a subject with JP constraint (2 to 6 JP).</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={handleAddMapel} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="mapel-name">Subject Name</Label>
                            <Input id="mapel-name" placeholder="e.g. Manajemen Perubahan" value={mapelForm.name} onChange={e => setMapelForm({...mapelForm, name: e.target.value})} required />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="mapel-kategori">Training Category</Label>
                            <Select value={mapelForm.kategoriId} onValueChange={val => setMapelForm({...mapelForm, kategoriId: val})}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent className="bg-white">
                                {kategoriList.map(k => (
                                  <SelectItem key={k.id} value={k.id}>{k.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="mapel-jp">Total JP Allocation (2 - 6 JP)</Label>
                            <Select value={mapelForm.jpTotal} onValueChange={val => setMapelForm({...mapelForm, jpTotal: val})}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select JP" />
                              </SelectTrigger>
                              <SelectContent className="bg-white">
                                <SelectItem value="2">2 JP (90 Mins)</SelectItem>
                                <SelectItem value="3">3 JP (135 Mins)</SelectItem>
                                <SelectItem value="4">4 JP (180 Mins)</SelectItem>
                                <SelectItem value="5">5 JP (225 Mins)</SelectItem>
                                <SelectItem value="6">6 JP (270 Mins)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white">Save Subject</Button>
                        </form>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Lokasi Sub-tab */}
                <TabsContent value="lokasi">
                  <div className="grid md:grid-cols-3 gap-6">
                    <Card className="md:col-span-2 shadow-sm border-slate-200">
                      <CardContent className="p-0">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="pl-6">Location / Room Name</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="pr-6 text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {lokasiList.map(l => (
                              <TableRow key={l.id}>
                                <TableCell className="font-semibold text-slate-900 pl-6 flex items-center gap-2">
                                  <MapPin className="h-4 w-4 text-slate-400" />
                                  {l.name}
                                </TableCell>
                                <TableCell>
                                  <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 font-semibold">
                                    Available
                                  </Badge>
                                </TableCell>
                                <TableCell className="pr-6 text-right space-x-2">
                                  <Button size="sm" variant="ghost" onClick={() => {
                                    setEditingLokId(l.id);
                                    setLokForm({ name: l.name });
                                    setIsLokDialogOpen(true);
                                  }} className="text-blue-600 hover:text-blue-800">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button size="sm" variant="ghost" onClick={() => {
                                    if (confirm(`Are you sure you want to delete location ${l.name}?`)) {
                                      deleteLokasi(l.id);
                                    }
                                  }} className="text-red-600 hover:text-red-800">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>

                    <Card className="shadow-sm border-slate-200">
                      <CardHeader>
                        <CardTitle className="text-base font-bold">{editingLokId ? 'Edit Location' : 'Add Location'}</CardTitle>
                        <CardDescription>Create or update a physical classroom or venue.</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={handleAddLok} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="lok-name">Location Name</Label>
                            <Input id="lok-name" placeholder="e.g. Ruang Kelas C" value={lokForm.name} onChange={e => setLokForm({...lokForm, name: e.target.value})} required />
                          </div>
                          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white">Save Location</Button>
                        </form>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Batches Sub-tab */}
                <TabsContent value="batches">
                  <Card className="shadow-sm border-slate-200">
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="pl-6">Batch Name</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Funding Pattern (Pola)</TableHead>
                            <TableHead>Duration</TableHead>
                            <TableHead className="text-center">Scheduled JP</TableHead>
                            <TableHead className="pr-6 text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {batchData.map(batch => (
                            <TableRow key={batch.id}>
                              <TableCell className="font-semibold text-slate-900 pl-6">{batch.name}</TableCell>
                              <TableCell className="text-slate-600">{batch.categoryName}</TableCell>
                              <TableCell>
                                <Badge className={`font-semibold ${
                                  batch.pola === 'APBD' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                  batch.pola === 'Kontribusi' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                                  'bg-amber-100 text-amber-800 border-amber-200'
                                }`}>
                                  {batch.pola}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-slate-600 text-sm">
                                {batch.startDate} to {batch.endDate}
                              </TableCell>
                              <TableCell className="text-center font-bold text-slate-900">
                                {batch.totalJpScheduled} JP
                              </TableCell>
                              <TableCell className="pr-6 text-right space-x-2">
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => {
                                    setSelectedBatchId(batch.id);
                                    setActiveTab('scheduling');
                                  }}
                                  className="border-blue-200 text-blue-700 hover:bg-blue-50"
                                >
                                  Open Scheduler
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => {
                                  setEditingBatchId(batch.id);
                                  setBatchForm({
                                    name: batch.name,
                                    kategoriId: batch.kategoriId,
                                    pola: batch.pola,
                                    startDate: batch.startDate,
                                    endDate: batch.endDate
                                  });
                                  setIsBatchDialogOpen(true);
                                }} className="text-blue-600 hover:text-blue-800">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => {
                                  if (confirm(`Are you sure you want to delete batch ${batch.name}?`)) {
                                    deleteBatch(batch.id);
                                  }
                                }} className="text-red-600 hover:text-red-800">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}

          {/* 3. SCHEDULING ENGINE TAB */}
          {activeTab === 'scheduling' && (
            <div className="space-y-8">
              {/* Batch Selector & View Mode Toggle */}
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="space-y-1">
                  <Label htmlFor="batch-select" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Select Training Batch to Schedule</Label>
                  <Select value={selectedBatchId} onValueChange={setSelectedBatchId}>
                    <SelectTrigger className="w-full sm:w-80 bg-slate-50 border-slate-200 font-semibold text-slate-900">
                      <SelectValue placeholder="Select a batch..." />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {batchData.map(b => (
                        <SelectItem key={b.id} value={b.id} className="font-medium">
                          {b.name} ({b.pola})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  {activeBatch && (
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
                        <p className="text-xs text-slate-500">Category</p>
                        <p className="font-semibold text-slate-800">{activeBatch.categoryName}</p>
                      </div>
                      <div className="bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
                        <p className="text-xs text-slate-500">Funding Pattern</p>
                        <p className="font-semibold text-slate-800">{activeBatch.pola}</p>
                      </div>
                    </div>
                  )}

                  {/* View Mode Toggle */}
                  <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
                    <button
                      onClick={() => setSchedulingViewMode('table')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                        schedulingViewMode === 'table'
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <TableIcon className="h-3.5 w-3.5" />
                      Table View
                    </button>
                    <button
                      onClick={() => setSchedulingViewMode('calendar')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                        schedulingViewMode === 'calendar'
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

              {/* 1. Batch Duration Visibility (Admin Context) */}
              {activeBatch && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3 text-blue-900 shadow-sm">
                  <Calendar className="h-5 w-5 text-blue-600 shrink-0" />
                  <div className="text-sm font-semibold">
                    📅 Periode Pelaksanaan: <span className="text-blue-700">{formatIndoDate(activeBatch.startDate)}</span> s/d <span className="text-blue-700">{formatIndoDate(activeBatch.endDate)}</span>
                  </div>
                </div>
              )}

              {activeBatch ? (
                <div className="grid lg:grid-cols-3 gap-8">
                  {/* Left Column: Mapel Status & Compliance */}
                  <div className="space-y-6">
                    <Card className="shadow-sm border-slate-200">
                      <CardHeader className="border-b border-slate-100 bg-slate-50/50">
                        <CardTitle className="text-base font-bold text-slate-900">Subject (Mapel) JP Status</CardTitle>
                        <CardDescription>Each subject has a strict limit of 2 to 6 JP per batch.</CardDescription>
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
                                  <span className="text-xs font-bold text-slate-500">
                                    {m.scheduledJp} / {m.jpTotal} JP
                                  </span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <Progress value={percentage} className="h-2 flex-1 bg-slate-100" />
                                  {m.isFullyScheduled ? (
                                    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px] font-bold">
                                      Complete
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-[10px] font-bold text-slate-500">
                                      {m.remainingJp} JP Left
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </CardContent>
                    </Card>

                    {/* Business Rules Quick Reference */}
                    <Card className="shadow-sm border-slate-200 bg-blue-50/30 border-blue-100">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold text-blue-900 flex items-center gap-2">
                          <Info className="h-4 w-4 text-blue-600" />
                          Validation Rules Enforced
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-xs text-blue-800 space-y-2">
                        <p><strong>1. Hierarchy Weight:</strong> Instructors must have a competency level equal to or higher than the training category requirement.</p>
                        <p><strong>2. Operational Hours:</strong> Klasikal sessions must be between 08:00 and 17:00.</p>
                        <p><strong>3. WI Collision:</strong> Instructors cannot be scheduled for overlapping sessions.</p>
                        <p><strong>4. Location Clash:</strong> Physical rooms cannot be booked for overlapping Klasikal sessions.</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Right Column: Scheduled Sessions Timeline & Assign Form */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-bold text-slate-900">
                        {schedulingViewMode === 'table' ? `Scheduled Sessions (${batchSessions.length})` : 'Global Master Schedule Calendar'}
                      </h3>
                      
                      <Dialog open={isSessionDialogOpen} onOpenChange={setIsSessionDialogOpen}>
                        <DialogTrigger asChild>
                          <Button onClick={() => {
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
                          }} className="bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-2">
                            <Plus className="h-4 w-4" /> Assign Session
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-white max-w-lg">
                          <DialogHeader>
                            <DialogTitle>{editingSessionId ? 'Edit Training Session' : 'Assign Training Session'}</DialogTitle>
                            <DialogDescription>Schedule or update a session for {activeBatch.name}.</DialogDescription>
                          </DialogHeader>
                          <form onSubmit={handleAddSession} className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="sess-mapel">Subject (Mapel) - Searchable</Label>
                                <Combobox
                                  options={mapelOptions}
                                  value={sessionForm.mapelId}
                                  onValueChange={val => setSessionForm({...sessionForm, mapelId: val})}
                                  placeholder="Search subject..."
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="sess-wi">Widyaswara (WI) - Searchable</Label>
                                <Combobox
                                  options={wiOptions}
                                  value={sessionForm.wiId}
                                  onValueChange={val => setSessionForm({...sessionForm, wiId: val})}
                                  placeholder="Search instructor..."
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                              {/* 2. Date-Picker Restraints (Strict Range In-Bounds) */}
                              <div className="space-y-2">
                                <Label htmlFor="sess-date">Date</Label>
                                <Input 
                                  id="sess-date" 
                                  type="date" 
                                  min={activeBatch.startDate}
                                  max={activeBatch.endDate}
                                  value={sessionForm.date} 
                                  onChange={e => setSessionForm({...sessionForm, date: e.target.value})} 
                                  required 
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="sess-start">Start Time</Label>
                                <Input id="sess-start" type="time" value={sessionForm.startTime} onChange={e => setSessionForm({...sessionForm, startTime: e.target.value})} required />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="sess-end">End Time</Label>
                                <Input id="sess-end" type="time" value={sessionForm.endTime} onChange={e => setSessionForm({...sessionForm, endTime: e.target.value})} required />
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="sess-format">Format</Label>
                                <Select value={sessionForm.format} onValueChange={(val: any) => setSessionForm({...sessionForm, format: val})}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select format" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-white">
                                    <SelectItem value="Klasikal">Klasikal (In-Person)</SelectItem>
                                    <SelectItem value="Virtual">Virtual (Online)</SelectItem>
                                    <SelectItem value="Asinkron">Asinkron</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="sess-jp-ke">JP Ke (e.g. 1-2)</Label>
                                <Input id="sess-jp-ke" placeholder="e.g. 1-2" value={sessionForm.jpKe} onChange={e => setSessionForm({...sessionForm, jpKe: e.target.value})} required />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="sess-jp-count">JP Count</Label>
                                <Select value={sessionForm.jpCount} onValueChange={val => setSessionForm({...sessionForm, jpCount: val})}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select JP count" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-white">
                                    <SelectItem value="1">1 JP (45 Mins)</SelectItem>
                                    <SelectItem value="2">2 JP (90 Mins)</SelectItem>
                                    <SelectItem value="3">3 JP (135 Mins)</SelectItem>
                                    <SelectItem value="4">4 JP (180 Mins)</SelectItem>
                                    <SelectItem value="5">5 JP (225 Mins)</SelectItem>
                                    <SelectItem value="6">6 JP (270 Mins)</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            {sessionForm.format === 'Klasikal' && (
                              <div className="space-y-2">
                                <Label htmlFor="sess-lokasi">Location / Room - Searchable</Label>
                                <Combobox
                                  options={lokasiOptions}
                                  value={sessionForm.lokasiId}
                                  onValueChange={val => setSessionForm({...sessionForm, lokasiId: val})}
                                  placeholder="Search location..."
                                />
                              </div>
                            )}

                            <DialogFooter className="pt-4">
                              <Button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white w-full">Save Session</Button>
                            </DialogFooter>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>

                    {schedulingViewMode === 'calendar' ? (
                      <CalendarView events={calendarEvents} title={`Master Schedule - ${activeBatch.name}`} />
                    ) : batchSessions.length === 0 ? (
                      <Card className="border-dashed border-slate-300 shadow-none py-12 text-center">
                        <CardContent className="space-y-3">
                          <Calendar className="h-10 w-10 text-slate-400 mx-auto" />
                          <p className="text-slate-600 font-medium">No sessions scheduled for this batch yet.</p>
                          <p className="text-xs text-slate-400">Click "Assign Session" to schedule the first training session.</p>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="space-y-4">
                        {batchSessions.map(session => (
                          <Card key={session.id} className="shadow-sm border-slate-200 hover:border-blue-300 transition-all duration-200">
                            <CardContent className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Badge className={`font-semibold ${
                                    session.format === 'Klasikal' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                    session.format === 'Virtual' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                                    'bg-amber-100 text-amber-800 border-amber-200'
                                  }`}>
                                    {session.format}
                                  </Badge>
                                  <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                                    <Calendar className="h-3.5 w-3.5" />
                                    {session.date}
                                  </span>
                                  <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                                    <Clock className="h-3.5 w-3.5" />
                                    {session.startTime} - {session.endTime} ({session.jpCount} JP, JP Ke: {session.jpKe})
                                  </span>
                                </div>

                                <h4 className="text-base font-bold text-slate-900">{session.mapelName}</h4>
                                
                                <div className="flex items-center gap-4 text-xs text-slate-600">
                                  <span className="flex items-center gap-1 font-medium">
                                    <UserCheck className="h-3.5 w-3.5 text-slate-400" />
                                    {session.wiName} <strong className="text-blue-600">({session.jpCount} JP)</strong>
                                  </span>
                                  <span className="flex items-center gap-1 font-medium">
                                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                                    {session.lokasiName}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => {
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
                                    setIsSessionDialogOpen(true);
                                  }}
                                  className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => {
                                    if (confirm("Are you sure you want to delete this session?")) {
                                      deleteSession(session.id);
                                    }
                                  }}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-slate-500 text-center py-12">Please create a batch first in the Master Data tab.</p>
              )}
            </div>
          )}

          {/* 4. REPORTS TAB */}
          {activeTab === 'reports' && (
            <div className="space-y-8">
              {/* Advanced Filtering Controls */}
              <Card className="shadow-sm border-slate-200 bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base font-bold">Advanced Filtering & Search</CardTitle>
                  <CardDescription>Filter the monthly recap table by date range, funding pattern, or search by instructor name.</CardDescription>
                </CardHeader>
                <CardContent className="grid sm:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-slate-500 uppercase">Search Instructor</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input 
                        placeholder="Search by name or NIP..." 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-slate-500 uppercase">Funding Pattern (Pola)</Label>
                    <Select value={filterPola} onValueChange={setFilterPola}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Patterns" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="ALL">All Patterns</SelectItem>
                        <SelectItem value="APBD">APBD</SelectItem>
                        <SelectItem value="Kontribusi">Kontribusi</SelectItem>
                        <SelectItem value="Kemitraan">Kemitraan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-slate-500 uppercase">Start Date</Label>
                    <Input 
                      type="date" 
                      value={startDateFilter}
                      onChange={e => setStartDateFilter(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-slate-500 uppercase">End Date</Label>
                    <Input 
                      type="date" 
                      value={endDateFilter}
                      onChange={e => setEndDateFilter(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Monthly Recap Table with Pagination & Export */}
              <Card className="shadow-sm border-slate-200">
                <CardHeader className="border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle className="text-lg font-bold text-slate-900">Monthly Recap Table</CardTitle>
                    <CardDescription>Detailed breakdown of teaching hours per Widyaswara.</CardDescription>
                  </div>
                  <Button onClick={handleExportGlobalRecap} className="bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-2">
                    <Download className="h-4 w-4" /> Export Global Recap
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50/70">
                        <TableHead className="font-semibold text-slate-700 pl-6">NIP</TableHead>
                        <TableHead className="font-semibold text-slate-700">Nama Widyaswara</TableHead>
                        <TableHead className="font-semibold text-slate-700">Jabatan</TableHead>
                        <TableHead className="font-semibold text-slate-700 text-center">Total JP APBD</TableHead>
                        <TableHead className="font-semibold text-slate-700 text-center">Total JP Kontribusi</TableHead>
                        <TableHead className="font-semibold text-slate-700 text-center">Total JP Kemitraan</TableHead>
                        <TableHead className="font-semibold text-slate-700 text-center">Grand Total JP</TableHead>
                        <TableHead className="font-semibold text-slate-700 pr-6 text-right">Export Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedRecapData.map((wi) => (
                        <TableRow key={wi.id} className="hover:bg-slate-50/50 transition-colors">
                          <TableCell className="font-mono text-xs pl-6">{wi.nip || 'N/A'}</TableCell>
                          <TableCell className="font-semibold text-slate-900">{wi.name}, {wi.gelar}</TableCell>
                          <TableCell className="text-slate-600 text-xs font-medium">{wi.jabatan}</TableCell>
                          <TableCell className="text-center font-medium text-blue-600">{wi.apbd} JP</TableCell>
                          <TableCell className="text-center font-medium text-emerald-600">{wi.kontribusi} JP</TableCell>
                          <TableCell className="text-center font-medium text-amber-600">{wi.kemitraan} JP</TableCell>
                          <TableCell className="text-center font-bold text-slate-900">{wi.grandTotal} JP</TableCell>
                          <TableCell className="pr-6 text-right">
                            <Button size="sm" variant="outline" onClick={() => handleExportIndividualReport(wi)} className="border-blue-200 text-blue-700 hover:bg-blue-50 flex items-center gap-1.5 ml-auto">
                              <Download className="h-3.5 w-3.5" /> Export WI Report
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Pagination Controls */}
                  <div className="p-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-xs text-slate-500">
                      Showing {Math.min((currentPage - 1) * rowsPerPage + 1, totalRows)} to {Math.min(currentPage * rowsPerPage, totalRows)} of {totalRows} entries
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => prev - 1)}
                      >
                        <ChevronLeft className="h-4 w-4" /> Previous
                      </Button>
                      <span className="text-xs font-semibold text-slate-700">
                        Page {currentPage} of {totalPages || 1}
                      </span>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        disabled={currentPage === totalPages || totalPages === 0}
                        onClick={() => setCurrentPage(prev => prev + 1)}
                      >
                        Next <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

        </div>

        {/* Footer */}
        <footer className="border-t border-slate-200 bg-white mt-auto">
          <MadeWithDuad />
        </footer>
      </main>
    </div>
  );
}