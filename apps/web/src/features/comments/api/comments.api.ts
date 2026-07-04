import type {
  CommentTargetType,
  CreateCommentInput,
  PublicComment,
} from 'shared';
import { http } from '@/services/http';

export const commentsApi = {
  list: (targetType: CommentTargetType, targetId: string) =>
    http
      .get<PublicComment[]>('/comments', { params: { targetType, targetId } })
      .then((r) => r.data),

  create: (input: CreateCommentInput) =>
    http.post<PublicComment>('/comments', input).then((r) => r.data),

  remove: (id: string) => http.delete(`/comments/${id}`).then(() => undefined),
};
