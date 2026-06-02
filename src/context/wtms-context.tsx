"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

export interface Widyaswara {
  id: string;
  name: string;
  gelar: string;
  email: string;
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
  
  // Actions
  setUserRole: (role: 'admin' | 'wi' | null) => void;
  setSelectedWiId: (id: string | null) => void;
  addWidyaswara: (wi: Omit<Widyaswara, 'id' | 'jpLastMonth'>) => void;
  addKategori: (kat: Omit<Kategori, 'id'>) => void;
  addMapel: (mapel: Omit<Mapel, 'id'>) => void;
  addLokasi: (lok: Omit<Lokasi, 'id'>) => void;
  addBatch: (batch: Omit<Batch, 'id'>) => void;
  addSession: (session: Omit<Session, 'id'>) => { success: boolean; error?: string };
  deleteSession: (sessionId: string) => void;
}

const WTMSContext = createContext<WTMSContextType | undefined>(undefined);

// Pre-seeded data
const initialWidyaswaras: Widyaswara[] = [
  { id: 'wi-1', name: 'Uqie Rachmadie', gelar: 'M.Pd.', email: 'wtms+wi.uqie@gmail.com', level: 5, levelLabel: 'PKM', jpLastMonth: 32 },
  { id: 'wi-2', name: 'Americo Block', gelar: 'S.T.', email: 'wtms+wi.americo@gmail.com', level: 2, levelLabel: 'Latsar', jpLastMonth: 24 },
  { id: 'wi-3', name: 'Dr. H. Ahmad Yani', gelar: 'M.Si.', email: 'wtms+wi.yani@gmail.com', level: 4, levelLabel: 'PKA', jpLastMonth: 28 },
  { id: 'wi-4', name: 'Rina Wijaya', gelar: 'M.Si.', email: 'wtms+wi.rina@gmail.com', level: 3, levelLabel: 'PKP', jpLastMonth: 18 },
  { id: 'wi-5', name: 'Budi Santoso', gelar: 'S.Kom.', email: 'wtms+wi.budi@gmail.com', level: 1, levelLabel: 'PPPK', jpLastMonth: 12 },
];

const initialKategori: Kategori[] = [
  { id: 'kat-pkm', name: 'PKM (Pelatihan Kepemimpinan Nasional)', minWeight: 5 },
  { id: 'kat-pka', name: 'PKA (Pelatihan Kepemimpinan Administrator)', minWeight: 4 },
  { id: 'kat-pkp', name: 'PKP (Pelatihan Kepemimpinan Pengawas)', minWeight: 3 },
  { id: 'kat-latsar', name: 'Latsar (Pelatihan Dasar CPNS)', minWeight: 2 },
  { id: 'kat-pppk', name: 'PPPK (Pelatihan PPPK)', minWeight: 1 },
];

const initialMapel: Mapel[] = [
  { id: 'mapel-1', name: 'Kepemimpinan Pancasila & Nasionalisme', kategoriId: 'kat-pka', jpTotal: 4 },
  { id: 'mapel-2', name: 'Manajemen Perubahan Sektor Publik', kategoriId: 'kat-pka', jpTotal: 6 },
  { id: 'mapel-3', name: 'Etika dan Integritas Kepemimpinan', kategoriId: 'kat-pka', jpTotal: 3 },
  { id: 'mapel-4', name: 'Agenda Bela Negara', kategoriId: 'kat-latsar', jpTotal: 2 },
  { id: 'mapel-5', name: 'Nilai-Nilai Dasar PNS (BerAKHLAK)', kategoriId: 'kat-latsar', jpTotal: 6 },
  { id: 'mapel-6', name: 'Manajemen Strategis Nasional', kategoriId: 'kat-pkm', jpTotal: 6 },
  { id: 'mapel-7', name: 'Inovasi Pelayanan Publik', kategoriId: 'kat-pkp', jpTotal: 4 },
];

const initialLokasi: Lokasi[] = [
  { id: 'lok-1', name: 'Aula Utama' },
  { id: 'lok-2', name: 'Lab Komputer' },
  { id: 'lok-3', name: 'Ruang Kelas A' },
  { id: 'lok-4', name: 'Ruang Kelas B' },
];

const initialBatches: Batch[] = [
  { id: 'batch-1', name: 'PKA Angkatan I', kategoriId: 'kat-pka', pola: 'APBD', startDate: '2026-03-01', endDate: '2026-03-15' },
  { id: 'batch-2', name: 'Latsar CPNS 2026', kategoriId: 'kat-latsar', pola: 'Kontribusi', startDate: '2026-03-10', endDate: '2026-03-25' },
  { id: 'batch-3', name: 'PKM Kepemimpinan Nasional', kategoriId: 'kat-pkm', pola: 'Kemitraan', startDate: '2026-03-05', endDate: '2026-03-20' },
];

