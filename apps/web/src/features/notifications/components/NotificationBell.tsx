import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { PublicNotification } from 'shared';
import { useMarkAllRead, useNotifications } from '../hooks/useNotifications';
import { useI18n } from '@/i18n/useI18n';

/** Campana con contador de no leídas y panel desplegable. Al abrir marca todo
 *  como leído. */
export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { data: notifications } = useNotifications();
  const markAllRead = useMarkAllRead();
  const { t, locale } = useI18n();

  const describe = (n: PublicNotification): string =>
    t(`notifications.${n.type}`, { actor: n.actorName });

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
        aria-label={t('notifications.aria')}
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
                <p className="p-4 text-center text-sm text-neutral-400">
                  {t('notifications.empty')}
                </p>
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
                      {new Date(n.createdAt).toLocaleString(locale, {
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
