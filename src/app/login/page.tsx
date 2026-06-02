"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWTMS } from '@/context/wtms-context';
import { GraduationCap, Lock, Mail, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { MadeWithDyad } from "@/components/made-with-dyad";

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
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-b from-slate-900 via-slate-800 to-slate-950 text-white">
      <header className="container mx-auto px-6 py-6 flex justify-between items-center border-b border-slate-800">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push('/')}>
          <div className="bg-blue-600 p-2 rounded-lg">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-xl tracking-tight">WTMS</h1>
            <p className="text-xs text-slate-400">Widyaswara Training Management</p>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <Card className="w-full max-w-md bg-slate-900/80 border-slate-800 text-white shadow-2xl">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold tracking-tight">Sign In to WTMS</CardTitle>
            <CardDescription className="text-slate-400">
              Enter your credentials to access your personalized portal.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-start gap-2 text-xs text-red-400">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="admin@wtms.com or wi email" 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="pl-10 bg-slate-950 border-slate-800 text-white focus:ring-blue-500"
                    required 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="admin123 or wi123" 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="pl-10 bg-slate-950 border-slate-800 text-white focus:ring-blue-500"
                    required 
                  />
                </div>
              </div>

              <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800/60 text-[11px] text-slate-400 space-y-1">
                <p className="font-semibold text-slate-300">💡 Quick Demo Credentials:</p>
                <p>• Admin: <span className="font-mono text-blue-400">admin@wtms.com</span> / <span className="font-mono text-blue-400">admin123</span></p>
                <p>• Widyaswara: <span className="font-mono text-indigo-400">wtms+wi.uqie@gmail.com</span> / <span className="font-mono text-indigo-400">wi123</span></p>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-6 text-base shadow-lg shadow-blue-600/20">
                Sign In
              </Button>
            </CardFooter>
          </form>
        </Card>
      </main>

      <footer className="border-t border-slate-800/60 bg-slate-950/80">
        <MadeWithDyad />
      </footer>
    </div>
  );
}