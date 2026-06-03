"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, Clock, MapPin, Edit, Trash2 } from 'lucide-react';
import { useWTMS } from '@/context/wtms-context';

interface SchedulingWorkspaceProps {
  batch: any;
  mapels: any[];
  widyaswaras: any[];
  lokasiList: any[];
  sessions: any[];
}

export function SchedulingWorkspace({ batch, mapels, widyaswaras, lokasiList, sessions }: SchedulingWorkspaceProps) {
  const { deleteSession } = useWTMS();

  // Mapel Status Calculation
  const mapelStatus = mapels.map(m => {
    const scheduledJp = sessions.filter(s => s.mapel_id === m.id).reduce((sum, s) => sum + s.jp_count, 0);
    return { ...m, scheduledJp, remainingJp: m.jp_total - scheduledJp };
  });

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold">Subject Status</CardTitle>
            <CardDescription>JP allocation limits (2-6 JP).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mapelStatus.map(m => (
              <div key={m.id} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold">{m.name}</span>
                  <span className="text-xs text-slate-500">{m.scheduledJp}/{m.jp_total} JP</span>
                </div>
                <Progress value={(m.scheduledJp/m.jp_total)*100} className="h-1.5" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-2 space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold">Allocated Slots</h3>
          <Button className="bg-blue-600 hover:bg-blue-500"><Plus className="h-4 w-4 mr-2" /> Assign Session</Button>
        </div>

        <div className="space-y-4">
          {sessions.map(s => (
            <Card key={s.id} className="hover:border-blue-300 transition-colors">
              <CardContent className="p-6 flex justify-between items-center">
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Badge variant="outline">{s.format}</Badge>
                    <span className="text-xs text-slate-500 flex items-center"><Calendar className="h-3 w-3 mr-1" /> {s.date}</span>
                    <span className="text-xs text-slate-500 flex items-center"><Clock className="h-3 w-3 mr-1" /> {s.start_time} - {s.end_time}</span>
                  </div>
                  <h4 className="font-bold">{s.mapel_name}</h4>
                  <div className="flex gap-4 text-xs text-slate-600">
                    <span>WI: {s.wi_name}</span>
                    {s.lokasi_name && <span><MapPin className="h-3 w-3 inline" /> {s.lokasi_name}</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="icon" variant="ghost" className="text-red-500" onClick={() => deleteSession(s.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}