import type { Request, Response } from 'express';
import { createEvent, deleteEvent, listEvents, updateEvent } from './event.service.js';

function scopeOf(req: Request) {
  return { spaceId: req.spaceId!, userId: req.userId! };
}

export async function list(req: Request, res: Response): Promise<void> {
  res.json(await listEvents(req.spaceId!));
}

export async function create(req: Request, res: Response): Promise<void> {
  res.status(201).json(await createEvent(scopeOf(req), req.body));
}

export async function update(req: Request, res: Response): Promise<void> {
  res.json(await updateEvent(scopeOf(req), req.params.id!, req.body));
}

export async function remove(req: Request, res: Response): Promise<void> {
  await deleteEvent(scopeOf(req), req.params.id!);
  res.status(204).send();
}
