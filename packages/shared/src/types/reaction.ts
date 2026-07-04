import type { Id, IsoDate } from './common.js';

export type ReactionTargetType = 'memory' | 'album' | 'comment';

export const REACTION_EMOJIS = ['❤️', '🥰', '😂', '😭', '😍'] as const;
export type ReactionEmoji = (typeof REACTION_EMOJIS)[number];

export interface PublicReaction {
  id: Id;
  targetType: ReactionTargetType;
  targetId: Id;
  userId: Id;
  emoji: ReactionEmoji;
  createdAt: IsoDate;
}

/** Recuento agregado de un emoji sobre un objetivo, con si el usuario reaccionó. */
export interface ReactionSummary {
  emoji: ReactionEmoji;
  count: number;
  mine: boolean;
}
