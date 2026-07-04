import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ReactionEmoji, ReactionSummary, ReactionTargetType } from 'shared';
import { reactionsApi } from '../api/reactions.api';

const key = (targetType: ReactionTargetType, targetId: string) =>
  ['reactions', targetType, targetId] as const;

export function useReactions(targetType: ReactionTargetType, targetId: string) {
  return useQuery({
    queryKey: key(targetType, targetId),
    queryFn: () => reactionsApi.list(targetType, targetId),
    enabled: Boolean(targetId),
  });
}

export function useToggleReaction(targetType: ReactionTargetType, targetId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (emoji: ReactionEmoji) => reactionsApi.toggle(targetType, targetId, emoji),
    onSuccess: (summary: ReactionSummary[]) =>
      queryClient.setQueryData(key(targetType, targetId), summary),
  });
}
