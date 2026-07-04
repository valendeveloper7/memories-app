import { motion } from 'framer-motion';

/**
 * Pantalla placeholder de la fundación. Confirma que React, Tailwind,
 * las variables de tema y Framer Motion funcionan de extremo a extremo.
 * Se reemplazará por el dashboard real en fases posteriores.
 */
export function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <h1 className="bg-gradient-to-r from-accent to-secondary bg-clip-text text-5xl font-bold text-transparent">
          Nosotros
        </h1>
        <p className="mt-4 max-w-md text-neutral-500 dark:text-neutral-400">
          Nuestro rincón de recuerdos. La fundación del proyecto está lista.
        </p>
      </motion.div>

      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="rounded-full bg-accent/10 px-4 py-1 text-sm font-medium text-accent"
      >
        Fase 0 · Esqueleto operativo
      </motion.span>
    </main>
  );
}
