import { useMemo } from 'react';
import type { HeatmapCell } from 'shared';

const DAY_MS = 24 * 60 * 60 * 1000;

function colorFor(count: number): string {
  if (count === 0) return 'bg-neutral-200/60 dark:bg-neutral-800';
  if (count < 2) return 'bg-accent/30';
  if (count < 4) return 'bg-accent/55';
  if (count < 7) return 'bg-accent/75';
  return 'bg-accent';
}

/** Mapa de calor de actividad del último año (columnas = semanas). */
export function ActivityHeatmap({ cells }: { cells: HeatmapCell[] }) {
  const weeks = useMemo(() => {
    const counts = new Map(cells.map((c) => [c.date, c.count]));
    const days: { date: string; count: number }[] = [];
    const start = new Date(Date.now() - 364 * DAY_MS);
    for (let i = 0; i < 365; i += 1) {
      const d = new Date(start.getTime() + i * DAY_MS);
      const key = d.toISOString().slice(0, 10);
      days.push({ date: key, count: counts.get(key) ?? 0 });
    }
    const grouped: (typeof days)[] = [];
    for (let i = 0; i < days.length; i += 7) grouped.push(days.slice(i, i + 7));
    return grouped;
  }, [cells]);

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-1">
        {weeks.map((week, i) => (
          <div key={i} className="flex flex-col gap-1">
            {week.map((day) => (
              <div
                key={day.date}
                title={`${day.date}: ${day.count} recuerdo(s)`}
                className={`h-3 w-3 rounded-sm ${colorFor(day.count)}`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
