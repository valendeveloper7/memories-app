import { REACTION_EMOJIS, type ReactionTargetType } from 'shared';
import { useReactions, useToggleReaction } from '../hooks/useReactions';

/** Fila de reacciones con emoji. Resalta las del usuario y muestra recuentos. */
export function ReactionBar({
  targetType,
  targetId,
}: {
  targetType: ReactionTargetType;
  targetId: string;
}) {
  const { data: summary } = useReactions(targetType, targetId);
  const toggle = useToggleReaction(targetType, targetId);

  return (
    <div className="flex flex-wrap gap-1.5">
      {REACTION_EMOJIS.map((emoji) => {
        const entry = summary?.find((s) => s.emoji === emoji);
        const mine = entry?.mine ?? false;
        return (
          <button
            key={emoji}
            type="button"
            onClick={() => toggle.mutate(emoji)}
            className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-sm transition-all active:scale-90 ${
              mine
                ? 'border-accent bg-accent/10'
                : 'border-neutral-200 hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800'
            }`}
          >
            <span>{emoji}</span>
            {entry && entry.count > 0 && (
              <span className="text-xs text-neutral-500 dark:text-neutral-400">{entry.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
