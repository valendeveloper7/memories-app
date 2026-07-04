import { useMutation } from '@tanstack/react-query';
import type { PublicUser, UpdatePreferencesInput, UserPreferences } from 'shared';
import { http } from '@/services/http';
import { useAuthStore } from '@/features/auth/store/authStore';

/** Actualiza las preferencias en el backend y refleja el cambio en el store,
 *  con actualización optimista para que el tema cambie al instante. */
export function useUpdatePreferences() {
  const patchUser = useAuthStore((s) => s.patchUser);
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: (input: UpdatePreferencesInput) =>
      http.patch<PublicUser>('/users/me/preferences', input).then((r) => r.data),
    onMutate: (input) => {
      if (!user) return;
      const merged: UserPreferences = {
        ...user.preferences,
        ...input,
        backgroundImage: input.backgroundImage ?? user.preferences.backgroundImage,
      };
      patchUser({ preferences: merged });
    },
    onSuccess: (updated) => patchUser({ preferences: updated.preferences }),
  });
}
