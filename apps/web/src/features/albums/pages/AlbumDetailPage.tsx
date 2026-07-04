import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { PublicAlbum, PublicMemory } from 'shared';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { cloudinaryThumb } from '@/utils/cloudinary';
import { MemoryUploader } from '@/features/memories/components/MemoryUploader';
import { MemoryGrid } from '@/features/memories/components/MemoryGrid';
import { MemoryCard } from '@/features/memories/components/MemoryCard';
import { CreateNoteModal } from '@/features/memories/components/CreateNoteModal';
import { useAlbum } from '../hooks/useAlbums';
import { useAlbumMemories } from '../hooks/useAlbumMemories';
import { AlbumEditor } from '../components/editor/AlbumEditor';

export function AlbumDetailPage() {
  const { id = '' } = useParams();
  const { data: album, isLoading } = useAlbum(id);
  const { data: memories } = useAlbumMemories(id);
  const [editing, setEditing] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);

  const layout = album?.layout ?? [];
  const hasLayout = layout.length > 0;

  // Recuerdos que aún no están colocados en el diseño (p.ej. subidos después
  // de guardar el layout). Se muestran aparte para que no queden ocultos.
  const placedIds = new Set(layout.map((item) => item.memoryId));
  const unplaced = (memories ?? []).filter((m) => !placedIds.has(m.id));

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
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setNoteOpen(true)}>
              📝 Nota
            </Button>
            {memories && memories.length > 0 && (
              <Button variant="ghost" onClick={() => setEditing(true)}>
                🎨 Editar diseño
              </Button>
            )}
          </div>
        </div>
      )}

      <div className="mb-6">
        <MemoryUploader albumId={id} />
      </div>

      {hasLayout && album && memories ? (
        <>
          <AlbumCanvasView album={album} memories={memories} />

          {unplaced.length > 0 && (
            <section className="mt-8">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                  Sin colocar en el diseño ({unplaced.length})
                </h2>
                <Button variant="ghost" onClick={() => setEditing(true)}>
                  Añadir al diseño
                </Button>
              </div>
              <div className="grid auto-rows-[160px] grid-cols-2 gap-3 sm:grid-cols-4">
                {unplaced.map((memory) => (
                  <MemoryCard key={memory.id} memory={memory} />
                ))}
              </div>
            </section>
          )}
        </>
      ) : (
        <MemoryGrid
          query={{ albumId: id }}
          emptyLabel="Sube la primera foto o vídeo a este álbum."
        />
      )}

      {editing && album && memories && (
        <AlbumEditor album={album} memories={memories} onClose={() => setEditing(false)} />
      )}

      <CreateNoteModal albumId={id} open={noteOpen} onClose={() => setNoteOpen(false)} />
    </div>
  );
}

/** Render de solo lectura del layout freeform guardado. */
function AlbumCanvasView({
  album,
  memories,
}: {
  album: PublicAlbum;
  memories: PublicMemory[];
}) {
  const memoryById = new Map(memories.map((m) => [m.id, m]));
  const layout = album.layout ?? [];
  const cols = 12;
  const maxY = layout.reduce((max, it) => Math.max(max, it.y + it.h), 6);

  return (
    <div className="relative w-full" style={{ aspectRatio: `${cols} / ${maxY}` }}>
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
            {memory.type === 'text' ? (
              <div className="flex h-full w-full flex-col justify-center bg-gradient-to-br from-accent/15 to-secondary/15 p-3">
                {memory.title && (
                  <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                    {memory.title}
                  </p>
                )}
                <p className="line-clamp-5 text-sm text-neutral-600 dark:text-neutral-300">
                  {memory.description}
                </p>
              </div>
            ) : memory.type === 'video' ? (
              <video src={memory.mediaUrl} className="h-full w-full object-cover" muted />
            ) : (
              <img
                src={cloudinaryThumb(memory.mediaUrl, 600)}
                alt={memory.title ?? ''}
                className="h-full w-full object-cover"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
