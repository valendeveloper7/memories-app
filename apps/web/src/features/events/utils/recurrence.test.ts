import { describe, it, expect } from 'vitest';
import type { PublicCalendarEvent } from 'shared';
import { eventOccursOn } from './recurrence';

function makeEvent(date: string, recurrence: PublicCalendarEvent['recurrence']): PublicCalendarEvent {
  return {
    id: '1',
    spaceId: 's',
    title: 'Test',
    type: 'special',
    color: '#000000',
    date: new Date(`${date}T12:00:00`).toISOString(),
    recurrence,
    createdBy: 'u',
    createdAt: new Date().toISOString(),
  };
}

const day = (d: string) => new Date(`${d}T12:00:00`);

describe('eventOccursOn', () => {
  it('none: solo el día exacto', () => {
    const ev = makeEvent('2025-06-15', 'none');
    expect(eventOccursOn(ev, day('2025-06-15'))).toBe(true);
    expect(eventOccursOn(ev, day('2025-07-15'))).toBe(false);
  });

  it('yearly: mismo mes y día en años posteriores, no antes', () => {
    const ev = makeEvent('2020-12-25', 'yearly');
    expect(eventOccursOn(ev, day('2025-12-25'))).toBe(true);
    expect(eventOccursOn(ev, day('2025-12-26'))).toBe(false);
    expect(eventOccursOn(ev, day('2019-12-25'))).toBe(false); // antes del inicio
  });

  it('monthly: mismo día de cada mes desde el inicio', () => {
    const ev = makeEvent('2025-03-10', 'monthly');
    expect(eventOccursOn(ev, day('2025-04-10'))).toBe(true);
    expect(eventOccursOn(ev, day('2025-04-11'))).toBe(false);
    expect(eventOccursOn(ev, day('2025-02-10'))).toBe(false); // antes del inicio
  });

  it('weekly: mismo día de la semana desde el inicio', () => {
    const ev = makeEvent('2025-06-02', 'weekly'); // lunes
    expect(eventOccursOn(ev, day('2025-06-09'))).toBe(true); // lunes siguiente
    expect(eventOccursOn(ev, day('2025-06-10'))).toBe(false); // martes
    expect(eventOccursOn(ev, day('2025-05-26'))).toBe(false); // lunes anterior al inicio
  });
});
