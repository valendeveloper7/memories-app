import { Types } from 'mongoose';
import { REACTION_EMOJIS, type ReactionSummary, type ToggleReactionInput } from 'shared';
import { assertTargetInSpace } from '../../utils/assertTargetInSpace.js';
import { ReactionModel } from './reaction.model.js';

interface Scope {
  spaceId: string;
  userId: string;
}

/** Añade o quita una reacción (toggle). Devuelve el resumen actualizado. */
export async function toggleReaction(
  scope: Scope,
  input: ToggleReactionInput,
): Promise<ReactionSummary[]> {
  await assertTargetInSpace(scope.spaceId, input.targetType, input.targetId);

  const filter = {
    targetType: input.targetType,
    targetId: new Types.ObjectId(input.targetId),
    userId: new Types.ObjectId(scope.userId),
    emoji: input.emoji,
  };

  const existing = await ReactionModel.findOne(filter);
  if (existing) {
    await existing.deleteOne();
  } else {
    await ReactionModel.create({ ...filter, spaceId: new Types.ObjectId(scope.spaceId) });
  }

  return summarize(scope.userId, input.targetType, input.targetId);
}

/** Resumen de reacciones (recuento por emoji + si el usuario reaccionó). */
export async function listReactions(
  scope: Scope,
  targetType: 'memory' | 'album' | 'comment',
  targetId: string,
): Promise<ReactionSummary[]> {
  await assertTargetInSpace(scope.spaceId, targetType, targetId);
  return summarize(scope.userId, targetType, targetId);
}

async function summarize(
  userId: string,
  targetType: string,
  targetId: string,
): Promise<ReactionSummary[]> {
  const reactions = await ReactionModel.find({
    targetType,
    targetId: new Types.ObjectId(targetId),
  });

  return REACTION_EMOJIS.map((emoji) => {
    const forEmoji = reactions.filter((r) => r.emoji === emoji);
    return {
      emoji,
      count: forEmoji.length,
      mine: forEmoji.some((r) => r.userId.toString() === userId),
    };
  }).filter((summary) => summary.count > 0);
}
