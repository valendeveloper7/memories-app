import type { Id, IsoDate } from './common.js';

export type CalendarEventType = 'birthday' | 'special' | 'other';
export type EventRecurrence = 'none' | 'weekly' | 'monthly' | 'yearly';

/** Color por defecto según el tipo de evento (el usuario puede cambiarlo). */
export const EVENT_TYPE_COLORS: Record<CalendarEventType, string> = {
  birthday: '#e26d8a',
  special: '#6d7de2',
  other: '#5aa9a3',
};

export interface PublicCalendarEvent {
  id: Id;
  spaceId: Id;
  title: string;
  type: CalendarEventType;
  color: string;
  date: IsoDate;
  recurrence: EventRecurrence;
  createdBy: Id;
  createdAt: IsoDate;
}
