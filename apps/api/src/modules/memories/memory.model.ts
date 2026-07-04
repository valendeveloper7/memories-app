import { Schema, model, type HydratedDocument, type Model, type Types } from 'mongoose';
import type { PublicMemory } from 'shared';

export interface MemoryDocument {
  spaceId: Types.ObjectId;
  albumId?: Types.ObjectId;
  type: 'photo' | 'video' | 'text' | 'location' | 'audio';
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
  people: Types.ObjectId[];
  emotions: string[];
  location?: { name: string; type: 'Point'; coordinates: [number, number] };
  isFavorite: boolean;
  actualDate: Date;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export type MemoryHydrated = HydratedDocument<MemoryDocument>;

const locationSchema = new Schema(
  {
    name: { type: String, required: true },
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }, // [lng, lat]
  },
  { _id: false },
);

const memorySchema = new Schema<MemoryDocument>(
  {
    spaceId: { type: Schema.Types.ObjectId, ref: 'Space', required: true, index: true },
    albumId: { type: Schema.Types.ObjectId, ref: 'Album', index: true },
    type: {
      type: String,
      enum: ['photo', 'video', 'text', 'location', 'audio'],
      required: true,
    },
    title: { type: String },
    description: { type: String },
    mediaUrl: { type: String },
    mediaPublicId: { type: String },
    thumbnailUrl: { type: String },
    blurhash: { type: String },
    width: { type: Number },
    height: { type: Number },
    duration: { type: Number },
    tags: { type: [String], default: [], index: true },
    people: { type: [Schema.Types.ObjectId], ref: 'Person', default: [] },
    emotions: { type: [String], default: [] },
    location: { type: locationSchema },
    isFavorite: { type: Boolean, default: false },
    actualDate: { type: Date, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

// Timeline: recuerdos del espacio ordenados por fecha real descendente.
memorySchema.index({ spaceId: 1, actualDate: -1 });
// Búsqueda de texto sobre título y descripción.
memorySchema.index({ title: 'text', description: 'text' });
// Geoconsultas (mapa, lugar más visitado).
memorySchema.index({ location: '2dsphere' });

export const MemoryModel: Model<MemoryDocument> = model<MemoryDocument>('Memory', memorySchema);

export function toPublicMemory(memory: MemoryHydrated): PublicMemory {
  return {
    id: memory._id.toString(),
    spaceId: memory.spaceId.toString(),
    albumId: memory.albumId?.toString(),
    type: memory.type,
    title: memory.title,
    description: memory.description,
    mediaUrl: memory.mediaUrl,
    mediaPublicId: memory.mediaPublicId,
    thumbnailUrl: memory.thumbnailUrl,
    blurhash: memory.blurhash,
    width: memory.width,
    height: memory.height,
    duration: memory.duration,
    tags: memory.tags,
    people: memory.people.map((p) => p.toString()),
    emotions: memory.emotions,
    location: memory.location
      ? { name: memory.location.name, coordinates: memory.location.coordinates }
      : undefined,
    isFavorite: memory.isFavorite,
    actualDate: memory.actualDate.toISOString(),
    createdAt: memory.createdAt.toISOString(),
    createdBy: memory.createdBy.toString(),
    updatedAt: memory.updatedAt.toISOString(),
  };
}
