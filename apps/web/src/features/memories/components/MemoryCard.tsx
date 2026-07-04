import { motion } from 'framer-motion';
import type { PublicMemory } from 'shared';
import { cloudinaryThumb } from '@/utils/cloudinary';
import { useDeleteMemory, useToggleMemoryFavorite } from '../hooks/useMemories';

/** Miniatura de un recuerdo en la cuadrícula. Foto o vídeo, con acciones
 *  rápidas de favorito y borrado. */
export function MemoryCard({ memory }: { memory: PublicMemory }) {
  const deleteMemory = useDeleteMemory();
  const toggleFavorite = useToggleMemoryFavorite();

  function handleDelete() {
    if (window.confirm('¿Eliminar este recuerdo?')) deleteMemory.mutate(memory.id);
  }

  return (
    <motion.figure
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
      className="group relative overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800"
    >
      {memory.type === 'video' ? (
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
          onClick={() => toggleFavorite(memory)}
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
    </motion.figure>
  );
}
