import type {
  CreateAlbumInput,
  ListAlbumsQuery,
  PublicAlbum,
  UpdateAlbumInput,
  UpdateAlbumLayoutInput,
} from 'shared';
import { http } from '@/services/http';

export const albumsApi = {
  list: (query?: ListAlbumsQuery) =>
    http.get<PublicAlbum[]>('/albums', { params: query }).then((r) => r.data),

  get: (id: string) => http.get<PublicAlbum>(`/albums/${id}`).then((r) => r.data),

  create: (input: CreateAlbumInput) =>
    http.post<PublicAlbum>('/albums', input).then((r) => r.data),

  update: (id: string, input: UpdateAlbumInput) =>
    http.patch<PublicAlbum>(`/albums/${id}`, input).then((r) => r.data),

  updateLayout: (id: string, input: UpdateAlbumLayoutInput) =>
    http.patch<PublicAlbum>(`/albums/${id}/layout`, input).then((r) => r.data),

  remove: (id: string) => http.delete(`/albums/${id}`).then(() => undefined),
};
