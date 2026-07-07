"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';

export interface Widyaiswara {
  id: string;
  name: string;
  gelar: string;
  email: string;
  nip: string;
  jabatan: 'WI Ahli Pertama' | 'WI Ahli Muda' | 'WI Ahli Madya' | 'WI Ahli Utama';
  level: number;
  levelLabel: string;
  jpLastMonth: number;
  password?: string;
}

export interface KategoriPelatihan {
  id: string;
  name: string;
  minWeight: number;
}

export interface Mapel {
  id: string;
  name: string;
  kategoriId: string;
  jpTotal: number;
}

export interface Lokasi {
  id: string;
  name: string;
}

export interface Batch {
  id: string;
  name: string;
  kategoriId: string;
  pola: 'APBD' | 'Kontribusi' | 'Kemitraan';
  startDate: string;
  endDate: string;
}

export interface Session {
  id: string;
  batchId: string;
  mapelId: string;
  wiIds: string[];
  date: string;
  startTime: string;
  endTime: string;
  format: 'Klasikal' | 'Virtual' | 'Asinkron';
  lokasiId?: string;
  jpKe: string;
  jpCount: number;
}

// ---------- Helper untuk fetch dengan error handling ----------
async function fetchJSON(url: string, options?: RequestInit): Promise<any> {
  const res = await fetch(url, options);
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.error || `Request failed with status ${res.status}`);
  }
  return data;
}

// ---------- Helper untuk menampilkan toast error konsisten ----------
function toastApiError(context: string, err: unknown) {
  const message = err instanceof Error ? err.message : 'Terjadi kesalahan jaringan.';
  toast.error(`${context} gagal: ${message}`);
}

// ---------- Helper sukses ----------
function toastApiSuccess(context: string) {
  toast.success(`${context} berhasil.`);
}

interface WTMSContextType {
  widyaswaras: Widyaiswara[];
  kategoriList: KategoriPelatihan[];
  mapelList: Mapel[];
  lokasiList: Lokasi[];
  batches: Batch[];
  sessions: Session[];
  userRole: 'admin' | 'wi' | null;
  selectedWiId: string | null;
  isAuthenticated: boolean;
  
  setUserRole: (role: 'admin' | 'wi' | null) => void;
  setSelectedWiId: (id: string | null) => void;
  setIsAuthenticated: (auth: boolean) => void;
  
  // Widyaiswara CRUD – sekarang async & return status
  addWidyaswara: (wi: Omit<Widyaiswara, 'id' | 'jpLastMonth'>) => Promise<{ success: boolean; error?: string }>;
  updateWidyaswara: (id: string, wi: Omit<Widyaiswara, 'id' | 'jpLastMonth'>) => Promise<{ success: boolean; error?: string }>;
  deleteWidyaswara: (id: string) => Promise<{ success: boolean; error?: string }>;
  
  // Kategori CRUD
  addKategori: (kat: Omit<KategoriPelatihan, 'id'>) => Promise<{ success: boolean; error?: string }>;
  updateKategori: (id: string, kat: Omit<KategoriPelatihan, 'id'>) => Promise<{ success: boolean; error?: string }>;
  deleteKategori: (id: string) => Promise<{ success: boolean; error?: string }>;
  
  // Mapel CRUD
  addMapel: (mapel: Omit<Mapel, 'id'>) => Promise<{ success: boolean; error?: string }>;
  updateMapel: (id: string, mapel: Omit<Mapel, 'id'>) => Promise<{ success: boolean; error?: string }>;
  deleteMapel: (id: string) => Promise<{ success: boolean; error?: string }>;
  
  // Lokasi CRUD
  addLokasi: (lok: Omit<Lokasi, 'id'>) => Promise<{ success: boolean; error?: string }>;
  updateLokasi: (id: string, lok: Omit<Lokasi, 'id'>) => Promise<{ success: boolean; error?: string }>;
  deleteLokasi: (id: string) => Promise<{ success: boolean; error?: string }>;
  
