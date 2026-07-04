import type { Id, IsoDate } from './common.js';

export type NotificationType =
  | 'memory_added'
  | 'album_shared'
  | 'comment_added'
  | 'reaction_added';

export type NotificationEntityType = 'album' | 'memory' | 'comment';

export interface PublicNotification {
  id: Id;
  type: NotificationType;
  actorId: Id;
  actorName: string;
  entityType: NotificationEntityType;
  entityId: Id;
  read: boolean;
  createdAt: IsoDate;
}

/** Nombres de los eventos de Socket.io (contrato cliente/servidor). */
export const SOCKET_EVENTS = {
  notificationNew: 'notification:new',
  memoryCreated: 'memory:created',
} as const;
