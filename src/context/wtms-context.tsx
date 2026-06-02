"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

export type WIJabatan = 'WI Ahli Pertama' | 'WI Ahli Muda' | 'WI Ahli Madya' | 'WI Ahli Utama';

export interface Widyaswara {
  id: string;
  name: string;
  nip: string;
  jabatan: WIJabatan;
  gelar: string;
  email: string;
  level: number;
  levelLabel: string;
  jpLastMonth: number;
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
  wiId: string;
  kelompok: string; // e.g., "Kelompok A"
  date: string;
  startTime: string;
  endTime: string;
  format: 'Klasikal' | 'Virtual' | 'Asinkron';
  lokasiId?: string;
  jpKe: string;
  jpCount: number;
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

const initialWidyaswaras: Widyaswara[] = [
  { id: 'wi-1', name: 'Uqie Rachmadie', nip: '198501012010011001', jabatan: 'WI Ahli Utama', gelar: 'M.Pd.', email: 'wi.uqie@example.com', level: 5, levelLabel: 'PKM', jpLastMonth: 32 },
  { id: 'wi-2', name: 'Americo Block', nip: '199002022015021002', jabatan: 'WI Ahli Muda', gelar: 'S.T.', email: 'wi.americo@example.com', level: 2, levelLabel: 'Latsar', jpLastMonth: 24 },
  { id: 'wi-3', name: 'Dr. H. Ahmad Yani', nip: '197503031998031003', jabatan: 'WI Ahli Madya', gelar: 'M.Si.', email: 'wi.yani@example.com', level: 4, levelLabel: 'PKA', jpLastMonth: 28 },
];

const initialKategori: Kategori[] = [
  { id: 'kat-pkm', name: 'PKM (Pelatihan Kepemimpinan Nasional)', minWeight: 5 },
  { id: 'kat-pka', name: 'PKA (Pelatihan Kepemimpinan Administrator)', minWeight: 4 },
  { id: 'kat-pkp', name: 'PKP (Pelatihan Kepemimpinan Pengawas)', minWeight: 3 },
  { id: 'kat-latsar', name: 'Latsar (Pelatihan Dasar CPNS)', minWeight: 2 },
];

const initialMapel: Mapel[] = [
  { id: 'mapel-1', name: 'Kepemimpinan Pancasila & Nasionalisme', kategoriId: 'kat-pka', jpTotal: 4 },
  { id: 'mapel-2', name: 'Manajemen Perubahan Sektor Publik', kategoriId: 'kat-pka', jpTotal: 6 },
  { id: 'mapel-3', name: 'Etika dan Integritas Kepemimpinan', kategoriId: 'kat-pka', jpTotal: 3 },
];

const initialLokasi: Lokasi[] = [
  { id: 'lok-1', name: 'Aula Utama' },
  { id: 'lok-2', name: 'Lab Komputer' },
  { id: 'lok-3', name: 'Ruang Kelas A' },
];

const initialBatches: Batch[] = [
  { id: 'batch-1', name: 'PKA Angkatan I', kategoriId: 'kat-pka', pola: 'APBD', startDate: '2026-03-01', endDate: '2026-03-15' },
];

const initialSessions: Session[] = [
  {
    id: 'sess-1',
    batchId: 'batch-1',
    mapelId: 'mapel-1',
    wiId: 'wi-3',
    kelompok: 'Kelompok A',
    date: '2026-03-02',
    startTime: '08:00',
    endTime: '09:30',
    format: 'Klasikal',
    lokasiId: 'lok-3',
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

  useEffect(() => {
    const load = (key: string, setter: any) => {
      const data = localStorage.getItem(key);
      if (data) setter(JSON.parse(data));
    };
    load('wtms_widyaswaras', setWidyaswaras);
    load('wtms_kategori', setKategoriList);
    load('wtms_mapel', setMapelList);
    load('wtms_lokasi', setLokasiList);
    load('wtms_batches', setBatches);
    load('wtms_sessions', setSessions);
  }, []);

  const save = (key: string, data: any) => localStorage.setItem(key, JSON.stringify(data));

  const addWidyaswara = (wi: Omit<Widyaswara, 'id' | 'jpLastMonth'>) => {
    const newWi = { ...wi, id: `wi-${Date.now()}`, jpLastMonth: 15 };
    setWidyaswaras(prev => {
      const updated = [...prev, newWi];
      save('wtms_widyaswaras', updated);
      return updated;
    });
    toast.success(`Widyaswara ${wi.name} added.`);
  };

  const addKategori = (kat: Omit<Kategori, 'id'>) => {
    const newKat = { ...kat, id: `kat-${Date.now()}` };
    setKategoriList(prev => {
      const updated = [...prev, newKat];
      save('wtms_kategori', updated);
      return updated;
    });
  };

  const addMapel = (mapel: Omit<Mapel, 'id'>) => {
    const newMapel = { ...mapel, id: `mapel-${Date.now()}` };
    setMapelList(prev => {
      const updated = [...prev, newMapel];
      save('wtms_mapel', updated);
      return updated;
    });
  };

  const addLokasi = (lok: Omit<Lokasi, 'id'>) => {
    const newLok = { ...lok, id: `lok-${Date.now()}` };
    setLokasiList(prev => {
      const updated = [...prev, newLok];
      save('wtms_lokasi', updated);
      return updated;
    });
  };

  const addBatch = (batch: Omit<Batch, 'id'>) => {
    const newBatch = { ...batch, id: `batch-${Date.now()}` };
    setBatches(prev => {
      const updated = [...prev, newBatch];
      save('wtms_batches', updated);
      return updated;
    });
  };

  const addSession = (sessionData: Omit<Session, 'id'>) => {
    const wi = widyaswaras.find(w => w.id === sessionData.wiId);
    const batch = batches.find(b => b.id === sessionData.batchId);
    const category = batch ? kategoriList.find(k => k.id === batch.kategoriId) : null;
    const mapel = mapelList.find(m => m.id === sessionData.mapelId);

    if (!wi || !batch || !category || !mapel) return { success: false, error: "Invalid data." };

    // Hierarchy Validation
    if (wi.level < category.minWeight) {
      toast.error(`Hierarchy Restriction: ${wi.name} level is insufficient.`);
      return { success: false };
    }

    // Operational Hours
    if (sessionData.format === 'Klasikal') {
      const start = parseInt(sessionData.startTime.split(':')[0]);
      const end = parseInt(sessionData.endTime.split(':')[0]);
      if (start < 8 || end > 17 || (end === 17 && parseInt(sessionData.endTime.split(':')[1]) > 0)) {
        toast.error("Operational Hours Restriction: Klasikal sessions must be 08:00 - 17:00.");
        return { success: false };
      }
    }

    // Mapel JP Aggregation (across groups)
    const existingJp = sessions
      .filter(s => s.batchId === sessionData.batchId && s.mapelId === sessionData.mapelId && s.kelompok === sessionData.kelompok)
      .reduce((sum, s) => sum + s.jpCount, 0);

    if (existingJp + sessionData.jpCount > mapel.jpTotal) {
      toast.error(`Mapel Constraint: Group "${sessionData.kelompok}" exceeds allocated ${mapel.jpTotal} JP for this subject.`);
      return { success: false };
    }

    // Collisions
    const collision = sessions.find(s => 
      s.wiId === sessionData.wiId && 
      s.date === sessionData.date && 
      ((sessionData.startTime < s.endTime && sessionData.endTime > s.startTime))
    );
    if (collision) {
      toast.error(`WI Collision: ${wi.name} is already teaching.`);
      return { success: false };
    }

    const newSession = { ...sessionData, id: `sess-${Date.now()}` };
    setSessions(prev => {
      const updated = [...prev, newSession];
      save('wtms_sessions', updated);
      return updated;
    });
    toast.success("Session scheduled.");
    return { success: true };
  };

  const deleteSession = (id: string) => {
    setSessions(prev => {
      const updated = prev.filter(s => s.id !== id);
      save('wtms_sessions', updated);
      return updated;
    });
    toast.success("Session removed.");
  };

  return (
    <WTMSContext.Provider value={{
      widyaswaras, kategoriList, mapelList, lokasiList, batches, sessions, userRole, selectedWiId,
      setUserRole, setSelectedWiId, addWidyaswara, addKategori, addMapel, addLokasi, addBatch, addSession, deleteSession
    }}>
      {children}
    </WTMSContext.Provider>
  );
};

export const useWTMS = () => {
  const context = useContext(WTMSContext);
  if (!context) throw new Error('useWTMS must be used within a WTMSProvider');
  return context;
};