  // Batch CRUD
  addBatch: (batch: Omit<Batch, 'id'>) => Promise<{ success: boolean; error?: string }>;
  updateBatch: (id: string, batch: Omit<Batch, 'id'>) => Promise<{ success: boolean; error?: string }>;
  deleteBatch: (id: string) => Promise<{ success: boolean; error?: string }>;
  
  // Session CRUD (sudah ada di kode asli, tidak diubah)
  addSession: (session: Omit<Session, 'id'>) => { success: boolean; error?: string };
  updateSession: (id: string, session: Omit<Session, 'id'>) => { success: boolean; error?: string };
  deleteSession: (sessionId: string) => void;
}

const WTMSContext = createContext<WTMSContextType | undefined>(undefined);

function parseJpRange(jpKe: string): number[] {
  const clean = jpKe.replace(/\s+/g, '');
  const parts = clean.split('-');
  if (parts.length === 1) {
    const val = parseInt(parts[0]);
    return isNaN(val) ? [] : [val, val];
  } else if (parts.length === 2) {
    const start = parseInt(parts[0]);
    const end = parseInt(parts[1]);
    return isNaN(start) || isNaN(end) ? [] : [start, end];
  }
  return [];
}

function isJpOverlapping(range1: number[], range2: number[]): boolean {
  if (range1.length !== 2 || range2.length !== 2) return false;
  return Math.max(range1[0], range2[0]) <= Math.min(range1[1], range2[1]);
}

