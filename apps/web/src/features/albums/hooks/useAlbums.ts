import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  ListAlbumsQuery,
  PublicAlbum,
  UpdateAlbumInput,
  UpdateAlbumLayoutInput,
} from 'shared';
import { albumsApi } from '../api/albums.api';

const albumKeys = {
  all: ['albums'] as const,
  list: (query?: ListAlbumsQuery) => ['albums', 'list', query ?? {}] as const,
  detail: (id: string) => ['albums', 'detail', id] as const,
};

export function useAlbums(query?: ListAlbumsQuery) {
  return useQuery({
    queryKey: albumKeys.list(query),
    queryFn: () => albumsApi.list(query),
  });
}

export function useAlbum(id: string) {
  return useQuery({
    queryKey: albumKeys.detail(id),
    queryFn: () => albumsApi.get(id),
    enabled: Boolean(id),
  });
}

export function useCreateAlbum() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: albumsApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: albumKeys.all }),
  });
}

export function useUpdateAlbum() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateAlbumInput }) =>
      albumsApi.update(id, input),
    onSuccess: (album: PublicAlbum) => {
      queryClient.invalidateQueries({ queryKey: albumKeys.all });
      queryClient.setQueryData(albumKeys.detail(album.id), album);
    },
  });
}

export function useUpdateLayout(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateAlbumLayoutInput) => albumsApi.updateLayout(id, input),
    onSuccess: (album: PublicAlbum) =>
      queryClient.setQueryData(albumKeys.detail(album.id), album),
  });
}

export function useDeleteAlbum() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: albumsApi.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: albumKeys.all }),
  });
}
