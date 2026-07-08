'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Clock, MapPin, BookOpen, Edit, Trash2, Layers } from 'lucide-react';
import type { Widyaiswara, Session } from '@/context/wtms-context';

interface WiDailyScheduleCardProps {
  wi: Widyaiswara;
  sessions: Array<{
    id: string;
    mapelName: string;
    batchName: string;
    startTime: string;
    endTime: string;
    format: string;
    lokasiName: string;
    jpKe: string;
    jpCount: number;
  }>;
  date: string;
  onClose: () => void;
  onEditSession: (session: Session) => void;
  onDeleteSession: (sessionId: string) => void;
}

export function WiDailyScheduleCard({
  wi, sessions, date, onClose, onEditSession, onDeleteSession,
}: WiDailyScheduleCardProps) {
  const formattedDate = date
    ? new Date(date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  const totalJp = sessions.reduce((sum, s) => sum + s.jpCount, 0);

  const formatBadgeClass = (format: string) => {
    switch (format) {
      case 'Klasikal': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Virtual': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Asinkron': return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <Card className="shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-blue-200 bg-white rounded-lg animate-in slide-in-from-left-2 duration-200">
      <CardHeader className="border-b border-slate-100 bg-blue-50/50 py-3 px-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold text-blue-600">
              {wi.name}, {wi.gelar}
            </CardTitle>
            <p className="text-[10px] text-slate-500 mt-0.5">{formattedDate}</p>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={onClose}
            className="h-7 w-7 text-slate-400 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {sessions.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-400 italic">
            Tidak ada sesi mengajar pada tanggal ini.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {sessions.map(session => (
              <div key={session.id} className="px-4 py-3 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-2 mb-1.5">
                  <Badge className={`text-[9px] font-bold ${formatBadgeClass(session.format)}`}>
                    {session.format}
                  </Badge>
                  <span className="text-[11px] font-extrabold text-slate-700 flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    {session.startTime} - {session.endTime}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 ml-auto">
                    {session.jpCount} JP
                  </span>
                </div>

                <p className="text-xs font-semibold text-slate-800 mb-1">
                  <BookOpen className="h-3.5 w-3.5 text-slate-400 inline mr-1" />
                  {session.mapelName}
                </p>

                <div className="flex items-center gap-3 text-[10px] text-slate-500 mb-2">
                  <span className="flex items-center gap-1">
                    <Layers className="h-3 w-3 text-slate-400" />
                    {session.batchName}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-slate-400" />
                    {session.lokasiName}
                  </span>
                  <span className="text-slate-400">JP ke: {session.jpKe}</span>
                </div>

                <div className="flex items-center gap-1 pt-1 border-t border-slate-50">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      onEditSession({
                        id: session.id,
                        batchId: '',
                        mapelId: '',
                        wiIds: [wi.id],
                        date,
                        startTime: session.startTime,
                        endTime: session.endTime,
                        format: session.format as 'Klasikal' | 'Virtual' | 'Asinkron',
                        jpKe: session.jpKe,
                        jpCount: session.jpCount,
                      } as Session);
                    }}
                    className="text-blue-600 text-[10px] font-bold h-6 px-2 hover:bg-blue-50"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDeleteSession(session.id)}
                    className="text-red-500 text-[10px] font-bold h-6 px-2 hover:bg-red-50"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Hapus
                  </Button>
                </div>
              </div>
            ))}

            {/* Footer total */}
            <div className="px-4 py-2.5 bg-slate-50/70 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-600">Total Hari Ini</span>
              <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-[11px] font-bold">
                {totalJp} JP ({totalJp * 45} menit)
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}