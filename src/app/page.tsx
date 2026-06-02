"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useWTMS } from '@/context/wtms-context';
import { ShieldAlert, GraduationCap, BookOpen, Calendar, Award, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MadeWithDyad } from "@/components/made-with-dyad";

export default function Home() {
  const router = useRouter();
  const { widyaswaras, setUserRole, setSelectedWiId } = useWTMS();
  const [selectedWi, setSelectedWi] = React.useState<string>('');

  const handleAdminSignIn = () => {
    setUserRole('admin');
    setSelectedWiId(null);
    router.push('/admin');
  };

  const handleWiSignIn = () => {
    if (!selectedWi) {
      setSelectedWi(widyaswaras[0]?.id || '');
      setUserRole('wi');
      setSelectedWiId(widyaswaras[0]?.id || null);
      router.push('/widyaswara');
      return;
    }
    setUserRole('wi');
    setSelectedWiId(selectedWi);
    router.push('/widyaswara');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-b from-slate-900 via-slate-800 to-slate-950 text-white">
      <header className="container mx-auto px-6 py-6 flex justify-between items-center border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-xl tracking-tight">WTMS</h1>
            <p className="text-xs text-slate-400">Widyaswara Training Management</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Development Mode Bypassed
        </div>
      </header>

      <main className="container mx-auto px-6 py-12 flex-1 flex flex-col items-center justify-center">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 bg-gradient-to-r from-blue-400 via-indigo-200 to-white bg-clip-text text-transparent">
            Widyaswara Training Management System
          </h2>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            An enterprise-grade scheduling, load balancing, and compliance engine for civil service training centers.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl w-full">
          {/* Super Admin Card */}
          <Card className="bg-slate-900/80 border-slate-800 text-white hover:border-blue-500/50 transition-all duration-300 shadow-xl flex flex-col justify-between">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mb-4">
                <ShieldAlert className="h-6 w-6 text-blue-400" />
              </div>
              <CardTitle className="text-2xl font-bold">Super Admin Portal</CardTitle>
              <CardDescription className="text-slate-400">
                Full access to scheduling engine, load balancing, master data, and compliance reports.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 flex-1">
              <div className="space-y-2 text-sm text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-400"></span>
                  <span>Schedule sessions with real-time conflict checks</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-400"></span>
                  <span>Monitor Widyaswara JP load balancing</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-400"></span>
                  <span>Manage Master Data (WI, Mapel, Lokasi)</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-4 border-t border-slate-800/60">
              <Button 
                onClick={handleAdminSignIn}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-6 text-base shadow-lg shadow-blue-600/20"
              >
                Sign In as Super Admin
              </Button>
            </CardFooter>
          </Card>

          {/* Widyaswara Card */}
          <Card className="bg-slate-900/80 border-slate-800 text-white hover:border-indigo-500/50 transition-all duration-300 shadow-xl flex flex-col justify-between">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-indigo-400" />
              </div>
              <CardTitle className="text-2xl font-bold">Widyaswara Portal</CardTitle>
              <CardDescription className="text-slate-400">
                Read-only access to personalized teaching schedules, calendar views, and venue details.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 flex-1">
              <div className="space-y-3">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Select Widyaswara Profile
                </label>
                <Select value={selectedWi} onValueChange={setSelectedWi}>
                  <SelectTrigger className="bg-slate-950 border-slate-800 text-white focus:ring-indigo-500">
                    <SelectValue placeholder="Choose a Widyaswara..." />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-white">
                    {widyaswaras.map((wi) => (
                      <SelectItem key={wi.id} value={wi.id} className="hover:bg-slate-800 focus:bg-slate-800">
                        {wi.name}, {wi.gelar} (Level {wi.level} - {wi.levelLabel})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 text-sm text-slate-300 pt-2">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-400"></span>
                  <span>Personalized calendar & list schedule views</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-400"></span>
                  <span>Real-time venue and batch details</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-4 border-t border-slate-800/60">
              <Button 
                onClick={handleWiSignIn}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-6 text-base shadow-lg shadow-indigo-600/20"
              >
                Sign In as Widyaswara
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* System Rules Quick Reference */}
        <div className="mt-16 w-full max-w-4xl bg-slate-900/40 border border-slate-800/80 rounded-xl p-6">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Award className="h-4 w-4 text-amber-500" />
            WTMS Core Business Rules & Constraints
          </h3>
          <div className="grid sm:grid-cols-3 gap-6 text-xs text-slate-400">
            <div className="space-y-1">
              <h4 className="font-semibold text-slate-200">Time & Format</h4>
              <p>1 JP = 45 Minutes.</p>
              <p>Klasikal format is strictly restricted to 08:00 – 17:00. Virtual & Asinkron are flexible.</p>
            </div>
            <div className="space-y-1">
              <h4 className="font-semibold text-slate-200">Mapel Constraint</h4>
              <p>1 Subject (Mapel) spans 2 to 6 JP.</p>
              <p>Can be split across multiple days or multiple Widyaswaras within different hours.</p>
            </div>
            <div className="space-y-1">
              <h4 className="font-semibold text-slate-200">Hierarchy Restriction</h4>
              <p>WIs have competency weights (PKM=5, PKA=4, PKP=3, Latsar=2, PPPK=1).</p>
              <p>System prevents assigning a WI to a training category exceeding their weight.</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-800/60 bg-slate-950/80">
        <MadeWithDyad />
      </footer>
    </div>
  );
}