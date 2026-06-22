"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

export interface Widyaiswara {
  id: string;
  name: string;
  gelar: string;
  email: string;
  nip: string; // Unique identifier
  jabatan: 'WI Ahli Pertama' | 'WI Ahli Muda' | 'WI Ahli Madya' | 'WI Ahli Utama';
  level: number; // 1 to 5
  levelLabel: string; // PPPK, Latsar, PKP, PKA, PKN
  jpLastMonth: number;
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
  jpTotal: number; // 2 to 6 JP
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
  wiIds: string[]; // Support multi-WI!
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  format: 'Klasikal' | 'Virtual' | 'Asinkron';
  lokasiId?: string; // Required if Klasikal
  jpKe: string; // e.g. "1-2"
  jpCount: number; // Number of JP
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
  
  // Actions
  setUserRole: (role: 'admin' | 'wi' | null) => void;
  setSelectedWiId: (id: string | null) => void;
  setIsAuthenticated: (auth: boolean) => void;
  
  // Widyaiswara CRUD
  addWidyaswara: (wi: Omit<Widyaiswara, 'id' | 'jpLastMonth'>) => boolean;
  updateWidyaswara: (id: string, wi: Omit<Widyaiswara, 'id' | 'jpLastMonth'>) => boolean;
  deleteWidyaswara: (id: string) => void;
  
  // Kategori CRUD
  addKategori: (kat: Omit<KategoriPelatihan, 'id'>) => void;
  updateKategori: (id: string, kat: Omit<KategoriPelatihan, 'id'>) => void;
  deleteKategori: (id: string) => void;
  
  // Mapel CRUD
  addMapel: (mapel: Omit<Mapel, 'id'>) => void;
  updateMapel: (id: string, mapel: Omit<Mapel, 'id'>) => void;
  deleteMapel: (id: string) => void;
  
  // Lokasi CRUD
  addLokasi: (lok: Omit<Lokasi, 'id'>) => void;
  updateLokasi: (id: string, lok: Omit<Lokasi, 'id'>) => void;
  deleteLokasi: (id: string) => void;
  
  // Batch CRUD
  addBatch: (batch: Omit<Batch, 'id'>) => void;
  updateBatch: (id: string, batch: Omit<Batch, 'id'>) => void;
  deleteBatch: (id: string) => void;
  
  // Session CRUD
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

