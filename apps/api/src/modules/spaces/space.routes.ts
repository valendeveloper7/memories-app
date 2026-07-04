import { Router, type Router as RouterType } from 'express';
import { createSpaceSchema, joinSpaceSchema } from 'shared';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { requireAuth } from '../../middlewares/requireAuth.js';
import { validateBody } from '../../middlewares/validate.js';
import { create, getMine, join } from './space.controller.js';

export const spaceRouter: RouterType = Router();

spaceRouter.use(requireAuth);
spaceRouter.get('/me', asyncHandler(getMine));
spaceRouter.post('/', validateBody(createSpaceSchema), asyncHandler(create));
spaceRouter.post('/join', validateBody(joinSpaceSchema), asyncHandler(join));
