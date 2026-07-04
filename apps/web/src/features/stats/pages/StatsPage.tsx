import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import { useHeatmap, useOverview } from '../hooks/useStats';
import { ActivityHeatmap } from '../components/ActivityHeatmap';

const MONTHS = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

export function StatsPage() {
  const { data: overview, isLoading } = useOverview();
  const { data: heatmap } = useHeatmap();

  if (isLoading || !overview) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-neutral-900 dark:text-neutral-100">
        Estadísticas
      </h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatTile label="Recuerdos" value={overview.totalMemories} icon="📸" />
        <StatTile label="Fotos" value={overview.photos} icon="🖼️" />
        <StatTile label="Vídeos" value={overview.videos} icon="🎬" />
        <StatTile label="Álbumes" value={overview.albums} icon="📚" />
        <StatTile label="Años" value={overview.yearsRegistered} icon="📅" />
        {overview.daysTogether !== undefined && (
          <StatTile label="Días juntos" value={overview.daysTogether} icon="❤️" />
        )}
        {overview.favoriteMonth && (
          <StatTile label="Mes favorito" value={MONTHS[overview.favoriteMonth.month - 1]} icon="⭐" />
        )}
        {overview.topLocation && (
          <StatTile label="Lugar top" value={overview.topLocation} icon="📍" />
        )}
      </div>

      {overview.busiestDay && (
        <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">
          📈 El día con más recuerdos fue el{' '}
          <span className="font-semibold text-accent">
            {new Date(overview.busiestDay.date).toLocaleDateString('es-ES')}
          </span>{' '}
          con {overview.busiestDay.count} recuerdos.
        </p>
      )}

      {heatmap && (
        <section className="mt-8">
          <h2 className="mb-3 font-semibold text-neutral-700 dark:text-neutral-300">
            Actividad del último año
          </h2>
          <ActivityHeatmap cells={heatmap} />
        </section>
      )}
    </div>
  );
}

function StatTile({
  label,
  value,
  icon,
}: {
  label: string;
  value: ReactNode;
  icon: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-neutral-200/70 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
    >
      <span className="text-xl">{icon}</span>
      <p className="mt-2 truncate text-2xl font-bold text-neutral-900 dark:text-neutral-100">
        {value}
      </p>
      <p className="text-xs text-neutral-500 dark:text-neutral-400">{label}</p>
    </motion.div>
  );
}
