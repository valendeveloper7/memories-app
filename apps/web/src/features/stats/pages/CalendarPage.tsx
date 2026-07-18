import { useState } from 'react';
import { motion } from 'framer-motion';
import type { PublicCalendarEvent } from 'shared';
import { cloudinaryThumb } from '@/utils/cloudinary';
import { Button } from '@/components/ui/Button';
import { useI18n } from '@/i18n/useI18n';
import { useCalendar } from '../hooks/useStats';
import { useDeleteEvent, useEvents } from '@/features/events/hooks/useEvents';
import { eventsForDay } from '@/features/events/utils/recurrence';
import { CreateEventModal } from '@/features/events/components/CreateEventModal';

/** Vista calendario: cada día muestra miniaturas de recuerdos y puntos de color
 *  de los eventos/fechas importantes. Al pulsar un día se ven sus eventos. */
export function CalendarPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState<Date>(today);
  const [modalOpen, setModalOpen] = useState(false);
  const { data: days } = useCalendar(year, month);
  const { data: events } = useEvents();
  const deleteEvent = useDeleteEvent();
  const { locale, t } = useI18n();

  const monthTitle = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(
    new Date(year, month - 1, 1),
  );
  const weekdays = Array.from({ length: 7 }, (_, i) =>
    new Intl.DateTimeFormat(locale, { weekday: 'narrow' }).format(new Date(2024, 0, 1 + i)),
  );

  const byDate = new Map((days ?? []).map((d) => [d.date, d]));
  const allEvents = events ?? [];
  const firstDay = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  const startOffset = (firstDay.getDay() + 6) % 7;

  const selectedEvents = eventsForDay(allEvents, selectedDay);

  function shift(delta: number) {
    const d = new Date(year, month - 1 + delta, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth() + 1);
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold capitalize text-neutral-900 dark:text-neutral-100">
          {monthTitle}
        </h1>
        <div className="flex gap-2">
          <Button onClick={() => setModalOpen(true)}>{t('calendar.addEvent')}</Button>
          <Button variant="ghost" onClick={() => shift(-1)}>
            {t('calendar.prev')}
          </Button>
          <Button variant="ghost" onClick={() => shift(1)}>
            {t('calendar.next')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {weekdays.map((d, i) => (
          <div key={i} className="text-center text-xs font-medium uppercase text-neutral-400">
            {d}
          </div>
        ))}
        {Array.from({ length: startOffset }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const cellDate = new Date(year, month - 1, day);
          const key = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const entry = byDate.get(key);
          const dayEvents = eventsForDay(allEvents, cellDate);
          const isSelected =
            selectedDay.getFullYear() === year &&
            selectedDay.getMonth() === month - 1 &&
            selectedDay.getDate() === day;

          return (
            <motion.button
              key={key}
              type="button"
              whileHover={{ scale: 1.05 }}
              onClick={() => setSelectedDay(cellDate)}
              className={`relative flex aspect-square items-center justify-center overflow-hidden rounded-xl border bg-neutral-50 text-sm dark:bg-neutral-900 ${
                isSelected
                  ? 'border-accent ring-2 ring-accent/40'
                  : 'border-neutral-200/70 dark:border-neutral-800'
              }`}
            >
              {entry?.thumbnailUrl ? (
                <>
                  <img
                    src={cloudinaryThumb(entry.thumbnailUrl, 150)}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <span className="absolute right-1 top-1 rounded bg-black/50 px-1 text-[10px] font-bold text-white">
                    {day}
                  </span>
                </>
              ) : (
                <span className="text-neutral-500 dark:text-neutral-400">{day}</span>
              )}

              {dayEvents.length > 0 && (
                <span className="absolute bottom-1 left-1/2 flex -translate-x-1/2 gap-0.5">
                  {dayEvents.slice(0, 3).map((ev) => (
                    <span
                      key={ev.id}
                      className="h-1.5 w-1.5 rounded-full ring-1 ring-white/70"
                      style={{ backgroundColor: ev.color }}
                    />
                  ))}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      <SelectedDayPanel
        date={selectedDay}
        events={selectedEvents}
        locale={locale}
        emptyLabel={t('calendar.noEvents')}
        title={t('calendar.eventsOn', {
          date: selectedDay.toLocaleDateString(locale, { day: 'numeric', month: 'long' }),
        })}
        onDelete={(id) => {
          if (window.confirm(t('event.deleteConfirm'))) deleteEvent.mutate(id);
        }}
      />

      <CreateEventModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultDate={selectedDay}
      />
    </div>
  );
}

function SelectedDayPanel({
  date,
  events,
  title,
  emptyLabel,
  onDelete,
}: {
  date: Date;
  events: PublicCalendarEvent[];
  locale: string;
  title: string;
  emptyLabel: string;
  onDelete: (id: string) => void;
}) {
  return (
    <section className="mt-6 rounded-2xl border border-neutral-200/70 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
      <h2 className="mb-3 text-sm font-semibold capitalize text-neutral-700 dark:text-neutral-300">
        {title}
      </h2>
      {events.length === 0 ? (
        <p className="text-sm text-neutral-400">{emptyLabel}</p>
      ) : (
        <ul className="space-y-2">
          {events.map((ev) => (
            <li key={ev.id} className="group flex items-center gap-3">
              <span
                className="h-3 w-3 shrink-0 rounded-full"
                style={{ backgroundColor: ev.color }}
              />
              <span className="flex-1 text-sm text-neutral-700 dark:text-neutral-200">
                {ev.title}
              </span>
              <button
                type="button"
                onClick={() => onDelete(ev.id)}
                aria-label="Eliminar evento"
                className="text-xs text-neutral-400 opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100"
              >
                🗑️
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
