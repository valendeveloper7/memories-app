import { Router, type Router as RouterType } from 'express';
import { createCommentSchema, updateCommentSchema } from 'shared';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { requireAuth } from '../../middlewares/requireAuth.js';
import { requireSpace } from '../../middlewares/requireSpace.js';
import { validateBody } from '../../middlewares/validate.js';
import { create, list, remove, update } from './comment.controller.js';

export const commentRouter: RouterType = Router();

commentRouter.use(requireAuth, requireSpace);

commentRouter.get('/', asyncHandler(list));
commentRouter.post('/', validateBody(createCommentSchema), asyncHandler(create));
commentRouter.patch('/:id', validateBody(updateCommentSchema), asyncHandler(update));
commentRouter.delete('/:id', asyncHandler(remove));
