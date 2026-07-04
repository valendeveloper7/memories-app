import { Schema, model, type HydratedDocument, type Model, type Types } from 'mongoose';

export interface CommentDocument {
  spaceId: Types.ObjectId;
  targetType: 'memory' | 'album';
  targetId: Types.ObjectId;
  authorId: Types.ObjectId;
  text: string;
  parentCommentId?: Types.ObjectId;
  createdAt: Date;
  editedAt?: Date;
}

export type CommentHydrated = HydratedDocument<CommentDocument>;

const commentSchema = new Schema<CommentDocument>(
  {
    spaceId: { type: Schema.Types.ObjectId, ref: 'Space', required: true, index: true },
    targetType: { type: String, enum: ['memory', 'album'], required: true },
    targetId: { type: Schema.Types.ObjectId, required: true },
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    parentCommentId: { type: Schema.Types.ObjectId, ref: 'Comment' },
    editedAt: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

commentSchema.index({ targetType: 1, targetId: 1, createdAt: 1 });

export const CommentModel: Model<CommentDocument> = model<CommentDocument>('Comment', commentSchema);
