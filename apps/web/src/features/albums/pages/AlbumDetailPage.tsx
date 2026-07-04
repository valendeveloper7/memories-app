import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { MemoryUploader } from '@/features/memories/components/MemoryUploader';
import { MemoryGrid } from '@/features/memories/components/MemoryGrid';
import { useAlbum } from '../hooks/useAlbums';
import { useAlbumMemories } from '../hooks/useAlbumMemories';
import { AlbumEditor } from '../components/editor/AlbumEditor';

export function AlbumDetailPage() {
  const { id = '' } = useParams();
  const { data: album, isLoading } = useAlbum(id);
  const { data: memories } = useAlbumMemories(id);
  const [editing, setEditing] = useState(false);

  const hasLayout = (album?.layout?.length ?? 0) > 0;

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
        <div className="mb-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {album?.icon && <span className="text-3xl">{album.icon}</span>}
            <div>
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {album?.title}
              </h1>
              {album?.description && (
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  {album.description}
                </p>
              )}
            </div>
          </div>
          {memories && memories.length > 0 && (
            <Button variant="ghost" onClick={() => setEditing(true)}>
              🎨 Editar diseño
            </Button>
          )}
        </div>
      )}

      <div className="mb-6">
        <MemoryUploader albumId={id} />
      </div>

      {hasLayout && album && memories ? (
        <AlbumCanvasView album={album} memories={memories} />
      ) : (
        <MemoryGrid
          query={{ albumId: id }}
          emptyLabel="Sube la primera foto o vídeo a este álbum."
        />
      )}

      {editing && album && memories && (
        <AlbumEditor album={album} memories={memories} onClose={() => setEditing(false)} />
      )}
    </div>
  );
}

/** Render de solo lectura del layout freeform guardado. */
function AlbumCanvasView({
  album,
  memories,
}: {
  album: import('shared').PublicAlbum;
  memories: import('shared').PublicMemory[];
}) {
  const memoryById = new Map(memories.map((m) => [m.id, m]));
  const layout = album.layout ?? [];
  const cols = 12;
  const maxY = layout.reduce((max, it) => Math.max(max, it.y + it.h), 6);

  return (
    <div
      className="relative w-full"
      style={{ aspectRatio: `${cols} / ${maxY}` }}
    >
      {layout.map((item) => {
        const memory = memoryById.get(item.memoryId);
        if (!memory) return null;
        return (
          <div
            key={item.memoryId}
            style={{
              left: `${(item.x / cols) * 100}%`,
              top: `${(item.y / maxY) * 100}%`,
              width: `${(item.w / cols) * 100}%`,
              height: `${(item.h / maxY) * 100}%`,
              transform: `rotate(${item.rotation}deg)`,
              zIndex: item.zIndex,
              borderRadius: item.borderRadius ?? 12,
            }}
            className="absolute overflow-hidden shadow-md"
          >
            <img
              src={memory.mediaUrl}
              alt={memory.title ?? ''}
              className="h-full w-full object-cover"
            />
          </div>
        );
      })}
    </div>
  );
}
