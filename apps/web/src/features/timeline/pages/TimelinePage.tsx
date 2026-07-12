import { useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import type { PublicMemory } from 'shared';
import { Skeleton } from '@/components/ui/Skeleton';
import { useMemories } from '@/features/memories/hooks/useMemories';
import { MemoryCard } from '@/features/memories/components/MemoryCard';
import { OnThisDayBanner } from '@/features/memories/components/OnThisDayBanner';
import { useI18n } from '@/i18n/useI18n';

/** Línea temporal vertical: recuerdos agrupados por año, con scroll infinito.
 *  Al hacer scroll se percibe el paso del tiempo (cada año es una sección). */
export function TimelinePage() {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useMemories();
  const { t } = useI18n();
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage();
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const groups = useMemo(() => {
    const memories = data?.pages.flatMap((p) => p.items) ?? [];
    const byYear = new Map<number, PublicMemory[]>();
    for (const memory of memories) {
      const year = new Date(memory.actualDate).getFullYear();
      const list = byYear.get(year) ?? [];
      list.push(memory);
      byYear.set(year, list);
    }
    return [...byYear.entries()].sort((a, b) => b[0] - a[0]);
  }, [data]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-neutral-900 dark:text-neutral-100">
        {t('timeline.title')}
      </h1>
      <OnThisDayBanner />

      {groups.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 py-12 text-center text-sm text-neutral-500 dark:border-neutral-700">
          {t('timeline.empty')}
        </div>
      ) : (
        <div className="relative border-l-2 border-neutral-200 pl-6 dark:border-neutral-800">
          {groups.map(([year, memories]) => (
            <motion.section
              key={year}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.4 }}
              className="mb-10"
            >
              <div className="absolute -left-[9px] mt-1 h-4 w-4 rounded-full border-2 border-accent bg-surface" />
              <h2 className="mb-4 text-xl font-bold text-accent">{year}</h2>
              <div className="grid auto-rows-[160px] grid-cols-2 gap-3 sm:grid-cols-4">
                {memories.map((memory) => (
                  <MemoryCard key={memory.id} memory={memory} />
                ))}
              </div>
            </motion.section>
          ))}
        </div>
      )}

      <div ref={sentinelRef} className="h-10" />
      {isFetchingNextPage && (
        <p className="py-4 text-center text-sm text-neutral-400">{t('common.loadingMore')}</p>
      )}
    </div>
  );
}