  // Load from API on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [resWi, resKat, resMapel, resLok, resBatches, resSessions] = await Promise.all([
          fetch('/api/widyaswara').then(r => r.ok ? r.json() : []),
          fetch('/api/kategori-pelatihan').then(r => r.ok ? r.json() : []),
          fetch('/api/mata-pelatihan').then(r => r.ok ? r.json() : []),
          fetch('/api/lokasi').then(r => r.ok ? r.json() : []),
          fetch('/api/batches').then(r => r.ok ? r.json() : []),
          fetch('/api/sessions').then(r => r.ok ? r.json() : [])
        ]);

        if (Array.isArray(resWi) && resWi.length === 0 && Array.isArray(resKat) && resKat.length === 0) {
          const seedRes = await fetch('/api/seed', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
          }).then(r => r.json());

          if (seedRes.success) {
            window.location.reload();
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

    loadData();

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

  // Widyaiswara CRUD
  const addWidyaswara = (wi: Omit<Widyaiswara, 'id' | 'jpLastMonth'>): boolean => {
    const nipExists = widyaswaras.some(w => w.nip === wi.nip);
    if (nipExists) {
      toast.error(`Validation Error: Widyaiswara with NIP ${wi.nip} already exists!`);
      return false;
    }

    const newWi = {
      ...wi,
      id: `wi-${Date.now()}`,
      jpLastMonth: 0
    };
    
    setWidyaswaras(prev => [...prev, newWi]);

    fetch('/api/widyaswara', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newWi)
    }).catch(err => console.error(err));

    toast.success("Widyaiswara successfully added!");
    return true;
  };

  const updateWidyaswara = (id: string, wi: Omit<Widyaiswara, 'id' | 'jpLastMonth'>): boolean => {
    const updatedWi = { ...wi, id, jpLastMonth: 0 };
    setWidyaswaras(prev => prev.map(w => w.id === id ? updatedWi : w));

    fetch('/api/widyaswara', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedWi)
    }).catch(err => console.error(err));

    toast.success("Widyaiswara successfully updated!");
    return true;
  };

  const deleteWidyaswara = (id: string) => {
    setWidyaswaras(prev => prev.filter(w => w.id !== id));
    fetch(`/api/widyaswara?id=${id}`, { method: 'DELETE' }).catch(err => console.error(err));
    toast.success("Widyaiswara successfully removed.");
  };

  // Kategori CRUD
  const addKategori = (kat: Omit<KategoriPelatihan, 'id'>) => {
    const newKat = { ...kat, id: `kat-${Date.now()}` };
    setKategoriList(prev => [...prev, newKat]);
    fetch('/api/kategori-pelatihan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newKat) }).catch(err => console.error(err));
  };

  const updateKategori = (id: string, kat: Omit<KategoriPelatihan, 'id'>) => {
    const updatedKat = { ...kat, id };
    setKategoriList(prev => prev.map(k => k.id === id ? updatedKat : k));
    fetch('/api/kategori-pelatihan', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedKat) }).catch(err => console.error(err));
  };

  const deleteKategori = (id: string) => {
    setKategoriList(prev => prev.filter(k => k.id !== id));
    fetch(`/api/kategori-pelatihan?id=${id}`, { method: 'DELETE' }).catch(err => console.error(err));
  };

  // Mapel CRUD
  const addMapel = (mapel: Omit<Mapel, 'id'>) => {
    const newMapel = { ...mapel, id: `mapel-${Date.now()}` };
    setMapelList(prev => [...prev, newMapel]);
    fetch('/api/mata-pelatihan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newMapel) }).catch(err => console.error(err));
  };

  const updateMapel = (id: string, mapel: Omit<Mapel, 'id'>) => {
    const updatedMapel = { ...mapel, id };
    setMapelList(prev => prev.map(m => m.id === id ? updatedMapel : m));
    fetch('/api/mata-pelatihan', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedMapel) }).catch(err => console.error(err));
  };

  const deleteMapel = (id: string) => {
    setMapelList(prev => prev.filter(m => m.id !== id));
    fetch(`/api/mata-pelatihan?id=${id}`, { method: 'DELETE' }).catch(err => console.error(err));
  };

  // Lokasi CRUD
  const addLokasi = (lok: Omit<Lokasi, 'id'>) => {
    const newLok = { ...lok, id: `lok-${Date.now()}` };
    setLokasiList(prev => [...prev, newLok]);
    fetch('/api/lokasi', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newLok) }).catch(err => console.error(err));
  };

  const updateLokasi = (id: string, lok: Omit<Lokasi, 'id'>) => {
    const updatedLok = { ...lok, id };
    setLokasiList(prev => prev.map(l => l.id === id ? updatedLok : l));
    fetch('/api/lokasi', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedLok) }).catch(err => console.error(err));
  };

  const deleteLokasi = (id: string) => {
    setLokasiList(prev => prev.filter(l => l.id !== id));
    fetch(`/api/lokasi?id=${id}`, { method: 'DELETE' }).catch(err => console.error(err));
  };

  // Batch CRUD
  const addBatch = (batch: Omit<Batch, 'id'>) => {
    const newBatch = { ...batch, id: `batch-${Date.now()}` };
    setBatches(prev => [...prev, newBatch]);
    fetch('/api/batches', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newBatch) }).catch(err => console.error(err));
  };

  const updateBatch = (id: string, batch: Omit<Batch, 'id'>) => {
    const updatedBatch = { ...batch, id };
    setBatches(prev => prev.map(b => b.id === id ? updatedBatch : b));
    fetch('/api/batches', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedBatch) }).catch(err => console.error(err));
  };

  const deleteBatch = (id: string) => {
    setBatches(prev => prev.filter(b => b.id !== id));
    fetch(`/api/batches?id=${id}`, { method: 'DELETE' }).catch(err => console.error(err));
  };

  // Session CRUD (Refactored for Multi-WI Assignment & Verification loop)
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

    // 1. Hierarchy validation check for each selected instructor
    const wis = widyaswaras.filter(w => sessionData.wiIds.includes(w.id));
    for (const wi of wis) {
      if (wi.level < category.minWeight) {
        const errorMsg = `Hierarki Kompetensi Terbatas: ${wi.name} (Level ${wi.level}) tidak memiliki level kompetensi yang cukup untuk kategori ${category.name} (Memerlukan minimal Level ${category.minWeight}).`;
        toast.error(errorMsg);
        return { success: false, error: errorMsg };
      }
    }

    // 2. Operational Hours check (08:00 - 17:00 for Klasikal)
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

    // 3. Subject JP maximum allocation check
    const existingMapelSessions = sessions.filter(s => s.batchId === sessionData.batchId && s.mapelId === sessionData.mapelId);
    const currentJpSum = existingMapelSessions.reduce((sum, s) => sum + s.jpCount, 0);
    const mapel = mapelList.find(m => m.id === sessionData.mapelId);
    const maxJp = mapel ? mapel.jpTotal : 6;

    if (currentJpSum + sessionData.jpCount > maxJp) {
      const errorMsg = `Maksimum JP Terlampaui: Total JP untuk ${mapel?.name || 'mata pelajaran ini'} tidak boleh melebihi ${maxJp} JP. Alokasi saat ini: ${currentJpSum} JP. Sesi baru: ${sessionData.jpCount} JP.`;
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }

    // 4. Overlapping JP Slot check
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

    // 5. Collision checks: Loops over ALL assigned Widyaiswara IDs to detect overlaps
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

    // 6. Classroom venue clash check
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

    fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSession)
    }).catch(err => console.error(err));

    toast.success("Sesi pelatihan berhasil dialokasikan!");
    return { success: true };
  };

  const updateSession = (id: string, sessionData: Omit<Session, 'id'>) => {
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

    // 1. Hierarchy check
    const wis = widyaswaras.filter(w => sessionData.wiIds.includes(w.id));
    for (const wi of wis) {
      if (wi.level < category.minWeight) {
        const errorMsg = `Hierarki Kompetensi Terbatas: ${wi.name} (Level ${wi.level}) tidak memiliki level kompetensi yang cukup untuk kategori ${category.name} (Memerlukan minimal Level ${category.minWeight}).`;
        toast.error(errorMsg);
        return { success: false, error: errorMsg };
      }
    }

    // 2. Operational Hours check
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

    // 3. Max JP Check
    const existingMapelSessions = sessions.filter(s => s.id !== id && s.batchId === sessionData.batchId && s.mapelId === sessionData.mapelId);
    const currentJpSum = existingMapelSessions.reduce((sum, s) => sum + s.jpCount, 0);
    const mapel = mapelList.find(m => m.id === sessionData.mapelId);
    const maxJp = mapel ? mapel.jpTotal : 6;

    if (currentJpSum + sessionData.jpCount > maxJp) {
      const errorMsg = `Maksimum JP Terlampaui: Total JP untuk ${mapel?.name || 'mata pelajaran ini'} tidak boleh melebihi ${maxJp} JP. Alokasi saat ini: ${currentJpSum} JP. Sesi baru: ${sessionData.jpCount} JP.`;
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }

    // 4. Overlapping JP range check
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

    // 5. Collision checks: Loops over ALL assigned Widyaiswara IDs to detect overlaps
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

    // 6. Classroom venue clash check
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

    fetch('/api/sessions', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedSession)
    }).catch(err => console.error(err));

    toast.success("Sesi pelatihan berhasil diperbarui!");
    return { success: true };
  };

  const deleteSession = (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    fetch(`/api/sessions?id=${sessionId}`, { method: 'DELETE' }).catch(err => console.error(err));
    toast.success("Sesi pelatihan berhasil dihapus.");
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
      
      // Widyaiswara CRUD
      addWidyaswara,
      updateWidyaswara,
      deleteWidyaswara,
      
      // Kategori CRUD
      addKategori,
      updateKategori,
      deleteKategori,
      
      // Mapel CRUD
      addMapel,
      updateMapel,
      deleteMapel,
      
      // Lokasi CRUD
      addLokasi,
      updateLokasi,
      deleteLokasi,
      
      // Batch CRUD
      addBatch,
      updateBatch,
      deleteBatch,
      
      // Session CRUD
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