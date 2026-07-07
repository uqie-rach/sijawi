'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Calendar, Clock, MapPin, UserCheck, Edit, Trash2 } from 'lucide-react';
import type { Session, Mapel, Widyaiswara, Lokasi } from '@/context/wtms-context';

interface DayViewProps {
  selectedDayDate: string;
  setSelectedDayDate: (date: string) => void;
  daySessions: Session[];
  activeMapels: Mapel[];
  activeWis: Widyaiswara[];
  activeLokasis: Lokasi[];
  activeBatch?: { startDate?: string; endDate?: string } | null;
  onEditSession: (session: Session) => void;
  onDeleteSession: (sessionId: string) => void;
}

export function DayView({
  selectedDayDate, setSelectedDayDate, daySessions,
  activeMapels, activeWis, activeLokasis, activeBatch,
  onEditSession, onDeleteSession,
}: DayViewProps) {
  return (
    <Card className="shadow-sm border-slate-200 bg-white">
      <CardHeader className="border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 py-4">
        <div>
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-blue-600">
            <Clock className="h-4 w-4 text-blue-600" />
            Tampilan Lini Masa Jam Detail
          </CardTitle>
          <p className="text-xs text-slate-500">Periksa alokasi jam operasional secara berdampingan.</p>
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-xs font-bold text-slate-500 whitespace-nowrap">Pilih Tanggal:</Label>
          <Input
            type="date"
            min={activeBatch?.startDate}
            max={activeBatch?.endDate}
            value={selectedDayDate}
            onChange={e => setSelectedDayDate(e.target.value)}
            className="h-8 py-0 px-2 text-xs w-[140px]"
          />
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {daySessions.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Calendar className="h-10 w-10 mx-auto text-slate-300 mb-2" />
            <p className="text-xs font-semibold">
              Tidak ada sesi yang dijadwalkan pada {selectedDayDate}.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {daySessions.map(session => {
              const mapel = activeMapels.find(m => m.id === session.mapelId);
              const resolvedWis = (session.wiIds || [])
                .map((id: string) => activeWis.find(w => w.id === id))
                .filter(Boolean) as Widyaiswara[];
              const wiNames = resolvedWis.map(w => `${w.name}, ${w.gelar}`).join(', ');
              const lok = activeLokasis.find(l => l.id === session.lokasiId);

              return (
                <div
                  key={session.id}
                  className="p-4 border border-slate-100 rounded-xl bg-slate-50/50 hover:border-blue-200 transition-all flex justify-between items-center"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge className={`text-[9px] font-bold ${
                        session.format === 'Klasikal'
                          ? 'bg-blue-100 text-blue-800'
                          : session.format === 'Virtual'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {session.format}
                      </Badge>
                      <span className="text-xs font-extrabold text-slate-600 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {session.startTime} - {session.endTime} ({session.jpCount} JP, JP ke: {session.jpKe})
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">{mapel?.name}</h4>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-start gap-1">
                        <UserCheck className="h-3.5 w-3.5 text-slate-400 mt-0.5 shrink-0" />
                        <span>
                          Widyaiswara: <strong>{wiNames || 'Tidak Diketahui'}</strong>
                        </span>
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        Ruangan:{' '}
                        <strong>
                          {session.format === 'Klasikal' ? lok?.name || 'Ruangan' : session.format}
                        </strong>
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onEditSession(session)}
                      className="text-blue-600"
                    >
                      <Edit className="h-4.5 w-4.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onDeleteSession(session.id)}
                      className="text-red-500"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
