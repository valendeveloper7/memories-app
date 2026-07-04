import type { Request, Response } from 'express';
import { listNotifications, markAllRead, markRead } from './notification.service.js';

export async function list(req: Request, res: Response): Promise<void> {
  res.json(await listNotifications(req.userId!));
}

export async function readOne(req: Request, res: Response): Promise<void> {
  await markRead(req.userId!, req.params.id!);
  res.status(204).send();
}

export async function readAll(req: Request, res: Response): Promise<void> {
  await markAllRead(req.userId!);
  res.status(204).send();
}
