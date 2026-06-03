"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { toast } from 'sonner';

interface ReportActionsProps {
  data: any[];
}

export function ReportActions({ data }: ReportActionsProps) {
  const handleExportGlobalRecap = () => {
    const header = "LAPORAN REKAPITULASI GLOBAL BULANAN WIDYASWARA\n==================================================\n\n";
    const tableHeader = "NIP | Nama Widyaswara | APBD | Kontribusi | Kemitraan | Grand Total JP\n";
    const rows = data.map(wi => 
      `${wi.nip} | ${wi.name}, ${wi.gelar} | ${wi.apbd} JP | ${wi.kontribusi} JP | ${wi.kemitraan} JP | ${wi.total} JP`
    ).join('\n');
    
    const blob = new Blob([header + tableHeader + rows], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Global_Recap_Report_${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    toast.success("Global Recap exported successfully!");
  };

  return (
    <Button onClick={handleExportGlobalRecap} className="bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-2">
      <Download className="h-4 w-4" /> Export Global Recap
    </Button>
  );
}