"use client";

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, MapPin } from 'lucide-react';
import { useWTMS } from '@/context/wtms-context';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

  // Form states
  const [wiForm, setWiForm] = useState({ name: '', gelar: '', email: '', nip: '', jabatan: 'WI Ahli Madya', level: '3' });
  const [editingWiId, setEditingWiId] = useState<string | null>(null);
  const [isWiDialogOpen, setIsWiDialogOpen] = useState(false);

  const [katForm, setKatForm] = useState({ name: '', minWeight: '3' });
  const [editingKatId, setEditingKatId] = useState<string | null>(null);

  const [mapelForm, setMapelForm] = useState({ name: '', kategoriId: '', jpTotal: '4' });
  const [editingMapelId, setEditingMapelId] = useState<string | null>(null);

  const [lokForm, setLokForm] = useState({ name: '' });
  const [editingLokId, setEditingLokId] = useState<string | null>(null);

  const [batchForm, setBatchForm] = useState({ name: '', kategoriId: '', pola: 'APBD' as any, startDate: '2026-03-01', endDate: '2026-03-15' });
  const [editingBatchId, setEditingBatchId] = useState<string | null>(null);

  const handleWiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lvl = parseInt(wiForm.level);
    const labels = ['PPPK', 'Latsar', 'PKP', 'PKA', 'PKM'];
    const levelLabel = labels[lvl - 1] || 'PPPK';

    if (editingWiId) {
      updateWidyaswara(editingWiId, { ...wiForm, level: lvl, levelLabel, jabatan: wiForm.jabatan as any });
    } else {
      addWidyaswara({ ...wiForm, level: lvl, levelLabel, jabatan: wiForm.jabatan as any });
    }
    setIsWiDialogOpen(false);
  };

  return (
    <Tabs defaultValue="wi" className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <TabsList className="bg-slate-100 p-1 rounded-lg">
          <TabsTrigger value="wi">Widyaswara</TabsTrigger>
          <TabsTrigger value="kategori">Kategori</TabsTrigger>
          <TabsTrigger value="mapel">Mata Pelajaran</TabsTrigger>
          <TabsTrigger value="lokasi">Lokasi / Ruangan</TabsTrigger>
          <TabsTrigger value="batches">Pelatihan (Batches)</TabsTrigger>
        </TabsList>

        <Dialog open={isWiDialogOpen} onOpenChange={setIsWiDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingWiId(null); setWiForm({ name: '', gelar: '', email: '', nip: '', jabatan: 'WI Ahli Madya', level: '3' }); }} className="bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-2">
              <Plus className="h-4 w-4" /> Add Widyaswara
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle>{editingWiId ? 'Edit Widyaswara' : 'Add New Widyaswara'}</DialogTitle>
              <DialogDescription>Setup instructor profile details and competency level.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleWiSubmit} className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Name</Label>
                  <Input value={wiForm.name} onChange={e => setWiForm({ ...wiForm, name: e.target.value })} required />
                </div>
                <div className="space-y-1">
                  <Label>Gelar</Label>
                  <Input value={wiForm.gelar} onChange={e => setWiForm({ ...wiForm, gelar: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>NIP</Label>
                  <Input value={wiForm.nip} onChange={e => setWiForm({ ...wiForm, nip: e.target.value })} required />
                </div>
                <div className="space-y-1">
                  <Label>Email</Label>
                  <Input type="email" value={wiForm.email} onChange={e => setWiForm({ ...wiForm, email: e.target.value })} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Jabatan</Label>
                  <Select value={wiForm.jabatan} onValueChange={val => setWiForm({ ...wiForm, jabatan: val })}>
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
                  <Label>Level</Label>
                  <Select value={wiForm.level} onValueChange={val => setWiForm({ ...wiForm, level: val })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="5">Level 5 (PKM)</SelectItem>
                      <SelectItem value="4">Level 4 (PKA)</SelectItem>
                      <SelectItem value="3">Level 3 (PKP)</SelectItem>
                      <SelectItem value="2">Level 2 (Latsar)</SelectItem>
                      <SelectItem value="1">Level 1 (PPPK)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white mt-4">Save Widyaswara</Button>
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
                  <TableHead className="pl-6">Name</TableHead>
                  <TableHead>NIP</TableHead>
                  <TableHead>Jabatan</TableHead>
                  <TableHead>Competency Level</TableHead>
                  <TableHead className="pr-6 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeWis.map(wi => (
                  <TableRow key={wi.id}>
                    <TableCell className="font-semibold text-slate-900 pl-6">{wi.name}, {wi.gelar}</TableCell>
                    <TableCell className="text-slate-600 font-mono text-xs">{wi.nip}</TableCell>
                    <TableCell className="text-slate-600 text-xs font-medium">{wi.jabatan}</TableCell>
                    <TableCell>
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                        Level {wi.level} - {wi.levelLabel}
                      </Badge>
                    </TableCell>
                    <TableCell className="pr-6 text-right space-x-2">
                      <Button size="sm" variant="ghost" onClick={() => {
                        setEditingWiId(wi.id);
                        setWiForm({ name: wi.name, gelar: wi.gelar, email: wi.email, nip: wi.nip, jabatan: wi.jabatan, level: String(wi.level) });
                        setIsWiDialogOpen(true);
                      }} className="text-blue-600 hover:text-blue-800">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => { if (confirm(`Delete ${wi.name}?`)) deleteWidyaswara(wi.id); }} className="text-red-600 hover:text-red-800">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
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
                    <TableHead className="pl-6">Category Name</TableHead>
                    <TableHead>Min. Competency Weight</TableHead>
                    <TableHead className="pr-6 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeKats.map(k => (
                    <TableRow key={k.id}>
                      <TableCell className="font-semibold pl-6">{k.name}</TableCell>
                      <TableCell>
                        <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                          Level {k.minWeight} or higher
                        </Badge>
                      </TableCell>
                      <TableCell className="pr-6 text-right space-x-2">
                        <Button size="sm" variant="ghost" onClick={() => { setEditingKatId(k.id); setKatForm({ name: k.name, minWeight: String(k.minWeight) }); }} className="text-blue-600"><Edit className="h-4 w-4" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => { if (confirm('Delete?')) deleteKategori(k.id); }} className="text-red-600"><Trash2 className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-200 bg-white p-6">
            <CardTitle className="text-base font-bold mb-4">{editingKatId ? 'Edit Category' : 'Add Category'}</CardTitle>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (editingKatId) updateKategori(editingKatId, { name: katForm.name, minWeight: parseInt(katForm.minWeight) });
              else addKategori({ name: katForm.name, minWeight: parseInt(katForm.minWeight) });
              setKatForm({ name: '', minWeight: '3' });
              setEditingKatId(null);
            }} className="space-y-4">
              <div className="space-y-1">
                <Label>Category Name</Label>
                <Input value={katForm.name} onChange={e => setKatForm({ ...katForm, name: e.target.value })} required />
              </div>
              <div className="space-y-1">
                <Label>Minimum Competency Weight</Label>
                <Select value={katForm.minWeight} onValueChange={val => setKatForm({ ...katForm, minWeight: val })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="5">Level 5 (PKM)</SelectItem>
                    <SelectItem value="4">Level 4 (PKA)</SelectItem>
                    <SelectItem value="3">Level 3 (PKP)</SelectItem>
                    <SelectItem value="2">Level 2 (Latsar)</SelectItem>
                    <SelectItem value="1">Level 1 (PPPK)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full bg-blue-600 text-white">Save Category</Button>
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
                    <TableHead className="pl-6">Subject (Mapel)</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Total JP</TableHead>
                    <TableHead className="pr-6 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeMapels.map(m => {
                    const cat = activeKats.find(k => k.id === m.kategoriId);
                    return (
                      <TableRow key={m.id}>
                        <TableCell className="font-semibold pl-6">{m.name}</TableCell>
                        <TableCell>{cat ? cat.name.split(' ')[0] : 'Unknown'}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{m.jpTotal} JP</Badge>
                        </TableCell>
                        <TableCell className="pr-6 text-right space-x-2">
                          <Button size="sm" variant="ghost" onClick={() => { setEditingMapelId(m.id); setMapelForm({ name: m.name, kategoriId: m.kategoriId, jpTotal: String(m.jpTotal) }); }} className="text-blue-600"><Edit className="h-4 w-4" /></Button>
                          <Button size="sm" variant="ghost" onClick={() => { if (confirm('Delete?')) deleteMapel(m.id); }} className="text-red-600"><Trash2 className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-200 bg-white p-6">
            <CardTitle className="text-base font-bold mb-4">{editingMapelId ? 'Edit Subject' : 'Add Subject'}</CardTitle>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (editingMapelId) updateMapel(editingMapelId, { name: mapelForm.name, kategoriId: mapelForm.kategoriId, jpTotal: parseInt(mapelForm.jpTotal) });
              else addMapel({ name: mapelForm.name, kategoriId: mapelForm.kategoriId, jpTotal: parseInt(mapelForm.jpTotal) });
              setMapelForm({ name: '', kategoriId: '', jpTotal: '4' });
              setEditingMapelId(null);
            }} className="space-y-4">
              <div className="space-y-1">
                <Label>Subject Name</Label>
                <Input value={mapelForm.name} onChange={e => setMapelForm({ ...mapelForm, name: e.target.value })} required />
              </div>
              <div className="space-y-1">
                <Label>Training Category</Label>
                <Select value={mapelForm.kategoriId} onValueChange={val => setMapelForm({ ...mapelForm, kategoriId: val })}>
                  <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
                  <SelectContent className="bg-white">
                    {activeKats.map(k => (
                      <SelectItem key={k.id} value={k.id}>{k.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Total JP Allocation (2-6 JP)</Label>
                <Select value={mapelForm.jpTotal} onValueChange={val => setMapelForm({ ...mapelForm, jpTotal: val })}>
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
              <Button type="submit" className="w-full bg-blue-600 text-white">Save Subject</Button>
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
                    <TableHead className="pl-6">Location / Room Name</TableHead>
                    <TableHead className="pr-6 text-right">Actions</TableHead>
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
                        <Button size="sm" variant="ghost" onClick={() => { if (confirm('Delete?')) deleteLokasi(l.id); }} className="text-red-600"><Trash2 className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-200 bg-white p-6">
            <CardTitle className="text-base font-bold mb-4">{editingLokId ? 'Edit Location' : 'Add Location'}</CardTitle>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (editingLokId) updateLokasi(editingLokId, { name: lokForm.name });
              else addLokasi({ name: lokForm.name });
              setLokForm({ name: '' });
              setEditingLokId(null);
            }} className="space-y-4">
              <div className="space-y-1">
                <Label>Location Name</Label>
                <Input value={lokForm.name} onChange={e => setLokForm({ name: e.target.value })} required />
              </div>
              <Button type="submit" className="w-full bg-blue-600 text-white">Save Location</Button>
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
                    <TableHead className="pl-6">Batch Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Funding Pola</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead className="pr-6 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeBatches.map(b => {
                    const cat = activeKats.find(k => k.id === b.kategoriId);
                    return (
                      <TableRow key={b.id}>
                        <TableCell className="font-semibold pl-6">{b.name}</TableCell>
                        <TableCell>{cat ? cat.name.split(' ')[0] : 'Unknown'}</TableCell>
                        <TableCell>
                          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">{b.pola}</Badge>
                        </TableCell>
                        <TableCell className="text-xs text-slate-500">{b.startDate} to {b.endDate}</TableCell>
                        <TableCell className="pr-6 text-right space-x-2">
                          <Button size="sm" variant="ghost" onClick={() => { setEditingBatchId(b.id); setBatchForm({ name: b.name, kategoriId: b.kategoriId, pola: b.pola, startDate: b.startDate, endDate: b.endDate }); }} className="text-blue-600"><Edit className="h-4 w-4" /></Button>
                          <Button size="sm" variant="ghost" onClick={() => { if (confirm('Delete?')) deleteBatch(b.id); }} className="text-red-600"><Trash2 className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-200 bg-white p-6">
            <CardTitle className="text-base font-bold mb-4">{editingBatchId ? 'Edit Batch' : 'Create Batch'}</CardTitle>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (editingBatchId) updateBatch(editingBatchId, batchForm);
              else addBatch(batchForm);
              setBatchForm({ name: '', kategoriId: '', pola: 'APBD', startDate: '2026-03-01', endDate: '2026-03-15' });
              setEditingBatchId(null);
            }} className="space-y-4">
              <div className="space-y-1">
                <Label>Batch Name</Label>
                <Input value={batchForm.name} onChange={e => setBatchForm({ ...batchForm, name: e.target.value })} required />
              </div>
              <div className="space-y-1">
                <Label>Training Category</Label>
                <Select value={batchForm.kategoriId} onValueChange={val => setBatchForm({ ...batchForm, kategoriId: val })}>
                  <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
                  <SelectContent className="bg-white">
                    {activeKats.map(k => (
                      <SelectItem key={k.id} value={k.id}>{k.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Funding Pattern (Pola)</Label>
                <Select value={batchForm.pola} onValueChange={(val: any) => setBatchForm({ ...batchForm, pola: val })}>
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
                  <Label>Start Date</Label>
                  <Input type="date" value={batchForm.startDate} onChange={e => setBatchForm({ ...batchForm, startDate: e.target.value })} required />
                </div>
                <div className="space-y-1">
                  <Label>End Date</Label>
                  <Input type="date" value={batchForm.endDate} onChange={e => setBatchForm({ ...batchForm, endDate: e.target.value })} required />
                </div>
              </div>
              <Button type="submit" className="w-full bg-blue-600 text-white">Save Batch</Button>
            </form>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  );
}