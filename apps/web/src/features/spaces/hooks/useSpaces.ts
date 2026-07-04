import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { PublicSpace } from 'shared';
import { useAuthStore } from '@/features/auth/store/authStore';
import { spacesApi } from '../api/spaces.api';

/** Query del Space actual. Solo se ejecuta si el usuario ya tiene spaceId. */
export function useMySpace() {
  const spaceId = useAuthStore((s) => s.user?.spaceId);
  return useQuery({
    queryKey: ['space', 'me'],
    queryFn: spacesApi.getMine,
    enabled: Boolean(spaceId),
  });
}

/** Tras crear/unirse, sincroniza el spaceId en el store y la cache. */
function useOnSpaceReady() {
  const patchUser = useAuthStore((s) => s.patchUser);
  const queryClient = useQueryClient();
  return (space: PublicSpace) => {
    patchUser({ spaceId: space.id });
    queryClient.setQueryData(['space', 'me'], space);
  };
}

export function useCreateSpace() {
  const onReady = useOnSpaceReady();
  return useMutation({ mutationFn: spacesApi.create, onSuccess: onReady });
}

export function useJoinSpace() {
  const onReady = useOnSpaceReady();
  return useMutation({ mutationFn: spacesApi.join, onSuccess: onReady });
}
