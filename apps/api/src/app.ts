import express, { type Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFound } from './middlewares/notFound.js';

/**
 * Construye la aplicación Express con la cadena de middlewares de seguridad
 * y las rutas. Se separa de server.ts para poder importarla en los tests sin
 * arrancar el listener HTTP.
 */
export function createApp(): Application {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.CLIENT_ORIGIN,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(mongoSanitize());

  // Rate limit global suave; los módulos sensibles (auth) añadirán uno propio.
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 300,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'nosotros-api', timestamp: new Date().toISOString() });
  });

  // Aquí se irán montando los routers de cada módulo:
  // app.use('/api/auth', authRouter);
  // app.use('/api/albums', albumsRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
