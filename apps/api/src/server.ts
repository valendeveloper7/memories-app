import { createServer } from 'node:http';
import { createApp } from './app.js';
import { connectDatabase } from './config/db.js';
import { configureCloudinary } from './config/cloudinary.js';
import { env } from './config/env.js';

/** Punto de entrada: conecta a la BD y arranca el servidor HTTP. */
async function bootstrap(): Promise<void> {
  configureCloudinary();
  await connectDatabase();

  const app = createApp();
  const httpServer = createServer(app);

  // El servidor de Socket.io se inicializará aquí en el módulo de notificaciones.

  httpServer.listen(env.PORT, () => {
    console.log(`🚀 API escuchando en http://localhost:${env.PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error('No se pudo arrancar el servidor:', err);
  process.exit(1);
});
