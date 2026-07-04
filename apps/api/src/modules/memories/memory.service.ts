import { Types, type FilterQuery } from 'mongoose';
import type {
  CreateMemoryInput,
  CursorPage,
  ListMemoriesQuery,
  PublicMemory,
  UpdateMemoryInput,
} from 'shared';
import { ApiError } from '../../utils/ApiError.js';
import { AlbumModel } from '../albums/album.model.js';
import { mediaStorage } from '../../services/mediaStorage/CloudinaryStorage.js';
import { notifySpace } from '../notifications/notification.service.js';
import { MemoryModel, toPublicMemory, type MemoryDocument } from './memory.model.js';

interface Scope {
  spaceId: string;
  userId: string;
}

const DEFAULT_LIMIT = 30;

/** Codifica un cursor de paginación (fecha real + id) en base64. */
function encodeCursor(date: Date, id: string): string {
  return Buffer.from(`${date.toISOString()}_${id}`).toString('base64url');
}

function decodeCursor(cursor: string): { date: Date; id: string } | null {
  try {
    const [dateStr, id] = Buffer.from(cursor, 'base64url').toString().split('_');
    if (!dateStr || !id) return null;
    return { date: new Date(dateStr), id };
  } catch {
    return null;
  }
}

/** Construye el filtro común a partir de la query, escopado por Space. */
function buildFilter(scope: Scope, query: ListMemoriesQuery): FilterQuery<MemoryDocument> {
  const filter: FilterQuery<MemoryDocument> = { spaceId: scope.spaceId };
  if (query.albumId) filter.albumId = query.albumId;
  if (query.type) filter.type = query.type;
  if (query.favorite === 'true') filter.isFavorite = true;
  if (query.tag) filter.tags = query.tag;
  if (query.person) filter.people = query.person;
  if (query.q) filter.$text = { $search: query.q };
  if (query.from || query.to) {
    filter.actualDate = {};
    if (query.from) filter.actualDate.$gte = new Date(query.from);
    if (query.to) filter.actualDate.$lte = new Date(query.to);
  }
  return filter;
}

/** Lista recuerdos con paginación por cursor (orden: fecha real descendente). */
export async function listMemories(
  scope: Scope,
  query: ListMemoriesQuery,
): Promise<CursorPage<PublicMemory>> {
  const filter = buildFilter(scope, query);
  const limit = query.limit ?? DEFAULT_LIMIT;

  if (query.cursor) {
    const decoded = decodeCursor(query.cursor);
    if (decoded) {
      filter.$or = [
        { actualDate: { $lt: decoded.date } },
        { actualDate: decoded.date, _id: { $lt: new Types.ObjectId(decoded.id) } },
      ];
    }
  }

  // Pedimos uno más para saber si hay página siguiente.
  const docs = await MemoryModel.find(filter)
    .sort({ actualDate: -1, _id: -1 })
    .limit(limit + 1);

  const hasMore = docs.length > limit;
  const items = docs.slice(0, limit);
  const last = items[items.length - 1];
  const nextCursor = hasMore && last ? encodeCursor(last.actualDate, last._id.toString()) : null;

  return { items: items.map(toPublicMemory), nextCursor };
}

export async function getMemory(scope: Scope, id: string): Promise<PublicMemory> {
  if (!Types.ObjectId.isValid(id)) throw ApiError.notFound('Recuerdo no encontrado');
  const memory = await MemoryModel.findOne({ _id: id, spaceId: scope.spaceId });
  if (!memory) throw ApiError.notFound('Recuerdo no encontrado');
  return toPublicMemory(memory);
}

export async function createMemory(scope: Scope, input: CreateMemoryInput): Promise<PublicMemory> {
  // Si se asigna a un álbum, verificamos que pertenece al mismo Space.
  if (input.albumId) {
    if (!Types.ObjectId.isValid(input.albumId)) throw ApiError.badRequest('Álbum no válido');
    const album = await AlbumModel.exists({ _id: input.albumId, spaceId: scope.spaceId });
    if (!album) throw ApiError.notFound('El álbum indicado no existe');
  }

  const { location, actualDate, ...rest } = input;
  const memory = await MemoryModel.create({
    ...rest,
    spaceId: new Types.ObjectId(scope.spaceId),
    createdBy: new Types.ObjectId(scope.userId),
    actualDate: actualDate ? new Date(actualDate) : new Date(),
    location: location
      ? { name: location.name, type: 'Point', coordinates: location.coordinates }
      : undefined,
  });

  await notifySpace({
    spaceId: scope.spaceId,
    actorId: scope.userId,
    type: 'memory_added',
    entityType: 'memory',
    entityId: memory._id.toString(),
  });

  return toPublicMemory(memory);
}

export async function updateMemory(
  scope: Scope,
  id: string,
  input: UpdateMemoryInput,
): Promise<PublicMemory> {
  if (!Types.ObjectId.isValid(id)) throw ApiError.notFound('Recuerdo no encontrado');

  const { location, actualDate, albumId, ...rest } = input;
  const update: Record<string, unknown> = { ...rest };
  if (actualDate !== undefined) update.actualDate = new Date(actualDate);
  if (albumId !== undefined) update.albumId = albumId ? new Types.ObjectId(albumId) : null;
  if (location !== undefined) {
    update.location = location
      ? { name: location.name, type: 'Point', coordinates: location.coordinates }
      : null;
  }

  const memory = await MemoryModel.findOneAndUpdate(
    { _id: id, spaceId: scope.spaceId },
    { $set: update },
    { new: true, runValidators: true },
  );
  if (!memory) throw ApiError.notFound('Recuerdo no encontrado');
  return toPublicMemory(memory);
}

export async function deleteMemory(scope: Scope, id: string): Promise<void> {
  if (!Types.ObjectId.isValid(id)) throw ApiError.notFound('Recuerdo no encontrado');
  const memory = await MemoryModel.findOne({ _id: id, spaceId: scope.spaceId });
  if (!memory) throw ApiError.notFound('Recuerdo no encontrado');

  // Borramos también el asset en Cloudinary (si lo hay).
  if (memory.mediaPublicId) {
    const resourceType = memory.type === 'video' ? 'video' : 'image';
    await mediaStorage.deleteAsset(memory.mediaPublicId, resourceType).catch(() => {
      // No bloqueamos el borrado del recuerdo si falla la limpieza remota.
    });
  }

  await memory.deleteOne();
}

/** Recuerdos "en este día" de años anteriores (para sugerencias automáticas). */
export async function onThisDay(scope: Scope): Promise<PublicMemory[]> {
  const now = new Date();
  const memories = await MemoryModel.aggregate([
    { $match: { spaceId: new Types.ObjectId(scope.spaceId) } },
    {
      $addFields: {
        _month: { $month: '$actualDate' },
        _day: { $dayOfMonth: '$actualDate' },
        _year: { $year: '$actualDate' },
      },
    },
    {
      $match: {
        _month: now.getMonth() + 1,
        _day: now.getDate(),
        _year: { $lt: now.getFullYear() },
      },
    },
    { $sort: { actualDate: -1 } },
    { $limit: 30 },
  ]);

  return memories.map((m) => toPublicMemory(MemoryModel.hydrate(m)));
}