export const WTMSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [widyaswaras, setWidyaswaras] = useState<Widyaiswara[]>([]);
  const [kategoriList, setKategoriList] = useState<KategoriPelatihan[]>([]);
  const [mapelList, setMapelList] = useState<Mapel[]>([]);
  const [lokasiList, setLokasiList] = useState<Lokasi[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [userRole, setUserRole] = useState<'admin' | 'wi' | null>(null);
  const [selectedWiId, setSelectedWiId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Ref untuk mencegah seeding ganda
  const isSeeding = useRef(false);

  // Fungsi untuk memuat semua data dari API
  const loadAllData = async () => {
    try {
      const [resWi, resKat, resMapel, resLok, resBatches, resSessions] = await Promise.all([
        fetch('/api/widyaswara').then(r => r.ok ? r.json() : []),
        fetch('/api/kategori-pelatihan').then(r => r.ok ? r.json() : []),
        fetch('/api/mata-pelatihan').then(r => r.ok ? r.json() : []),
        fetch('/api/lokasi').then(r => r.ok ? r.json() : []),
        fetch('/api/batches').then(r => r.ok ? r.json() : []),
        fetch('/api/sessions').then(r => r.ok ? r.json() : [])
      ]);

      // Cek apakah database masih kosong (fresh start)
      if (Array.isArray(resWi) && resWi.length === 0 &&
          Array.isArray(resKat) && resKat.length === 0 &&
          !isSeeding.current) {
        isSeeding.current = true;
        try {
          const seedRes = await fetch('/api/seed', { method: 'POST' }).then(r => r.json());
          if (seedRes.success) {
            // Setelah seeding berhasil, fetch ulang data tanpa reload
            const newData = await Promise.all([
              fetch('/api/widyaswara').then(r => r.ok ? r.json() : []),
              fetch('/api/kategori-pelatihan').then(r => r.ok ? r.json() : []),
              fetch('/api/mata-pelatihan').then(r => r.ok ? r.json() : []),
              fetch('/api/lokasi').then(r => r.ok ? r.json() : []),
              fetch('/api/batches').then(r => r.ok ? r.json() : []),
              fetch('/api/sessions').then(r => r.ok ? r.json() : [])
            ]);
            setWidyaswaras(newData[0] || []);
            setKategoriList(newData[1] || []);
            setMapelList(newData[2] || []);
            setLokasiList(newData[3] || []);
            setBatches(newData[4] || []);
            setSessions(newData[5] || []);
            toast.success('Data awal berhasil dimuat!');
          } else {
            toast.error('Gagal memuat data awal. Silakan muat ulang halaman.');
          }
        } catch (seedError) {
          console.error('Seeding failed:', seedError);
          toast.error('Gagal memuat data awal.');
        } finally {
          isSeeding.current = false;
        }
        return;
      }

      if (Array.isArray(resWi)) setWidyaswaras(resWi);
      if (Array.isArray(resKat)) setKategoriList(resKat);
      if (Array.isArray(resMapel)) setMapelList(resMapel);
      if (Array.isArray(resLok)) setLokasiList(resLok);
      if (Array.isArray(resBatches)) setBatches(resBatches);
      if (Array.isArray(resSessions)) setSessions(resSessions);
    } catch (err) {
      console.error("Failed to load data from API:", err);
    }
  };

  // Load from API on mount
  useEffect(() => {
    loadAllData();

    const storedAuth = localStorage.getItem('wtms_auth');
    const storedRole = localStorage.getItem('wtms_role');
    const storedWiId = localStorage.getItem('wtms_wi_id');

    if (storedAuth) setIsAuthenticated(JSON.parse(storedAuth));
    if (storedRole) setUserRole(JSON.parse(storedRole) as any);
    if (storedWiId) setSelectedWiId(JSON.parse(storedWiId));
  }, []);

  const saveToStorage = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  const handleSetUserRole = (role: 'admin' | 'wi' | null) => {
    setUserRole(role);
    saveToStorage('wtms_role', role);
  };

  const handleSetSelectedWiId = (id: string | null) => {
    setSelectedWiId(id);
    saveToStorage('wtms_wi_id', id);
  };

  const handleSetIsAuthenticated = (auth: boolean) => {
    setIsAuthenticated(auth);
    saveToStorage('wtms_auth', auth);
  };

  // ======================== WIDYAISWARA CRUD ========================
  const addWidyaswara = async (wi: Omit<Widyaiswara, 'id' | 'jpLastMonth'>): Promise<{ success: boolean; error?: string }> => {
    if (widyaswaras.some(w => w.nip === wi.nip)) {
      const msg = `Widyaiswara dengan NIP ${wi.nip} sudah terdaftar.`;
      toast.error(msg);
      return { success: false, error: msg };
    }
    if (widyaswaras.some(w => w.email.toLowerCase() === wi.email.toLowerCase())) {
      const msg = `Email ${wi.email} sudah digunakan oleh Widyaiswara lain.`;
      toast.error(msg);
      return { success: false, error: msg };
    }

    const newWi = { ...wi, id: `wi-${Date.now()}`, jpLastMonth: 0 };

    try {
      await fetchJSON('/api/widyaswara', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newWi),
      });
      setWidyaswaras(prev => [...prev, newWi]);
      toastApiSuccess('Widyaiswara berhasil ditambahkan');
      return { success: true };
    } catch (err) {
      toastApiError('Penambahan Widyaiswara', err);
      return { success: false, error: err instanceof Error ? err.message : 'Gagal menambahkan' };
    }
  };

  const updateWidyaswara = async (id: string, wi: Omit<Widyaiswara, 'id' | 'jpLastMonth'>): Promise<{ success: boolean; error?: string }> => {
    if (widyaswaras.some(w => w.nip === wi.nip && w.id !== id)) {
      const msg = `NIP ${wi.nip} sudah digunakan oleh Widyaiswara lain.`;
      toast.error(msg);
      return { success: false, error: msg };
    }
    if (widyaswaras.some(w => w.email.toLowerCase() === wi.email.toLowerCase() && w.id !== id)) {
      const msg = `Email ${wi.email} sudah terdaftar untuk akun lain.`;
      toast.error(msg);
      return { success: false, error: msg };
    }

    const updatedWi = { ...wi, id, jpLastMonth: 0 };

    try {
      await fetchJSON('/api/widyaswara', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedWi),
      });
      setWidyaswaras(prev => prev.map(w => w.id === id ? updatedWi : w));
      toastApiSuccess('Data Widyaiswara berhasil diperbarui');
      return { success: true };
    } catch (err) {
      toastApiError('Pembaruan Widyaiswara', err);
      return { success: false, error: err instanceof Error ? err.message : 'Gagal memperbarui' };
    }
  };

  const deleteWidyaswara = async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await fetchJSON(`/api/widyaswara?id=${id}`, { method: 'DELETE' });
      setWidyaswaras(prev => prev.filter(w => w.id !== id));
      toastApiSuccess('Widyaiswara berhasil dihapus');
      return { success: true };
    } catch (err) {
      toastApiError('Penghapusan Widyaiswara', err);
      return { success: false, error: err instanceof Error ? err.message : 'Gagal menghapus' };
    }
  };

  // ======================== KATEGORI CRUD ========================
  const addKategori = async (kat: Omit<KategoriPelatihan, 'id'>): Promise<{ success: boolean; error?: string }> => {
    const newKat = { ...kat, id: `kat-${Date.now()}` };
    try {
      await fetchJSON('/api/kategori-pelatihan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newKat),
      });
      setKategoriList(prev => [...prev, newKat]);
      toastApiSuccess('Kategori berhasil ditambahkan');
      return { success: true };
    } catch (err) {
      toastApiError('Penambahan Kategori', err);
      return { success: false, error: err instanceof Error ? err.message : 'Gagal menambahkan' };
    }
  };

  const updateKategori = async (id: string, kat: Omit<KategoriPelatihan, 'id'>): Promise<{ success: boolean; error?: string }> => {
    const updatedKat = { ...kat, id };
    try {
      await fetchJSON('/api/kategori-pelatihan', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedKat),
      });
      setKategoriList(prev => prev.map(k => k.id === id ? updatedKat : k));
      toastApiSuccess('Kategori berhasil diperbarui');
      return { success: true };
    } catch (err) {
      toastApiError('Pembaruan Kategori', err);
      return { success: false, error: err instanceof Error ? err.message : 'Gagal memperbarui' };
    }
  };

  const deleteKategori = async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await fetchJSON(`/api/kategori-pelatihan?id=${id}`, { method: 'DELETE' });
      setKategoriList(prev => prev.filter(k => k.id !== id));
      toastApiSuccess('Kategori berhasil dihapus');
      return { success: true };
    } catch (err) {
      toastApiError('Penghapusan Kategori', err);
      return { success: false, error: err instanceof Error ? err.message : 'Gagal menghapus' };
    }
  };

  // ======================== MAPEL CRUD ========================
  const addMapel = async (mapel: Omit<Mapel, 'id'>): Promise<{ success: boolean; error?: string }> => {
    const newMapel = { ...mapel, id: `mapel-${Date.now()}` };
    try {
      await fetchJSON('/api/mata-pelatihan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMapel),
      });
      setMapelList(prev => [...prev, newMapel]);
      toastApiSuccess('Mata Pelajaran berhasil ditambahkan');
      return { success: true };
    } catch (err) {
      toastApiError('Penambahan Mata Pelajaran', err);
      return { success: false, error: err instanceof Error ? err.message : 'Gagal menambahkan' };
    }
  };

  const updateMapel = async (id: string, mapel: Omit<Mapel, 'id'>): Promise<{ success: boolean; error?: string }> => {
    const updatedMapel = { ...mapel, id };
    try {
      await fetchJSON('/api/mata-pelatihan', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedMapel),
      });
      setMapelList(prev => prev.map(m => m.id === id ? updatedMapel : m));
      toastApiSuccess('Mata Pelajaran berhasil diperbarui');
      return { success: true };
    } catch (err) {
      toastApiError('Pembaruan Mata Pelajaran', err);
      return { success: false, error: err instanceof Error ? err.message : 'Gagal memperbarui' };
    }
  };

  const deleteMapel = async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await fetchJSON(`/api/mata-pelatihan?id=${id}`, { method: 'DELETE' });
      setMapelList(prev => prev.filter(m => m.id !== id));
      toastApiSuccess('Mata Pelajaran berhasil dihapus');
      return { success: true };
    } catch (err) {
      toastApiError('Penghapusan Mata Pelajaran', err);
      return { success: false, error: err instanceof Error ? err.message : 'Gagal menghapus' };
    }
  };

  // ======================== LOKASI CRUD ========================
  const addLokasi = async (lok: Omit<Lokasi, 'id'>): Promise<{ success: boolean; error?: string }> => {
    const newLok = { ...lok, id: `lok-${Date.now()}` };
    try {
      await fetchJSON('/api/lokasi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLok),
      });
      setLokasiList(prev => [...prev, newLok]);
      toastApiSuccess('Lokasi berhasil ditambahkan');
      return { success: true };
    } catch (err) {
      toastApiError('Penambahan Lokasi', err);
      return { success: false, error: err instanceof Error ? err.message : 'Gagal menambahkan' };
    }
  };

  const updateLokasi = async (id: string, lok: Omit<Lokasi, 'id'>): Promise<{ success: boolean; error?: string }> => {
    const updatedLok = { ...lok, id };
    try {
      await fetchJSON('/api/lokasi', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedLok),
      });
      setLokasiList(prev => prev.map(l => l.id === id ? updatedLok : l));
      toastApiSuccess('Lokasi berhasil diperbarui');
      return { success: true };
    } catch (err) {
      toastApiError('Pembaruan Lokasi', err);
      return { success: false, error: err instanceof Error ? err.message : 'Gagal memperbarui' };
    }
  };

  const deleteLokasi = async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await fetchJSON(`/api/lokasi?id=${id}`, { method: 'DELETE' });
      setLokasiList(prev => prev.filter(l => l.id !== id));
      toastApiSuccess('Lokasi berhasil dihapus');
      return { success: true };
    } catch (err) {
      toastApiError('Penghapusan Lokasi', err);
      return { success: false, error: err instanceof Error ? err.message : 'Gagal menghapus' };
    }
  };

  // ======================== BATCH CRUD ========================
  const addBatch = async (batch: Omit<Batch, 'id'>): Promise<{ success: boolean; error?: string }> => {
    const newBatch = { ...batch, id: `batch-${Date.now()}` };
    try {
      await fetchJSON('/api/batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBatch),
      });
      setBatches(prev => [...prev, newBatch]);
      toastApiSuccess('Angkatan berhasil dibuat');
      return { success: true };
    } catch (err) {
      toastApiError('Pembuatan Angkatan', err);
      return { success: false, error: err instanceof Error ? err.message : 'Gagal membuat' };
    }
  };

  const updateBatch = async (id: string, batch: Omit<Batch, 'id'>): Promise<{ success: boolean; error?: string }> => {
    const updatedBatch = { ...batch, id };
    try {
      await fetchJSON('/api/batches', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedBatch),
      });
      setBatches(prev => prev.map(b => b.id === id ? updatedBatch : b));
      toastApiSuccess('Angkatan berhasil diperbarui');
      return { success: true };
    } catch (err) {
      toastApiError('Pembaruan Angkatan', err);
      return { success: false, error: err instanceof Error ? err.message : 'Gagal memperbarui' };
    }
  };

  const deleteBatch = async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await fetchJSON(`/api/batches?id=${id}`, { method: 'DELETE' });
      setBatches(prev => prev.filter(b => b.id !== id));
      toastApiSuccess('Angkatan berhasil dihapus');
      return { success: true };
    } catch (err) {
      toastApiError('Penghapusan Angkatan', err);
      return { success: false, error: err instanceof Error ? err.message : 'Gagal menghapus' };
    }
  };

  // ======================== SESSION CRUD (tetap sinkron seperti semula) ========================
  const addSession = (sessionData: Omit<Session, 'id'>) => {
    const batch = batches.find(b => b.id === sessionData.batchId);
    const category = batch ? kategoriList.find(k => k.id === batch.kategoriId) : null;

    if (!batch || !category) {
      return { success: false, error: "Invalid selection parameters." };
    }

    if (!sessionData.wiIds || sessionData.wiIds.length === 0) {
      const errorMsg = "Pilih setidaknya satu Widyaiswara pengajar untuk sesi ini.";
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }

    const wis = widyaswaras.filter(w => sessionData.wiIds.includes(w.id));
    for (const wi of wis) {
      if (wi.level < category.minWeight) {
        const errorMsg = `Hierarki Kompetensi Terbatas: ${wi.name} (Level ${wi.level}) tidak memiliki level kompetensi yang cukup untuk kategori ${category.name} (Memerlukan minimal Level ${category.minWeight}).`;
        toast.error(errorMsg);
        return { success: false, error: errorMsg };
      }
    }

    if (sessionData.format === 'Klasikal') {
      const startHour = parseInt(sessionData.startTime.split(':')[0]);
      const endHour = parseInt(sessionData.endTime.split(':')[0]);
      const endMin = parseInt(sessionData.endTime.split(':')[1]);
      
      if (startHour < 8 || endHour > 17 || (endHour === 17 && endMin > 0)) {
        const errorMsg = "Jam Operasional Terbatas: Format Klasikal hanya dapat dijadwalkan antara pukul 08:00 dan 17:00.";
        toast.error(errorMsg);
        return { success: false, error: errorMsg };
      }

      if (!sessionData.lokasiId) {
        const errorMsg = "Lokasi kelas wajib dipilih untuk format Klasikal.";
        toast.error(errorMsg);
        return { success: false, error: errorMsg };
      }
    }

    const existingMapelSessions = sessions.filter(s => s.batchId === sessionData.batchId && s.mapelId === sessionData.mapelId);
    const currentJpSum = existingMapelSessions.reduce((sum, s) => sum + s.jpCount, 0);
    const mapel = mapelList.find(m => m.id === sessionData.mapelId);
    const maxJp = mapel ? mapel.jpTotal : 6;

    if (currentJpSum + sessionData.jpCount > maxJp) {
      const errorMsg = `Maksimum JP Terlampaui: Total JP untuk ${mapel?.name || 'mata pelajaran ini'} tidak boleh melebihi ${maxJp} JP. Alokasi saat ini: ${currentJpSum} JP. Sesi baru: ${sessionData.jpCount} JP.`;
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }

    const newJpRange = parseJpRange(sessionData.jpKe);
    if (newJpRange.length === 2) {
      const jpCollision = sessions.find(s => 
        s.batchId === sessionData.batchId &&
        s.date === sessionData.date &&
        isJpOverlapping(newJpRange, parseJpRange(s.jpKe))
      );

      if (jpCollision) {
        const errorMsg = `Bentrok JP: Slot JP ke-${sessionData.jpKe} sudah terisi untuk angkatan ini pada tanggal terpilih!`;
        toast.error(errorMsg);
        return { success: false, error: errorMsg };
      }
    }

    const wiCollision = sessions.find(s => 
      s.wiIds.some(id => sessionData.wiIds.includes(id)) && 
      s.date === sessionData.date && 
      (
        (sessionData.startTime >= s.startTime && sessionData.startTime < s.endTime) ||
        (sessionData.endTime > s.startTime && sessionData.endTime <= s.endTime) ||
        (sessionData.startTime <= s.startTime && sessionData.endTime >= s.endTime)
      )
    );

    if (wiCollision) {
      const collidingBatch = batches.find(b => b.id === wiCollision.batchId);
      const clashedWiNames = wis
        .filter(w => wiCollision.wiIds.includes(w.id))
        .map(w => w.name)
        .join(', ');
      
      const errorMsg = `Bentrok Jadwal Pengajar: Instruktur (${clashedWiNames}) sudah teralokasikan untuk mengajar di angkatan "${collidingBatch?.name || 'Angkatan Lain'}" pada pukul ${wiCollision.startTime} - ${wiCollision.endTime} di hari yang sama.`;
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }

    if (sessionData.format === 'Klasikal' && sessionData.lokasiId) {
      const locationClash = sessions.find(s => 
        s.format === 'Klasikal' &&
        s.lokasiId === sessionData.lokasiId &&
        s.date === sessionData.date &&
        (
          (sessionData.startTime >= s.startTime && sessionData.startTime < s.endTime) ||
          (sessionData.endTime > s.startTime && sessionData.endTime <= s.endTime) ||
          (sessionData.startTime <= s.startTime && sessionData.endTime >= s.endTime)
        )
      );

      if (locationClash) {
        const collidingBatch = batches.find(b => b.id === locationClash.batchId);
        const locName = lokasiList.find(l => l.id === sessionData.lokasiId)?.name || 'ruangan ini';
        const errorMsg = `Bentrok Penggunaan Ruangan: ${locName} sedang digunakan oleh angkatan "${collidingBatch?.name || 'Angkatan Lain'}" dari pukul ${locationClash.startTime} s/d ${locationClash.endTime}.`;
        toast.error(errorMsg);
        return { success: false, error: errorMsg };
      }
    }

    const newSession: Session = {
      ...sessionData,
      id: `sess-${Date.now()}`
    };
    setSessions(prev => [...prev, newSession]);

    fetchJSON('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSession),
    }).then(() => {
      toast.success("Sesi pelatihan berhasil dialokasikan!");
    }).catch(err => {
      toastApiError('Alokasi sesi (server)', err);
      setSessions(prev => prev.filter(s => s.id !== newSession.id));
    });

    return { success: true };
  };

  const updateSession = (id: string, sessionData: Omit<Session, 'id'>) => {
    // Validasi yang sama seperti addSession ...
    const batch = batches.find(b => b.id === sessionData.batchId);
    const category = batch ? kategoriList.find(k => k.id === batch.kategoriId) : null;

    if (!batch || !category) {
      return { success: false, error: "Invalid selection parameters." };
    }

    if (!sessionData.wiIds || sessionData.wiIds.length === 0) {
      const errorMsg = "Pilih setidaknya satu Widyaiswara pengajar untuk sesi ini.";
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }

    const wis = widyaswaras.filter(w => sessionData.wiIds.includes(w.id));
    for (const wi of wis) {
      if (wi.level < category.minWeight) {
        const errorMsg = `Hierarki Kompetensi Terbatas: ${wi.name} (Level ${wi.level}) tidak memiliki level kompetensi yang cukup untuk kategori ${category.name} (Memerlukan minimal Level ${category.minWeight}).`;
        toast.error(errorMsg);
        return { success: false, error: errorMsg };
      }
    }

    if (sessionData.format === 'Klasikal') {
      const startHour = parseInt(sessionData.startTime.split(':')[0]);
      const endHour = parseInt(sessionData.endTime.split(':')[0]);
      const endMin = parseInt(sessionData.endTime.split(':')[1]);
      
      if (startHour < 8 || endHour > 17 || (endHour === 17 && endMin > 0)) {
        const errorMsg = "Jam Operasional Terbatas: Format Klasikal hanya dapat dijadwalkan antara pukul 08:00 dan 17:00.";
        toast.error(errorMsg);
        return { success: false, error: errorMsg };
      }

      if (!sessionData.lokasiId) {
        const errorMsg = "Lokasi kelas wajib dipilih untuk format Klasikal.";
        toast.error(errorMsg);
        return { success: false, error: errorMsg };
      }
    }

    const existingMapelSessions = sessions.filter(s => s.id !== id && s.batchId === sessionData.batchId && s.mapelId === sessionData.mapelId);
    const currentJpSum = existingMapelSessions.reduce((sum, s) => sum + s.jpCount, 0);
    const mapel = mapelList.find(m => m.id === sessionData.mapelId);
    const maxJp = mapel ? mapel.jpTotal : 6;

    if (currentJpSum + sessionData.jpCount > maxJp) {
      const errorMsg = `Maksimum JP Terlampaui: Total JP untuk ${mapel?.name || 'mata pelajaran ini'} tidak boleh melebihi ${maxJp} JP. Alokasi saat ini: ${currentJpSum} JP. Sesi baru: ${sessionData.jpCount} JP.`;
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }

    const newJpRange = parseJpRange(sessionData.jpKe);
    if (newJpRange.length === 2) {
      const jpCollision = sessions.find(s => 
        s.id !== id &&
        s.batchId === sessionData.batchId &&
        s.date === sessionData.date &&
        isJpOverlapping(newJpRange, parseJpRange(s.jpKe))
      );

      if (jpCollision) {
        const errorMsg = `Bentrok JP: Slot JP ke-${sessionData.jpKe} sudah terisi untuk angkatan ini pada tanggal terpilih!`;
        toast.error(errorMsg);
        return { success: false, error: errorMsg };
      }
    }

    const wiCollision = sessions.find(s => 
      s.id !== id &&
      s.wiIds.some(id => sessionData.wiIds.includes(id)) && 
      s.date === sessionData.date && 
      (
        (sessionData.startTime >= s.startTime && sessionData.startTime < s.endTime) ||
        (sessionData.endTime > s.startTime && sessionData.endTime <= s.endTime) ||
        (sessionData.startTime <= s.startTime && sessionData.endTime >= s.endTime)
      )
    );

    if (wiCollision) {
      const collidingBatch = batches.find(b => b.id === wiCollision.batchId);
      const clashedWiNames = wis
        .filter(w => wiCollision.wiIds.includes(w.id))
        .map(w => w.name)
        .join(', ');
      
      const errorMsg = `Bentrok Jadwal Pengajar: Instruktur (${clashedWiNames}) sudah teralokasikan untuk mengajar di angkatan "${collidingBatch?.name || 'Angkatan Lain'}" pada pukul ${wiCollision.startTime} - ${wiCollision.endTime} di hari yang sama.`;
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }

    if (sessionData.format === 'Klasikal' && sessionData.lokasiId) {
      const locationClash = sessions.find(s => 
        s.id !== id &&
        s.format === 'Klasikal' &&
        s.lokasiId === sessionData.lokasiId &&
        s.date === sessionData.date &&
        (
          (sessionData.startTime >= s.startTime && sessionData.startTime < s.endTime) ||
          (sessionData.endTime > s.startTime && sessionData.endTime <= s.endTime) ||
          (sessionData.startTime <= s.startTime && sessionData.endTime >= s.endTime)
        )
      );

      if (locationClash) {
        const collidingBatch = batches.find(b => b.id === locationClash.batchId);
        const locName = lokasiList.find(l => l.id === sessionData.lokasiId)?.name || 'ruangan ini';
        const errorMsg = `Bentrok Penggunaan Ruangan: ${locName} sedang digunakan oleh angkatan "${collidingBatch?.name || 'Angkatan Lain'}" dari pukul ${locationClash.startTime} s/d ${locationClash.endTime}.`;
        toast.error(errorMsg);
        return { success: false, error: errorMsg };
      }
    }

    const updatedSession = { ...sessionData, id };
    setSessions(prev => prev.map(s => s.id === id ? updatedSession : s));

    fetchJSON('/api/sessions', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedSession),
    }).then(() => {
      toast.success("Sesi pelatihan berhasil diperbarui!");
    }).catch(err => {
      toastApiError('Pembaruan sesi (server)', err);
    });

    return { success: true };
  };

  const deleteSession = (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    fetch(`/api/sessions?id=${sessionId}`, { method: 'DELETE' })
      .then(res => {
        if (!res.ok) throw new Error('Gagal menghapus sesi.');
        toast.success("Sesi pelatihan berhasil dihapus.");
      })
      .catch(err => toastApiError('Penghapusan sesi', err));
  };

  return (
    <WTMSContext.Provider value={{
      widyaswaras,
      kategoriList,
      mapelList,
      lokasiList,
      batches,
      sessions,
      userRole,
      selectedWiId,
      isAuthenticated,
      setUserRole: handleSetUserRole,
      setSelectedWiId: handleSetSelectedWiId,
      setIsAuthenticated: handleSetIsAuthenticated,
      
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
      deleteSession
    }}>
      {children}
    </WTMSContext.Provider>
  );
};

export const useWTMS = () => {
  const context = useContext(WTMSContext);
  if (context === undefined) {
    throw new Error('useWTMS must be used within a WTMSProvider');
  }
  return context;
};