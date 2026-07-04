import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CommentTargetType } from 'shared';
import { commentsApi } from '../api/comments.api';

const key = (targetType: CommentTargetType, targetId: string) =>
  ['comments', targetType, targetId] as const;

export function useComments(targetType: CommentTargetType, targetId: string) {
  return useQuery({
    queryKey: key(targetType, targetId),
    queryFn: () => commentsApi.list(targetType, targetId),
    enabled: Boolean(targetId),
  });
}

export function useCreateComment(targetType: CommentTargetType, targetId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (text: string) => commentsApi.create({ targetType, targetId, text }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: key(targetType, targetId) }),
  });
}

export function useDeleteComment(targetType: CommentTargetType, targetId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: commentsApi.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: key(targetType, targetId) }),
  });
}
