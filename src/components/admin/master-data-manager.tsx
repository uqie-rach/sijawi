"use client";

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default function MasterDataManager({ initialData }: { initialData: any }) {
  const [activeTab, setActiveTab] = useState('wi');

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <div className="flex justify-between items-center mb-6">
        <TabsList className="bg-slate-100 p-1">
          <TabsTrigger value="wi">Widyaswara</TabsTrigger>
          <TabsTrigger value="kategori">Kategori</TabsTrigger>
          <TabsTrigger value="mapel">Mapel</TabsTrigger>
          <TabsTrigger value="lokasi">Lokasi</TabsTrigger>
          <TabsTrigger value="batches">Batches</TabsTrigger>
        </TabsList>
        <Button className="bg-blue-600 hover:bg-blue-500 text-white">
          <Plus className="h-4 w-4 mr-2" /> Add {activeTab === 'wi' ? 'Instructor' : activeTab === 'batches' ? 'Batch' : 'Entry'}
        </Button>
      </div>

      <TabsContent value="wi">
        <Card className="shadow-sm">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Name</TableHead>
                  <TableHead>NIP</TableHead>
                  <TableHead>Competency Level</TableHead>
                  <TableHead className="text-right pr-6">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {initialData.widyaswaras.map((wi: any) => (
                  <TableRow key={wi.id}>
                    <TableCell className="pl-6 font-semibold">{wi.name}, {wi.gelar}</TableCell>
                    <TableCell className="text-xs font-mono">{wi.nip}</TableCell>
                    <TableCell>
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200">Level {wi.level} - {wi.level_label}</Badge>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <Button variant="ghost" size="sm" className="text-blue-600">Edit</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
      
      {/* Other content omitted for brevity but following same pattern */}
      <TabsContent value="batches">
        <Card className="shadow-sm">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Batch Name</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Pola</TableHead>
                  <TableHead className="text-right pr-6">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {initialData.batches.map((b: any) => (
                  <TableRow key={b.id}>
                    <TableCell className="pl-6 font-semibold">{b.name}</TableCell>
                    <TableCell className="text-xs text-slate-500">{b.start_date} to {b.end_date}</TableCell>
                    <TableCell><Badge variant="outline">{b.pola}</Badge></TableCell>
                    <TableCell className="text-right pr-6">
                      <Button variant="ghost" size="sm" className="text-blue-600">Edit</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}