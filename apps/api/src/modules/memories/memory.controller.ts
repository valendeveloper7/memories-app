import type { Request, Response } from 'express';
import { listMemoriesQuerySchema } from 'shared';
import {
  createMemory,
  deleteMemory,
  getMemory,
  listMemories,
  onThisDay,
  updateMemory,
} from './memory.service.js';

function scopeOf(req: Request) {
  return { spaceId: req.spaceId!, userId: req.userId! };
}

export async function list(req: Request, res: Response): Promise<void> {
  const query = listMemoriesQuerySchema.parse(req.query);
  res.json(await listMemories(scopeOf(req), query));
}

export async function getOnThisDay(req: Request, res: Response): Promise<void> {
  res.json(await onThisDay(scopeOf(req)));
}

export async function getOne(req: Request, res: Response): Promise<void> {
  res.json(await getMemory(scopeOf(req), req.params.id!));
}

export async function create(req: Request, res: Response): Promise<void> {
  res.status(201).json(await createMemory(scopeOf(req), req.body));
}

export async function update(req: Request, res: Response): Promise<void> {
  res.json(await updateMemory(scopeOf(req), req.params.id!, req.body));
}

export async function remove(req: Request, res: Response): Promise<void> {
  await deleteMemory(scopeOf(req), req.params.id!);
  res.status(204).send();
}
