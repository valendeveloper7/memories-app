import { Types } from 'mongoose';
import {
  SOCKET_EVENTS,
  type NotificationEntityType,
  type NotificationType,
  type PublicNotification,
} from 'shared';
import { ApiError } from '../../utils/ApiError.js';
import { emitToSpace } from '../../services/socket.js';
import { SpaceModel } from '../spaces/space.model.js';
import { UserModel } from '../users/user.model.js';
import { NotificationModel, type NotificationHydrated } from './notification.model.js';

async function toPublic(
  notifications: NotificationHydrated[],
): Promise<PublicNotification[]> {
  const actorIds = [...new Set(notifications.map((n) => n.actorId.toString()))];
  const users = await UserModel.find({ _id: { $in: actorIds } }).select('name');
  const byId = new Map(users.map((u) => [u._id.toString(), u]));

  return notifications.map((n) => ({
    id: n._id.toString(),
    type: n.type,
    actorId: n.actorId.toString(),
    actorName: byId.get(n.actorId.toString())?.name ?? 'Alguien',
    entityType: n.entityType,
    entityId: n.entityId.toString(),
    read: n.read,
    createdAt: n.createdAt.toISOString(),
  }));
}

/**
 * Crea notificaciones para el resto de miembros del Space (todos menos el
 * actor) y las emite por Socket.io en tiempo real. Es "best effort": si algo
 * falla no debe romper la acción principal que la disparó.
 */
export async function notifySpace(params: {
  spaceId: string;
  actorId: string;
  type: NotificationType;
  entityType: NotificationEntityType;
  entityId: string;
}): Promise<void> {
  try {
    const space = await SpaceModel.findById(params.spaceId).select('members');
    if (!space) return;

    const recipients = space.members
      .map((m) => m.userId.toString())
      .filter((id) => id !== params.actorId);

    for (const recipientId of recipients) {
      const notification = await NotificationModel.create({
        spaceId: new Types.ObjectId(params.spaceId),
        recipientId: new Types.ObjectId(recipientId),
        actorId: new Types.ObjectId(params.actorId),
        type: params.type,
        entityType: params.entityType,
        entityId: new Types.ObjectId(params.entityId),
      });
      const [payload] = await toPublic([notification]);
      emitToSpace(params.spaceId, SOCKET_EVENTS.notificationNew, payload);
    }
  } catch (error) {
    console.error('No se pudo crear la notificación:', error);
  }
}

export async function listNotifications(recipientId: string): Promise<PublicNotification[]> {
  const notifications = await NotificationModel.find({ recipientId })
    .sort({ createdAt: -1 })
    .limit(50);
  return toPublic(notifications);
}

export async function markRead(recipientId: string, id: string): Promise<void> {
  if (!Types.ObjectId.isValid(id)) throw ApiError.notFound('Notificación no encontrada');
  await NotificationModel.updateOne({ _id: id, recipientId }, { $set: { read: true } });
}

export async function markAllRead(recipientId: string): Promise<void> {
  await NotificationModel.updateMany({ recipientId, read: false }, { $set: { read: true } });
}
