import { Router, type Router as RouterType } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { requireAuth } from '../../middlewares/requireAuth.js';
import { list, readAll, readOne } from './notification.controller.js';

export const notificationRouter: RouterType = Router();

notificationRouter.use(requireAuth);

notificationRouter.get('/', asyncHandler(list));
notificationRouter.patch('/read-all', asyncHandler(readAll));
notificationRouter.patch('/:id/read', asyncHandler(readOne));
