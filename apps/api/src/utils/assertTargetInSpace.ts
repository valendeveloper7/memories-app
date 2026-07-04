import { Types } from 'mongoose';
import { ApiError } from './ApiError.js';
import { MemoryModel } from '../modules/memories/memory.model.js';
import { AlbumModel } from '../modules/albums/album.model.js';
import { CommentModel } from '../modules/comments/comment.model.js';

/** Verifica que un objetivo (recuerdo/álbum/comentario) pertenece al Space.
 *  Evita que alguien comente o reaccione sobre contenido de otra pareja. */
export async function assertTargetInSpace(
  spaceId: string,
  targetType: 'memory' | 'album' | 'comment',
  targetId: string,
): Promise<void> {
  if (!Types.ObjectId.isValid(targetId)) throw ApiError.notFound('El elemento no existe');
  const Model =
    targetType === 'memory' ? MemoryModel : targetType === 'album' ? AlbumModel : CommentModel;
  const exists = await Model.exists({ _id: targetId, spaceId });
  if (!exists) throw ApiError.notFound('El elemento no existe');
}
