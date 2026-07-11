"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Settings } from "lucide-react";

import { CalendarProvider } from "@/calendar/contexts/calendar-context";

import { ChangeBadgeVariantInput } from "@/calendar/components/change-badge-variant-input";
import { ChangeVisibleHoursInput } from "@/calendar/components/change-visible-hours-input";
import { ChangeWorkingHoursInput } from "@/calendar/components/change-working-hours-input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

import { useWTMS } from "@/context/wtms-context";

import type { IEvent, IUser } from "@/calendar/interfaces";
import type { TEventColor } from "@/calendar/types";

export default function WidyaswaraCalendarLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { userRole, isAuthenticated, selectedWiId, widyaswaras, sessions, batches, mapelList, lokasiList } = useWTMS();

  const [events, setEvents] = useState<IEvent[]>([]);
  const [users, setUsers] = useState<IUser[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Route guard
  useEffect(() => {
    if (!isAuthenticated || userRole !== 'wi') {
      router.push('/login');
    }
  }, [isAuthenticated, userRole, router]);

  // Build events from WTMS context (no server fetch needed)
  useEffect(() => {
    const batchMap = new Map(batches.map(b => [b.id, b]));
    const mapelMap = new Map(mapelList.map(m => [m.id, m]));
    const lokasiMap = new Map(lokasiList.map(l => [l.id, l]));

    const allEvents: IEvent[] = sessions.map(s => {
      const batch = batchMap.get(s.batchId);
      const mapel = mapelMap.get(s.mapelId);
      const lok = lokasiMap.get(s.lokasiId || '');

      const resolvedWis = (s.wiIds || [])
        .map((id: string) => widyaswaras.find(w => w.id === id))
        .filter(Boolean);
      const wiNames = resolvedWis.map(w => `${w!.name}, ${w!.gelar}`).join(', ');

      let color: TEventColor = 'blue';
      if (s.format === 'Virtual') color = 'purple';
      else if (s.format === 'Asinkron') color = 'orange';

      return {
        id: s.id,
        startDate: `${s.date}T${s.startTime}:00`,
        endDate: `${s.date}T${s.endTime}:00`,
        title: `${mapel ? mapel.name : 'Subject'} (${batch ? batch.name : 'Batch'})`,
        color,
        description: `Format: ${s.format} | Pengajar: ${wiNames || 'N/A'} | JP Ke: ${s.jpKe} (${s.jpCount} JP) | Venue: ${lok ? lok.name : 'N/A'}`,
        user: {
          id: s.wiIds && s.wiIds.length > 0 ? s.wiIds[0] : 'wi-1',
          name: wiNames || 'Widyaiswara',
          picturePath: null,
        },
      };
    });

    setEvents(allEvents);

    // Build users list from WI data
    const allUsers: IUser[] = widyaswaras.map(w => ({
      id: w.id,
      name: w.gelar ? `${w.name}, ${w.gelar}` : w.name,
      picturePath: null,
    }));
    setUsers(allUsers);

    setLoaded(true);
  }, [sessions, batches, mapelList, lokasiList, widyaswaras]);

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-slate-500">Memuat jadwal...</p>
      </div>
    );
  }

  return (
    <CalendarProvider users={users} events={events}>
      <div data-onboarding="wi-calendar-view" className="mx-auto flex max-w-screen-2xl flex-col gap-4 px-4 sm:px-8 py-4">
        {children}

        <Accordion type="single" collapsible>
          <AccordionItem value="item-1" className="border-none">
            <AccordionTrigger className="flex-none gap-2 py-0 hover:no-underline">
              <div className="flex items-center gap-2">
                <Settings className="size-4" />
                <p className="text-base font-semibold">Calendar settings</p>
              </div>
            </AccordionTrigger>

            <AccordionContent>
              <div className="mt-4 flex flex-col gap-6">
                <ChangeBadgeVariantInput />
                <ChangeVisibleHoursInput />
                <ChangeWorkingHoursInput />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </CalendarProvider>
  );
}
