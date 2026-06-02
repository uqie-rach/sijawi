"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

export interface Widyaswara {
  id: string;
  name: string;
  gelar: string;
  email: string;
  nip: string; // Unique identifier
  jabatan: 'WI Ahli Pertama' | 'WI Ahli Muda' | 'WI Ahli Madya' | 'WI Ahli Utama';
  level: number; // 1 to 5
  levelLabel: string; // PPPK, Latsar, PKP, PKA, PKM
  jpLastMonth: number; // Static historical data
}

export interface Kategori {
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
  wiId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  format: 'Klasikal' | 'Virtual' | 'Asinkron';
  lokasiId?: string; // Required if Klasikal
  jpKe: string; // e.g. "1-2"
  jpCount: number; // Number of JP
}

interface WTMSContextType {
  widyaswaras: Widyaswara[];
  kategoriList: Kategori[];
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
  
  // Widyaswara CRUD
  addWidyaswara: (wi: Omit<Widyaswara, 'id' | 'jpLastMonth'>) => boolean;
  updateWidyaswara: (id: string, wi: Omit<Widyaswara, 'id' | 'jpLastMonth'>) => boolean;
  deleteWidyaswara: (id: string) => void;
  
  // Kategori CRUD
  addKategori: (kat: Omit<Kategori, 'id'>) => void;
  updateKategori: (id: string, kat: Omit<Kategori, 'id'>) => void;
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

// Helper to parse JP range (e.g., "1-2" -> [1, 2], "3" -> [3, 3])
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

// Helper to check if two JP ranges overlap
function isJpOverlapping(range1: number[], range2: number[]): boolean {
  if (range1.length !== 2 || range2.length !== 2) return false;
  return Math.max(range1[0], range2[0]) <= Math.min(range1[1], range2[1]);
}

export const WTMSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [widyaswaras, setWidyaswaras] = useState<Widyaswara[]>([]);
  const [kategoriList, setKategoriList] = useState<Kategori[]>([]);
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
        // Fetch all data from API
        const [resWi, resKat, resMapel, resLok, resBatches, resSessions] = await Promise.all([
          fetch('/api/widyaswara').then(r => r.json()),
          fetch('/api/kategori-pelatihan').then(r => r.json()),
          fetch('/api/mata-pelatihan').then(r => r.json()),
          fetch('/api/lokasi').then(r => r.json()),
          fetch('/api/batches').then(r => r.json()),
          fetch('/api/sessions').then(r => r.json())
        ]);

        // Jika database kosong, panggil endpoint seed tunggal di server
        if (resWi.length === 0 && resKat.length === 0) {
          const seedRes = await fetch('/api/seed', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
          }).then(r => r.json());

