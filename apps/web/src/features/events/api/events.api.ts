import type { CreateEventInput, PublicCalendarEvent, UpdateEventInput } from 'shared';
import { http } from '@/services/http';

export const eventsApi = {
  list: () => http.get<PublicCalendarEvent[]>('/events').then((r) => r.data),
  create: (input: CreateEventInput) =>
    http.post<PublicCalendarEvent>('/events', input).then((r) => r.data),
  update: (id: string, input: UpdateEventInput) =>
    http.patch<PublicCalendarEvent>(`/events/${id}`, input).then((r) => r.data),
  remove: (id: string) => http.delete(`/events/${id}`).then(() => undefined),
};
