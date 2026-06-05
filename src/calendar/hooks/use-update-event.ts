import { useCalendar } from "@/calendar/contexts/calendar-context";
import { toast } from "sonner";

export function useUpdateEvent() {
  const { setLocalEvents } = useCalendar();

  const updateEvent = async (event: any) => {
    try {
      // Parse date and times from ISO strings
      const startObj = new Date(event.startDate);
      const endObj = new Date(event.endDate);

      const formatDate = (d: Date) => d.toISOString().split('T')[0];
      const formatTime = (d: Date) => d.toTimeString().split(' ')[0].substring(0, 5);

      // Fetch original session to preserve other fields
      const resSessions = await fetch('/api/sessions').then(r => r.ok ? r.json() : []);
      const originalSession = resSessions.find((s: any) => s.id === event.id);

      if (!originalSession) {
        toast.error("Original session not found.");
        return;
      }

      const updatedPayload = {
        ...originalSession,
        wiId: event.user.id,
        date: formatDate(startObj),
        startTime: formatTime(startObj),
        endTime: formatTime(endObj),
      };

      const res = await fetch('/api/sessions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPayload)
      });

      if (res.ok) {
        setLocalEvents(prev => {
          const index = prev.findIndex(e => e.id === event.id);
          if (index === -1) return prev;
          return [...prev.slice(0, index), event, ...prev.slice(index + 1)];
        });
        toast.success("Session updated successfully in database!");
      } else {
        const errData = await res.json();
        toast.error(errData.error || "Failed to update session.");
      }
    } catch (error) {
      console.error("Error updating session:", error);
      toast.error("Network error updating session.");
    }
  };

  return { updateEvent };
}