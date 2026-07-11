"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { toast } from '@/lib/toast';

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
  singkatan: string;
  kepanjangan: string;
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

async function fetchJSON(url: string, options?: RequestInit): Promise<any> {
  const res = await fetch(url, options);
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.error || `Request failed with status ${res.status}`);
  }
  return data;
}

function toastApiError(context: string, err: unknown) {
  const message = err instanceof Error ? err.message : 'Terjadi kesalahan jaringan.';
  toast.error(`${context} gagal: ${message}`);
}

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

  addWidyaswara: (wi: Omit<Widyaiswara, 'id' | 'jpLastMonth'>) => Promise<{ success: boolean; error?: string }>;
  updateWidyaswara: (id: string, wi: Omit<Widyaiswara, 'id' | 'jpLastMonth'>) => Promise<{ success: boolean; error?: string }>;
  deleteWidyaswara: (id: string) => Promise<{ success: boolean; error?: string }>;

  addKategori: (kat: { singkatan: string; kepanjangan: string; minWeight: number }) => Promise<{ success: boolean; error?: string }>;
  updateKategori: (id: string, kat: { singkatan: string; kepanjangan: string; minWeight: number }) => Promise<{ success: boolean; error?: string }>;
  deleteKategori: (id: string) => Promise<{ success: boolean; error?: string }>;

  addMapel: (mapel: Omit<Mapel, 'id'>) => Promise<{ success: boolean; error?: string }>;
  updateMapel: (id: string, mapel: Omit<Mapel, 'id'>) => Promise<{ success: boolean; error?: string }>;
  deleteMapel: (id: string) => Promise<{ success: boolean; error?: string }>;

  addLokasi: (lok: Omit<Lokasi, 'id'>) => Promise<{ success: boolean; error?: string }>;
  updateLokasi: (id: string, lok: Omit<Lokasi, 'id'>) => Promise<{ success: boolean; error?: string }>;
  deleteLokasi: (id: string) => Promise<{ success: boolean; error?: string }>;

  addBatch: (batch: Omit<Batch, 'id'>) => Promise<{ success: boolean; error?: string }>;
  updateBatch: (id: string, batch: Omit<Batch, 'id'>) => Promise<{ success: boolean; error?: string }>;
  deleteBatch: (id: string) => Promise<{ success: boolean; error?: string }>;

  addSession: (session: Omit<Session, 'id'>) => Promise<{ success: boolean; error?: string }>;
  updateSession: (id: string, session: Omit<Session, 'id'>) => Promise<{ success: boolean; error?: string }>;
  deleteSession: (sessionId: string) => void;
}

