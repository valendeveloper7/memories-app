import mongoose from 'mongoose';
import { env } from './env.js';

/** Conecta a MongoDB. Se llama una sola vez al arrancar el servidor. */
export async function connectDatabase(): Promise<void> {
  mongoose.set('strictQuery', true);

  mongoose.connection.on('connected', () => {
    console.log('✅ MongoDB conectado');
  });
  mongoose.connection.on('error', (err) => {
    console.error('❌ Error de MongoDB:', err.message);
  });

  await mongoose.connect(env.MONGODB_URI);
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
}