          if (seedRes.success) {
            // Reload setelah seeding berhasil
            window.location.reload();
          }
          return;
        }

        setWidyaswaras(resWi);
        setKategoriList(resKat);
        setMapelList(resMapel);
        setLokasiList(resLok);
        setBatches(resBatches);
        setSessions(resSessions);
      } catch (err) {
        console.error("Failed to load data from API:", err);
      }
    };

    loadData();

    // Load auth state from localStorage
    const storedAuth = localStorage.getItem('wtms_auth');
    const storedRole = localStorage.getItem('wtms_role');
    const storedWiId = localStorage.getItem('wtms_wi_id');

    if (storedAuth) setIsAuthenticated(JSON.parse(storedAuth));
    if (storedRole) setUserRole(JSON.parse(storedRole) as any);
    if (storedWiId) setSelectedWiId(JSON.parse(storedWiId));
  }, []);

  // Save to localStorage on changes
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

  // Widyaswara CRUD
  const addWidyaswara = (wi: Omit<Widyaswara, 'id' | 'jpLastMonth'>): boolean => {
    const nipExists = widyaswaras.some(w => w.nip === wi.nip);
    if (nipExists) {
      toast.error(`Validation Error: Widyaswara with NIP ${wi.nip} already exists!`);
      return false;
    }

    const newWi: Widyaswara = {
      ...wi,
      id: `wi-${Date.now()}`,
      jpLastMonth: Math.floor(Math.random() * 20) + 10
    };
    
    setWidyaswaras(prev => [...prev, newWi]);
    
    fetch('/api/widyaswara', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newWi)
    }).catch(err => console.error(err));

    toast.success(`Widyaswara ${wi.name} successfully added!`);
    return true;
  };

  const updateWidyaswara = (id: string, wi: Omit<Widyaswara, 'id' | 'jpLastMonth'>): boolean => {
    const nipExists = widyaswaras.some(w => w.nip === wi.nip && w.id !== id);
    if (nipExists) {
      toast.error(`Validation Error: Widyaswara with NIP ${wi.nip} already exists!`);
      return false;
    }

    const updatedWi = { ...wi, id };
    setWidyaswaras(prev => prev.map(w => w.id === id ? { ...w, ...wi } : w));

    fetch('/api/widyaswara', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedWi)
    }).catch(err => console.error(err));

    toast.success(`Widyaswara ${wi.name} successfully updated!`);
    return true;
  };

  const deleteWidyaswara = (id: string) => {
    setWidyaswaras(prev => prev.filter(w => w.id !== id));

    fetch(`/api/widyaswara?id=${id}`, {
      method: 'DELETE'
    }).catch(err => console.error(err));

    toast.success("Widyaswara successfully deleted.");
  };

  // Kategori CRUD
  const addKategori = (kat: Omit<Kategori, 'id'>) => {
    const newKat: Kategori = {
      ...kat,
      id: `kat-${Date.now()}`
    };
    setKategoriList(prev => [...prev, newKat]);

    fetch('/api/kategori-pelatihan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newKat)
    }).catch(err => console.error(err));

    toast.success(`Category ${kat.name} successfully added!`);
  };

  const updateKategori = (id: string, kat: Omit<Kategori, 'id'>) => {
    const updatedKat = { ...kat, id };
    setKategoriList(prev => prev.map(k => k.id === id ? { ...k, ...kat } : k));

    fetch('/api/kategori-pelatihan', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedKat)
    }).catch(err => console.error(err));

    toast.success(`Category ${kat.name} successfully updated!`);
  };

  const deleteKategori = (id: string) => {
    setKategoriList(prev => prev.filter(k => k.id !== id));

    fetch(`/api/kategori-pelatihan?id=${id}`, {
      method: 'DELETE'
    }).catch(err => console.error(err));

    toast.success("Category successfully deleted.");
  };

  // Mapel CRUD
  const addMapel = (mapel: Omit<Mapel, 'id'>) => {
    const newMapel: Mapel = {
      ...mapel,
      id: `mapel-${Date.now()}`
    };
    setMapelList(prev => [...prev, newMapel]);

    fetch('/api/mata-pelatihan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMapel)
    }).catch(err => console.error(err));

    toast.success(`Subject ${mapel.name} successfully added!`);
  };

  const updateMapel = (id: string, mapel: Omit<Mapel, 'id'>) => {
    const updatedMapel = { ...mapel, id };
    setMapelList(prev => prev.map(m => m.id === id ? { ...m, ...mapel } : m));

    fetch('/api/mata-pelatihan', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedMapel)
    }).catch(err => console.error(err));

    toast.success(`Subject ${mapel.name} successfully updated!`);
  };

  const deleteMapel = (id: string) => {
    setMapelList(prev => prev.filter(m => m.id !== id));

    fetch(`/api/mata-pelatihan?id=${id}`, {
      method: 'DELETE'
    }).catch(err => console.error(err));

    toast.success("Subject successfully deleted.");
  };

  // Lokasi CRUD
  const addLokasi = (lok: Omit<Lokasi, 'id'>) => {
    const newLok: Lokasi = {
      ...lok,
      id: `lok-${Date.now()}`
    };
    setLokasiList(prev => [...prev, newLok]);

    fetch('/api/lokasi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newLok)
    }).catch(err => console.error(err));

    toast.success(`Location ${lok.name} successfully added!`);
  };

  const updateLokasi = (id: string, lok: Omit<Lokasi, 'id'>) => {
    const updatedLok = { ...lok, id };
    setLokasiList(prev => prev.map(l => l.id === id ? { ...l, ...lok } : l));

    fetch('/api/lokasi', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedLok)
    }).catch(err => console.error(err));

    toast.success(`Location ${lok.name} successfully updated!`);
  };

  const deleteLokasi = (id: string) => {
    setLokasiList(prev => prev.filter(l => l.id !== id));

    fetch(`/api/lokasi?id=${id}`, {
      method: 'DELETE'
    }).catch(err => console.error(err));

    toast.success("Location successfully deleted.");
  };

  // Batch CRUD
  const addBatch = (batch: Omit<Batch, 'id'>) => {
    const newBatch: Batch = {
      ...batch,
      id: `batch-${Date.now()}`
    };
    setBatches(prev => [...prev, newBatch]);

    fetch('/api/batches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newBatch)
    }).catch(err => console.error(err));

    toast.success(`Batch ${batch.name} successfully created!`);
  };

  const updateBatch = (id: string, batch: Omit<Batch, 'id'>) => {
    const updatedBatch = { ...batch, id };
    setBatches(prev => prev.map(b => b.id === id ? { ...b, ...batch } : b));

    fetch('/api/batches', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedBatch)
    }).catch(err => console.error(err));

    toast.success(`Batch ${batch.name} successfully updated!`);
  };

  const deleteBatch = (id: string) => {
    setBatches(prev => prev.filter(b => b.id !== id));

    fetch(`/api/batches?id=${id}`, {
      method: 'DELETE'
    }).catch(err => console.error(err));

    toast.success("Batch successfully deleted.");
  };

  // Session CRUD
  const addSession = (sessionData: Omit<Session, 'id'>) => {
    // 1. Validate Hierarchy Restriction
    const wi = widyaswaras.find(w => w.id === sessionData.wiId);
    const batch = batches.find(b => b.id === sessionData.batchId);
    const category = batch ? kategoriList.find(k => k.id === batch.kategoriId) : null;

    if (!wi || !batch || !category) {
      return { success: false, error: "Invalid Widyaswara, Batch, or Category selection." };
    }

    if (wi.level < category.minWeight) {
      const errorMsg = `Hierarchy Restriction: ${wi.name} (Level ${wi.level}) does not have sufficient competency level for ${category.name} (Requires Level ${category.minWeight}).`;
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }

    // 2. Validate Operational Hours for Klasikal
    if (sessionData.format === 'Klasikal') {
      const startHour = parseInt(sessionData.startTime.split(':')[0]);
      const endHour = parseInt(sessionData.endTime.split(':')[0]);
      const endMin = parseInt(sessionData.endTime.split(':')[1]);
      
      if (startHour < 8 || endHour > 17 || (endHour === 17 && endMin > 0)) {
        const errorMsg = "Operational Hours Restriction: Klasikal sessions must be scheduled between 08:00 and 17:00.";
        toast.error(errorMsg);
        return { success: false, error: errorMsg };
      }

      if (!sessionData.lokasiId) {
        const errorMsg = "Location is required for Klasikal format.";
        toast.error(errorMsg);
        return { success: false, error: errorMsg };
      }
    }

    // 3. Validate Mapel JP accumulation (Max 6 JP per Mapel in a batch)
    const existingMapelSessions = sessions.filter(s => s.batchId === sessionData.batchId && s.mapelId === sessionData.mapelId);
    const currentJpSum = existingMapelSessions.reduce((sum, s) => sum + s.jpCount, 0);
    const mapel = mapelList.find(m => m.id === sessionData.mapelId);
    const maxJp = mapel ? mapel.jpTotal : 6;

    if (currentJpSum + sessionData.jpCount > maxJp) {
      const errorMsg = `Mapel Constraint: Total JP for ${mapel?.name || 'this subject'} cannot exceed ${maxJp} JP. Currently scheduled: ${currentJpSum} JP. Attempted to add: ${sessionData.jpCount} JP.`;
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }

    // 4. Validate JP Conflict Engine Validation (jp_ke Overlap Prevention)
    const newJpRange = parseJpRange(sessionData.jpKe);
    if (newJpRange.length === 2) {
      const jpCollision = sessions.find(s => 
        s.batchId === sessionData.batchId &&
        s.date === sessionData.date &&
        isJpOverlapping(newJpRange, parseJpRange(s.jpKe))
      );

      if (jpCollision) {
        const errorMsg = `❌ Slot JP tersebut sudah terisi pada tanggal ini! (Collision with existing JP ${jpCollision.jpKe})`;
        toast.error(errorMsg);
        return { success: false, error: errorMsg };
      }
    }

    // 5. Validate WI Collision (Widyaswara cannot teach in two places at the same time)
    const wiCollision = sessions.find(s => 
      s.wiId === sessionData.wiId && 
      s.date === sessionData.date && 
      (
        (sessionData.startTime >= s.startTime && sessionData.startTime < s.endTime) ||
        (sessionData.endTime > s.startTime && sessionData.endTime <= s.endTime) ||
        (sessionData.startTime <= s.startTime && sessionData.endTime >= s.endTime)
      )
    );

    if (wiCollision) {
      const collidingBatch = batches.find(b => b.id === wiCollision.batchId);
      const errorMsg = `Widyaswara Collision: ${wi.name} is already scheduled to teach in batch "${collidingBatch?.name || 'Another Batch'}" from ${wiCollision.startTime} to ${wiCollision.endTime} on this day.`;
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }

    // 6. Validate Location Clash (For Klasikal format)
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
        const locName = lokasiList.find(l => l.id === sessionData.lokasiId)?.name || 'this location';
        const errorMsg = `Location Clash: ${locName} is already booked for batch "${collidingBatch?.name || 'Another Batch'}" from ${locationClash.startTime} to ${locationClash.endTime} on this day.`;
        toast.error(errorMsg);
        return { success: false, error: errorMsg };
      }
    }

    // All validations passed!
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

    toast.success("Session successfully scheduled!");
    return { success: true };
  };

  const updateSession = (id: string, sessionData: Omit<Session, 'id'>) => {
    // 1. Validate Hierarchy Restriction
    const wi = widyaswaras.find(w => w.id === sessionData.wiId);
    const batch = batches.find(b => b.id === sessionData.batchId);
    const category = batch ? kategoriList.find(k => k.id === batch.kategoriId) : null;

    if (!wi || !batch || !category) {
      return { success: false, error: "Invalid Widyaswara, Batch, or Category selection." };
    }

    if (wi.level < category.minWeight) {
      const errorMsg = `Hierarchy Restriction: ${wi.name} (Level ${wi.level}) does not have sufficient competency level for ${category.name} (Requires Level ${category.minWeight}).`;
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }

    // 2. Validate Operational Hours for Klasikal
    if (sessionData.format === 'Klasikal') {
      const startHour = parseInt(sessionData.startTime.split(':')[0]);
      const endHour = parseInt(sessionData.endTime.split(':')[0]);
      const endMin = parseInt(sessionData.endTime.split(':')[1]);
      
      if (startHour < 8 || endHour > 17 || (endHour === 17 && endMin > 0)) {
        const errorMsg = "Operational Hours Restriction: Klasikal sessions must be scheduled between 08:00 and 17:00.";
        toast.error(errorMsg);
        return { success: false, error: errorMsg };
      }

      if (!sessionData.lokasiId) {
        const errorMsg = "Location is required for Klasikal format.";
        toast.error(errorMsg);
        return { success: false, error: errorMsg };
      }
    }

    // 3. Validate Mapel JP accumulation (Max 6 JP per Mapel in a batch)
    const existingMapelSessions = sessions.filter(s => s.id !== id && s.batchId === sessionData.batchId && s.mapelId === sessionData.mapelId);
    const currentJpSum = existingMapelSessions.reduce((sum, s) => sum + s.jpCount, 0);
    const mapel = mapelList.find(m => m.id === sessionData.mapelId);
    const maxJp = mapel ? mapel.jpTotal : 6;

    if (currentJpSum + sessionData.jpCount > maxJp) {
      const errorMsg = `Mapel Constraint: Total JP for ${mapel?.name || 'this subject'} cannot exceed ${maxJp} JP. Currently scheduled: ${currentJpSum} JP. Attempted to add: ${sessionData.jpCount} JP.`;
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }

    // 4. Validate JP Conflict Engine Validation (jp_ke Overlap Prevention)
    const newJpRange = parseJpRange(sessionData.jpKe);
    if (newJpRange.length === 2) {
      const jpCollision = sessions.find(s => 
        s.id !== id &&
        s.batchId === sessionData.batchId &&
        s.date === sessionData.date &&
        isJpOverlapping(newJpRange, parseJpRange(s.jpKe))
      );

      if (jpCollision) {
        const errorMsg = `❌ Slot JP tersebut sudah terisi pada tanggal ini! (Collision with existing JP ${jpCollision.jpKe})`;
        toast.error(errorMsg);
        return { success: false, error: errorMsg };
      }
    }

    // 5. Validate WI Collision (Widyaswara cannot teach in two places at the same time)
    const wiCollision = sessions.find(s => 
      s.id !== id &&
      s.wiId === sessionData.wiId && 
      s.date === sessionData.date && 
      (
        (sessionData.startTime >= s.startTime && sessionData.startTime < s.endTime) ||
        (sessionData.endTime > s.startTime && sessionData.endTime <= s.endTime) ||
        (sessionData.startTime <= s.startTime && sessionData.endTime >= s.endTime)
      )
    );

    if (wiCollision) {
      const collidingBatch = batches.find(b => b.id === wiCollision.batchId);
      const errorMsg = `Widyaswara Collision: ${wi.name} is already scheduled to teach in batch "${collidingBatch?.name || 'Another Batch'}" from ${wiCollision.startTime} to ${wiCollision.endTime} on this day.`;
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }

    // 6. Validate Location Clash (For Klasikal format)
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
        const locName = lokasiList.find(l => l.id === sessionData.lokasiId)?.name || 'this location';
        const errorMsg = `Location Clash: ${locName} is already booked for batch "${collidingBatch?.name || 'Another Batch'}" from ${locationClash.startTime} to ${locationClash.endTime} on this day.`;
        toast.error(errorMsg);
        return { success: false, error: errorMsg };
      }
    }

    // All validations passed!
    const updatedSession = { ...sessionData, id };
    setSessions(prev => prev.map(s => s.id === id ? { ...s, ...sessionData } : s));

    fetch('/api/sessions', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedSession)
    }).catch(err => console.error(err));

    toast.success("Session successfully updated!");
    return { success: true };
  };

  const deleteSession = (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));

    fetch(`/api/sessions?id=${sessionId}`, {
      method: 'DELETE'
    }).catch(err => console.error(err));

    toast.success("Session successfully removed.");
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
      
      // Widyaswara CRUD
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