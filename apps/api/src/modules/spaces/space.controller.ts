import type { Request, Response } from 'express';
import { createSpace, getMySpace, joinSpace } from './space.service.js';

export async function create(req: Request, res: Response): Promise<void> {
  const space = await createSpace(req.userId!, req.body);
  res.status(201).json(space);
}

export async function join(req: Request, res: Response): Promise<void> {
  const space = await joinSpace(req.userId!, req.body);
  res.json(space);
}

export async function getMine(req: Request, res: Response): Promise<void> {
  const space = await getMySpace(req.userId!);
  res.json(space);
}
