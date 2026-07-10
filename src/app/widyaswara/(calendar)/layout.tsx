import { Settings } from "lucide-react";

import { CalendarProvider } from "@/calendar/contexts/calendar-context";

import { ChangeBadgeVariantInput } from "@/calendar/components/change-badge-variant-input";
import { ChangeVisibleHoursInput } from "@/calendar/components/change-visible-hours-input";
import { ChangeWorkingHoursInput } from "@/calendar/components/change-working-hours-input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

import { getEvents, getUsers } from "@/calendar/requests";

import type { IEvent, IUser } from "@/calendar/interfaces";

export default async function Layout({ children }: { children: React.ReactNode }) {
  let events: IEvent[] = [];
  let users: IUser[] = [];

  try {
    [events, users] = await Promise.all([getEvents(), getUsers()]);
  } catch (e) {
    // Build-time: database unavailable, use empty arrays
    console.warn("[Calendar Layout] Failed to fetch events/users (expected during build):", (e as Error).message);
  }

  return (
    <CalendarProvider users={users} events={events}>
      <div className="mx-auto flex max-w-screen-2xl flex-col gap-4 px-8 py-4">
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