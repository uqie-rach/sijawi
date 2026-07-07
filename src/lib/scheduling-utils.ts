import type { Session } from '@/context/wtms-context';

/**
 * Deteksi bentrok lokasi: mengecek apakah lokasi tertentu sudah terpakai
 * pada rentang waktu yang sama di tanggal yang sama oleh sesi lain.
 */
export function isLocationClashed(
  lokId: string,
  formData: { format: string; date: string; startTime: string; endTime: string },
  allSessions: Session[],
  excludeSessionId?: string | null
): boolean {
  if (formData.format !== 'Klasikal' || !formData.date || !formData.startTime || !formData.endTime) {
    return false;
  }

  return allSessions.some(
    s =>
      s.id !== excludeSessionId &&
      s.format === 'Klasikal' &&
      s.lokasiId === lokId &&
      s.date === formData.date &&
      (
        (formData.startTime >= s.startTime && formData.startTime < s.endTime) ||
        (formData.endTime > s.startTime && formData.endTime <= s.endTime) ||
        (formData.startTime <= s.startTime && formData.endTime >= s.endTime)
      )
  );
}

/**
 * Format Date object ke string YYYY-MM-DD.
 */
export function formatDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Nama bulan dalam Bahasa Indonesia.
 */
export function getMonthName(monthIdx: number): string {
  return [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ][monthIdx];
}

/**
 * Hitung endTime otomatis dari startTime + jumlah JP (1 JP = 45 menit).
 */
export function calculateEndTime(startTime: string, jpCount: number): string {
  const [h, m] = startTime.split(':').map(Number);
  const totalMinutes = h * 60 + m + jpCount * 45;
  const endH = Math.floor(totalMinutes / 60) % 24;
  const endM = totalMinutes % 60;
  return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
}

/**
 * Generate array hari untuk grid kalender bulanan.
 * Elemen null merepresentasikan slot kosong sebelum hari pertama.
 */
export function buildCalendarDays(year: number, month: number): (Date | null)[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const days: (Date | null)[] = [];
  for (let i = 0; i < firstDayIndex; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i));
  }
  return days;
}
