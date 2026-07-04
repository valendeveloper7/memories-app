import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { PublicAlbum } from 'shared';
import { useUpdateAlbum, useDeleteAlbum } from '../hooks/useAlbums';

/** Tarjeta de un álbum en la cuadrícula. Portada por color/imagen, con acciones
 *  rápidas de favorito y borrado. */
export function AlbumCard({ album }: { album: PublicAlbum }) {
  const navigate = useNavigate();
  const updateAlbum = useUpdateAlbum();
  const deleteAlbum = useDeleteAlbum();

  const background = album.coverUrl
    ? { backgroundImage: `url(${album.coverUrl})`, backgroundSize: 'cover' }
    : { background: album.color ?? 'linear-gradient(135deg, rgb(var(--color-accent)/0.25), rgb(var(--color-secondary)/0.25))' };

  function toggleFavorite(event: React.MouseEvent) {
    event.stopPropagation();
    updateAlbum.mutate({ id: album.id, input: { isFavorite: !album.isFavorite } });
  }

  function handleDelete(event: React.MouseEvent) {
    event.stopPropagation();
    if (window.confirm(`¿Eliminar el álbum "${album.title}"?`)) {
      deleteAlbum.mutate(album.id);
    }
  }

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      onClick={() => navigate(`/albums/${album.id}`)}
      className="group cursor-pointer overflow-hidden rounded-2xl border border-neutral-200/70 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
    >
      <div className="relative flex h-32 items-center justify-center text-4xl" style={background}>
        {album.icon && <span>{album.icon}</span>}
        <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            type="button"
            onClick={toggleFavorite}
            aria-label="Favorito"
            className="rounded-full bg-white/90 px-2 py-1 text-sm shadow dark:bg-neutral-800/90"
          >
            {album.isFavorite ? '❤️' : '🤍'}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            aria-label="Eliminar"
            className="rounded-full bg-white/90 px-2 py-1 text-sm shadow dark:bg-neutral-800/90"
          >
            🗑️
          </button>
        </div>
      </div>

      <div className="p-3">
        <h3 className="truncate font-semibold text-neutral-900 dark:text-neutral-100">
          {album.title}
        </h3>
        {album.description && (
          <p className="mt-0.5 truncate text-sm text-neutral-500 dark:text-neutral-400">
            {album.description}
          </p>
        )}
        {album.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {album.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.article>
  );
}
