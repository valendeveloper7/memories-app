import { Outlet } from 'react-router-dom';
import { MAX_SPACE_MEMBERS } from 'shared';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useLogout } from '@/features/auth/hooks/useAuth';
import { useMySpace } from '@/features/spaces/hooks/useSpaces';
import { Button } from '@/components/ui/Button';

/** Marco común de la app autenticada: cabecera + contenido de la ruta. */
export function AppLayout() {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const { data: space } = useMySpace();
  const waitingForPartner = space ? space.members.length < MAX_SPACE_MEMBERS : false;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-neutral-200/70 bg-surface/80 backdrop-blur dark:border-neutral-800">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div>
            <span className="bg-gradient-to-r from-accent to-secondary bg-clip-text text-lg font-bold text-transparent">
              {space?.name ?? 'Nosotros'}
            </span>
            {waitingForPartner && space && (
              <span className="ml-3 rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
                Código: {space.inviteCode}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden text-sm text-neutral-500 sm:inline dark:text-neutral-400">
              {user?.name}
            </span>
            <Button variant="ghost" onClick={() => logout.mutate()} loading={logout.isPending}>
              Salir
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
