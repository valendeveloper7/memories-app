import { Schema, model, type HydratedDocument, type Model, Types } from 'mongoose';

export interface SpaceMemberSub {
  userId: Types.ObjectId;
  role: 'owner' | 'member';
  joinedAt: Date;
}

export interface SpaceDocument {
  name: string;
  members: SpaceMemberSub[];
  inviteCode: string;
  anniversaryDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type SpaceHydrated = HydratedDocument<SpaceDocument>;

const memberSchema = new Schema<SpaceMemberSub>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['owner', 'member'], required: true },
    joinedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const spaceSchema = new Schema<SpaceDocument>(
  {
    name: { type: String, required: true, trim: true },
    members: { type: [memberSchema], default: [] },
    inviteCode: { type: String, required: true, unique: true, index: true },
    anniversaryDate: { type: Date },
  },
  { timestamps: true },
);

export const SpaceModel: Model<SpaceDocument> = model<SpaceDocument>('Space', spaceSchema);
