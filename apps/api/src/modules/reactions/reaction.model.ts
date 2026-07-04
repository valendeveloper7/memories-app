import { Schema, model, type Model, type Types } from 'mongoose';

export interface ReactionDocument {
  spaceId: Types.ObjectId;
  targetType: 'memory' | 'album' | 'comment';
  targetId: Types.ObjectId;
  userId: Types.ObjectId;
  emoji: string;
  createdAt: Date;
}

const reactionSchema = new Schema<ReactionDocument>(
  {
    spaceId: { type: Schema.Types.ObjectId, ref: 'Space', required: true, index: true },
    targetType: { type: String, enum: ['memory', 'album', 'comment'], required: true },
    targetId: { type: Schema.Types.ObjectId, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    emoji: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

// Un usuario no puede repetir el mismo emoji sobre el mismo objetivo.
reactionSchema.index({ targetType: 1, targetId: 1, userId: 1, emoji: 1 }, { unique: true });

export const ReactionModel: Model<ReactionDocument> = model<ReactionDocument>(
  'Reaction',
  reactionSchema,
);
