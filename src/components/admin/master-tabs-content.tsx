"use client";

import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useWTMS } from '@/context/wtms-context';

interface MasterTabsContentProps {
  widyaswaras: any[];
  kategoriList: any[];
  mapelList: any[];
  lokasiList: any[];
  batches: any[];
}

export function MasterTabsContent({ 
  widyaswaras, 
  kategoriList, 
  mapelList, 
  lokasiList, 
  batches 
}: MasterTabsContentProps) {
  const router = useRouter();
  const { deleteWidyaswara, deleteBatch, deleteKategori, deleteMapel, deleteLokasi } = useWTMS();

  const handleOpenScheduler = (id: string) => {
    router.push(`/admin/scheduling/${id}`);
  };

  return (
    <>
      <TabsContent value="wi">
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
            {widyaswaras.map(wi => (
              <TableRow key={wi.id}>
                <TableCell className="font-semibold text-slate-900 pl-6">{wi.name}, {wi.gelar}</TableCell>
                <TableCell className="text-slate-600 font-mono text-xs">{wi.nip}</TableCell>
                <TableCell className="text-slate-600 font-medium text-xs">{wi.jabatan}</TableCell>
                <TableCell>
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200 font-semibold">
                    Level {wi.level} - {wi.level_label}
                  </Badge>
                </TableCell>
                <TableCell className="pr-6 text-right space-x-2">
                  <Button size="sm" variant="ghost" className="text-blue-600"><Edit className="h-4 w-4" /></Button>
                  <Button size="sm" variant="ghost" className="text-red-600" onClick={() => deleteWidyaswara(wi.id)}><Trash2 className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TabsContent>

      <TabsContent value="kategori">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6">Category Name</TableHead>
              <TableHead>Min Weight</TableHead>
              <TableHead className="pr-6 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {kategoriList.map(k => (
              <TableRow key={k.id}>
                <TableCell className="font-semibold text-slate-900 pl-6">{k.name}</TableCell>
                <TableCell><Badge>Level {k.min_weight}+</Badge></TableCell>
                <TableCell className="pr-6 text-right space-x-2">
                  <Button size="sm" variant="ghost" onClick={() => deleteKategori(k.id)}><Trash2 className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TabsContent>

      <TabsContent value="mapel">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6">Subject Name</TableHead>
              <TableHead>JP Allocation</TableHead>
              <TableHead className="pr-6 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mapelList.map(m => (
              <TableRow key={m.id}>
                <TableCell className="font-semibold text-slate-900 pl-6">{m.name}</TableCell>
                <TableCell><Badge variant="outline">{m.jp_total} JP</Badge></TableCell>
                <TableCell className="pr-6 text-right space-x-2">
                  <Button size="sm" variant="ghost" onClick={() => deleteMapel(m.id)}><Trash2 className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TabsContent>

      <TabsContent value="lokasi">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6">Room Name</TableHead>
              <TableHead className="pr-6 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lokasiList.map(l => (
              <TableRow key={l.id}>
                <TableCell className="font-semibold text-slate-900 pl-6">{l.name}</TableCell>
                <TableCell className="pr-6 text-right space-x-2">
                  <Button size="sm" variant="ghost" onClick={() => deleteLokasi(l.id)}><Trash2 className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TabsContent>

      <TabsContent value="batches">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6">Batch Name</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Pola</TableHead>
              <TableHead className="pr-6 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {batches.map(b => (
              <TableRow key={b.id}>
                <TableCell className="font-semibold text-slate-900 pl-6">{b.name}</TableCell>
                <TableCell className="text-xs">{b.start_date} to {b.end_date}</TableCell>
                <TableCell><Badge>{b.pola}</Badge></TableCell>
                <TableCell className="pr-6 text-right space-x-2">
                  <Button size="sm" variant="outline" onClick={() => handleOpenScheduler(b.id)}>Scheduler</Button>
                  <Button size="sm" variant="ghost" onClick={() => deleteBatch(b.id)} className="text-red-600"><Trash2 className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TabsContent>
    </>
  );
}