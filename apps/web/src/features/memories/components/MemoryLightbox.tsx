import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import type { PublicMemory } from 'shared';
import { ReactionBar } from '@/features/reactions/components/ReactionBar';
import { CommentsSection } from '@/features/comments/components/CommentsSection';

/** Vista ampliada de un recuerdo: media a gran tamaño, fecha, reacciones y
 *  comentarios en un panel lateral. Cierra con Escape o clic en el fondo. */
export function MemoryLightbox({
  memory,
  onClose,
}: {
  memory: PublicMemory | null;
  onClose: () => void;
}) {
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
            className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl md:flex-row dark:bg-neutral-900"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-1 items-center justify-center bg-black">
              {memory.type === 'video' ? (
                <video src={memory.mediaUrl} controls autoPlay className="max-h-[90vh] w-full" />
              ) : (
                <img
                  src={memory.mediaUrl}
                  alt={memory.title ?? 'Recuerdo'}
                  className="max-h-[90vh] w-full object-contain"
                />
              )}
            </div>

            <aside className="flex w-full flex-col gap-4 p-5 md:w-80">
              <div>
                {memory.title && (
                  <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                    {memory.title}
                  </h2>
                )}
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  {new Date(memory.actualDate).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
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
