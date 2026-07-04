import { Router, type Router as RouterType } from 'express';
import { createAlbumSchema, updateAlbumSchema } from 'shared';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { requireAuth } from '../../middlewares/requireAuth.js';
import { requireSpace } from '../../middlewares/requireSpace.js';
import { validateBody } from '../../middlewares/validate.js';
import { create, getOne, list, remove, update } from './album.controller.js';

export const albumRouter: RouterType = Router();

// Todas las rutas requieren sesión y pertenencia a un espacio.
albumRouter.use(requireAuth, requireSpace);

albumRouter.get('/', asyncHandler(list));
albumRouter.post('/', validateBody(createAlbumSchema), asyncHandler(create));
albumRouter.get('/:id', asyncHandler(getOne));
albumRouter.patch('/:id', validateBody(updateAlbumSchema), asyncHandler(update));
albumRouter.delete('/:id', asyncHandler(remove));