const initialSessions: Session[] = [
  {
    id: 'sess-1',
    batchId: 'batch-1',
    mapelId: 'mapel-1',
    wiId: 'wi-3', // Ahmad Yani (Level 4)
    date: '2026-03-02',
    startTime: '08:00',
    endTime: '09:30',
    format: 'Klasikal',
    lokasiId: 'lok-3',
    jpKe: '1-2',
    jpCount: 2
  },
  {
    id: 'sess-2',
    batchId: 'batch-1',
    mapelId: 'mapel-2',
    wiId: 'wi-1', // Uqie Rachmadie (Level 5)
    date: '2026-03-03',
    startTime: '10:00',
    endTime: '12:15',
    format: 'Klasikal',
    lokasiId: 'lok-1',
    jpKe: '3-5',
    jpCount: 3
  },
  {
    id: 'sess-3',
    batchId: 'batch-2',
    mapelId: 'mapel-4',
    wiId: 'wi-2', // Americo Block (Level 2)
    date: '2026-03-11',
    startTime: '08:00',
    endTime: '09:30',
    format: 'Klasikal',
    lokasiId: 'lok-2',
    jpKe: '1-2',
    jpCount: 2
  }
];

export const WTMSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [widyaswaras, setWidyaswaras] = useState<Widyaswara[]>(initialWidyaswaras);
  const [kategoriList, setKategoriList] = useState<Kategori[]>(initialKategori);
  const [mapelList, setMapelList] = useState<Mapel[]>(initialMapel);
  const [lokasiList, setLokasiList] = useState<Lokasi[]>(initialLokasi);
  const [batches, setBatches] = useState<Batch[]>(initialBatches);
  const [sessions, setSessions] = useState<Session[]>(initialSessions);
  const [userRole, setUserRole] = useState<'admin' | 'wi' | null>(null);
  const [selectedWiId, setSelectedWiId] = useState<string | null>(null);

  // Load from localStorage if available
  useEffect(() => {
    const storedWidyaswaras = localStorage.getItem('wtms_widyaswaras');
    const storedKategori = localStorage.getItem('wtms_kategori');
    const storedMapel = localStorage.getItem('wtms_mapel');
    const storedLokasi = localStorage.getItem('wtms_lokasi');
    const storedBatches = localStorage.getItem('wtms_batches');
    const storedSessions = localStorage.getItem('wtms_sessions');

    if (storedWidyaswaras) setWidyaswaras(JSON.parse(storedWidyaswaras));
    if (storedKategori) setKategoriList(JSON.parse(storedKategori));
    if (storedMapel) setMapelList(JSON.parse(storedMapel));
    if (storedLokasi) setLokasiList(JSON.parse(storedLokasi));
    if (storedBatches) setBatches(JSON.parse(storedBatches));
    if (storedSessions) setSessions(JSON.parse(storedSessions));
  }, []);

  // Save to localStorage on changes
  const saveToStorage = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  const addWidyaswara = (wi: Omit<Widyaswara, 'id' | 'jpLastMonth'>) => {
    const newWi: Widyaswara = {
      ...wi,
      id: `wi-${Date.now()}`,
      jpLastMonth: Math.floor(Math.random() * 20) + 10
    };
    const updated = [...widyaswaras, newWi];
    setWidyaswaras(updated);
    saveToStorage('wtms_widyaswaras', updated);
    toast.success(`Widyaswara ${wi.name} successfully added!`);
  };

  const addKategori = (kat: Omit<Kategori, 'id'>) => {
    const newKat: Kategori = {
      ...kat,
      id: `kat-${Date.now()}`
    };
    const updated = [...kategoriList, newKat];
    setKategoriList(updated);
    saveToStorage('wtms_kategori', updated);
    toast.success(`Category ${kat.name} successfully added!`);
  };

  const addMapel = (mapel: Omit<Mapel, 'id'>) => {
    const newMapel: Mapel = {
      ...mapel,
      id: `mapel-${Date.now()}`
    };
    const updated = [...mapelList, newMapel];
    setMapelList(updated);
    saveToStorage('wtms_mapel', updated);
    toast.success(`Subject ${mapel.name} successfully added!`);
  };

  const addLokasi = (lok: Omit<Lokasi, 'id'>) => {
    const newLok: Lokasi = {
      ...lok,
      id: `lok-${Date.now()}`
    };
    const updated = [...lokasiList, newLok];
    setLokasiList(updated);
    saveToStorage('wtms_lokasi', updated);
    toast.success(`Location ${lok.name} successfully added!`);
  };

  const addBatch = (batch: Omit<Batch, 'id'>) => {
    const newBatch: Batch = {
      ...batch,
      id: `batch-${Date.now()}`
    };
    const updated = [...batches, newBatch];
    setBatches(updated);
    saveToStorage('wtms_batches', updated);
    toast.success(`Batch ${batch.name} successfully created!`);
  };

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

    // 4. Validate WI Collision (Widyaswara cannot teach in two places at the same time)
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

    // 5. Validate Location Clash (For Klasikal format)
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
    const updated = [...sessions, newSession];
    setSessions(updated);
    saveToStorage('wtms_sessions', updated);
    toast.success("Session successfully scheduled!");
    return { success: true };
  };

  const deleteSession = (sessionId: string) => {
    const updated = sessions.filter(s => s.id !== sessionId);
    setSessions(updated);
    saveToStorage('wtms_sessions', updated);
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
      setUserRole,
      setSelectedWiId,
      addWidyaswara,
      addKategori,
      addMapel,
      addLokasi,
      addBatch,
      addSession,
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