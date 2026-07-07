'use client';

import React, { useState, useCallback } from 'react';
import { Database, Key, Palette, Eye, EyeOff, Loader2, Wrench } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { COLOR_PRESETS } from '@/lib/color-presets';

export default function EngineerPage() {
  // --- Seeding ---
  const [seeding, setSeeding] = useState(false);

  const handleSeed = useCallback(async () => {
    setSeeding(true);
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Seeding failed');
      toast.success(data.message || 'Database seeding completed!');
    } catch (err: any) {
      toast.error(err.message || 'Seeding failed');
    } finally {
      setSeeding(false);
    }
  }, []);

  // --- Password ---
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleSavePassword = useCallback(async () => {
    if (newPassword.length < 6) {
      toast.error('Password minimal 6 karakter');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Password dan konfirmasi tidak cocok');
      return;
    }
    setSavingPassword(true);
    try {
      const res = await fetch('/api/admin/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan password');
      toast.success('Password admin berhasil diperbarui!');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.message || 'Gagal menyimpan password');
    } finally {
      setSavingPassword(false);
    }
  }, [newPassword, confirmPassword]);

  // --- Primary Color ---
  const [activeColor, setActiveColor] = useState<string | null>(null);
  const [savingColor, setSavingColor] = useState<string | null>(null);

  const handleColorChange = useCallback(async (preset: (typeof COLOR_PRESETS)[0]) => {
    setSavingColor(preset.hsl);
    try {
      const res = await fetch('/api/admin/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ primaryColor: preset.hsl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal mengubah warna');
      // Apply via CSS custom properties on :root — safe, no DOM node manipulation
      applyColorToRoot(preset.hsl);
      setActiveColor(preset.hsl);
      toast.success(`Warna primary diubah ke ${preset.name}`);
    } catch (err: any) {
      toast.error(err.message || 'Gagal mengubah warna');
    } finally {
      setSavingColor(null);
    }
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-slate-400 mb-1">
          <Wrench className="h-5 w-5" />
          <span className="text-xs font-semibold uppercase tracking-wider">Utility &amp; Maintenance</span>
        </div>
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Engineer Console</h2>
        <p className="text-sm text-slate-500 mt-1">
          Alat bantu teknis untuk seeding data, manajemen password admin, dan kustomisasi tampilan.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Database Seeding */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center mb-2">
              <Database className="h-5 w-5 text-red-500" />
            </div>
            <CardTitle className="text-lg">Database Seeding</CardTitle>
            <CardDescription className="text-xs">
              Reset dan isi ulang database dengan data awal PKA Angkatan II 2026.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  className="w-full"
                  disabled={seeding}
                >
                  {seeding && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  ⚠️ Jalankan Seeding
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Konfirmasi Seeding</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tindakan ini akan <strong>menghapus semua data</strong> yang ada dan menggantinya
                    dengan data awal PKA Angkatan II 2026. Data yang sudah diubah akan hilang.
                    Lanjutkan?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction onClick={handleSeed} className="bg-red-600 hover:bg-red-700">
                    Ya, Jalankan Seeding
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>

        {/* Card 2: Ganti Password Admin */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center mb-2">
              <Key className="h-5 w-5 text-amber-500" />
            </div>
            <CardTitle className="text-lg">Ganti Password Admin</CardTitle>
            <CardDescription className="text-xs">
              Ubah password untuk akun <code className="bg-slate-100 px-1 rounded">admin@wtms.com</code>.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password" className="text-xs font-semibold">
                Password Baru
              </Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimal 6 karakter"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-xs font-semibold">
                Konfirmasi Password
              </Label>
              <Input
                id="confirm-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Ketik ulang password baru"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <Button
              onClick={handleSavePassword}
              className="w-full"
              variant="default"
              disabled={savingPassword}
            >
              {savingPassword && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Simpan Password Baru
            </Button>
          </CardContent>
        </Card>

        {/* Card 3: Warna Primary */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center mb-2">
              <Palette className="h-5 w-5 text-purple-500" />
            </div>
            <CardTitle className="text-lg">Ganti Warna Primary</CardTitle>
            <CardDescription className="text-xs">
              Pilih preset warna untuk mengubah tema seluruh aplikasi secara instan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {COLOR_PRESETS.map((preset) => {
                const isActive = activeColor === preset.hsl || (!activeColor && preset.hsl === COLOR_PRESETS[0].hsl);
                const isLoading = savingColor === preset.hsl;
                return (
                  <button
                    key={preset.hsl}
                    title={preset.name}
                    onClick={() => handleColorChange(preset)}
                    disabled={savingColor !== null}
                    className={`
                      relative w-full aspect-square rounded-xl border-2 transition-all duration-200
                      flex items-center justify-center
                      ${isActive ? 'border-slate-800 ring-2 ring-offset-2 ring-slate-400' : 'border-slate-200 hover:border-slate-400'}
                    `}
                    style={{ backgroundColor: preset.hex }}
                  >
                    {isLoading && <Loader2 className="h-4 w-4 text-white animate-spin" />}
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-slate-400 text-center mt-3">
              Klik warna untuk menerapkan • Perubahan langsung terlihat tanpa refresh
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/** Apply primary color directly to :root CSS custom properties */
function applyColorToRoot(hsl: string): void {
  const root = document.documentElement;
  const h = hsl.split(' ')[0];
  root.style.setProperty('--primary', hsl);
  root.style.setProperty('--primary-foreground', '0 0% 100%');
  root.style.setProperty('--ring', hsl);
  root.style.setProperty('--secondary', `${h} 100% 97%`);
  root.style.setProperty('--secondary-foreground', hsl);
  root.style.setProperty('--sidebar-primary', hsl);
  root.style.setProperty('--sidebar-primary-foreground', '0 0% 100%');
  root.style.setProperty('--sidebar-accent', `${h} 100% 97%`);
  root.style.setProperty('--sidebar-accent-foreground', hsl);
  root.style.setProperty('--sidebar-ring', hsl);
}
