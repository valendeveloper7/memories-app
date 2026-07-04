import { Router, type Router as RouterType } from 'express';
import { updatePreferencesSchema, updateProfileSchema } from 'shared';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { requireAuth } from '../../middlewares/requireAuth.js';
import { validateBody } from '../../middlewares/validate.js';
import { getMe, updatePreferences, updateProfile } from './user.controller.js';

export const userRouter: RouterType = Router();

userRouter.use(requireAuth);

userRouter.get('/me', asyncHandler(getMe));
userRouter.patch('/me', validateBody(updateProfileSchema), asyncHandler(updateProfile));
userRouter.patch(
  '/me/preferences',
  validateBody(updatePreferencesSchema),
  asyncHandler(updatePreferences),
);
