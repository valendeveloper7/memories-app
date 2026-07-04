import type { CreateSpaceInput, JoinSpaceInput, PublicSpace } from 'shared';
import { http } from '@/services/http';

export const spacesApi = {
  getMine: () => http.get<PublicSpace | null>('/spaces/me').then((r) => r.data),

  create: (input: CreateSpaceInput) =>
    http.post<PublicSpace>('/spaces', input).then((r) => r.data),

  join: (input: JoinSpaceInput) =>
    http.post<PublicSpace>('/spaces/join', input).then((r) => r.data),
};
