"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  LogOut,
  ChevronLeft,
  ChevronRight,
  BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWTMS } from '@/context/wtms-context';
import { BRANDING } from '@/lib/config';
import Image from 'next/image';

export function WidyaswaraSidebar({ activeWiName }: { activeWiName: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const { setIsAuthenticated, setUserRole, setSelectedWiId } = useWTMS();
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebar_wi_collapsed');
      if (saved) {
        setIsCollapsed(JSON.parse(saved));
      }
    }
  }, []);

  const toggleCollapse = () => {
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    localStorage.setItem('sidebar_wi_collapsed', JSON.stringify(nextState));
  };

  const handleLogout = () => {
    document.cookie = "sessionToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax";
    setIsAuthenticated(false);
    setUserRole(null);
    setSelectedWiId(null);
    router.push('/login');
  };

  const navItems = [
    { href: '/widyaswara', label: 'Ikhtisar', icon: LayoutDashboard },
    { href: '/widyaswara/reports', label: 'Laporan', icon: BarChart3 },
  ];

  return (
    <aside
      className={`relative bg-white text-slate-800 flex flex-col justify-between border-r border-slate-200 shrink-0 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-full md:w-64'
        } md:h-screen md:sticky md:top-0`}
    >
      {/* Toggle Collapse Button for desktop */}
      <button
        onClick={toggleCollapse}
        className="absolute -right-3 top-7 hidden md:flex bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-full p-1 shadow-sm z-50 transition-transform"
      >
        {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
      </button>

      {/* Branding header */}
      <div className={`p-6 border-b border-slate-100 flex items-center gap-3 ${isCollapsed ? 'justify-center p-4' : ''}`}>
        <div className="p-1.5 rounded-lg shrink-0">
          <Image src="/logo.png" alt="Logo" width={32} height={32} className="" />
        </div>
        {!isCollapsed && (
          <div className="animate-in fade-in duration-300">
            <h2 className="font-black text-lg tracking-tight text-blue-600">{BRANDING.name}</h2>
            <p className="text-[10px] text-slate-500 font-medium">Portal Widyaiswara</p>
          </div>
        )}
      </div>

      {/* Navigation Items */}
      <nav className={`p-4 space-y-1 ${isCollapsed ? 'p-2' : ''}`}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/widyaswara' && pathname.startsWith(item.href));
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${isCollapsed ? 'justify-center px-0 py-3' : ''
                } ${isActive
                  ? 'bg-blue-50 text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!isCollapsed && <span className="animate-in fade-in duration-300">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Footer Info & Logout */}
      <div className={`p-4 border-t border-slate-100 space-y-4 ${isCollapsed ? 'p-2' : ''}`}>
        {!isCollapsed ? (
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 animate-in fade-in duration-300">
            <p className="text-[10px] text-slate-500">Masuk sebagai</p>
            <p className="text-sm font-bold text-slate-800 truncate" title={activeWiName}>{activeWiName}</p>
          </div>
        ) : (
          <div className="flex justify-center text-slate-500" title={activeWiName}>
            <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          </div>
        )}
        <Button
          variant="destructive"
          onClick={handleLogout}
          className={`w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 ${isCollapsed ? 'px-0 py-2.5' : ''
            }`}
          title={isCollapsed ? "Keluar Portal" : undefined}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!isCollapsed && <span className="animate-in fade-in duration-300">Keluar Portal</span>}
        </Button>
      </div>
    </aside>
  );
}