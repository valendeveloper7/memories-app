export type MediaResourceType = 'image' | 'video';

/** Datos que devuelve el backend para una subida directa firmada a Cloudinary. */
export interface UploadSignatureResponse {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
  resourceType: MediaResourceType;
}
