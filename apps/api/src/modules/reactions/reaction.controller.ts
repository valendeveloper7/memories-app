import type { Request, Response } from 'express';
import { listReactionsQuerySchema } from 'shared';
import { listReactions, toggleReaction } from './reaction.service.js';

function scopeOf(req: Request) {
  return { spaceId: req.spaceId!, userId: req.userId! };
}

export async function list(req: Request, res: Response): Promise<void> {
  const { targetType, targetId } = listReactionsQuerySchema.parse(req.query);
  res.json(await listReactions(scopeOf(req), targetType, targetId));
}

export async function toggle(req: Request, res: Response): Promise<void> {
  res.json(await toggleReaction(scopeOf(req), req.body));
}
