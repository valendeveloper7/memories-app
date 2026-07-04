import { Types, type FilterQuery } from 'mongoose';
import type {
  CreateAlbumInput,
  ListAlbumsQuery,
  PublicAlbum,
  UpdateAlbumInput,
} from 'shared';
import { ApiError } from '../../utils/ApiError.js';
import { AlbumModel, toPublicAlbum, type AlbumDocument } from './album.model.js';

interface Scope {
  spaceId: string;
  userId: string;
}

/** Lista los álbumes del espacio aplicando filtros. Por defecto excluye archivados. */
export async function listAlbums(scope: Scope, query: ListAlbumsQuery): Promise<PublicAlbum[]> {
  const filter: FilterQuery<AlbumDocument> = { spaceId: scope.spaceId };

  filter.isArchived = query.archived === 'true';
  if (query.favorite === 'true') filter.isFavorite = true;
  if (query.visibility) filter.visibility = query.visibility;
  if (query.tag) filter.tags = query.tag;

  const albums = await AlbumModel.find(filter).sort({ updatedAt: -1 });
  return albums.map((a) => toPublicAlbum(a));
}

/** Obtiene un álbum del espacio por id (incluye el layout). */
export async function getAlbum(scope: Scope, id: string): Promise<PublicAlbum> {
  if (!Types.ObjectId.isValid(id)) throw ApiError.notFound('Álbum no encontrado');
  const album = await AlbumModel.findOne({ _id: id, spaceId: scope.spaceId });
  if (!album) throw ApiError.notFound('Álbum no encontrado');
  return toPublicAlbum(album, true);
}

export async function createAlbum(scope: Scope, input: CreateAlbumInput): Promise<PublicAlbum> {
  const album = await AlbumModel.create({
    ...input,
    spaceId: new Types.ObjectId(scope.spaceId),
    createdBy: new Types.ObjectId(scope.userId),
  });
  return toPublicAlbum(album, true);
}

export async function updateAlbum(
  scope: Scope,
  id: string,
  input: UpdateAlbumInput,
): Promise<PublicAlbum> {
  if (!Types.ObjectId.isValid(id)) throw ApiError.notFound('Álbum no encontrado');
  const album = await AlbumModel.findOneAndUpdate(
    { _id: id, spaceId: scope.spaceId },
    { $set: input },
    { new: true, runValidators: true },
  );
  if (!album) throw ApiError.notFound('Álbum no encontrado');
  return toPublicAlbum(album, true);
}

export async function deleteAlbum(scope: Scope, id: string): Promise<void> {
  if (!Types.ObjectId.isValid(id)) throw ApiError.notFound('Álbum no encontrado');
  const result = await AlbumModel.deleteOne({ _id: id, spaceId: scope.spaceId });
  if (result.deletedCount === 0) throw ApiError.notFound('Álbum no encontrado');
}
