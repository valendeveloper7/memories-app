import type { Id, IsoDate } from './common.js';

export type SpaceRole = 'owner' | 'member';

/** Miembro del Space con datos de display (nombre/avatar) resueltos. */
export interface SpaceMember {
  userId: Id;
  name: string;
  avatarUrl?: string;
  role: SpaceRole;
  joinedAt: IsoDate;
}

/** Space ("la pareja") tal y como lo expone la API. */
export interface PublicSpace {
  id: Id;
  name: string;
  members: SpaceMember[];
  inviteCode: string;
  anniversaryDate?: IsoDate;
  createdAt: IsoDate;
}

/** Nº máximo de miembros por Space (una pareja). Ampliable en el futuro. */
export const MAX_SPACE_MEMBERS = 2;
