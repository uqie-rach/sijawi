'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Combobox } from '@/components/ui/combobox';
import { JpSlotSelector } from '@/components/admin/scheduling/jp-slot-selector';
import { getAllocatedJpRanges } from '@/hooks/use-jp-tracking';
import { Plus, Zap, Edit, CheckCircle, Clock, ChevronUp, ChevronDown, UserPlus } from 'lucide-react';
import type { Widyaiswara, Session } from '@/context/wtms-context';
import type { TrackingMapelStatus } from '@/hooks/use-jp-tracking';
import type { BusyWiDetail } from '@/hooks/use-wi-availability';
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

  // WI Assignment
  date: string;
  availableWis: Widyaiswara[];
  busyWis: BusyWiDetail[];
  onToggleWi: (wiId: string, checked: boolean) => void;
  onViewWiDetail: (wiId: string) => void;
  selectedWiId: string | null;

  // JP tracking
  allSessions: Session[];
}

export function SessionFormPanel({
  editingSessionId, sessionForm, updateForm, onSubmit, openNewForm,
  batchId, batchOptions, mapelOptions, filteredWisList, lokasiOptions,
  trackingMapelStatus, activeWis, activeBatch,
  date, availableWis, busyWis, onToggleWi, onViewWiDetail, selectedWiId,
  allSessions,
}: SessionFormPanelProps) {
  const [showAvailable, setShowAvailable] = useState(true);
  const [showBusy, setShowBusy] = useState(true);

  const formattedDate = date
    ? new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
    : '';

  const availableIds = new Set(availableWis.map(w => w.id));

  // Compute jpTotal for selected mapel
  const selectedMapel = trackingMapelStatus.find(m => m.id === sessionForm.mapelId);
  const jpTotal = selectedMapel ? selectedMapel.jpTotal : 0;

  // Compute allocated JP ranges for the selected mapel
  const allocatedJpRanges = useMemo(() => {
    if (!sessionForm.mapelId || !sessionForm.batchId) return [];
    return getAllocatedJpRanges(
      sessionForm.mapelId,
      sessionForm.batchId,
      allSessions,
      editingSessionId
    );
  }, [sessionForm.mapelId, sessionForm.batchId, allSessions, editingSessionId]);

  const handleJpSlotChange = (jpKe: string, jpCount: number) => {
    updateForm({ jpKe, jpCount: String(jpCount) });
  };

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
        <form onSubmit={onSubmit} className="space-y-4">
          {/* 1. Angkatan */}
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

          {/* 2. Mata Pelatihan */}
          <div className="space-y-1">
            <Label className="text-[11px] font-semibold text-slate-600">Mata Pelatihan</Label>
            <Combobox
              options={mapelOptions}
              value={sessionForm.mapelId}
              onValueChange={val => {
                updateForm({ mapelId: val, jpKe: '', jpCount: '' });
              }}
              placeholder="Cari mata pelajaran..."
            />
          </div>

          {/* 3. JP Slot Selector */}
          {sessionForm.mapelId && jpTotal > 0 && (
            <div className="space-y-2">
              <Label className="text-[11px] font-semibold text-slate-600">
                Pilih Rentang JP ({jpTotal} JP Total)
              </Label>
              <JpSlotSelector
                jpTotal={jpTotal}
                allocatedRanges={allocatedJpRanges}
                value={sessionForm.jpKe}
                onChange={handleJpSlotChange}
              />
            </div>
          )}

          {/* 4. Tanggal / Mulai / Selesai */}
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

          {/* 5. Format / JP Ke (readonly) / Jumlah JP (readonly) */}
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
                value={sessionForm.jpKe}
                disabled
                className="bg-slate-100/80 text-slate-500 font-mono text-[11px] h-9"
                placeholder="Pilih dari grid"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-slate-600">Jumlah JP</Label>
              <Input
                value={sessionForm.jpCount}
                disabled
                className="bg-slate-100/80 text-slate-500 font-mono text-[11px] h-9"
                placeholder="Otomatis"
              />
            </div>
          </div>

          {/* 6. Lokasi */}
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

          {/* 7. WI Assignment — merged from WiAssignmentPanel */}
          {filteredWisList.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-blue-600" />
                <Label className="text-[11px] font-bold text-slate-700">Penugasan Pengajar</Label>
                {formattedDate && (
                  <Badge variant="outline" className="text-[10px] bg-white text-slate-600 border-slate-200 font-medium ml-auto">
                    {formattedDate}
                  </Badge>
                )}
              </div>

              {!date ? (
                <p className="text-[11px] text-slate-400 italic">Pilih tanggal untuk melihat ketersediaan.</p>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
                  {/* Available WIs */}
                  <div>
                    <button
                      type="button"
                      onClick={() => setShowAvailable(!showAvailable)}
                      className="w-full flex items-center justify-between px-3 py-2 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                        <span className="text-[11px] font-bold text-slate-700">Tersedia</span>
                        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px] font-bold">
                          {availableWis.length}
                        </Badge>
                      </div>
                      {showAvailable ? (
                        <ChevronUp className="h-3.5 w-3.5 text-slate-400" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                      )}
                    </button>

                    {showAvailable && (
                      <div className="max-h-[180px] overflow-y-auto">
                        {availableWis.length === 0 ? (
                          <p className="text-[10px] text-slate-400 px-3 py-2 text-center italic">
                            Tidak ada WI yang tersedia pada tanggal ini.
                          </p>
                        ) : (
                          availableWis.map(wi => {
                            const isChecked = sessionForm.wiIds.includes(wi.id);
                            return (
                              <label
                                key={wi.id}
                                className="px-3 py-2 flex items-center justify-between hover:bg-emerald-50/30 transition-colors cursor-pointer"
                              >
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => onToggleWi(wi.id, !isChecked)}
                                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5 shrink-0"
                                  />
                                  <div className="min-w-0">
                                    <p className="text-[11px] font-semibold text-slate-800 truncate">
                                      {wi.name}, {wi.gelar}
                                    </p>
                                    <p className="text-[10px] text-slate-500">
                                      Level {wi.level} &middot; {wi.jabatan.replace('WI ', '')}
                                    </p>
                                  </div>
                                </div>
                              </label>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>

                  {/* Busy WIs */}
                  <div>
                    <button
                      type="button"
                      onClick={() => setShowBusy(!showBusy)}
                      className="w-full flex items-center justify-between px-3 py-2 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 text-amber-500" />
                        <span className="text-[11px] font-bold text-slate-700">Sudah Terjadwal</span>
                        <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-[10px] font-bold">
                          {busyWis.length}
                        </Badge>
                      </div>
                      {showBusy ? (
                        <ChevronUp className="h-3.5 w-3.5 text-slate-400" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                      )}
                    </button>

                    {showBusy && (
                      <div className="max-h-[180px] overflow-y-auto">
                        {busyWis.length === 0 ? (
                          <p className="text-[10px] text-slate-400 px-3 py-2 text-center italic">
                            Belum ada WI yang terjadwal pada tanggal ini.
                          </p>
                        ) : (
                          busyWis.map(item => {
                            const isSelected = selectedWiId === item.wi.id;
                            const isChecked = sessionForm.wiIds.includes(item.wi.id);
                            return (
                              <div
                                key={item.wi.id}
                                className={`px-3 py-2 hover:bg-amber-50/30 transition-colors ${
                                  isSelected ? 'bg-blue-50/60 border-l-2 border-blue-500' : ''
                                }`}
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => onToggleWi(item.wi.id, !isChecked)}
                                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5 shrink-0"
                                    />
                                    <p className="text-[11px] font-semibold text-slate-800 truncate">
                                      {item.wi.name}, {item.wi.gelar}
                                    </p>
                                  </div>
                                  <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-[9px] font-bold ml-2 shrink-0">
                                    {item.sessions.length} sesi
                                  </Badge>
                                </div>
                                <div className="space-y-0.5 mb-1.5 ml-5">
                                  {item.sessions.slice(0, 2).map(s => (
                                    <div
                                      key={s.id}
                                      className="flex items-center gap-1 text-[10px] text-slate-600"
                                    >
                                      <Clock className="h-3 w-3 text-slate-400 shrink-0" />
                                      <span className="font-mono">
                                        {s.startTime}-{s.endTime}
                                      </span>
                                      <span className="truncate">{s.mapelName}</span>
                                    </div>
                                  ))}
                                  {item.sessions.length > 2 && (
                                    <p className="text-[10px] text-slate-400 ml-4">
                                      +{item.sessions.length - 2} sesi lainnya
                                    </p>
                                  )}
                                </div>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => onViewWiDetail(item.wi.id)}
                                  className={`text-[10px] font-bold h-6 px-2 w-full justify-center ${
                                    isSelected
                                      ? 'text-blue-700 bg-blue-100 hover:bg-blue-200'
                                      : 'text-amber-600 hover:text-amber-700 hover:bg-amber-50'
                                  }`}
                                >
                                  {isSelected ? 'Tutup Detail' : 'Lihat Detail'}
                                </Button>
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>

                  {/* Selected badges summary */}
                  {sessionForm.wiIds.length > 0 && (
                    <div className="px-3 py-2 bg-blue-50/50 border-t border-blue-100">
                      <p className="text-[10px] font-bold text-blue-800 mb-1">
                        {sessionForm.wiIds.length} pengajar ditugaskan:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {sessionForm.wiIds.map(id => {
                          const wi = filteredWisList.find(w => w.id === id);
                          if (!wi) return null;
                          const isAvailable = availableIds.has(id);
                          return (
                            <Badge
                              key={id}
                              variant="secondary"
                              className={`text-[9px] font-bold rounded ${
                                isAvailable
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                  : 'bg-amber-100 text-amber-800 border-amber-200'
                              }`}
                            >
                              {wi.name.split(' ')[0]}
                              <span className="ml-1 opacity-60">
                                {isAvailable ? '✓' : '⚠'}
                              </span>
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 8. Submit */}
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
