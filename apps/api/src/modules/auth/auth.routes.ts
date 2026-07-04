import { Router, type Router as RouterType } from 'express';
import rateLimit from 'express-rate-limit';
import { loginSchema, registerSchema } from 'shared';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { validateBody } from '../../middlewares/validate.js';
import { login, logout, refresh, register } from './auth.controller.js';

/** Rate limit estricto para endpoints de credenciales (anti fuerza bruta). */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Demasiados intentos, prueba de nuevo más tarde', code: 'RATE_LIMITED' },
});

export const authRouter: RouterType = Router();

authRouter.post('/register', authLimiter, validateBody(registerSchema), asyncHandler(register));
authRouter.post('/login', authLimiter, validateBody(loginSchema), asyncHandler(login));
authRouter.post('/refresh', asyncHandler(refresh));
authRouter.post('/logout', asyncHandler(logout));
