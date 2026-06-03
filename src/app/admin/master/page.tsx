import React from 'react';
import { sql } from '@/db';
import { AdminHeader } from '@/components/admin/header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { MasterTabsContent } from '@/components/admin/master-tabs-content';

export const dynamic = 'force-dynamic';

export default async function MasterDataPage() {
  // SSR Master Collection Fetching
  const [widyaswaras, kategoriList, mapelList, lokasiList, batches] = await Promise.all([
    sql`SELECT * FROM widyaswaras ORDER BY name ASC`,
    sql`SELECT * FROM kategori_pelatihan ORDER BY name ASC`,
    sql`SELECT * FROM mata_pelatihan ORDER BY name ASC`,
    sql`SELECT * FROM lokasi ORDER BY name ASC`,
    sql`SELECT * FROM batches ORDER BY start_date DESC`
  ]);

  return (
    <div className="flex flex-col">
      <AdminHeader 
        title="Master Data Management" 
        description="Manage Widyaswaras, training categories, subjects, and venues." 
      />
      
      <div className="p-8">
        <Tabs defaultValue="wi" className="w-full">
          <TabsList className="bg-slate-100 p-1 rounded-lg mb-6">
            <TabsTrigger value="wi">Widyaswara</TabsTrigger>
            <TabsTrigger value="kategori">Kategori Pelatihan</TabsTrigger>
            <TabsTrigger value="mapel">Mata Pelajaran</TabsTrigger>
            <TabsTrigger value="lokasi">Lokasi / Ruangan</TabsTrigger>
            <TabsTrigger value="batches">Pelatihan (Batches)</TabsTrigger>
          </TabsList>

          <Card className="shadow-sm border-slate-200">
            <CardContent className="p-0">
              <MasterTabsContent 
                widyaswaras={widyaswaras}
                kategoriList={kategoriList}
                mapelList={mapelList}
                lokasiList={lokasiList}
                batches={batches}
              />
            </CardContent>
          </Card>
        </Tabs>
      </div>
    </div>
  );
}