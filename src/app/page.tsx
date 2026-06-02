"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useWTMS } from '@/context/wtms-context';
import { ShieldAlert, GraduationCap, BookOpen, Calendar, Award, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { MadeWithDyad } from "@/components/made-with-dyad";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, userRole } = useWTMS();

  React.useEffect(() => {
    if (isAuthenticated) {
      if (userRole === 'admin') {
        router.push('/admin');
      } else if (userRole === 'wi') {
        router.push('/widyaswara');
      }
    }
  }, [isAuthenticated, userRole, router]);

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
          Secure Portal Active
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

        <div className="max-w-md w-full">
          <Card className="bg-slate-900/80 border-slate-800 text-white hover:border-blue-500/50 transition-all duration-300 shadow-xl flex flex-col justify-between">
            <CardHeader className="text-center">
              <div className="h-12 w-12 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-4">
                <ShieldAlert className="h-6 w-6 text-blue-400" />
              </div>
              <CardTitle className="text-2xl font-bold">Access Portal</CardTitle>
              <CardDescription className="text-slate-400">
                Sign in to access the Super Admin or Widyaswara dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                onClick={() => router.push('/login')}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-6 text-base shadow-lg shadow-blue-600/20"
              >
                Go to Login Page
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