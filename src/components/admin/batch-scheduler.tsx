"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Edit, Calendar, Clock, MapPin, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface Props {
  batch: any;
  mapels: any[];
  sessions: any[];
  widyaswaras: any[];
  lokasi: any[];
}

export default function BatchScheduler({ batch, mapels, sessions, widyaswaras, lokasi }: Props) {
  const [activeSessions, setActiveSessions] = useState(sessions);

  const mapelStatus = mapels.map(m => {
    const scheduled = activeSessions.filter(s => s.mapel_id === m.id).reduce((sum, s) => sum + s.jp_count, 0);
    return { ...m, scheduled, remaining: m.jp_total - scheduled };
  });

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="space-y-6">
        <Card className="shadow-sm">
          <CardHeader className="bg-slate-50/50 border-b">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">Subject JP Compliance</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {mapelStatus.map(m => (
              <div key={m.id} className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-700">{m.name}</span>
                  <span className={m.remaining <= 0 ? 'text-emerald-600' : 'text-slate-400'}>
                    {m.scheduled} / {m.jp_total} JP
                  </span>
                </div>
                <Progress value={(m.scheduled / m.jp_total) * 100} className="h-1.5" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-2 space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Timeline & Session Flow</h3>
          <Button className="bg-blue-600 hover:bg-blue-500 text-white font-bold">
            <Plus className="h-4 w-4 mr-2" /> Assign New Session
          </Button>
        </div>

        {activeSessions.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-xl p-12 text-center">
            <Calendar className="h-12 w-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-500 font-bold">No sessions scheduled yet.</p>
            <p className="text-xs text-slate-400">Initialize the workspace by adding your first instructor slot.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeSessions.map((s: any) => (
              <Card key={s.id} className="shadow-sm hover:border-blue-300 transition-all border-slate-200">
                <CardContent className="p-6 flex justify-between items-center">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge className={`text-[10px] ${
                        s.format === 'Klasikal' ? 'bg-blue-100 text-blue-700' :
                        s.format === 'Virtual' ? 'bg-purple-100 text-purple-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {s.format}
                      </Badge>
                      <span className="text-xs font-bold text-slate-500">{s.date} • {s.start_time}-{s.end_time}</span>
                    </div>
                    <h4 className="font-black text-slate-900">{s.mapel_name}</h4>
                    <div className="flex gap-4 text-[10px] font-bold text-slate-500 uppercase">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {s.jp_count} JP (Ke {s.jp_ke})</span>
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {s.lokasi_name || s.format}</span>
                      <span className="flex items-center gap-1 text-blue-600"><CheckCircle2 className="h-3 w-3" /> {s.wi_name}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-blue-600"><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}