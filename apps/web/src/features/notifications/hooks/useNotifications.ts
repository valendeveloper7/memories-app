import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { SOCKET_EVENTS, type PublicNotification } from 'shared';
import { connectSocket, disconnectSocket, getSocket } from '@/services/socket';
import { useAuthStore } from '@/features/auth/store/authStore';
import { notificationsApi } from '../api/notifications.api';

const NOTIFICATIONS_KEY = ['notifications'] as const;

export function useNotifications() {
  return useQuery({ queryKey: NOTIFICATIONS_KEY, queryFn: notificationsApi.list });
}

export function useMarkAllRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationsApi.readAll,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY }),
  });
}

/**
 * Conecta el socket mientras hay sesión y escucha notificaciones en tiempo
 * real: cada evento entrante actualiza la cache de notificaciones y refresca
 * los recuerdos para que el contenido nuevo aparezca al instante.
 */
export function useRealtimeNotifications() {
  const status = useAuthStore((s) => s.status);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (status !== 'authenticated') return;
    connectSocket();
    const socket = getSocket();

    const onNotification = (notification: PublicNotification) => {
      queryClient.setQueryData<PublicNotification[]>(NOTIFICATIONS_KEY, (prev) =>
        prev ? [notification, ...prev] : [notification],
      );
      queryClient.invalidateQueries({ queryKey: ['memories'] });
    };

    socket.on(SOCKET_EVENTS.notificationNew, onNotification);
    return () => {
      socket.off(SOCKET_EVENTS.notificationNew, onNotification);
      disconnectSocket();
    };
  }, [status, queryClient]);
}
