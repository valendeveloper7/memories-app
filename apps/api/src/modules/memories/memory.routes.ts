import { Router, type Router as RouterType } from 'express';
import { createMemorySchema, updateMemorySchema } from 'shared';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { requireAuth } from '../../middlewares/requireAuth.js';
import { requireSpace } from '../../middlewares/requireSpace.js';
import { validateBody } from '../../middlewares/validate.js';
import { create, getOne, getOnThisDay, list, remove, update } from './memory.controller.js';

export const memoryRouter: RouterType = Router();

memoryRouter.use(requireAuth, requireSpace);

memoryRouter.get('/', asyncHandler(list));
memoryRouter.get('/on-this-day', asyncHandler(getOnThisDay));
memoryRouter.post('/', validateBody(createMemorySchema), asyncHandler(create));
memoryRouter.get('/:id', asyncHandler(getOne));
memoryRouter.patch('/:id', validateBody(updateMemorySchema), asyncHandler(update));
memoryRouter.delete('/:id', asyncHandler(remove));
