import { Router, type Router as RouterType } from 'express';
import { toggleReactionSchema } from 'shared';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { requireAuth } from '../../middlewares/requireAuth.js';
import { requireSpace } from '../../middlewares/requireSpace.js';
import { validateBody } from '../../middlewares/validate.js';
import { list, toggle } from './reaction.controller.js';

export const reactionRouter: RouterType = Router();

reactionRouter.use(requireAuth, requireSpace);

reactionRouter.get('/', asyncHandler(list));
reactionRouter.post('/toggle', validateBody(toggleReactionSchema), asyncHandler(toggle));
