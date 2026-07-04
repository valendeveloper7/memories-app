import { Schema, model, type HydratedDocument, type Model, type Types } from 'mongoose';
import { DEFAULT_USER_PREFERENCES, type PublicUser } from 'shared';

export interface UserDocument {
  name: string;
  email: string;
  passwordHash: string;
  avatarUrl?: string;
  spaceId?: Types.ObjectId;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    accentColor: string;
    secondaryColor: string;
    fontFamily: string;
    borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'full';
    density: 'compact' | 'comfortable' | 'spacious';
    backgroundImage?: string;
    animationsEnabled: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export type UserHydrated = HydratedDocument<UserDocument>;

const preferencesSchema = new Schema(
  {
    theme: { type: String, enum: ['light', 'dark', 'system'], default: DEFAULT_USER_PREFERENCES.theme },
    accentColor: { type: String, default: DEFAULT_USER_PREFERENCES.accentColor },
    secondaryColor: { type: String, default: DEFAULT_USER_PREFERENCES.secondaryColor },
    fontFamily: { type: String, default: DEFAULT_USER_PREFERENCES.fontFamily },
    borderRadius: {
      type: String,
      enum: ['none', 'sm', 'md', 'lg', 'full'],
      default: DEFAULT_USER_PREFERENCES.borderRadius,
    },
    density: {
      type: String,
      enum: ['compact', 'comfortable', 'spacious'],
      default: DEFAULT_USER_PREFERENCES.density,
    },
    backgroundImage: { type: String },
    animationsEnabled: { type: Boolean, default: DEFAULT_USER_PREFERENCES.animationsEnabled },
  },
  { _id: false },
);

const userSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true, select: false },
    avatarUrl: { type: String },
    spaceId: { type: Schema.Types.ObjectId, ref: 'Space' },
    preferences: { type: preferencesSchema, default: () => ({}) },
  },
  { timestamps: true },
);

export const UserModel: Model<UserDocument> = model<UserDocument>('User', userSchema);

/** Convierte un documento de Mongoose en la forma pública que expone la API. */
export function toPublicUser(user: UserHydrated): PublicUser {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    spaceId: user.spaceId?.toString(),
    preferences: user.preferences,
    createdAt: user.createdAt.toISOString(),
  };
}
