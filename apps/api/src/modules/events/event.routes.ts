import { Router, type Router as RouterType } from 'express';
import { createEventSchema, updateEventSchema } from 'shared';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { requireAuth } from '../../middlewares/requireAuth.js';
import { requireSpace } from '../../middlewares/requireSpace.js';
import { validateBody } from '../../middlewares/validate.js';
import { create, list, remove, update } from './event.controller.js';

export const eventRouter: RouterType = Router();

eventRouter.use(requireAuth, requireSpace);

eventRouter.get('/', asyncHandler(list));
eventRouter.post('/', validateBody(createEventSchema), asyncHandler(create));
eventRouter.patch('/:id', validateBody(updateEventSchema), asyncHandler(update));
eventRouter.delete('/:id', asyncHandler(remove));
