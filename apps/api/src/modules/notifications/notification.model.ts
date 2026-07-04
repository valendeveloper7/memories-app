import { Schema, model, type HydratedDocument, type Model, type Types } from 'mongoose';

export interface NotificationDocument {
  spaceId: Types.ObjectId;
  recipientId: Types.ObjectId;
  actorId: Types.ObjectId;
  type: 'memory_added' | 'album_shared' | 'comment_added' | 'reaction_added';
  entityType: 'album' | 'memory' | 'comment';
  entityId: Types.ObjectId;
  read: boolean;
  createdAt: Date;
}

export type NotificationHydrated = HydratedDocument<NotificationDocument>;

const notificationSchema = new Schema<NotificationDocument>(
  {
    spaceId: { type: Schema.Types.ObjectId, ref: 'Space', required: true },
    recipientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    actorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['memory_added', 'album_shared', 'comment_added', 'reaction_added'],
      required: true,
    },
    entityType: { type: String, enum: ['album', 'memory', 'comment'], required: true },
    entityId: { type: Schema.Types.ObjectId, required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

notificationSchema.index({ recipientId: 1, read: 1, createdAt: -1 });

export const NotificationModel: Model<NotificationDocument> = model<NotificationDocument>(
  'Notification',
  notificationSchema,
);
