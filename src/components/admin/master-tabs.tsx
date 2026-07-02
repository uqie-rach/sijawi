"use client";

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, MapPin, Eye, EyeOff } from 'lucide-react';
import { useWTMS } from '@/context/wtms-context';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface MasterTabsProps {
  initialWis: any[];
  initialKats: any[];
  initialMapels: any[];
  initialLokasis: any[];
  initialBatches: any[];
}

export function MasterTabs({
  initialWis,
  initialKats,
  initialMapels,
  initialLokasis,
  initialBatches,
}: MasterTabsProps) {
  const {
    widyaswaras,
    kategoriList,
    mapelList,
    lokasiList,
    batches,
    addWidyaswara,
    updateWidyaswara,
    deleteWidyaswara,
    addKategori,
    updateKategori,
    deleteKategori,
    addMapel,
    updateMapel,
    deleteMapel,
    addLokasi,
    updateLokasi,
    deleteLokasi,
    addBatch,
    updateBatch,
    deleteBatch,
  } = useWTMS();

  // Local sync or hook usage
  const activeWis = widyaswaras.length ? widyaswaras : initialWis;
  const activeKats = kategoriList.length ? kategoriList : initialKats;
  const activeMapels = mapelList.length ? mapelList : initialMapels;
  const activeLokasis = lokasiList.length ? lokasiList : initialLokasis;
  const activeBatches = batches.length ? batches : initialBatches;

  // Form states with LocalStorage persistence of drafts
  const [wiForm, setWiForm] = useState({ name: '', gelar: '', email: '', nip: '', jabatan: 'WI Ahli Madya', level: '3', password: 'wi123' });
  const [editingWiId, setEditingWiId] = useState<string | null>(null);
  const [isWiDialogOpen, setIsWiDialogOpen] = useState(false);

  // State to track password visibility for each Widyaiswara in the list
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  const [katForm, setKatForm] = useState({ name: '', minWeight: '3' });
  const [editingKatId, setEditingKatId] = useState<string | null>(null);

  const [mapelForm, setMapelForm] = useState({ name: '', kategoriId: '', jpTotal: '4' });
  const [editingMapelId, setEditingMapelId] = useState<string | null>(null);

  const [lokForm, setLokForm] = useState({ name: '' });
  const [editingLokId, setEditingLokId] = useState<string | null>(null);

  const [batchForm, setBatchForm] = useState({ name: '', kategoriId: '', pola: 'APBD' as any, startDate: '2026-03-01', endDate: '2026-03-15' });
  const [editingBatchId, setEditingBatchId] = useState<string | null>(null);

  // Destructive Action Guard states (for Delete & Edit confirmation alerts)
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({
    open: false,
    title: '',
    description: '',
    onConfirm: () => {}
  });

  // LocalStorage state restore for creating drafts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedWiDraft = localStorage.getItem('draft_wiForm');
      if (savedWiDraft && !editingWiId) setWiForm(JSON.parse(savedWiDraft));

      const savedKatDraft = localStorage.getItem('draft_katForm');
      if (savedKatDraft && !editingKatId) setKatForm(JSON.parse(savedKatDraft));

      const savedMapelDraft = localStorage.getItem('draft_mapelForm');
      if (savedMapelDraft && !editingMapelId) setMapelForm(JSON.parse(savedMapelDraft));

      const savedLokDraft = localStorage.getItem('draft_lokForm');
      if (savedLokDraft && !editingLokId) setLokForm(JSON.parse(savedLokDraft));

      const savedBatchDraft = localStorage.getItem('draft_batchForm');
      if (savedBatchDraft && !editingBatchId) setBatchForm(JSON.parse(savedBatchDraft));
    }
  }, [editingWiId, editingKatId, editingMapelId, editingLokId, editingBatchId]);

  // Handle draft persistence changes
  const updateWiForm = (fields: Partial<typeof wiForm>) => {
    const newVal = { ...wiForm, ...fields };
    setWiForm(newVal);
    if (!editingWiId) localStorage.setItem('draft_wiForm', JSON.stringify(newVal));
  };

  const updateKatForm = (fields: Partial<typeof katForm>) => {
    const newVal = { ...katForm, ...fields };
    setKatForm(newVal);
    if (!editingKatId) localStorage.setItem('draft_katForm', JSON.stringify(newVal));
  };

  const updateMapelForm = (fields: Partial<typeof mapelForm>) => {
    const newVal = { ...mapelForm, ...fields };
    setMapelForm(newVal);
    if (!editingMapelId) localStorage.setItem('draft_mapelForm', JSON.stringify(newVal));
  };

  const updateLokForm = (fields: Partial<typeof lokForm>) => {
    const newVal = { ...lokForm, ...fields };
    setLokForm(newVal);
    if (!editingLokId) localStorage.setItem('draft_lokForm', JSON.stringify(newVal));
  };

  const updateBatchForm = (fields: Partial<typeof batchForm>) => {
    const newVal = { ...batchForm, ...fields };
    setBatchForm(newVal);
    if (!editingBatchId) localStorage.setItem('draft_batchForm', JSON.stringify(newVal));
  };

  const triggerConfirmation = (title: string, description: string, onConfirm: () => void) => {
    setConfirmDialog({
      open: true,
      title,
      description,
      onConfirm
    });
  };

  const handleWiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lvl = parseInt(wiForm.level);
    const labels = ['PPPK', 'Latsar', 'PKP', 'PKA', 'PKN'];
    const levelLabel = labels[lvl - 1] || 'PPPK';

    const performSave = () => {
      if (editingWiId) {
        updateWidyaswara(editingWiId, { ...wiForm, level: lvl, levelLabel, jabatan: wiForm.jabatan as any });
      } else {
        addWidyaswara({ ...wiForm, level: lvl, levelLabel, jabatan: wiForm.jabatan as any || 'WI Ahli Madya' });
        localStorage.removeItem('draft_wiForm');
      }
      setIsWiDialogOpen(false);
    };

    if (editingWiId) {
      triggerConfirmation(
        "Konfirmasi Pembaruan Widyaiswara",
        `Apakah Anda yakin ingin menyimpan perubahan untuk Widyaiswara ${wiForm.name}?`,
        performSave
      );
    } else {
      performSave();
    }
  };

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <Tabs defaultValue="wi" className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <TabsList className="bg-slate-100 p-1 rounded-lg">
          <TabsTrigger value="wi">Widyaiswara</TabsTrigger>
          <TabsTrigger value="kategori">Kategori</TabsTrigger>
          <TabsTrigger value="mapel">Mata Pelajaran</TabsTrigger>
          <TabsTrigger value="lokasi">Lokasi / Ruangan</TabsTrigger>
          <TabsTrigger value="batches">Angkatan Pelatihan</TabsTrigger>
        </TabsList>

        <Dialog open={isWiDialogOpen} onOpenChange={setIsWiDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingWiId(null); setWiForm({ name: '', gelar: '', email: '', nip: '', jabatan: 'WI Ahli Madya', level: '3', password: 'wi123' }); }} className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
              <Plus className="h-4 w-4" /> Tambah Widyaiswara
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle>{editingWiId ? 'Edit Widyaiswara' : 'Tambah Widyaiswara Baru'}</DialogTitle>
              <DialogDescription>Atur detail profil instruktur, tingkat kompetensi mengajar, dan kata sandi akun.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleWiSubmit} className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Nama Lengkap</Label>
                  <Input value={wiForm.name} onChange={e => updateWiForm({ name: e.target.value })} required />
                </div>
                <div className="space-y-1">
                  <Label>Gelar</Label>
                  <Input value={wiForm.gelar} onChange={e => updateWiForm({ gelar: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>NIP</Label>
                  <Input value={wiForm.nip} onChange={e => updateWiForm({ nip: e.target.value })} required />
                </div>
                <div className="space-y-1">
                  <Label>Email</Label>
                  <Input type="email" value={wiForm.email} onChange={e => updateWiForm({ email: e.target.value })} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Jabatan</Label>
                  <Select value={wiForm.jabatan} onValueChange={val => updateWiForm({ jabatan: val })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="WI Ahli Pertama">WI Ahli Pertama</SelectItem>
                      <SelectItem value="WI Ahli Muda">WI Ahli Muda</SelectItem>
                      <SelectItem value="WI Ahli Madya">WI Ahli Madya</SelectItem>
                      <SelectItem value="WI Ahli Utama">WI Ahli Utama</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Tingkat Kompetensi</Label>
                  <Select value={wiForm.level} onValueChange={val => updateWiForm({ level: val })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="5">Level 5 (PKN)</SelectItem>
                      <SelectItem value="4">Level 4 (PKA)</SelectItem>
                      <SelectItem value="3">Level 3 (PKP)</SelectItem>
                      <SelectItem value="2">Level 2 (Latsar)</SelectItem>
                      <SelectItem value="1">Level 1 (PPPK)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1">
                <Label>Kata Sandi (Password)</Label>
                <Input type="text" value={wiForm.password} onChange={e => updateWiForm({ password: e.target.value })} placeholder="wi123" required />
                <p className="text-[10px] text-slate-400">Kata sandi ini akan digunakan oleh Widyaiswara untuk masuk ke portal.</p>
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-4">Simpan Widyaiswara</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <TabsContent value="wi">
        <Card className="shadow-sm border-slate-200">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Nama</TableHead>
                  <TableHead>NIP</TableHead>
                  <TableHead>Jabatan</TableHead>
                  <TableHead>Tingkat Kompetensi</TableHead>
                  <TableHead>Kata Sandi</TableHead>
                  <TableHead className="pr-6 text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeWis.map(wi => {
                  const isPasswordVisible = !!visiblePasswords[wi.id];
                  return (
                    <TableRow key={wi.id}>
                      <TableCell className="font-semibold text-slate-900 pl-6">{wi.name}, {wi.gelar}</TableCell>
                      <TableCell className="text-slate-600 font-mono text-xs">{wi.nip}</TableCell>
                      <TableCell className="text-slate-600 text-xs font-medium">{wi.jabatan}</TableCell>
                      <TableCell>
                        <Badge className="bg-blue-100 text-blue-900 border-blue-200">
                          Level {wi.level} - {wi.levelLabel}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-slate-700 bg-slate-100 px-2 py-1 rounded border border-slate-200 min-w-[80px] text-center">
                            {isPasswordVisible ? (wi.password || 'wi123') : '••••••••'}
                          </span>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => togglePasswordVisibility(wi.id)}
                            className="h-7 w-7 text-slate-500 hover:text-slate-700"
                            title={isPasswordVisible ? "Sembunyikan Password" : "Tampilkan Password"}
                          >
                            {isPasswordVisible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="pr-6 text-right space-x-2">
                        <Button size="sm" variant="ghost" onClick={() => {
                          setEditingWiId(wi.id);
                          setWiForm({ name: wi.name, gelar: wi.gelar, email: wi.email, nip: wi.nip, jabatan: wi.jabatan, level: String(wi.level), password: wi.password || 'wi123' });
                          setIsWiDialogOpen(true);
                        }} className="text-blue-600 hover:text-blue-700">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => {
                          triggerConfirmation(
                            "Hapus Profil Widyaiswara",
                            `Apakah Anda yakin ingin menghapus profil Widyaiswara ${wi.name} secara permanen?`,
                            () => deleteWidyaswara(wi.id)
                          );
                        }} className="text-red-600 hover:text-red-800">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="kategori">
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="md:col-span-2 shadow-sm border-slate-200">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Nama Kategori</TableHead>
                    <TableHead>Min. Bobot Kompetensi</TableHead>
                    <TableHead className="pr-6 text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeKats.map(k => (
                    <TableRow key={k.id}>
                      <TableCell className="font-semibold pl-6">{k.name}</TableCell>
                      <TableCell>
                        <Badge className="bg-sky-100 text-sky-800 border-sky-200">
                          Level {k.minWeight} atau lebih tinggi
                        </Badge>
                      </TableCell>
                      <TableCell className="pr-6 text-right space-x-2">
                        <Button size="sm" variant="ghost" onClick={() => { setEditingKatId(k.id); setKatForm({ name: k.name, minWeight: String(k.min_weight) }); }} className="text-blue-600"><Edit className="h-4 w-4" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => {
                          triggerConfirmation(
                            "Hapus Kategori",
                            `Apakah Anda yakin ingin menghapus kategori ${k.name} secara permanen?`,
                            () => deleteKategori(k.id)
                          );
                        }} className="text-red-600"><Trash2 className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-200 bg-white p-6">
            <CardTitle className="text-base font-bold mb-4 text-blue-900">{editingKatId ? 'Edit Kategori' : 'Tambah Kategori'}</CardTitle>
            <form onSubmit={(e) => {
              e.preventDefault();
              const performSave = () => {
                if (editingKatId) updateKategori(editingKatId, { name: katForm.name, minWeight: parseInt(katForm.minWeight) });
                else {
                  addKategori({ name: katForm.name, minWeight: parseInt(katForm.minWeight) });
                  localStorage.removeItem('draft_katForm');
                }
                setKatForm({ name: '', minWeight: '3' });
                setEditingKatId(null);
              };

              if (editingKatId) {
                triggerConfirmation("Konfirmasi Pembaruan Kategori", "Simpan perubahan pada kategori pelatihan ini?", performSave);
              } else {
                performSave();
              }
            }} className="space-y-4">
              <div className="space-y-1">
                <Label>Nama Kategori</Label>
                <Input value={katForm.name} onChange={e => updateKatForm({ name: e.target.value })} required />
              </div>
              <div className="space-y-1">
                <Label>Bobot Kompetensi Minimum</Label>
                <Select value={katForm.minWeight} onValueChange={val => updateKatForm({ minWeight: val })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="5">Level 5 (PKN)</SelectItem>
                    <SelectItem value="4">Level 4 (PKA)</SelectItem>
                    <SelectItem value="3">Level 3 (PKP)</SelectItem>
                    <SelectItem value="2">Level 2 (Latsar)</SelectItem>
                    <SelectItem value="1">Level 1 (PPPK)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">Simpan Kategori</Button>
            </form>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="mapel">
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="md:col-span-2 shadow-sm border-slate-200">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Mata Pelajaran (Mapel)</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Total JP</TableHead>
                    <TableHead className="pr-6 text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeMapels.map(m => {
                    const cat = activeKats.find(k => k.id === m.kategoriId);
                    return (
                      <TableRow key={m.id}>
                        <TableCell className="font-semibold pl-6">{m.name}</TableCell>
                        <TableCell>{cat ? cat.name.split(' ')[0] : 'Tidak Diketahui'}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{m.jpTotal} JP</Badge>
                        </TableCell>
                        <TableCell className="pr-6 text-right space-x-2">
                          <Button size="sm" variant="ghost" onClick={() => { setEditingMapelId(m.id); setMapelForm({ name: m.name, kategoriId: m.kategoriId, jpTotal: String(m.jpTotal) }); }} className="text-blue-600"><Edit className="h-4 w-4" /></Button>
                          <Button size="sm" variant="ghost" onClick={() => {
                            triggerConfirmation(
                              "Hapus Mata Pelajaran",
                              `Apakah Anda yakin ingin menghapus mata pelajaran ${m.name}?`,
                              () => deleteMapel(m.id)
                            );
                          }} className="text-red-600"><Trash2 className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-200 bg-white p-6">
            <CardTitle className="text-base font-bold mb-4 text-blue-900">{editingMapelId ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran'}</CardTitle>
            <form onSubmit={(e) => {
              e.preventDefault();
              const performSave = () => {
                if (editingMapelId) updateMapel(editingMapelId, { name: mapelForm.name, kategoriId: mapelForm.kategoriId, jpTotal: parseInt(mapelForm.jpTotal) });
                else {
                  addMapel({ name: mapelForm.name, kategoriId: mapelForm.kategoriId, jpTotal: parseInt(mapelForm.jpTotal) });
                  localStorage.removeItem('draft_mapelForm');
                }
                setMapelForm({ name: '', kategoriId: '', jpTotal: '4' });
                setEditingMapelId(null);
              };

              if (editingMapelId) {
                triggerConfirmation("Konfirmasi Pembaruan Mata Pelajaran", "Simpan perubahan pada mata pelajaran ini?", performSave);
              } else {
                performSave();
              }
            }} className="space-y-4">
              <div className="space-y-1">
                <Label>Nama Mata Pelajaran</Label>
                <Input value={mapelForm.name} onChange={e => updateMapelForm({ name: e.target.value })} required />
              </div>
              <div className="space-y-1">
                <Label>Kategori Pelatihan</Label>
                <Select value={mapelForm.kategoriId} onValueChange={val => updateMapelForm({ kategoriId: val })}>
                  <SelectTrigger><SelectValue placeholder="Pilih Kategori" /></SelectTrigger>
                  <SelectContent className="bg-white">
                    {activeKats.map(k => (
                      <SelectItem key={k.id} value={k.id}>{k.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Alokasi Total JP (2-6 JP)</Label>
                <Select value={mapelForm.jpTotal} onValueChange={val => updateMapelForm({ jpTotal: val })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="2">2 JP</SelectItem>
                    <SelectItem value="3">3 JP</SelectItem>
                    <SelectItem value="4">4 JP</SelectItem>
                    <SelectItem value="5">5 JP</SelectItem>
                    <SelectItem value="6">6 JP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">Save Mata Pelajaran</Button>
            </form>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="lokasi">
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="md:col-span-2 shadow-sm border-slate-200">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Nama Lokasi / Ruangan</TableHead>
                    <TableHead className="pr-6 text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeLokasis.map(l => (
                    <TableRow key={l.id}>
                      <TableCell className="font-semibold pl-6 flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-slate-400" />
                        {l.name}
                      </TableCell>
                      <TableCell className="pr-6 text-right space-x-2">
                        <Button size="sm" variant="ghost" onClick={() => { setEditingLokId(l.id); setLokForm({ name: l.name }); }} className="text-blue-600"><Edit className="h-4 w-4" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => {
                          triggerConfirmation(
                            "Hapus Lokasi",
                            `Hapus lokasi ${l.name}?`,
                            () => deleteLokasi(l.id)
                          );
                        }} className="text-red-600"><Trash2 className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-200 bg-white p-6">
            <CardTitle className="text-base font-bold mb-4 text-blue-900">{editingLokId ? 'Edit Lokasi' : 'Tambah Lokasi'}</CardTitle>
            <form onSubmit={(e) => {
              e.preventDefault();
              const performSave = () => {
                if (editingLokId) updateLokasi(editingLokId, { name: lokForm.name });
                else {
                  addLokasi({ name: lokForm.name });
                  localStorage.removeItem('draft_lokForm');
                }
                setLokForm({ name: '' });
                setEditingLokId(null);
              };

              if (editingLokId) {
                triggerConfirmation("Konfirmasi Pembaruan Lokasi", "Simpan perubahan lokasi kelas ini?", performSave);
              } else {
                performSave();
              }
            }} className="space-y-4">
              <div className="space-y-1">
                <Label>Nama Lokasi</Label>
                <Input value={lokForm.name} onChange={e => updateLokForm({ name: e.target.value })} required />
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">Simpan Lokasi</Button>
            </form>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="batches">
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="md:col-span-2 shadow-sm border-slate-200">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Nama Angkatan</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Pola Pendanaan</TableHead>
                    <TableHead>Periode</TableHead>
                    <TableHead className="pr-6 text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeBatches.map(b => {
                    const cat = activeKats.find(k => k.id === b.kategoriId);
                    return (
                      <TableRow key={b.id}>
                        <TableCell className="font-semibold pl-6">{b.name}</TableCell>
                        <TableCell>{cat ? cat.name.split(' ')[0] : 'Tidak Diketahui'}</TableCell>
                        <TableCell>
                          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">{b.pola}</Badge>
                        </TableCell>
                        <TableCell className="text-xs text-slate-500">{b.startDate} s/d {b.endDate}</TableCell>
                        <TableCell className="pr-6 text-right space-x-2">
                          <Button size="sm" variant="ghost" onClick={() => { setEditingBatchId(b.id); setBatchForm({ name: b.name, kategoriId: b.kategoriId, pola: b.pola, startDate: b.startDate, endDate: b.endDate }); }} className="text-blue-600"><Edit className="h-4 w-4" /></Button>
                          <Button size="sm" variant="ghost" onClick={() => {
                            triggerConfirmation(
                              "Hapus Angkatan",
                              `Apakah Anda yakin ingin menghapus angkatan ${b.name}?`,
                              () => deleteBatch(b.id)
                            );
                          }} className="text-red-600"><Trash2 className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-200 bg-white p-6">
            <CardTitle className="text-base font-bold mb-4 text-blue-900">{editingBatchId ? 'Edit Angkatan' : 'Buat Angkatan'}</CardTitle>
            <form onSubmit={(e) => {
              e.preventDefault();
              const performSave = () => {
                if (editingBatchId) updateBatch(editingBatchId, batchForm);
                else {
                  addBatch(batchForm);
                  localStorage.removeItem('draft_batchForm');
                }
                setBatchForm({ name: '', kategoriId: '', pola: 'APBD', startDate: '2026-03-01', endDate: '2026-03-15' });
                setEditingBatchId(null);
              };

              if (editingBatchId) {
                triggerConfirmation("Konfirmasi Pembaruan Angkatan", "Simpan perubahan pada angkatan pelatihan ini?", performSave);
              } else {
                performSave();
              }
            }} className="space-y-4">
              <div className="space-y-1">
                <Label>Nama Angkatan</Label>
                <Input value={batchForm.name} onChange={e => updateBatchForm({ name: e.target.value })} required />
              </div>
              <div className="space-y-1">
                <Label>Kategori Pelatihan</Label>
                <Select value={batchForm.kategoriId} onValueChange={val => updateBatchForm({ kategoriId: val })}>
                  <SelectTrigger><SelectValue placeholder="Pilih Kategori" /></SelectTrigger>
                  <SelectContent className="bg-white">
                    {activeKats.map(k => (
                      <SelectItem key={k.id} value={k.id}>{k.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Pola Pelaksanaan</Label>
                <Select value={batchForm.pola} onValueChange={(val: any) => updateBatchForm({ pola: val })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="APBD">APBD</SelectItem>
                    <SelectItem value="Kontribusi">Kontribusi</SelectItem>
                    <SelectItem value="Kemitraan">Kemitraan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label>Tanggal Mulai</Label>
                  <Input type="date" value={batchForm.startDate} onChange={e => updateBatchForm({ startDate: e.target.value })} required />
                </div>
                <div className="space-y-1">
                  <Label>Tanggal Selesai</Label>
                  <Input type="date" value={batchForm.endDate} onChange={e => updateBatchForm({ endDate: e.target.value })} required />
                </div>
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">Simpan Angkatan</Button>
            </form>
          </Card>
        </div>
      </TabsContent>

      <AlertDialog open={confirmDialog.open} onOpenChange={open => setConfirmDialog(prev => ({ ...prev, open }))}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900 font-bold text-lg">{confirmDialog.title}</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 text-sm">{confirmDialog.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-200 text-slate-700 hover:bg-slate-50">Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDialog.onConfirm} className="bg-blue-600 hover:bg-blue-700 text-white">Konfirmasi Tindakan</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Tabs>
  );
}