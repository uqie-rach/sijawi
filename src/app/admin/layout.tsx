import React from 'react';
import { GraduationCap, LayoutDashboard, Database, CalendarDays, BarChart3, LogOut, User } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MadeWithDyad } from "@/components/made-with-dyad";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      <aside className="w-full md:w-64 bg-slate-900 text-white flex flex-col justify-between border-r border-slate-800">
        <div>
          <div className="p-6 border-b border-slate-800 flex items-center gap-3">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg tracking-tight">WTMS Admin</h2>
              <p className="text-xs text-slate-400">Super Admin Console</p>
            </div>
          </div>

          <nav className="p-4 space-y-1">
            <Link href="/admin" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard Overview
            </Link>
            <Link href="/admin/master" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors">
              <Database className="h-4 w-4" />
              Master Data
            </Link>
            <Link href="/admin/scheduling" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors">
              <CalendarDays className="h-4 w-4" />
              Batch Scheduling
            </Link>
            <Link href="/admin/reports" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors">
              <BarChart3 className="h-4 w-4" />
              Reports & Analytics
            </Link>
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800 space-y-4">
          <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50 flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center">
              <User className="h-4 w-4 text-slate-300" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Super Admin</p>
              <p className="text-xs font-mono text-blue-400">admin@wtms.com</p>
            </div>
          </div>
          <Button variant="destructive" className="w-full bg-red-600/20 hover:bg-red-600 text-red-200 border-red-500/30">
            <LogOut className="h-4 w-4 mr-2" />
            Exit Admin Mode
          </Button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        <header className="bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-10 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Widyaswara Training Management System</h1>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            System Verified
          </div>
        </header>
        
        <div className="p-8">
          {children}
        </div>

        <footer className="mt-auto border-t border-slate-200 bg-white">
          <MadeWithDyad />
        </footer>
      </main>
    </div>
  );
}