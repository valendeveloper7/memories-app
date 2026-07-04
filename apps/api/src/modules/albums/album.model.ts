import { Schema, model, type HydratedDocument, type Model, type Types } from 'mongoose';
import type { PublicAlbum } from 'shared';

interface LayoutItemSub {
  memoryId: Types.ObjectId;
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

export interface AlbumDocument {
  spaceId: Types.ObjectId;
  title: string;
  description?: string;
  coverUrl?: string;
  color?: string;
  icon?: string;
  backgroundStyle?: { type: 'color' | 'gradient' | 'image'; value: string };
  visibility: 'private' | 'shared';
  isFavorite: boolean;
  isArchived: boolean;
  tags: string[];
  createdBy: Types.ObjectId;
  layout: LayoutItemSub[];
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export type AlbumHydrated = HydratedDocument<AlbumDocument>;

const layoutItemSchema = new Schema<LayoutItemSub>(
  {
    memoryId: { type: Schema.Types.ObjectId, ref: 'Memory', required: true },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    w: { type: Number, required: true },
    h: { type: Number, required: true },
    rotation: { type: Number, default: 0 },
    zIndex: { type: Number, default: 0 },
    borderRadius: { type: Number },
    shadow: { type: String, enum: ['none', 'sm', 'md', 'lg'] },
    locked: { type: Boolean },
  },
  { _id: false },
);

const backgroundStyleSchema = new Schema(
  {
    type: { type: String, enum: ['color', 'gradient', 'image'], required: true },
    value: { type: String, required: true },
  },
  { _id: false },
);

const albumSchema = new Schema<AlbumDocument>(
  {
    spaceId: { type: Schema.Types.ObjectId, ref: 'Space', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String },
    coverUrl: { type: String },
    color: { type: String },
    icon: { type: String },
    backgroundStyle: { type: backgroundStyleSchema },
    visibility: { type: String, enum: ['private', 'shared'], default: 'shared' },
    isFavorite: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false },
    tags: { type: [String], default: [] },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    layout: { type: [layoutItemSchema], default: [] },
    version: { type: Number, default: 0 },
  },
  { timestamps: true },
);

// Índice para el listado típico: álbumes no archivados de un espacio, recientes.
albumSchema.index({ spaceId: 1, isArchived: 1, updatedAt: -1 });

export const AlbumModel: Model<AlbumDocument> = model<AlbumDocument>('Album', albumSchema);

/** Serializa un álbum al contrato público. `includeLayout` solo en el detalle. */
export function toPublicAlbum(album: AlbumHydrated, includeLayout = false): PublicAlbum {
  return {
    id: album._id.toString(),
    spaceId: album.spaceId.toString(),
    title: album.title,
    description: album.description,
    coverUrl: album.coverUrl,
    color: album.color,
    icon: album.icon,
    backgroundStyle: album.backgroundStyle,
    visibility: album.visibility,
    isFavorite: album.isFavorite,
    isArchived: album.isArchived,
    tags: album.tags,
    createdBy: album.createdBy.toString(),
    ...(includeLayout && {
      layout: album.layout.map((item) => ({
        memoryId: item.memoryId.toString(),
        x: item.x,
        y: item.y,
        w: item.w,
        h: item.h,
        rotation: item.rotation,
        zIndex: item.zIndex,
        borderRadius: item.borderRadius,
        shadow: item.shadow,
        locked: item.locked,
      })),
    }),
    createdAt: album.createdAt.toISOString(),
    updatedAt: album.updatedAt.toISOString(),
  };
}
