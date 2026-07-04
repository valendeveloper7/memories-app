import type { PublicNotification } from 'shared';
import { http } from '@/services/http';

export const notificationsApi = {
  list: () => http.get<PublicNotification[]>('/notifications').then((r) => r.data),
  readOne: (id: string) => http.patch(`/notifications/${id}/read`).then(() => undefined),
  readAll: () => http.patch('/notifications/read-all').then(() => undefined),
};
