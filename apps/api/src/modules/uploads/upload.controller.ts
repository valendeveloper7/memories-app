import type { Request, Response } from 'express';
import type { UploadSignatureResponse } from 'shared';
import { mediaStorage } from '../../services/mediaStorage/CloudinaryStorage.js';

/** Devuelve una firma temporal para subir un archivo directamente a Cloudinary. */
export async function createSignature(req: Request, res: Response): Promise<void> {
  const signature = mediaStorage.createUploadSignature({
    spaceId: req.spaceId!,
    resourceType: req.body.resourceType,
  });
  const body: UploadSignatureResponse = signature;
  res.json(body);
}
