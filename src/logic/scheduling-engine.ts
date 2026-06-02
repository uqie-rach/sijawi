import { Widyaswara, Batch, Kategori, Mapel, Session, Lokasi } from '@/context/wtms-context';

// Helper to parse JP range (e.g., "1-2" -> [1, 2], "3" -> [3, 3])
export function parseJpRange(jpKe: string): number[] {
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
export function isJpOverlapping(range1: number[], range2: number[]): boolean {
  if (range1.length !== 2 || range2.length !== 2) return false;
  return Math.max(range1[0], range2[0]) <= Math.min(range1[1], range2[1]);
}

export interface ValidationResult {
  success: boolean;
  error?: string;
}

/**
 * Core Scheduling Engine
 * Validates a session against all business rules and constraints.
 */
export function validateSession(
  sessionData: Omit<Session, 'id'>,
  sessions: Session[],
  widyaswaras: Widyaswara[],
  batches: Batch[],
  kategoriList: Kategori[],
  mapelList: Mapel[],
  lokasiList: Lokasi[],
  excludeSessionId?: string
): ValidationResult {
  const wi = widyaswaras.find(w => w.id === sessionData.wiId);
  const batch = batches.find(b => b.id === sessionData.batchId);
  const category = batch ? kategoriList.find(k => k.id === batch.kategoriId) : null;

  if (!wi || !batch || !category) {
    return { success: false, error: "Invalid Widyaswara, Batch, or Category selection." };
  }

  // 1. Validate Hierarchy Restriction
  if (wi.level < category.minWeight) {
    return {
      success: false,
      error: `Hierarchy Restriction: ${wi.name} (Level ${wi.level}) does not have sufficient competency level for ${category.name} (Requires Level ${category.minWeight}).`
    };
  }

  // 2. Validate Operational Hours for Klasikal
  if (sessionData.format === 'Klasikal') {
    const startHour = parseInt(sessionData.startTime.split(':')[0]);
    const endHour = parseInt(sessionData.endTime.split(':')[0]);
    const endMin = parseInt(sessionData.endTime.split(':')[1]);
    
    if (startHour < 8 || endHour > 17 || (endHour === 17 && endMin > 0)) {
      return {
        success: false,
        error: "Operational Hours Restriction: Klasikal sessions must be scheduled between 08:00 and 17:00."
      };
    }

    if (!sessionData.lokasiId) {
      return {
        success: false,
        error: "Location is required for Klasikal format."
      };
    }
  }

  // 3. Validate Mapel JP accumulation (Max JP per Mapel in a batch)
  const existingMapelSessions = sessions.filter(s => 
    s.id !== excludeSessionId && 
    s.batchId === sessionData.batchId && 
    s.mapelId === sessionData.mapelId
  );
  const currentJpSum = existingMapelSessions.reduce((sum, s) => sum + s.jpCount, 0);
  const mapel = mapelList.find(m => m.id === sessionData.mapelId);
  const maxJp = mapel ? mapel.jpTotal : 6;

  if (currentJpSum + sessionData.jpCount > maxJp) {
    return {
      success: false,
      error: `Mapel Constraint: Total JP for ${mapel?.name || 'this subject'} cannot exceed ${maxJp} JP. Currently scheduled: ${currentJpSum} JP. Attempted to add: ${sessionData.jpCount} JP.`
    };
  }

  // 4. Validate JP Conflict Engine Validation (jp_ke Overlap Prevention)
  const newJpRange = parseJpRange(sessionData.jpKe);
  if (newJpRange.length === 2) {
    const jpCollision = sessions.find(s => 
      s.id !== excludeSessionId &&
      s.batchId === sessionData.batchId &&
      s.date === sessionData.date &&
      isJpOverlapping(newJpRange, parseJpRange(s.jpKe))
    );

    if (jpCollision) {
      return {
        success: false,
        error: `❌ Slot JP tersebut sudah terisi pada tanggal ini! (Collision with existing JP ${jpCollision.jpKe})`
      };
    }
  }

  // 5. Validate WI Collision (Widyaswara cannot teach in two places at the same time)
  const wiCollision = sessions.find(s => 
    s.id !== excludeSessionId &&
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
    return {
      success: false,
      error: `Widyaswara Collision: ${wi.name} is already scheduled to teach in batch "${collidingBatch?.name || 'Another Batch'}" from ${wiCollision.startTime} to ${wiCollision.endTime} on this day.`
    };
  }

  // 6. Validate Location Clash (For Klasikal format)
  if (sessionData.format === 'Klasikal' && sessionData.lokasiId) {
    const locationClash = sessions.find(s => 
      s.id !== excludeSessionId &&
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
      return {
        success: false,
        error: `Location Clash: ${locName} is already booked for batch "${collidingBatch?.name || 'Another Batch'}" from ${locationClash.startTime} to ${locationClash.endTime} on this day.`
      };
    }
  }

  return { success: true };
}