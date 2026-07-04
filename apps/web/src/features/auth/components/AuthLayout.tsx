import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

/** Envoltorio visual compartido por las pantallas de login y registro. */
export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-accent/5 to-secondary/5 px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-sm rounded-3xl border border-neutral-200/70 bg-white/80 p-8 shadow-xl backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/80"
      >
        <div className="mb-6 text-center">
          <h1 className="bg-gradient-to-r from-accent to-secondary bg-clip-text text-2xl font-bold text-transparent">
            {title}
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{subtitle}</p>
        </div>
        {children}
        <div className="mt-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
          {footer}
        </div>
      </motion.div>
    </main>
  );
}
