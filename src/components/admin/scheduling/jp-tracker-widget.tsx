'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MiniPieChart } from '@/components/admin/scheduling/mini-pie-chart';
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
      <CardContent className="p-4 space-y-3">
        {trackingMapelStatus.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-4">Tidak ada mata pelajaran terdaftar.</p>
        ) : (
          trackingMapelStatus.map(m => {
            const percentage = m.jpTotal > 0 ? Math.round((m.scheduledJp / m.jpTotal) * 100) : 0;
            return (
              <div key={m.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50/50 transition-colors">
                <MiniPieChart scheduled={m.scheduledJp} total={m.jpTotal} size={44} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-700 truncate" title={m.name}>
                    {m.name}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] font-bold text-slate-500">
                      {m.scheduledJp}/{m.jpTotal} JP
                    </span>
                    {m.isFullyScheduled ? (
                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[9px] font-bold">
                        Selesai
                      </Badge>
                    ) : (
                      <span className="text-[9px] font-bold text-amber-600">sisa {m.remainingJp}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
