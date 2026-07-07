'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Layers } from 'lucide-react';

interface BatchNavigationProps {
  batches: { id: string; name: string; startDate: string }[];
  currentBatchId?: string;
}

export function BatchNavigation({ batches, currentBatchId }: BatchNavigationProps) {
  const router = useRouter();

  if (!batches || batches.length === 0) return null;

  return (
    <Card className="shadow-sm border-slate-200 bg-white">
      <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-3">
        <CardTitle className="text-sm font-bold flex items-center gap-2 text-blue-600">
          <Layers className="h-4 w-4 text-blue-600" />
          Navigasi Angkatan
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3">
        <div className="space-y-1 max-h-[220px] overflow-y-auto pr-1">
          {batches.map(b => (
            <button
              key={b.id}
              onClick={() => router.push(`/admin/scheduling/${b.id}`)}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${
                b.id === currentBatchId
                  ? 'bg-blue-50 text-blue-600 border border-blue-200'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span className="truncate max-w-[130px]">{b.name}</span>
              <span className="text-[9px] opacity-75">{b.startDate}</span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
