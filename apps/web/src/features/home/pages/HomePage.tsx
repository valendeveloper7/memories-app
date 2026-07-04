import { motion } from 'framer-motion';
import { MAX_SPACE_MEMBERS } from 'shared';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useLogout } from '@/features/auth/hooks/useAuth';
import { useMySpace } from '@/features/spaces/hooks/useSpaces';
import { Button } from '@/components/ui/Button';

/**
 * Pantalla de inicio (protegida, requiere Space). Placeholder del dashboard:
 * saluda, muestra el espacio y, si aún falta la pareja, el código para
 * invitarla. Se sustituirá por el feed de álbumes/recuerdos en fases futuras.
 */
export function HomePage() {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const { data: space } = useMySpace();

  const waitingForPartner = space ? space.members.length < MAX_SPACE_MEMBERS : false;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <h1 className="bg-gradient-to-r from-accent to-secondary bg-clip-text text-4xl font-bold text-transparent">
          Hola, {user?.name ?? 'de nuevo'} 👋
        </h1>
        {space && (
          <p className="mt-4 max-w-md text-neutral-500 dark:text-neutral-400">
            Estás en <span className="font-semibold text-accent">{space.name}</span>. Aquí vivirá el
            feed de álbumes y recuerdos.
          </p>
        )}
      </motion.div>

      {waitingForPartner && space && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-neutral-200 bg-white/70 p-5 text-sm dark:border-neutral-800 dark:bg-neutral-900/70"
        >
          <p className="text-neutral-500 dark:text-neutral-400">
            Comparte este código con tu pareja para que se una:
          </p>
          <div className="mt-2 flex items-center justify-center gap-2">
            <code className="rounded-lg bg-accent/10 px-4 py-2 text-lg font-bold tracking-widest text-accent">
              {space.inviteCode}
            </code>
            <Button
              variant="ghost"
              onClick={() => navigator.clipboard?.writeText(space.inviteCode)}
              aria-label="Copiar código"
            >
              Copiar
            </Button>
          </div>
        </motion.div>
      )}

      <Button variant="ghost" onClick={() => logout.mutate()} loading={logout.isPending}>
        Cerrar sesión
      </Button>
    </main>
  );
}
