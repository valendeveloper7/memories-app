/** Bloque de carga con shimmer. Se usa como placeholder mientras llega data. */
export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-neutral-200/70 dark:bg-neutral-800/70 ${className}`}
    />
  );
}
