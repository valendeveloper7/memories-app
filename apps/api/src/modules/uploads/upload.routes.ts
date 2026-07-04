import { Router, type Router as RouterType } from 'express';
import { uploadSignatureSchema } from 'shared';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { requireAuth } from '../../middlewares/requireAuth.js';
import { requireSpace } from '../../middlewares/requireSpace.js';
import { validateBody } from '../../middlewares/validate.js';
import { createSignature } from './upload.controller.js';

export const uploadRouter: RouterType = Router();

uploadRouter.use(requireAuth, requireSpace);
uploadRouter.post('/signature', validateBody(uploadSignatureSchema), asyncHandler(createSignature));
