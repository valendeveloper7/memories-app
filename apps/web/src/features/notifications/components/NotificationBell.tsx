import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { NotificationType, PublicNotification } from 'shared';
import { useMarkAllRead, useNotifications } from '../hooks/useNotifications';

const LABELS: Record<NotificationType, string> = {
  memory_added: 'añadió un recuerdo',
  comment_added: 'comentó',
  reaction_added: 'reaccionó a un recuerdo',
  album_shared: 'compartió un álbum',
};

function describe(n: PublicNotification): string {
  return `${n.actorName} ${LABELS[n.type]}`;
}

/** Campana con contador de no leídas y panel desplegable. Al abrir marca todo
 *  como leído. */
export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { data: notifications } = useNotifications();
  const markAllRead = useMarkAllRead();

  const unread = notifications?.filter((n) => !n.read).length ?? 0;

  function toggle() {
    const next = !open;
    setOpen(next);
    if (next && unread > 0) markAllRead.mutate();
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={toggle}
        aria-label="Notificaciones"
        className="relative rounded-full p-2 text-lg transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
      >
        🔔
        {unread > 0 && (
          <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white">
            {unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="absolute right-0 z-50 mt-2 max-h-96 w-72 overflow-y-auto rounded-2xl border border-neutral-200 bg-white p-2 shadow-xl dark:border-neutral-800 dark:bg-neutral-900"
            >
              {!notifications || notifications.length === 0 ? (
                <p className="p-4 text-center text-sm text-neutral-400">Sin notificaciones</p>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`rounded-xl p-3 text-sm ${
                      n.read ? '' : 'bg-accent/5'
                    }`}
                  >
                    <p className="text-neutral-700 dark:text-neutral-200">{describe(n)}</p>
                    <p className="mt-0.5 text-xs text-neutral-400">
                      {new Date(n.createdAt).toLocaleString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                ))
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
