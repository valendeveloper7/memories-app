import type { Request, Response } from 'express';
import { listCommentsQuerySchema } from 'shared';
import { createComment, deleteComment, listComments, updateComment } from './comment.service.js';

function scopeOf(req: Request) {
  return { spaceId: req.spaceId!, userId: req.userId! };
}

export async function list(req: Request, res: Response): Promise<void> {
  const { targetType, targetId } = listCommentsQuerySchema.parse(req.query);
  res.json(await listComments(scopeOf(req), targetType, targetId));
}

export async function create(req: Request, res: Response): Promise<void> {
  res.status(201).json(await createComment(scopeOf(req), req.body));
}

export async function update(req: Request, res: Response): Promise<void> {
  res.json(await updateComment(scopeOf(req), req.params.id!, req.body.text));
}

export async function remove(req: Request, res: Response): Promise<void> {
  await deleteComment(scopeOf(req), req.params.id!);
  res.status(204).send();
}