const WTMSContext = createContext<WTMSContextType | undefined>(undefined);

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

  const isSeeding = useRef(false);

  const loadAllData = async () => {
    try {
      const [resWi, resKat, resMapel, resLok, resBatches, rawSessions] = await Promise.all([
        fetch('/api/widyaswara').then(r => r.ok ? r.json() : []),
        fetch('/api/kategori-pelatihan').then(r => r.ok ? r.json() : []),
        fetch('/api/mata-pelatihan').then(r => r.ok ? r.json() : []),
        fetch('/api/lokasi').then(r => r.ok ? r.json() : []),
        fetch('/api/batches').then(r => r.ok ? r.json() : []),
        fetch('/api/sessions').then(r => r.ok ? r.json() : []),
      ]);

      // Extract sessions array from paginated response if needed
      let resSessions: Session[] = [];
      if (Array.isArray(rawSessions)) {
        resSessions = rawSessions;
      } else if (rawSessions && Array.isArray(rawSessions.sessions)) {
        // Paginated response: { sessions: [...], total, page, totalPages }
        resSessions = rawSessions.sessions;
      } else if (rawSessions && rawSessions.sessions) {
        resSessions = rawSessions.sessions;
      }

      if (Array.isArray(resWi) && resWi.length === 0 &&
        Array.isArray(resKat) && resKat.length === 0 &&
        !isSeeding.current) {
        isSeeding.current = true;
        try {
          const seedRes = await fetch('/api/seed', { method: 'POST' }).then(r => r.json());
          if (seedRes.success) {
            const newData = await Promise.all([
              fetch('/api/widyaswara').then(r => r.ok ? r.json() : []),
              fetch('/api/kategori-pelatihan').then(r => r.ok ? r.json() : []),
              fetch('/api/mata-pelatihan').then(r => r.ok ? r.json() : []),
              fetch('/api/lokasi').then(r => r.ok ? r.json() : []),
              fetch('/api/batches').then(r => r.ok ? r.json() : []),
              fetch('/api/sessions').then(r => r.ok ? r.json() : []),
            ]);

            let newSessions: Session[] = [];
            const rawNewSessions = newData[5];
            if (Array.isArray(rawNewSessions)) {
              newSessions = rawNewSessions;
            } else if (rawNewSessions && Array.isArray(rawNewSessions.sessions)) {
              newSessions = rawNewSessions.sessions;
            }

            setWidyaswaras(newData[0] || []);
            setKategoriList(newData[1] || []);
            setMapelList(newData[2] || []);
            setLokasiList(newData[3] || []);
            setBatches(newData[4] || []);
            setSessions(newSessions);
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
      setSessions(resSessions);
    } catch (err) {
      console.error("Failed to load data from API:", err);
    }
  };

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

  const addKategori = async (kat: { singkatan: string; kepanjangan: string; minWeight: number }): Promise<{ success: boolean; error?: string }> => {
    const newKat = { ...kat, id: `kat-${Date.now()}` };
    try {
      await fetchJSON('/api/kategori-pelatihan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newKat),
      });
      setKategoriList(prev => [...prev, newKat as KategoriPelatihan]);
      toastApiSuccess('Kategori berhasil ditambahkan');
      return { success: true };
    } catch (err) {
      toastApiError('Penambahan Kategori', err);
      return { success: false, error: err instanceof Error ? err.message : 'Gagal menambahkan' };
    }
  };

  const updateKategori = async (id: string, kat: { singkatan: string; kepanjangan: string; minWeight: number }): Promise<{ success: boolean; error?: string }> => {
    const updatedKat = { ...kat, id };
    try {
      await fetchJSON('/api/kategori-pelatihan', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedKat),
      });
      setKategoriList(prev => prev.map(k => k.id === id ? updatedKat as KategoriPelatihan : k));
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

  const addSession = async (sessionData: Omit<Session, 'id'>): Promise<{ success: boolean; error?: string }> => {
    const newSession: Session = {
      ...sessionData,
      id: `sess-${Date.now()}`
    };
    // Optimistic update
    setSessions(prev => [...prev, newSession]);

    try {
      await fetchJSON('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSession),
      });
      // success: keep the session
      toast.success("Sesi pelatihan berhasil dialokasikan!");
      return { success: true };
    } catch (err) {
      // Rollback optimistic update on API error
      setSessions(prev => prev.filter(s => s.id !== newSession.id));
      const message = err instanceof Error ? err.message : 'Gagal menyimpan sesi.';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const updateSession = async (id: string, sessionData: Omit<Session, 'id'>): Promise<{ success: boolean; error?: string }> => {
    const updatedSession = { ...sessionData, id };
    // Optimistic update
    const previousSessions = sessions;
    setSessions(prev => prev.map(s => s.id === id ? updatedSession : s));

    try {
      await fetchJSON('/api/sessions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSession),
      });
      toast.success("Sesi pelatihan berhasil diperbarui!");
      return { success: true };
    } catch (err) {
      // Revert to previous state on error
      setSessions(previousSessions);
      const message = err instanceof Error ? err.message : 'Gagal memperbarui sesi.';
      toast.error(message);
      return { success: false, error: message };
    }
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