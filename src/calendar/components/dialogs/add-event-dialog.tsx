"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { useCalendar } from "@/calendar/contexts/calendar-context";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SingleDayPicker } from "@/components/ui/single-day-picker";
import { Textarea } from "@/components/ui/textarea";
import { TimeInput } from "@/components/ui/time-input";

import { eventSchema } from "@/calendar/schemas";

import type { TEventFormData } from "@/calendar/schemas";
import type { TimeValue } from "react-aria-components";
import { useDisclosure } from "@/hooks/use-disclosure";

interface IProps {
  children: React.ReactNode;
  startDate?: Date;
  startTime?: { hour: number; minute: number };
}

export function AddEventDialog({ children, startDate, startTime }: IProps) {
  const { users, setLocalEvents } = useCalendar();
  const { isOpen, onClose, onToggle } = useDisclosure();

  const [batches, setBatches] = useState<any[]>([]);
  const [mapels, setMapels] = useState<any[]>([]);
  const [lokasis, setLokasis] = useState<any[]>([]);

  // Fetch master data for dropdowns
  useEffect(() => {
    if (isOpen) {
      Promise.all([
        fetch('/api/batches').then(r => r.ok ? r.json() : []),
        fetch('/api/mata-pelatihan').then(r => r.ok ? r.json() : []),
        fetch('/api/lokasi').then(r => r.ok ? r.json() : [])
      ]).then(([b, m, l]) => {
        setBatches(b);
        setMapels(m);
        setLokasis(l);
      }).catch(err => console.error("Error loading master data:", err));
    }
  }, [isOpen]);

  const form = useForm<TEventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      description: "",
      startDate: typeof startDate !== "undefined" ? startDate : undefined,
      startTime: typeof startTime !== "undefined" ? startTime : undefined,
    },
  });

  const onSubmit = async (values: TEventFormData) => {
    try {
      const user = users.find(u => u.id === values.user);
      if (!user) {
        toast.error("Please select a responsible Widyaiswara.");
        return;
      }

      // Find matching batch and mapel based on title or selection
      const defaultBatch = batches[0];
      const defaultMapel = mapels[0];
      const defaultLokasi = lokasis[0];

      if (!defaultBatch || !defaultMapel) {
        toast.error("Missing master data (Batch or Subject) to create session.");
        return;
      }

      const formatDate = (d: Date) => d.toISOString().split('T')[0];
      const formatTime = (hour: number, minute: number) => 
        `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

      const startDateTime = new Date(values.startDate);
      startDateTime.setHours(values.startTime.hour, values.startTime.minute);

      const endDateTime = new Date(values.endDate);
      endDateTime.setHours(values.endTime.hour, values.endTime.minute);

      const sessionPayload = {
        id: `sess-${Date.now()}`,
        batchId: defaultBatch.id,
        mapelId: defaultMapel.id,
        wiId: values.user,
        date: formatDate(values.startDate),
        startTime: formatTime(values.startTime.hour, values.startTime.minute),
        endTime: formatTime(values.endTime.hour, values.endTime.minute),
        format: 'Klasikal',
        lokasiId: defaultLokasi?.id,
        jpKe: '1-2',
        jpCount: 2
      };

      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionPayload)
      });

      if (res.ok) {
        toast.success("Session successfully scheduled in database!");
        
        // Update local state
        const newEvent = {
          id: sessionPayload.id,
          startDate: startDateTime.toISOString(),
          endDate: endDateTime.toISOString(),
          title: `${values.title} (${defaultBatch.name})`,
          color: values.color,
          description: values.description,
          user: user
        };

        setLocalEvents(prev => [...prev, newEvent]);
        onClose();
        form.reset();
      } else {
        const errData = await res.json();
        toast.error(errData.error || "Failed to save session.");
      }
    } catch (error) {
      console.error("Error creating session:", error);
      toast.error("Network error creating session.");
    }
  };

  useEffect(() => {
    form.reset({
      startDate,
      startTime,
    });
  }, [startDate, startTime, form]);

  return (
    <Dialog open={isOpen} onOpenChange={onToggle}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Event</DialogTitle>
          <DialogDescription>
            Create a new training session mapped directly to the database.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form id="event-form" onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
            <FormField
              control={form.control}
              name="user"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Responsible Widyaiswara</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger data-invalid={fieldState.invalid}>
                        <SelectValue placeholder="Select an option" />
                      </SelectTrigger>

                      <SelectContent>
                        {users.map(user => (
                          <SelectItem key={user.id} value={user.id} className="flex-1">
                            <div className="flex items-center gap-2">
                              <Avatar key={user.id} className="size-6">
                                <AvatarImage src={user.picturePath ?? undefined} alt={user.name} />
                                <AvatarFallback className="text-xxs">{user.name[0]}</AvatarFallback>
                              </Avatar>

                              <p className="truncate">{user.name}</p>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel htmlFor="title">Title / Subject Name</FormLabel>

                  <FormControl>
                    <Input id="title" placeholder="Enter a title" data-invalid={fieldState.invalid} {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-start gap-2">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field, fieldState }) => (
                  <FormItem className="flex-1">
                    <FormLabel htmlFor="startDate">Start Date</FormLabel>

                    <FormControl>
                      <SingleDayPicker
                        id="startDate"
                        value={field.value}
                        onSelect={date => field.onChange(date as Date)}
                        placeholder="Select a date"
                        data-invalid={fieldState.invalid}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="startTime"
                render={({ field, fieldState }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Start Time</FormLabel>

                    <FormControl>
                      <TimeInput value={field.value as TimeValue} onChange={field.onChange} hourCycle={12} data-invalid={fieldState.invalid} />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex items-start gap-2">
              <FormField
                control={form.control}
                name="endDate"
                render={({ field, fieldState }) => (
                  <FormItem className="flex-1">
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <SingleDayPicker
                        value={field.value}
                        onSelect={date => field.onChange(date as Date)}
                        placeholder="Select a date"
                        data-invalid={fieldState.invalid}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endTime"
                render={({ field, fieldState }) => (
                  <FormItem className="flex-1">
                    <FormLabel>End Time</FormLabel>
                    <FormControl>
                      <TimeInput value={field.value as TimeValue} onChange={field.onChange} hourCycle={12} data-invalid={fieldState.invalid} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="color"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Color / Format Indicator</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger data-invalid={fieldState.invalid}>
                        <SelectValue placeholder="Select an option" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="blue">
                          <div className="flex items-center gap-2">
                            <div className="size-3.5 rounded-full bg-blue-600" />
                            Blue (Klasikal)
                          </div>
                        </SelectItem>

                        <SelectItem value="purple">
                          <div className="flex items-center gap-2">
                            <div className="size-3.5 rounded-full bg-purple-600" />
                            Purple (Virtual)
                          </div>
                        </SelectItem>

                        <SelectItem value="orange">
                          <div className="flex items-center gap-2">
                            <div className="size-3.5 rounded-full bg-orange-600" />
                            Orange (Asinkron)
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Description / Notes</FormLabel>

                  <FormControl>
                    <Textarea {...field} value={field.value} data-invalid={fieldState.invalid} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>

          <Button form="event-form" type="submit">
            Create Event
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}