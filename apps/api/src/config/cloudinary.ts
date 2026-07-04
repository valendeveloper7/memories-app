import { v2 as cloudinary } from 'cloudinary';
import { env } from './env.js';

/** Configura el SDK de Cloudinary con las credenciales del entorno. */
export function configureCloudinary(): void {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export { cloudinary };

/** Indica si Cloudinary está configurado (credenciales presentes). */
export const isCloudinaryConfigured = Boolean(
  env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET,
);
