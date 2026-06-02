"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWTMS } from '@/context/wtms-context';
import { useScheduling } from '@/hooks/use-wtms-api';
import { GraduationCap, LogOut, User, Mail, Award, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MadeWithDyad } from "@/components/made-with-dyad";
import { CalendarView } from '@/components/calendar-view';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function WidyaswaraDashboard() {
  const router = useRouter();
  const { userRole, widyaswaras, selectedWiId, setSelectedWiId } = useWTMS();
  const { sessions: allSessions } = useScheduling();

  const activeWi = widyaswaras.find(w => w.id === selectedWiId) || widyaswaras[0];
  const wiSessions = allSessions.filter(s => s.wiId === activeWi?.id);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-slate-900 text-white border-b border-slate-800 px-6 py-4 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg"><GraduationCap className="h-6 w-6" /></div>
          <div><h1 className="font-bold text-xl tracking-tight">WTMS Portal</h1></div>
        </div>
        <div className="flex items-center gap-4">
          <Select value={activeWi?.id} onValueChange={setSelectedWiId}>
            <SelectTrigger className="w-64 bg-slate-800 border-none text-white"><SelectValue /></SelectTrigger>
            <SelectContent>{widyaswaras.map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}</SelectContent>
          </Select>
          <Button variant="destructive" onClick={() => router.push('/')}><LogOut className="h-4 w-4" /></Button>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-6 py-8 space-y-8">
        <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 h-20"></div>
          <CardContent className="p-6 -mt-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-slate-100 border-4 border-white flex items-center justify-center text-indigo-600 shadow-sm"><User className="h-8 w-8" /></div>
              <div>
                <h2 className="text-xl font-bold">{activeWi?.name}, {activeWi?.gelar}</h2>
                <p className="text-sm text-slate-500 font-mono">{activeWi?.nip} • {activeWi?.jabatan}</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-center px-4"><p className="text-xs text-slate-500">Scheduled</p><p className="text-xl font-bold">{wiSessions.reduce((sum, s) => sum + s.jpCount, 0)} JP</p></div>
              <div className="text-center px-4 border-l"><p className="text-xs text-slate-500">Level</p><p className="text-xl font-bold">{activeWi?.levelLabel}</p></div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="calendar">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold flex items-center gap-2"><Calendar className="h-5 w-5 text-indigo-600" /> Teaching Schedule</h3>
            <TabsList><TabsTrigger value="calendar">Calendar View</TabsTrigger><TabsTrigger value="list">List View</TabsTrigger></TabsList>
          </div>
          <TabsContent value="calendar"><CalendarView sessions={wiSessions} /></TabsContent>
          <TabsContent value="list">
             <div className="space-y-4">
               {wiSessions.map(s => (
                 <Card key={s.id} className="p-4 flex justify-between items-center">
                   <div>
                     <Badge className="mb-2">{s.format}</Badge>
                     <h4 className="font-bold">{s.mapelName}</h4>
                     <p className="text-sm text-slate-500">{s.date} | {s.startTime} - {s.endTime} | {s.lokasiName}</p>
                   </div>
                   <div className="text-right"><p className="text-xs text-slate-400">Kelompok</p><p className="font-bold">{s.kelompok}</p></div>
                 </Card>
               ))}
             </div>
          </TabsContent>
        </Tabs>
      </main>
      <MadeWithDyad />
    </div>
  );
}