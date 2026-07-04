import type { UploadSignatureResponse } from 'shared';

export interface CloudinaryUploadResult {
  secureUrl: string;
  publicId: string;
  width?: number;
  height?: number;
  duration?: number;
}

/**
 * Sube un archivo DIRECTAMENTE a Cloudinary usando la firma emitida por el
 * backend. El archivo no pasa por nuestro servidor: menos latencia y sin
 * saturar la API con vídeos grandes. Reporta progreso vía callback.
 */
export function uploadToCloudinary(
  file: File,
  sig: UploadSignatureResponse,
  onProgress?: (percent: number) => void,
): Promise<CloudinaryUploadResult> {
  const url = `https://api.cloudinary.com/v1_1/${sig.cloudName}/${sig.resourceType}/upload`;

  const form = new FormData();
  form.append('file', file);
  form.append('api_key', sig.apiKey);
  form.append('timestamp', String(sig.timestamp));
  form.append('signature', sig.signature);
  form.append('folder', sig.folder);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const data = JSON.parse(xhr.responseText);
        resolve({
          secureUrl: data.secure_url,
          publicId: data.public_id,
          width: data.width,
          height: data.height,
          duration: data.duration,
        });
      } else {
        reject(new Error('La subida a Cloudinary ha fallado'));
      }
    };

    xhr.onerror = () => reject(new Error('Error de red al subir el archivo'));
    xhr.send(form);
  });
}
