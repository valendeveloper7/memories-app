import { cloudinary } from '../../config/cloudinary.js';
import { env } from '../../config/env.js';
import type {
  MediaResourceType,
  MediaStorageService,
  UploadSignature,
} from './MediaStorageService.js';

/** Implementación de MediaStorageService sobre Cloudinary. */
export class CloudinaryStorage implements MediaStorageService {
  createUploadSignature(params: {
    spaceId: string;
    resourceType: MediaResourceType;
  }): UploadSignature {
    const timestamp = Math.round(Date.now() / 1000);
    // La carpeta aísla el contenido por Space. Debe firmarse junto al resto.
    const folder = `spaces/${params.spaceId}`;

    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder },
      env.CLOUDINARY_API_SECRET!,
    );

    return {
      cloudName: env.CLOUDINARY_CLOUD_NAME!,
      apiKey: env.CLOUDINARY_API_KEY!,
      timestamp,
      signature,
      folder,
      resourceType: params.resourceType,
    };
  }

  async deleteAsset(publicId: string, resourceType: MediaResourceType): Promise<void> {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  }
}

/** Instancia única usada por los controllers. */
export const mediaStorage: MediaStorageService = new CloudinaryStorage();
