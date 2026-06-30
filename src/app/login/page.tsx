"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWTMS } from '@/context/wtms-context';
import { GraduationCap, Lock, Mail, AlertCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { MadeWithDyad } from "@/components/made-with-dyad";
import { BRANDING } from "@/lib/config";

export default function LoginPage() {
  const router = useRouter();
  const { widyaswaras, setUserRole, setSelectedWiId, setIsAuthenticated } = useWTMS();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 1. Check for Super Admin
    if (email === 'admin@wtms.com' && password === 'admin123') {
      document.cookie = "sessionToken=admin-session-token; path=/; max-age=86400; SameSite=Lax";
      
      setIsAuthenticated(true);
      setUserRole('admin');
      setSelectedWiId(null);
      toast.success('Logged in successfully as Super Admin!');
      router.push('/admin');
      return;
    }

    // 2. Check for Widyaswara
    const matchedWi = widyaswaras.find(w => w.email.toLowerCase() === email.toLowerCase());
    if (matchedWi && password === 'wi123') {
      document.cookie = "sessionToken=wi-session-token; path=/; max-age=86400; SameSite=Lax";

      setIsAuthenticated(true);
      setUserRole('wi');
      setSelectedWiId(matchedWi.id);
      toast.success(`Logged in successfully as ${matchedWi.name}!`);
      router.push('/widyaswara');
      return;
    }

    setError('Invalid email or password. Use admin@wtms.com / admin123 or a Widyaswara email / wi123.');
    toast.error('Authentication failed.');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 text-slate-800">
      <header className="container mx-auto px-6 py-6 flex justify-between items-center border-b border-slate-200/60">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push('/')}>
          <div className="bg-blue-600 p-2 rounded-xl shadow-md shadow-blue-500/20">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="font-black text-2xl tracking-tight text-blue-600">{BRANDING.name}</h1>
            <p className="text-xs text-slate-500 font-medium">{BRANDING.fullName}</p>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="text-center max-w-xl mb-8">
          <div className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full text-xs font-bold text-blue-600 mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            {BRANDING.tagline}
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">Selamat Datang di {BRANDING.name}</h2>
          <p className="text-sm text-slate-600">Silakan masuk untuk mengakses jadwal mengajar dan manajemen widyaiswara.</p>
        </div>

        <Card className="w-full max-w-md bg-white border-slate-200 text-slate-800 shadow-xl rounded-2xl">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-xl font-bold tracking-tight text-slate-900">Sign In Portal</CardTitle>
            <CardDescription className="text-slate-500">
              Masukkan email dan kata sandi Anda untuk melanjutkan.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2 text-xs text-red-700">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 font-semibold">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="admin@wtms.com atau email WI" 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="pl-10 bg-slate-50 border-slate-200 text-slate-800 focus:ring-blue-500 focus:border-blue-500 rounded-xl"
                    required 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700 font-semibold">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="admin123 atau wi123" 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="pl-10 bg-slate-50 border-slate-200 text-slate-800 focus:ring-blue-500 focus:border-blue-500 rounded-xl"
                    required 
                  />
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
                <p className="font-bold text-blue-600">💡 Quick Demo Credentials:</p>
                <p>• Admin: <span className="font-mono text-blue-600 font-semibold">admin@wtms.com</span> / <span className="font-mono text-blue-600 font-semibold">admin123</span></p>
                <p>• Widyaiswara: <span className="font-mono text-blue-600 font-semibold">wtms+wi.uqie@gmail.com</span> / <span className="font-mono text-blue-600 font-semibold">wi123</span></p>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 text-base shadow-lg shadow-blue-500/20 rounded-xl">
                Masuk Portal
              </Button>
            </CardFooter>
          </form>
        </Card>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <MadeWithDyad />
      </footer>
    </div>
  );
}