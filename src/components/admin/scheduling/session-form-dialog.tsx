'use client';

import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Combobox } from '@/components/ui/combobox';
import { Plus, Zap } from 'lucide-react';
import type { Widyaiswara } from '@/context/wtms-context';
import type { TrackingMapelStatus } from '@/hooks/use-jp-tracking';
import type { SessionFormState } from '@/hooks/use-session-form';

interface SessionFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
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

export function SessionFormDialog({
  isOpen, onOpenChange,
  editingSessionId, sessionForm, updateForm, onSubmit, openNewForm,
  batchId, batchOptions, mapelOptions, filteredWisList, lokasiOptions,
  trackingMapelStatus, activeWis, activeBatch,
}: SessionFormDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          onClick={openNewForm}
          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 text-xs font-semibold py-5 px-4 shadow-md shadow-blue-100"
        >
          <Plus className="h-4 w-4" /> Alokasikan Sesi Jadwal
        </Button>
      </DialogTrigger>

      <DialogContent className="bg-white max-w-4xl p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl font-bold text-blue-600">
            {editingSessionId ? 'Edit Alokasi Sesi' : 'Alokasikan Sesi Baru'}
          </DialogTitle>
          <DialogDescription>
            Atur pemetaan instruktur, batasan ketersediaan ruang kelas, dan parameter operasional.
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-slate-100 p-6 gap-6">
          {/* Form Inputs (3 Cols) */}
          <form onSubmit={onSubmit} className="md:col-span-3 space-y-4">
            {!batchId && (
              <div className="space-y-1">
                <Label>Angkatan Pelatihan</Label>
                <Combobox
                  options={batchOptions}
                  value={sessionForm.batchId}
                  onValueChange={val => updateForm({ batchId: val })}
                  placeholder="Pilih angkatan..."
                />
              </div>
            )}

            <div className="space-y-1">
              <Label>Mata Pelatihan (Mapel)</Label>
              <Combobox
                options={mapelOptions}
                value={sessionForm.mapelId}
                onValueChange={val => updateForm({ mapelId: val })}
                placeholder="Cari mata pelajaran..."
              />
            </div>

            {/* Multi-WI Selection */}
            <div className="space-y-2 border border-slate-100 p-3.5 rounded-xl bg-slate-50/50">
              <Label className="text-xs font-bold text-blue-900 block mb-1">
                Daftar Pengajar (Multi-Select Widyaiswara)
              </Label>
              <div className="grid grid-cols-2 gap-2 max-h-[140px] overflow-y-auto">
                {filteredWisList.map(wi => {
                  const isChecked = sessionForm.wiIds.includes(wi.id);
                  return (
                    <label
                      key={wi.id}
                      className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer hover:bg-slate-100 p-1.5 rounded transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          const newVal = isChecked
                            ? sessionForm.wiIds.filter(id => id !== wi.id)
                            : [...sessionForm.wiIds, wi.id];
                          updateForm({ wiIds: newVal });
                        }}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                      />
                      <span className="truncate">{wi.name}, {wi.gelar}</span>
                    </label>
                  );
                })}
              </div>
              {sessionForm.wiIds.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1.5 border-t border-slate-200">
                  {sessionForm.wiIds.map(val => {
                    const opt = activeWis.find(o => o.id === val);
                    if (!opt) return null;
                    return (
                      <Badge
                        key={val}
                        variant="secondary"
                        className="bg-blue-50 text-blue-800 border-blue-100 hover:bg-blue-100 flex items-center gap-1 text-[10px] font-bold rounded-lg shadow-sm"
                      >
                        <span>{opt.name}</span>
                      </Badge>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1 relative">
                <Label>Tanggal</Label>
                <div className="flex gap-1">
                  <Input
                    type="date"
                    min={activeBatch?.startDate}
                    max={activeBatch?.endDate}
                    value={sessionForm.date}
                    onChange={e => updateForm({ date: e.target.value })}
                    required
                    className="pr-1 text-xs"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => updateForm({ date: new Date().toISOString().split('T')[0] })}
                    title="Pintasan Hari Ini"
                    className="h-9 w-9 shrink-0 border-blue-200 hover:bg-blue-50 text-blue-600"
                  >
                    <Zap className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <div className="space-y-1">
                <Label>Waktu Mulai</Label>
                <Input
                  type="time"
                  value={sessionForm.startTime}
                  onChange={e => updateForm({ startTime: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label>Waktu Selesai</Label>
                <Input
                  type="time"
                  value={sessionForm.endTime}
                  disabled
                  className="bg-slate-100/80 text-slate-500 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <Label>Format</Label>
                <Select
                  value={sessionForm.format}
                  onValueChange={(val: 'Klasikal' | 'Virtual' | 'Asinkron') => updateForm({ format: val })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="Klasikal">Klasikal</SelectItem>
                    <SelectItem value="Virtual">Virtual</SelectItem>
                    <SelectItem value="Asinkron">Asinkron</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>JP Ke</Label>
                <Input
                  placeholder="1-2"
                  value={sessionForm.jpKe}
                  onChange={e => updateForm({ jpKe: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label>Jumlah JP</Label>
                <Select value={sessionForm.jpCount} onValueChange={val => updateForm({ jpCount: val })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
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
                <Label>Lokasi / Ruangan</Label>
                <Combobox
                  options={lokasiOptions}
                  value={sessionForm.lokasiId}
                  onValueChange={val => updateForm({ lokasiId: val })}
                  placeholder="Cari lokasi..."
                />
              </div>
            )}

            <DialogFooter className="pt-2">
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white w-full py-5 text-sm font-semibold"
              >
                Simpan Alokasi Sesi
              </Button>
            </DialogFooter>
          </form>

          {/* Real-time JP Tracking Widget (2 Cols) */}
          <div className="md:col-span-2 pl-4 space-y-4">
            <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider">
              Sisa Kapasitas Belum Dialokasikan
            </h4>
            <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
              {trackingMapelStatus.map(status => (
                <div key={status.id} className="text-xs space-y-1">
                  <div className="flex justify-between font-medium">
                    <span className="truncate max-w-[140px] text-slate-700" title={status.name}>
                      {status.name}
                    </span>
                    <span className="text-slate-500 font-bold">
                      {status.scheduledJp}/{status.jpTotal} JP
                    </span>
                  </div>
                  <Progress
                    value={(status.scheduledJp / status.jpTotal) * 100}
                    className="h-1 bg-slate-100"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
