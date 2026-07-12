import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import { useHeatmap, useOverview } from '../hooks/useStats';
import { ActivityHeatmap } from '../components/ActivityHeatmap';
import { useI18n } from '@/i18n/useI18n';

export function StatsPage() {
  const { data: overview, isLoading } = useOverview();
  const { data: heatmap } = useHeatmap();
  const { t, locale } = useI18n();
  const monthName = (month: number) =>
    new Intl.DateTimeFormat(locale, { month: 'long' }).format(new Date(2000, month - 1, 1));

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
        {t('stats.title')}
      </h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatTile label={t('stats.memories')} value={overview.totalMemories} icon="📸" />
        <StatTile label={t('stats.photos')} value={overview.photos} icon="🖼️" />
        <StatTile label={t('stats.videos')} value={overview.videos} icon="🎬" />
        <StatTile label={t('stats.albums')} value={overview.albums} icon="📚" />
        <StatTile label={t('stats.years')} value={overview.yearsRegistered} icon="📅" />
        {overview.daysTogether !== undefined && (
          <StatTile label={t('stats.daysTogether')} value={overview.daysTogether} icon="❤️" />
        )}
        {overview.favoriteMonth && (
          <StatTile
            label={t('stats.favMonth')}
            value={monthName(overview.favoriteMonth.month)}
            icon="⭐"
          />
        )}
        {overview.topLocation && (
          <StatTile label={t('stats.topPlace')} value={overview.topLocation} icon="📍" />
        )}
      </div>

      {overview.busiestDay && (
        <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">
          {t('stats.busiestDay', {
            date: new Date(overview.busiestDay.date).toLocaleDateString(locale),
            count: overview.busiestDay.count,
          })}
        </p>
      )}

      {heatmap && (
        <section className="mt-8">
          <h2 className="mb-3 font-semibold text-neutral-700 dark:text-neutral-300">
            {t('stats.activityLastYear')}
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
