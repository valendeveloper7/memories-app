import { Link, useParams } from 'react-router-dom';
import { Skeleton } from '@/components/ui/Skeleton';
import { MemoryUploader } from '@/features/memories/components/MemoryUploader';
import { MemoryGrid } from '@/features/memories/components/MemoryGrid';
import { useAlbum } from '../hooks/useAlbums';

export function AlbumDetailPage() {
  const { id = '' } = useParams();
  const { data: album, isLoading } = useAlbum(id);

  return (
    <div>
      <Link
        to="/"
        className="mb-4 inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-accent dark:text-neutral-400"
      >
        ← Álbumes
      </Link>

      {isLoading ? (
        <Skeleton className="mb-6 h-10 w-64" />
      ) : (
        <div className="mb-6 flex items-center gap-3">
          {album?.icon && <span className="text-3xl">{album.icon}</span>}
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {album?.title}
            </h1>
            {album?.description && (
              <p className="text-sm text-neutral-500 dark:text-neutral-400">{album.description}</p>
            )}
          </div>
        </div>
      )}

      <div className="mb-6">
        <MemoryUploader albumId={id} />
      </div>

      <MemoryGrid query={{ albumId: id }} emptyLabel="Sube la primera foto o vídeo a este álbum." />
    </div>
  );
}
