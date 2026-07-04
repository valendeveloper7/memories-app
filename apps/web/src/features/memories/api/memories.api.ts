import type {
  CreateMemoryInput,
  CursorPage,
  ListMemoriesQuery,
  PublicMemory,
  UpdateMemoryInput,
  UploadSignatureInput,
  UploadSignatureResponse,
} from 'shared';
import { http } from '@/services/http';

export const memoriesApi = {
  list: (query?: ListMemoriesQuery) =>
    http.get<CursorPage<PublicMemory>>('/memories', { params: query }).then((r) => r.data),

  onThisDay: () => http.get<PublicMemory[]>('/memories/on-this-day').then((r) => r.data),

  get: (id: string) => http.get<PublicMemory>(`/memories/${id}`).then((r) => r.data),

  create: (input: CreateMemoryInput) =>
    http.post<PublicMemory>('/memories', input).then((r) => r.data),

  update: (id: string, input: UpdateMemoryInput) =>
    http.patch<PublicMemory>(`/memories/${id}`, input).then((r) => r.data),

  remove: (id: string) => http.delete(`/memories/${id}`).then(() => undefined),

  getUploadSignature: (input: UploadSignatureInput) =>
    http.post<UploadSignatureResponse>('/uploads/signature', input).then((r) => r.data),
};
