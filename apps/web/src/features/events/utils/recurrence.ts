import type { PublicCalendarEvent } from 'shared';

/** Compara solo año-mes-día (ignora la hora). */
function atMidnight(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

/** Indica si un evento (según su recurrencia) ocurre en un día concreto.
 *  Las recurrencias empiezan a contar desde la fecha del evento. */
export function eventOccursOn(event: PublicCalendarEvent, day: Date): boolean {
  const start = new Date(event.date);
  const startMs = atMidnight(start);
  const dayMs = atMidnight(day);

  switch (event.recurrence) {
    case 'none':
      return startMs === dayMs;
    case 'weekly':
      return dayMs >= startMs && start.getDay() === day.getDay();
    case 'monthly':
      return dayMs >= startMs && start.getDate() === day.getDate();
    case 'yearly':
      return (
        dayMs >= startMs &&
        start.getMonth() === day.getMonth() &&
        start.getDate() === day.getDate()
      );
    default:
      return false;
  }
}

/** Eventos que ocurren en un día concreto. */
export function eventsForDay(
  events: PublicCalendarEvent[],
  day: Date,
): PublicCalendarEvent[] {
  return events.filter((event) => eventOccursOn(event, day));
}
