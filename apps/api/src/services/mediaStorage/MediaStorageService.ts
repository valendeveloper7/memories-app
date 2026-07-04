/**
 * Contrato de almacenamiento de media. Toda la app depende de esta interfaz,
 * nunca de Cloudinary directamente. El día que convenga migrar a S3 se
 * implementa otro adaptador sin tocar el resto del código (patrón Strategy).
 */

export type MediaResourceType = 'image' | 'video';

/** Datos que el backend firma para una subida directa desde el cliente. */
export interface UploadSignature {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
  resourceType: MediaResourceType;
}

export interface MediaStorageService {
  /** Genera una firma temporal para que el cliente suba directo al proveedor. */
  createUploadSignature(params: { spaceId: string; resourceType: MediaResourceType }): UploadSignature;

  /** Borra un asset por su identificador público. */
  deleteAsset(publicId: string, resourceType: MediaResourceType): Promise<void>;
}
