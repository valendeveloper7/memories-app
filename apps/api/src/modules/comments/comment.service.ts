import { Types } from 'mongoose';
import type { CreateCommentInput, PublicComment } from 'shared';
import { ApiError } from '../../utils/ApiError.js';
import { assertTargetInSpace } from '../../utils/assertTargetInSpace.js';
import { notifySpace } from '../notifications/notification.service.js';
import { UserModel } from '../users/user.model.js';
import { CommentModel, type CommentHydrated } from './comment.model.js';

interface Scope {
  spaceId: string;
  userId: string;
}

async function toPublicComments(comments: CommentHydrated[]): Promise<PublicComment[]> {
  const authorIds = [...new Set(comments.map((c) => c.authorId.toString()))];
  const users = await UserModel.find({ _id: { $in: authorIds } }).select('name avatarUrl');
  const byId = new Map(users.map((u) => [u._id.toString(), u]));

  return comments.map((c) => {
    const author = byId.get(c.authorId.toString());
    return {
      id: c._id.toString(),
      spaceId: c.spaceId.toString(),
      targetType: c.targetType,
      targetId: c.targetId.toString(),
      authorId: c.authorId.toString(),
      authorName: author?.name ?? 'Usuario',
      authorAvatar: author?.avatarUrl,
      text: c.text,
      parentCommentId: c.parentCommentId?.toString(),
      createdAt: c.createdAt.toISOString(),
      editedAt: c.editedAt?.toISOString(),
    };
  });
}

export async function listComments(
  scope: Scope,
  targetType: 'memory' | 'album',
  targetId: string,
): Promise<PublicComment[]> {
  await assertTargetInSpace(scope.spaceId, targetType, targetId);
  const comments = await CommentModel.find({
    spaceId: scope.spaceId,
    targetType,
    targetId,
  }).sort({ createdAt: 1 });
  return toPublicComments(comments);
}

export async function createComment(scope: Scope, input: CreateCommentInput): Promise<PublicComment> {
  await assertTargetInSpace(scope.spaceId, input.targetType, input.targetId);
  const comment = await CommentModel.create({
    spaceId: new Types.ObjectId(scope.spaceId),
    targetType: input.targetType,
    targetId: new Types.ObjectId(input.targetId),
    authorId: new Types.ObjectId(scope.userId),
    text: input.text,
    parentCommentId: input.parentCommentId
      ? new Types.ObjectId(input.parentCommentId)
      : undefined,
  });

  await notifySpace({
    spaceId: scope.spaceId,
    actorId: scope.userId,
    type: 'comment_added',
    entityType: 'comment',
    entityId: comment._id.toString(),
  });

  return (await toPublicComments([comment]))[0]!;
}

export async function updateComment(
  scope: Scope,
  id: string,
  text: string,
): Promise<PublicComment> {
  if (!Types.ObjectId.isValid(id)) throw ApiError.notFound('Comentario no encontrado');
  const comment = await CommentModel.findOne({ _id: id, spaceId: scope.spaceId });
  if (!comment) throw ApiError.notFound('Comentario no encontrado');
  if (comment.authorId.toString() !== scope.userId) {
    throw ApiError.forbidden('Solo puedes editar tus propios comentarios');
  }
  comment.text = text;
  comment.editedAt = new Date();
  await comment.save();
  return (await toPublicComments([comment]))[0]!;
}

export async function deleteComment(scope: Scope, id: string): Promise<void> {
  if (!Types.ObjectId.isValid(id)) throw ApiError.notFound('Comentario no encontrado');
  const comment = await CommentModel.findOne({ _id: id, spaceId: scope.spaceId });
  if (!comment) throw ApiError.notFound('Comentario no encontrado');
  if (comment.authorId.toString() !== scope.userId) {
    throw ApiError.forbidden('Solo puedes borrar tus propios comentarios');
  }
  await comment.deleteOne();
}
