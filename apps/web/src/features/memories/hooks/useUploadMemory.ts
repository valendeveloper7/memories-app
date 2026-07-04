import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { MediaResourceType, MemoryType } from 'shared';
import { memoriesApi } from '../api/memories.api';
import { uploadToCloudinary } from '../api/uploadToCloudinary';
import { memoryKeys } from './useMemories';

interface UploadItem {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'done' | 'error';
}

function resourceTypeOf(file: File): MediaResourceType {
  return file.type.startsWith('video/') ? 'video' : 'image';
}

function memoryTypeOf(file: File): MemoryType {
  return file.type.startsWith('video/') ? 'video' : 'photo';
}

/**
 * Orquesta la subida de uno o varios archivos: por cada uno pide firma al
 * backend, sube directo a Cloudinary y crea el recuerdo asociado al álbum.
 * Expone el progreso individual para pintar la UI.
 */
export function useUploadMemory(albumId?: string) {
  const queryClient = useQueryClient();
  const [items, setItems] = useState<UploadItem[]>([]);

  function patch(id: string, partial: Partial<UploadItem>) {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...partial } : it)));
  }

  async function uploadOne(file: File): Promise<void> {
    const id = crypto.randomUUID();
    setItems((prev) => [...prev, { id, file, progress: 0, status: 'uploading' }]);

    try {
      const sig = await memoriesApi.getUploadSignature({ resourceType: resourceTypeOf(file) });
      const result = await uploadToCloudinary(file, sig, (p) => patch(id, { progress: p }));

      await memoriesApi.create({
        type: memoryTypeOf(file),
        albumId,
        mediaUrl: result.secureUrl,
        mediaPublicId: result.publicId,
        width: result.width,
        height: result.height,
        duration: result.duration,
        actualDate: new Date(file.lastModified).toISOString(),
      });

      patch(id, { status: 'done', progress: 100 });
    } catch {
      patch(id, { status: 'error' });
    }
  }

  async function upload(files: FileList | File[]): Promise<void> {
    await Promise.all(Array.from(files).map(uploadOne));
    await queryClient.invalidateQueries({ queryKey: memoryKeys.all });
    // Limpia los completados tras un momento.
    setTimeout(() => setItems((prev) => prev.filter((it) => it.status === 'error')), 1500);
  }

  return { upload, items };
}
