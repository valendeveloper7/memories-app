import type { ReactionEmoji, ReactionSummary, ReactionTargetType } from 'shared';
import { http } from '@/services/http';

export const reactionsApi = {
  list: (targetType: ReactionTargetType, targetId: string) =>
    http
      .get<ReactionSummary[]>('/reactions', { params: { targetType, targetId } })
      .then((r) => r.data),

  toggle: (targetType: ReactionTargetType, targetId: string, emoji: ReactionEmoji) =>
    http
      .post<ReactionSummary[]>('/reactions/toggle', { targetType, targetId, emoji })
      .then((r) => r.data),
};
