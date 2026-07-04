import type { Server as HttpServer } from 'node:http';
import { Server as SocketServer } from 'socket.io';
import { env } from '../config/env.js';
import { verifyAccessToken } from '../modules/auth/token.service.js';
import { UserModel } from '../modules/users/user.model.js';

let io: SocketServer | null = null;

/**
 * Inicializa Socket.io sobre el servidor HTTP. Autentica cada conexión con el
 * access token (JWT) y mete al socket en la sala de su Space, de modo que las
 * emisiones a un Space llegan solo a sus miembros conectados.
 */
export function initSocket(httpServer: HttpServer): void {
  io = new SocketServer(httpServer, {
    cors: { origin: env.CLIENT_ORIGIN, credentials: true },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token as string | undefined;
      if (!token) return next(new Error('unauthorized'));
      const payload = verifyAccessToken(token);
      const user = await UserModel.findById(payload.sub).select('spaceId');
      if (!user?.spaceId) return next(new Error('no_space'));
      socket.data.userId = payload.sub;
      socket.data.spaceId = user.spaceId.toString();
      next();
    } catch {
      next(new Error('unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    const spaceId = socket.data.spaceId as string;
    socket.join(`space:${spaceId}`);
  });
}

/** Emite un evento a todos los miembros conectados de un Space. */
export function emitToSpace(spaceId: string, event: string, payload: unknown): void {
  io?.to(`space:${spaceId}`).emit(event, payload);
}
