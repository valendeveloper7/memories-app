import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import type { ListMemoriesQuery, PublicMemory, UpdateMemoryInput } from 'shared';
import { memoriesApi } from '../api/memories.api';

export const memoryKeys = {
  all: ['memories'] as const,
  list: (query?: ListMemoriesQuery) => ['memories', 'list', query ?? {}] as const,
  onThisDay: ['memories', 'on-this-day'] as const,
};

/** Lista paginada por cursor (scroll infinito). */
export function useMemories(query?: Omit<ListMemoriesQuery, 'cursor'>) {
  return useInfiniteQuery({
    queryKey: memoryKeys.list(query),
    queryFn: ({ pageParam }) =>
      memoriesApi.list({ ...query, cursor: pageParam as string | undefined }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
}

export function useOnThisDay() {
  return useQuery({ queryKey: memoryKeys.onThisDay, queryFn: memoriesApi.onThisDay });
}

export function useUpdateMemory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateMemoryInput }) =>
      memoriesApi.update(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: memoryKeys.all }),
  });
}

export function useDeleteMemory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: memoriesApi.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: memoryKeys.all }),
  });
}

export function useToggleMemoryFavorite() {
  const update = useUpdateMemory();
  return (memory: PublicMemory) =>
    update.mutate({ id: memory.id, input: { isFavorite: !memory.isFavorite } });
}
