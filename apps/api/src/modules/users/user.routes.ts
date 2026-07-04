import { Router, type Router as RouterType } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { requireAuth } from '../../middlewares/requireAuth.js';
import { getMe } from './user.controller.js';

export const userRouter: RouterType = Router();

userRouter.get('/me', requireAuth, asyncHandler(getMe));
