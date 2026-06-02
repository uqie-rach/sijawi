"use client";

import { useWTMS, Widyaswara, Batch, Session, Mapel } from '@/context/wtms-context';

// 1. useWidyaswaras(): Fetches WI data with current calculations
export function useWidyaswaras() {
  const { widyaswaras, sessions, batches, addWidyaswara } = useWTMS();

  // Calculate current month JP for each Widyaswara
  const widyaswarasWithCalculations = widyaswaras.map(wi => {
    // Filter sessions for this WI
    const wiSessions = sessions.filter(s => s.wiId === wi.id);
    
    // Calculate total JP
    const jpCurrentMonth = wiSessions.reduce((sum, s) => sum + s.jpCount, 0);

    // Breakdown by Pola (APBD, Kontribusi, Kemitraan)
    let apbdJp = 0;
    let kontribusiJp = 0;
    let kemitraanJp = 0;

    wiSessions.forEach(s => {
      const batch = batches.find(b => b.id === s.batchId);
      if (batch) {
        if (batch.pola === 'APBD') apbdJp += s.jpCount;
        else if (batch.pola === 'Kontribusi') kontribusiJp += s.jpCount;
        else if (batch.pola === 'Kemitraan') kemitraanJp += s.jpCount;
      }
    });

    return {
      ...wi,
      jpCurrentMonth,
      breakdown: {
        apbd: apbdJp,
        kontribusi: kontribusiJp,
        kemitraan: kemitraanJp
      }
    };
  });

  return {
    widyaswaras: widyaswarasWithCalculations,
    addWidyaswara
  };
}

// 2. usePelatihan(): Manages Batch creations and data tracking
export function usePelatihan() {
  const { batches, kategoriList, sessions, addBatch } = useWTMS();

  const batchesWithCalculations = batches.map(batch => {
    const category = kategoriList.find(k => k.id === batch.kategoriId);
    const batchSessions = sessions.filter(s => s.batchId === batch.id);
    const totalJpScheduled = batchSessions.reduce((sum, s) => sum + s.jpCount, 0);

    return {
      ...batch,
      categoryName: category ? category.name : 'Unknown',
      totalJpScheduled,
      sessionCount: batchSessions.length
    };
  });

  return {
    batches: batchesWithCalculations,
    addBatch
  };
}

// 3. useScheduling(batchId): Core engine for adding, deleting, and validating sessions
export function useScheduling(batchId?: string) {
  const { 
    sessions, 
    batches, 
    mapelList, 
    widyaswaras, 
    lokasiList, 
    addSession, 
    deleteSession 
  } = useWTMS();

  // Filter sessions for this specific batch
  const batchSessions = batchId ? sessions.filter(s => s.batchId === batchId) : sessions;

  const sessionsWithDetails = batchSessions.map(session => {
    const mapel = mapelList.find(m => m.id === session.mapelId);
    const wi = widyaswaras.find(w => w.id === session.wiId);
    const lokasi = lokasiList.find(l => l.id === session.lokasiId);
    const batch = batches.find(b => b.id === session.batchId);

    return {
      ...session,
      mapelName: mapel ? mapel.name : 'Unknown Subject',
      wiName: wi ? `${wi.name}, ${wi.gelar}` : 'Unknown WI',
      lokasiName: lokasi ? lokasi.name : (session.format === 'Klasikal' ? 'Unknown Location' : session.format),
      batchName: batch ? batch.name : 'Unknown Batch'
    };
  });

  // Calculate remaining JP for each Mapel in this batch
  const getMapelStatus = (targetBatchId: string) => {
    const batch = batches.find(b => b.id === targetBatchId);
    if (!batch) return [];

    // Filter mapels belonging to this batch's category
    const relevantMapels = mapelList.filter(m => m.kategoriId === batch.kategoriId);

    return relevantMapels.map(mapel => {
      const scheduledSessions = sessions.filter(s => s.batchId === targetBatchId && s.mapelId === mapel.id);
      const scheduledJp = scheduledSessions.reduce((sum, s) => sum + s.jpCount, 0);
      const remainingJp = mapel.jpTotal - scheduledJp;

      return {
        ...mapel,
        scheduledJp,
        remainingJp,
        isFullyScheduled: remainingJp <= 0
      };
    });
  };

  return {
    sessions: sessionsWithDetails,
    mapelStatus: batchId ? getMapelStatus(batchId) : [],
    addSession,
    deleteSession
  };
}

// 4. useReports(month, year): Aggregates runtime calculations
export function useReports(month?: number, year?: number) {
  const { sessions, widyaswaras, batches } = useWTMS();

  // Filter sessions by month and year if provided
  const filteredSessions = sessions.filter(s => {
    if (!s.date) return false;
    const dateObj = new Date(s.date);
    const m = dateObj.getMonth() + 1; // 1-12
    const y = dateObj.getFullYear();

    const matchMonth = month ? m === month : true;
    const matchYear = year ? y === year : true;
    return matchMonth && matchYear;
  });

  // Aggregate total JP scheduled
  const totalJp = filteredSessions.reduce((sum, s) => sum + s.jpCount, 0);

  // Aggregate by Format
  let klasikalJp = 0;
  let virtualJp = 0;
  let asinkronJp = 0;

  // Aggregate by Pola
  let apbdJp = 0;
  let kontribusiJp = 0;
  let kemitraanJp = 0;

  filteredSessions.forEach(s => {
    if (s.format === 'Klasikal') klasikalJp += s.jpCount;
    else if (s.format === 'Virtual') virtualJp += s.jpCount;
    else if (s.format === 'Asinkron') asinkronJp += s.jpCount;

    const batch = batches.find(b => b.id === s.batchId);
    if (batch) {
      if (batch.pola === 'APBD') apbdJp += s.jpCount;
      else if (batch.pola === 'Kontribusi') kontribusiJp += s.jpCount;
      else if (batch.pola === 'Kemitraan') kemitraanJp += s.jpCount;
    }
  });

  // Top Widyaswaras by JP
  const wiJpMap: Record<string, number> = {};
  filteredSessions.forEach(s => {
    wiJpMap[s.wiId] = (wiJpMap[s.wiId] || 0) + s.jpCount;
  });

  const topWidyaswaras = Object.entries(wiJpMap)
    .map(([wiId, jp]) => {
      const wi = widyaswaras.find(w => w.id === wiId);
      return {
        name: wi ? `${wi.name}, ${wi.gelar}` : 'Unknown',
        jp,
        levelLabel: wi?.levelLabel || 'N/A'
      };
    })
    .sort((a, b) => b.jp - a.jp);

  return {
    totalJp,
    formatBreakdown: {
      klasikal: klasikalJp,
      virtual: virtualJp,
      asinkron: asinkronJp
    },
    polaBreakdown: {
      apbd: apbdJp,
      kontribusi: kontribusiJp,
      kemitraan: kemitraanJp
    },
    topWidyaswaras,
    sessionCount: filteredSessions.length
  };
}