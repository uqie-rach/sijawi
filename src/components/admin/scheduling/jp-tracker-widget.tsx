'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { TrackingMapelStatus } from '@/hooks/use-jp-tracking';

interface JpTrackerWidgetProps {
  trackingMapelStatus: TrackingMapelStatus[];
}

export function JpTrackerWidget({ trackingMapelStatus }: JpTrackerWidgetProps) {
  return (
    <Card className="shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-slate-200 bg-white rounded-lg">
      <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-3 px-4">
        <CardTitle className="text-sm font-bold text-blue-600">Pelacak Alokasi JP</CardTitle>
        <CardDescription className="text-[11px]">Sisa kapasitas untuk kategori terpilih.</CardDescription>
      </CardHeader>
      <CardContent className="p-4 space-y-3 max-h-[240px] overflow-y-auto">
        {trackingMapelStatus.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-4">Tidak ada mata pelajaran terdaftar.</p>
        ) : (
          trackingMapelStatus.map(m => (
            <div key={m.id} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-700 truncate max-w-[120px]" title={m.name}>
                  {m.name}
                </span>
                <span className="text-[10px] font-bold text-slate-500">
                  {m.scheduledJp}/{m.jpTotal} JP
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Progress value={(m.scheduledJp / m.jpTotal) * 100} className="h-1.5 flex-1 bg-slate-100" />
                {m.isFullyScheduled ? (
                  <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[9px] font-bold">
                    Selesai
                  </Badge>
                ) : (
                  <span className="text-[9px] font-bold text-slate-500">sisa {m.remainingJp}</span>
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}