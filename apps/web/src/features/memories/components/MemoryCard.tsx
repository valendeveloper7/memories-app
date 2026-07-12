import { useState } from 'react';
import { motion } from 'framer-motion';
import type { PublicMemory } from 'shared';
import { cloudinaryThumb } from '@/utils/cloudinary';
import { useDeleteMemory, useToggleMemoryFavorite } from '../hooks/useMemories';
import { MemoryLightbox } from './MemoryLightbox';
import { useI18n } from '@/i18n/useI18n';

/** Miniatura de un recuerdo en la cuadrícula. Foto o vídeo, con acciones
 *  rápidas de favorito y borrado. Al hacer clic abre el lightbox. */
export function MemoryCard({ memory }: { memory: PublicMemory }) {
  const deleteMemory = useDeleteMemory();
  const toggleFavorite = useToggleMemoryFavorite();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  function handleDelete(event: React.MouseEvent) {
    event.stopPropagation();
    if (window.confirm(t('memory.deleteConfirm'))) deleteMemory.mutate(memory.id);
  }

  function handleFavorite(event: React.MouseEvent) {
    event.stopPropagation();
    toggleFavorite(memory);
  }

  return (
    <motion.figure
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
      onClick={() => setOpen(true)}
      className="group relative cursor-pointer overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800"
    >
      {memory.type === 'text' ? (
        <div className="flex h-full w-full flex-col justify-center bg-gradient-to-br from-accent/15 to-secondary/15 p-4">
          {memory.title && (
            <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
              {memory.title}
            </p>
          )}
          <p className="mt-1 line-clamp-4 text-sm text-neutral-600 dark:text-neutral-300">
            {memory.description}
          </p>
        </div>
      ) : memory.type === 'video' ? (
        <video
          src={memory.mediaUrl}
          className="h-full w-full object-cover"
          muted
          loop
          playsInline
          onMouseEnter={(e) => e.currentTarget.play()}
          onMouseLeave={(e) => e.currentTarget.pause()}
        />
      ) : (
        <img
          src={cloudinaryThumb(memory.mediaUrl, 500)}
          alt={memory.title ?? 'Recuerdo'}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      )}

      <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          type="button"
          onClick={handleFavorite}
          aria-label="Favorito"
          className="rounded-full bg-black/40 px-2 py-1 text-sm backdrop-blur"
        >
          {memory.isFavorite ? '❤️' : '🤍'}
        </button>
        <button
          type="button"
          onClick={handleDelete}
          aria-label="Eliminar"
          className="rounded-full bg-black/40 px-2 py-1 text-sm backdrop-blur"
        >
          🗑️
        </button>
      </div>

      {memory.title && (
        <figcaption className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/60 to-transparent p-2 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
          {memory.title}
        </figcaption>
      )}

      {open && <MemoryLightbox memory={memory} onClose={() => setOpen(false)} />}
    </motion.figure>
  );
}
