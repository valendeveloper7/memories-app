import type { Id, IsoDate } from './common.js';

export type CommentTargetType = 'memory' | 'album';

export interface PublicComment {
  id: Id;
  spaceId: Id;
  targetType: CommentTargetType;
  targetId: Id;
  authorId: Id;
  authorName: string;
  authorAvatar?: string;
  text: string;
  parentCommentId?: Id;
  createdAt: IsoDate;
  editedAt?: IsoDate;
}
