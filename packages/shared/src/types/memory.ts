import type { Id, IsoDate } from './common.js';

export type MemoryType = 'photo' | 'video' | 'text' | 'location' | 'audio';

export interface MemoryLocation {
  name: string;
  /** [longitud, latitud] (GeoJSON). */
  coordinates: [number, number];
}

/** Recuerdo tal y como lo expone la API. */
export interface PublicMemory {
  id: Id;
  spaceId: Id;
  albumId?: Id;
  type: MemoryType;
  title?: string;
  description?: string;
  mediaUrl?: string;
  mediaPublicId?: string;
  thumbnailUrl?: string;
  blurhash?: string;
  width?: number;
  height?: number;
  duration?: number;
  tags: string[];
  people: Id[];
  emotions: string[];
  location?: MemoryLocation;
  isFavorite: boolean;
  actualDate: IsoDate;
  createdAt: IsoDate;
  createdBy: Id;
  updatedAt: IsoDate;
}
