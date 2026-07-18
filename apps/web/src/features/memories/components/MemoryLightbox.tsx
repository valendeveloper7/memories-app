import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import type { PublicMemory } from 'shared';
import { ReactionBar } from '@/features/reactions/components/ReactionBar';
import { CommentsSection } from '@/features/comments/components/CommentsSection';
import { useI18n } from '@/i18n/useI18n';
import { useUpdateMemory } from '../hooks/useMemories';

/** Vista ampliada de un recuerdo: media a gran tamaño, fecha, reacciones y
 *  comentarios en un panel lateral. Cierra con Escape o clic en el fondo. */
export function MemoryLightbox({
  memory,
  onClose,
}: {
  memory: PublicMemory | null;
  onClose: () => void;
}) {
  const { locale, t } = useI18n();
  const updateMemory = useUpdateMemory();

  useEffect(() => {
    if (!memory) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [memory, onClose]);

  return (
    <AnimatePresence>
      {memory && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-y-auto rounded-2xl bg-white shadow-2xl md:flex-row md:overflow-hidden dark:bg-neutral-900"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex shrink-0 items-center justify-center bg-black md:flex-1">
              {memory.type === 'video' ? (
                <video
                  src={memory.mediaUrl}
                  controls
                  autoPlay
                  className="max-h-[45vh] w-full md:max-h-[92vh]"
                />
              ) : (
                <img
                  src={memory.mediaUrl}
                  alt={memory.title ?? 'Recuerdo'}
                  className="max-h-[45vh] w-full object-contain md:max-h-[92vh]"
                />
              )}
            </div>

            <aside className="flex w-full shrink-0 flex-col gap-4 p-5 md:w-80">
              <div>
                {memory.title && (
                  <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                    {memory.title}
                  </h2>
                )}
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  {new Date(memory.actualDate).toLocaleDateString(locale, {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
                <label className="mt-2 flex items-center gap-2 text-xs text-neutral-400">
                  {t('memory.date')}
                  <input
                    type="date"
                    defaultValue={memory.actualDate.slice(0, 10)}
                    onChange={(e) => {
                      if (!e.target.value) return;
                      updateMemory.mutate({
                        id: memory.id,
                        input: { actualDate: new Date(`${e.target.value}T12:00:00`).toISOString() },
                      });
                    }}
                    className="rounded-lg border border-neutral-200 bg-white px-2 py-1 text-xs dark:border-neutral-700 dark:bg-neutral-900"
                  />
                </label>
                {memory.description && (
                  <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
                    {memory.description}
                  </p>
                )}
              </div>

              <ReactionBar targetType="memory" targetId={memory.id} />

              <div className="min-h-0 flex-1 border-t border-neutral-200 pt-4 dark:border-neutral-800">
                <CommentsSection targetType="memory" targetId={memory.id} />
              </div>
            </aside>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
