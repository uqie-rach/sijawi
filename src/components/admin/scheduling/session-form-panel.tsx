'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';
import { Plus, Zap, Edit } from 'lucide-react';
import type { Widyaiswara } from '@/context/wtms-context';
import type { TrackingMapelStatus } from '@/hooks/use-jp-tracking';
import type { SessionFormState } from '@/hooks/use-session-form';

interface SessionFormPanelProps {
  editingSessionId: string | null;
  sessionForm: SessionFormState;
  updateForm: (fields: Partial<SessionFormState>) => void;
  onSubmit: (e: React.FormEvent) => void;
  openNewForm: () => void;

  batchId?: string;
  batchOptions: { value: string; label: string }[];
  mapelOptions: { value: string; label: string; disabled?: boolean }[];
  filteredWisList: Widyaiswara[];
  lokasiOptions: { value: string; label: string; disabled?: boolean }[];
  trackingMapelStatus: TrackingMapelStatus[];
  activeWis: Widyaiswara[];
  activeBatch?: { startDate?: string; endDate?: string } | null;
}

export function SessionFormPanel({
  editingSessionId, sessionForm, updateForm, onSubmit, openNewForm,
  batchId, batchOptions, mapelOptions, filteredWisList, lokasiOptions,
  trackingMapelStatus, activeWis, activeBatch,
}: SessionFormPanelProps) {
  return (
    <Card className="shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-slate-200 bg-white rounded-lg">
      <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-3 px-4">
        <CardTitle className="text-sm font-bold text-blue-600 flex items-center gap-2">
          {editingSessionId ? (
            <>
              <Edit className="h-4 w-4" />
              Edit Alokasi Sesi
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              Alokasikan Sesi Baru
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <form onSubmit={onSubmit} className="space-y-3">
          {!batchId && (
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-slate-600">Angkatan Pelatihan</Label>
              <Combobox
                options={batchOptions}
                value={sessionForm.batchId}
                onValueChange={val => updateForm({ batchId: val })}
                placeholder="Pilih angkatan..."
              />
            </div>
          )}

          <div className="space-y-1">
            <Label className="text-[11px] font-semibold text-slate-600">Mata Pelatihan</Label>
            <Combobox
              options={mapelOptions}
              value={sessionForm.mapelId}
              onValueChange={val => updateForm({ mapelId: val })}
              placeholder="Cari mata pelajaran..."
            />
          </div>

          {/* Multi-WI Selection — moved to WiAssignmentPanel */}

          <div className="grid grid-cols-[1fr_1fr_1fr] gap-3">
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-slate-600">Tanggal</Label>
              <Input
                type="date"
                min={activeBatch?.startDate}
                max={activeBatch?.endDate}
                value={sessionForm.date}
                onChange={e => updateForm({ date: e.target.value })}
                required
                className="text-[11px] h-9"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => updateForm({ date: new Date().toISOString().split('T')[0] })}
                title="Pintasan Hari Ini"
                className="h-7 w-full text-[10px] border-blue-200 hover:bg-blue-50 text-blue-600 mt-1 gap-1"
              >
                <Zap className="h-3 w-3" />
                Hari Ini
              </Button>
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-slate-600">Mulai</Label>
              <Input
                type="time"
                value={sessionForm.startTime}
                onChange={e => updateForm({ startTime: e.target.value })}
                required
                className="text-[11px] h-9"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-slate-600">Selesai</Label>
              <Input
                type="time"
                value={sessionForm.endTime}
                disabled
                className="bg-slate-100/80 text-slate-500 font-mono text-[11px] h-9"
              />
            </div>
          </div>

          <div className="grid grid-cols-[1fr_1fr_1fr] gap-3">
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-slate-600">Format</Label>
              <Select
                value={sessionForm.format}
                onValueChange={(val: 'Klasikal' | 'Virtual' | 'Asinkron') => updateForm({ format: val })}
              >
                <SelectTrigger className="h-9 text-[11px]"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="Klasikal">Klasikal</SelectItem>
                  <SelectItem value="Virtual">Virtual</SelectItem>
                  <SelectItem value="Asinkron">Asinkron</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-slate-600">JP Ke</Label>
              <Input
                placeholder="1-2"
                value={sessionForm.jpKe}
                onChange={e => updateForm({ jpKe: e.target.value })}
                required
                className="text-[11px] h-9"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-slate-600">Jumlah JP</Label>
              <Select value={sessionForm.jpCount} onValueChange={val => updateForm({ jpCount: val })}>
                <SelectTrigger className="h-9 text-[11px]"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="1">1 JP</SelectItem>
                  <SelectItem value="2">2 JP</SelectItem>
                  <SelectItem value="3">3 JP</SelectItem>
                  <SelectItem value="4">4 JP</SelectItem>
                  <SelectItem value="5">5 JP</SelectItem>
                  <SelectItem value="6">6 JP</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {sessionForm.format === 'Klasikal' && (
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-slate-600">Lokasi / Ruangan</Label>
              <Combobox
                options={lokasiOptions}
                value={sessionForm.lokasiId}
                onValueChange={val => updateForm({ lokasiId: val })}
                placeholder="Cari lokasi..."
              />
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 text-xs font-semibold mt-2"
          >
            {editingSessionId ? 'Perbarui Sesi' : 'Simpan Alokasi Sesi'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}