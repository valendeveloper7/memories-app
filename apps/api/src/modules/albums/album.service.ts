import { Types, type FilterQuery } from 'mongoose';
import type {
  CreateAlbumInput,
  ListAlbumsQuery,
  PublicAlbum,
  UpdateAlbumInput,
  UpdateAlbumLayoutInput,
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
  const { date, ...rest } = input;
  const album = new AlbumModel({
    ...rest,
    spaceId: new Types.ObjectId(scope.spaceId),
    createdBy: new Types.ObjectId(scope.userId),
  });

  if (date) {
    // Fecha personalizada del álbum: fijamos createdAt desactivando los
    // timestamps automáticos para que no la sobrescriban.
    const customDate = new Date(date);
    album.createdAt = customDate;
    album.updatedAt = customDate;
    await album.save({ timestamps: false });
  } else {
    await album.save();
  }

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

/**
 * Guarda el layout del editor. Usa concurrencia optimista: si el cliente envía
 * una `version` distinta de la actual, significa que la pareja lo editó mientras
 * tanto y se rechaza (409) para no pisar sus cambios.
 */
export async function updateAlbumLayout(
  scope: Scope,
  id: string,
  input: UpdateAlbumLayoutInput,
): Promise<PublicAlbum> {
  if (!Types.ObjectId.isValid(id)) throw ApiError.notFound('Álbum no encontrado');
  const album = await AlbumModel.findOne({ _id: id, spaceId: scope.spaceId });
  if (!album) throw ApiError.notFound('Álbum no encontrado');

  if (input.version !== undefined && input.version !== album.version) {
    throw ApiError.conflict('El álbum se editó desde otro sitio. Recárgalo para no perder cambios.');
  }

  album.layout = input.layout.map((item) => ({
    ...item,
    memoryId: new Types.ObjectId(item.memoryId),
  }));
  album.version += 1;
  await album.save();
  return toPublicAlbum(album, true);
}

export async function deleteAlbum(scope: Scope, id: string): Promise<void> {
  if (!Types.ObjectId.isValid(id)) throw ApiError.notFound('Álbum no encontrado');
  const result = await AlbumModel.deleteOne({ _id: id, spaceId: scope.spaceId });
  if (result.deletedCount === 0) throw ApiError.notFound('Álbum no encontrado');
}
