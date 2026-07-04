import type { Id, IsoDate } from './common.js';

export type AlbumVisibility = 'private' | 'shared';

export interface AlbumBackgroundStyle {
  type: 'color' | 'gradient' | 'image';
  value: string;
}

/** Posición de un recurso dentro del lienzo del álbum (editor freeform, v1).
 *  x/y/w/h en unidades de grid para ser responsive. */
export interface AlbumLayoutItem {
  memoryId: Id;
  x: number;
  y: number;
  w: number;
  h: number;
  rotation: number;
  zIndex: number;
  borderRadius?: number;
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  locked?: boolean;
}

/** Álbum tal y como lo expone la API. `layout` solo se incluye en el detalle. */
export interface PublicAlbum {
  id: Id;
  spaceId: Id;
  title: string;
  description?: string;
  coverUrl?: string;
  color?: string;
  icon?: string;
  backgroundStyle?: AlbumBackgroundStyle;
  visibility: AlbumVisibility;
  isFavorite: boolean;
  isArchived: boolean;
  tags: string[];
  createdBy: Id;
  layout?: AlbumLayoutItem[];
  createdAt: IsoDate;
  updatedAt: IsoDate;
}
