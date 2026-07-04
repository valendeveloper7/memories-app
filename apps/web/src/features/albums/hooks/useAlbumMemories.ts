import { useQuery } from '@tanstack/react-query';
import { memoriesApi } from '@/features/memories/api/memories.api';

/** Carga (sin paginar) los recuerdos de un álbum para el editor visual. */
export function useAlbumMemories(albumId: string) {
  return useQuery({
    queryKey: ['memories', 'album-all', albumId],
    queryFn: () => memoriesApi.list({ albumId, limit: 100 }),
    enabled: Boolean(albumId),
    select: (page) => page.items,
  });
}
