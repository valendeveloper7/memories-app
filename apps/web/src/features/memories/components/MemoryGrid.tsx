import { useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import type { ListMemoriesQuery } from 'shared';
import { Skeleton } from '@/components/ui/Skeleton';
import { useMemories } from '../hooks/useMemories';
import { MemoryCard } from './MemoryCard';
import { useI18n } from '@/i18n/useI18n';

/** Cuadrícula de recuerdos con scroll infinito (cursor). Un observador al final
 *  dispara la carga de la siguiente página. */
export function MemoryGrid({
  query,
  emptyLabel,
}: {
  query?: Omit<ListMemoriesQuery, 'cursor'>;
  emptyLabel?: string;
}) {
  const { t } = useI18n();
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useMemories(query);
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

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square" />
        ))}
      </div>
    );
  }

  const memories = data?.pages.flatMap((page) => page.items) ?? [];

  if (memories.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-neutral-300 py-12 text-center text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
        {emptyLabel ?? t('memory.emptyGrid')}
      </div>
    );
  }

  return (
    <>
      <div className="grid auto-rows-[180px] grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <AnimatePresence mode="popLayout">
          {memories.map((memory) => (
            <MemoryCard key={memory.id} memory={memory} />
          ))}
        </AnimatePresence>
      </div>
      <div ref={sentinelRef} className="h-10" />
      {isFetchingNextPage && (
        <p className="py-4 text-center text-sm text-neutral-400">{t('common.loadingMore')}</p>
      )}
    </>
  );
}
