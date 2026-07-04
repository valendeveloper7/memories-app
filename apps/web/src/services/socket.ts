import { io, type Socket } from 'socket.io-client';
import { useAuthStore } from '@/features/auth/store/authStore';

const socketUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:4000';

let socket: Socket | null = null;

/**
 * Devuelve el socket, creándolo si hace falta. La autenticación usa el access
 * token actual del store; al reconectar toma siempre el más reciente (por si
 * se refrescó mientras tanto).
 */
export function getSocket(): Socket {
  if (!socket) {
    socket = io(socketUrl, {
      autoConnect: false,
      auth: (cb) => cb({ token: useAuthStore.getState().accessToken }),
    });
  }
  return socket;
}

export function connectSocket(): void {
  const s = getSocket();
  if (!s.connected) s.connect();
}

export function disconnectSocket(): void {
  socket?.disconnect();
}
