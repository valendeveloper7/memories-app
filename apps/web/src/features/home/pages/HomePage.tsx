import { motion } from 'framer-motion';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useLogout } from '@/features/auth/hooks/useAuth';
import { Button } from '@/components/ui/Button';

/**
 * Pantalla de inicio (protegida). Placeholder del dashboard: saluda al usuario
 * autenticado y permite cerrar sesión. Se sustituirá por el feed real de
 * álbumes/recuerdos en fases posteriores.
 */
export function HomePage() {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();

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
        <p className="mt-4 max-w-md text-neutral-500 dark:text-neutral-400">
          Tu sesión está activa. Aquí vivirá el feed de álbumes y recuerdos.
        </p>
      </motion.div>

      <Button variant="ghost" onClick={() => logout.mutate()} loading={logout.isPending}>
        Cerrar sesión
      </Button>
    </main>
  );
}
