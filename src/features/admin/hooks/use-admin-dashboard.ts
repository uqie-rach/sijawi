"use client";

import { useState, useEffect } from 'react';
import { useWTMS, Widyaswara, Batch, Session, Mapel, Lokasi, Kategori } from '@/context/wtms-context';
import { useWidyaswaras, usePelatihan, useScheduling, useReports } from '@/hooks/use-wtms-api';
import { getFilteredRecapData, generateGlobalRecapText, generateIndividualReportText } from '@/utils/report-helpers';
import { toast } from 'sonner';

export function useAdminDashboard() {
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
  useEffect(() => {
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

  // Advanced Filtering for Monthly Recap Table
  const filteredRecapData = getFilteredRecapData(
    wiData,
    sessions,
    batches,
    searchQuery,
    filterPola,
    startDateFilter,
    endDateFilter
  );

  // Pagination Logic
  const totalRows = filteredRecapData.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const paginatedRecapData = filteredRecapData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // Export Global Recap
  const handleExportGlobalRecap = () => {
    const text = generateGlobalRecapText(filteredRecapData);
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Global_Recap_Report_${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    toast.success("Global Recap exported successfully!");
  };

  // Export Individual WI Report
  const handleExportIndividualReport = (wi: any) => {
    const text = generateIndividualReportText(wi);
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `WI_Report_${wi.name.replace(/\s+/g, '_')}.txt`;
    link.click();
    toast.success(`Individual report for ${wi.name} exported successfully!`);
  };

  return {
    // State
    activeTab,
    setActiveTab,
    schedulingViewMode,
    setSchedulingViewMode,
    selectedBatchId,
    setSelectedBatchId,
    activeBatch,
    batchSessions,
    mapelStatus,
    wiData,
    batchData,
    allSessions,
    reportData,
    kategoriList,
    mapelList,
    lokasiList,
    batches,
    isAuthenticated,
    setIsAuthenticated,
    userRole,
    setUserRole,

    // Form States
    wiForm,
    setWiForm,
    editingWiId,
    setEditingWiId,
    katForm,
    setKatForm,
    editingKatId,
    setEditingKatId,
    mapelForm,
    setMapelForm,
    editingMapelId,
    setEditingMapelId,
    lokForm,
    setLokForm,
    editingLokId,
    setEditingLokId,
    batchForm,
    setBatchForm,
    editingBatchId,
    setEditingBatchId,
    sessionForm,
    setSessionForm,
    editingSessionId,
    setEditingSessionId,

    // Dialog States
    isWiDialogOpen,
    setIsWiDialogOpen,
    isKatDialogOpen,
    setIsKatDialogOpen,
    isMapelDialogOpen,
    setIsMapelDialogOpen,
    isLokDialogOpen,
    setIsLokDialogOpen,
    isBatchDialogOpen,
    setIsBatchDialogOpen,
    isSessionDialogOpen,
    setIsSessionDialogOpen,

    // Filtering & Pagination
    searchQuery,
    setSearchQuery,
    filterPola,
    setFilterPola,
    startDateFilter,
    setStartDateFilter,
    endDateFilter,
    setEndDateFilter,
    currentPage,
    setCurrentPage,
    rowsPerPage,
    setRowsPerPage,
    totalRows,
    totalPages,
    paginatedRecapData,

    // Actions
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
    addSession,
    updateSession,
    deleteSession,
    handleExportGlobalRecap,
    handleExportIndividualReport
  };
}