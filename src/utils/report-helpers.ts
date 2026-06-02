import { Widyaswara, Batch, Session } from '@/context/wtms-context';

export interface WiReportData extends Widyaswara {
  apbd: number;
  kontribusi: number;
  kemitraan: number;
  grandTotal: number;
}

/**
 * Transforms Widyaswara list into chart-ready data for load balancing.
 */
export function transformLoadBalancingData(widyaswaras: any[]) {
  return widyaswaras.map(wi => ({
    name: wi.name.split(' ')[0], // Short name for X-axis
    fullName: `${wi.name}, ${wi.gelar}`,
    'Total JP': wi.jpCurrentMonth
  }));
}

/**
 * Transforms funding pattern breakdown into chart-ready data.
 */
export function transformFundingDistributionData(polaBreakdown: { apbd: number; kontribusi: number; kemitraan: number }) {
  return [
    { name: 'APBD', value: polaBreakdown.apbd, color: '#3b82f6' },
    { name: 'Kontribusi', value: polaBreakdown.kontribusi, color: '#10b981' },
    { name: 'Kemitraan', value: polaBreakdown.kemitraan, color: '#f59e0b' }
  ].filter(item => item.value > 0);
}

/**
 * Filters and aggregates Widyaswara data for the Monthly Recap Table.
 */
export function getFilteredRecapData(
  widyaswaras: Widyaswara[],
  sessions: Session[],
  batches: Batch[],
  searchQuery: string,
  filterPola: string,
  startDateFilter: string,
  endDateFilter: string
): WiReportData[] {
  return widyaswaras
    .filter(wi => {
      const matchesSearch = wi.name.toLowerCase().includes(searchQuery.toLowerCase()) || wi.nip.includes(searchQuery);
      
      // Calculate dynamic JP based on filters
      const wiSessions = sessions.filter(s => {
        if (s.wiId !== wi.id) return false;
        
        // Date Range Filter
        if (startDateFilter && s.date < startDateFilter) return false;
        if (endDateFilter && s.date > endDateFilter) return false;
        
        // Pola Filter
        if (filterPola !== 'ALL') {
          const batch = batches.find(b => b.id === s.batchId);
          if (!batch || batch.pola !== filterPola) return false;
        }
        
        return true;
      });

      return matchesSearch && (wiSessions.length > 0 || searchQuery === '');
    })
    .map(wi => {
      const wiSessions = sessions.filter(s => {
        if (s.wiId !== wi.id) return false;
        if (startDateFilter && s.date < startDateFilter) return false;
        if (endDateFilter && s.date > endDateFilter) return false;
        if (filterPola !== 'ALL') {
          const batch = batches.find(b => b.id === s.batchId);
          if (!batch || batch.pola !== filterPola) return false;
        }
        return true;
      });

      let apbd = 0;
      let kontribusi = 0;
      let kemitraan = 0;

      wiSessions.forEach(s => {
        const batch = batches.find(b => b.id === s.batchId);
        if (batch) {
          if (batch.pola === 'APBD') apbd += s.jpCount;
          else if (batch.pola === 'Kontribusi') kontribusi += s.jpCount;
          else if (batch.pola === 'Kemitraan') kemitraan += s.jpCount;
        }
      });

      return {
        ...wi,
        apbd,
        kontribusi,
        kemitraan,
        grandTotal: apbd + kontribusi + kemitraan
      };
    });
}

/**
 * Generates plaintext content for Global Recap Export.
 */
export function generateGlobalRecapText(recapData: WiReportData[]): string {
  const header = "LAPORAN REKAPITULASI GLOBAL BULANAN WIDYASWARA\n==================================================\n\n";
  const tableHeader = "NIP | Nama Widyaswara | Jabatan | APBD | Kontribusi | Kemitraan | Grand Total JP\n";
  const rows = recapData.map(wi => 
    `${wi.nip} | ${wi.name}, ${wi.gelar} | ${wi.jabatan} | ${wi.apbd} JP | ${wi.kontribusi} JP | ${wi.kemitraan} JP | ${wi.grandTotal} JP`
  ).join('\n');
  
  return header + tableHeader + rows;
}

/**
 * Generates plaintext content for Individual WI Report Export.
 */
export function generateIndividualReportText(wi: WiReportData): string {
  const header = `LAPORAN KINERJA INDIVIDU WIDYASWARA\n====================================\n\n`;
  const metadata = `NIP: ${wi.nip}\nNama: ${wi.name}, ${wi.gelar}\nJabatan: ${wi.jabatan}\nCompetency Level: Level ${wi.level} (${wi.levelLabel})\n\n`;
  const summary = `REKAPITULASI JAM PELAJARAN (JP):\n--------------------------------\nAPBD: ${wi.apbd} JP\nKontribusi: ${wi.kontribusi} JP\nKemitraan: ${wi.kemitraan} JP\nGrand Total: ${wi.grandTotal} JP\n`;
  
  return header + metadata + summary;
}