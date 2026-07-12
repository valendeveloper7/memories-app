import { useState } from 'react';
import { motion } from 'framer-motion';
import { cloudinaryThumb } from '@/utils/cloudinary';
import { Button } from '@/components/ui/Button';
import { useCalendar } from '../hooks/useStats';
import { useI18n } from '@/i18n/useI18n';

/** Vista calendario: cada día muestra una miniatura de sus recuerdos, al estilo
 *  de las contribuciones de GitHub pero con fotos. */
export function CalendarPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const { data: days } = useCalendar(year, month);
  const { locale } = useI18n();

  const monthTitle = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(
    new Date(year, month - 1, 1),
  );
  // Días de la semana empezando en lunes, localizados a una letra.
  const weekdays = Array.from({ length: 7 }, (_, i) =>
    new Intl.DateTimeFormat(locale, { weekday: 'narrow' }).format(new Date(2024, 0, 1 + i)),
  );

  const byDate = new Map((days ?? []).map((d) => [d.date, d]));
  const firstDay = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  // getDay: 0=domingo; lo convertimos a lunes=0.
  const startOffset = (firstDay.getDay() + 6) % 7;

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
          <Button variant="ghost" onClick={() => shift(-1)}>
            ←
          </Button>
          <Button variant="ghost" onClick={() => shift(1)}>
            →
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
          const key = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const entry = byDate.get(key);
          return (
            <motion.div
              key={key}
              whileHover={{ scale: 1.05 }}
              className="relative flex aspect-square items-center justify-center overflow-hidden rounded-xl border border-neutral-200/70 bg-neutral-50 text-sm dark:border-neutral-800 dark:bg-neutral-900"
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
                  {entry.count > 1 && (
                    <span className="absolute bottom-1 left-1 rounded-full bg-accent px-1.5 text-[10px] font-bold text-white">
                      {entry.count}
                    </span>
                  )}
                </>
              ) : (
                <span className="text-neutral-400">{day}</span>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
