import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAlbums } from '../hooks/useAlbums';
import { AlbumCard } from '../components/AlbumCard';
import { CreateAlbumModal } from '../components/CreateAlbumModal';

export function AlbumsListPage() {
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const { data: albums, isLoading } = useAlbums(
    onlyFavorites ? { favorite: 'true' } : undefined,
  );

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Álbumes</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Vuestros recuerdos, organizados.
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)}>+ Nuevo álbum</Button>
      </div>

      <div className="mb-4 flex gap-2">
        <FilterChip active={!onlyFavorites} onClick={() => setOnlyFavorites(false)}>
          Todos
        </FilterChip>
        <FilterChip active={onlyFavorites} onClick={() => setOnlyFavorites(true)}>
          ❤️ Favoritos
        </FilterChip>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : albums && albums.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {albums.map((album) => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <EmptyState onCreate={() => setModalOpen(true)} favoritesFilter={onlyFavorites} />
      )}

      <CreateAlbumModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
        active
          ? 'bg-accent text-white'
          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300'
      }`}
    >
      {children}
    </button>
  );
}

function EmptyState({
  onCreate,
  favoritesFilter,
}: {
  onCreate: () => void;
  favoritesFilter: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-neutral-300 py-16 text-center dark:border-neutral-700">
      <span className="text-5xl">📷</span>
      <p className="mt-4 font-medium text-neutral-700 dark:text-neutral-300">
        {favoritesFilter ? 'Aún no hay álbumes favoritos' : 'Todavía no hay álbumes'}
      </p>
      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
        Crea el primero para empezar a guardar recuerdos.
      </p>
      {!favoritesFilter && (
        <Button className="mt-4" onClick={onCreate}>
          Crear álbum
        </Button>
      )}
    </div>
  );
}
