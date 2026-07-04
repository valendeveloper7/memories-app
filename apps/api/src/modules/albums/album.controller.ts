import type { Request, Response } from 'express';
import { listAlbumsQuerySchema } from 'shared';
import {
  createAlbum,
  deleteAlbum,
  getAlbum,
  listAlbums,
  updateAlbum,
} from './album.service.js';

/** Construye el scope (espacio + usuario) que la capa de servicio necesita. */
function scopeOf(req: Request) {
  return { spaceId: req.spaceId!, userId: req.userId! };
}

export async function list(req: Request, res: Response): Promise<void> {
  const query = listAlbumsQuerySchema.parse(req.query);
  const albums = await listAlbums(scopeOf(req), query);
  res.json(albums);
}

export async function getOne(req: Request, res: Response): Promise<void> {
  const album = await getAlbum(scopeOf(req), req.params.id!);
  res.json(album);
}

export async function create(req: Request, res: Response): Promise<void> {
  const album = await createAlbum(scopeOf(req), req.body);
  res.status(201).json(album);
}

export async function update(req: Request, res: Response): Promise<void> {
  const album = await updateAlbum(scopeOf(req), req.params.id!, req.body);
  res.json(album);
}

export async function remove(req: Request, res: Response): Promise<void> {
  await deleteAlbum(scopeOf(req), req.params.id!);
  res.status(204).send();
}
