import { Router, type Router as RouterType } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { requireAuth } from '../../middlewares/requireAuth.js';
import { requireSpace } from '../../middlewares/requireSpace.js';
import { calendar, heatmap, overview } from './stats.controller.js';

export const statsRouter: RouterType = Router();

statsRouter.use(requireAuth, requireSpace);

statsRouter.get('/overview', asyncHandler(overview));
statsRouter.get('/heatmap', asyncHandler(heatmap));
statsRouter.get('/calendar/:year/:month', asyncHandler(calendar));
