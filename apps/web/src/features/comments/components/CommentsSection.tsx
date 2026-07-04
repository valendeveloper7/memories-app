import { useState, type FormEvent } from 'react';
import type { CommentTargetType } from 'shared';
import { useAuthStore } from '@/features/auth/store/authStore';
import { Button } from '@/components/ui/Button';
import { useComments, useCreateComment, useDeleteComment } from '../hooks/useComments';

/** Lista de comentarios de un objetivo + campo para añadir uno nuevo. */
export function CommentsSection({
  targetType,
  targetId,
}: {
  targetType: CommentTargetType;
  targetId: string;
}) {
  const currentUserId = useAuthStore((s) => s.user?.id);
  const { data: comments } = useComments(targetType, targetId);
  const createComment = useCreateComment(targetType, targetId);
  const deleteComment = useDeleteComment(targetType, targetId);
  const [text, setText] = useState('');

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const value = text.trim();
    if (!value) return;
    createComment.mutate(value, { onSuccess: () => setText('') });
  }

  return (
    <div className="flex h-full flex-col">
      <h3 className="mb-3 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
        Comentarios {comments && comments.length > 0 && `(${comments.length})`}
      </h3>

      <div className="flex-1 space-y-3 overflow-y-auto">
        {comments?.length === 0 && (
          <p className="text-sm text-neutral-400">Sé el primero en comentar.</p>
        )}
        {comments?.map((comment) => (
          <div key={comment.id} className="group flex gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/15 text-xs font-semibold text-accent">
              {comment.authorName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                  {comment.authorName}
                </span>
                {comment.authorId === currentUserId && (
                  <button
                    type="button"
                    onClick={() => deleteComment.mutate(comment.id)}
                    className="text-xs text-neutral-400 opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100"
                  >
                    borrar
                  </button>
                )}
              </div>
              <p className="text-sm text-neutral-600 dark:text-neutral-300">{comment.text}</p>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribe un comentario…"
          className="flex-1 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30 dark:border-neutral-700 dark:bg-neutral-900"
        />
        <Button type="submit" loading={createComment.isPending}>
          Enviar
        </Button>
      </form>
    </div>
  );
}
