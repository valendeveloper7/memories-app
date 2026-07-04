import { Router, type Router as RouterType } from 'express';
import { createAlbumSchema, updateAlbumLayoutSchema, updateAlbumSchema } from 'shared';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { requireAuth } from '../../middlewares/requireAuth.js';
import { requireSpace } from '../../middlewares/requireSpace.js';
import { validateBody } from '../../middlewares/validate.js';
import { create, getOne, list, remove, update, updateLayout } from './album.controller.js';

export const albumRouter: RouterType = Router();

// Todas las rutas requieren sesión y pertenencia a un espacio.
albumRouter.use(requireAuth, requireSpace);

albumRouter.get('/', asyncHandler(list));
albumRouter.post('/', validateBody(createAlbumSchema), asyncHandler(create));
albumRouter.get('/:id', asyncHandler(getOne));
albumRouter.patch('/:id', validateBody(updateAlbumSchema), asyncHandler(update));
albumRouter.patch(
  '/:id/layout',
  validateBody(updateAlbumLayoutSchema),
  asyncHandler(updateLayout),
);
albumRouter.delete('/:id', asyncHandler(remove));
