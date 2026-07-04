import { motion } from 'framer-motion';
import { useOnThisDay } from '../hooks/useMemories';
import { MemoryCard } from './MemoryCard';

/** Banner "Hace un año / Hoy hace X años": muestra recuerdos de este mismo día
 *  en años anteriores. Solo aparece si hay coincidencias. */
export function OnThisDayBanner() {
  const { data: memories } = useOnThisDay();
  if (!memories || memories.length === 0) return null;

  const currentYear = new Date().getFullYear();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="mb-8 rounded-3xl bg-gradient-to-br from-accent/10 to-secondary/10 p-5"
    >
      <div className="mb-3 flex items-center gap-2">
        <span className="text-xl">✨</span>
        <h2 className="font-bold text-neutral-900 dark:text-neutral-100">Un día como hoy</h2>
      </div>
      <div className="grid auto-rows-[140px] grid-cols-3 gap-3 sm:grid-cols-5">
        {memories.map((memory) => {
          const years = currentYear - new Date(memory.actualDate).getFullYear();
          return (
            <div key={memory.id} className="relative">
              <MemoryCard memory={memory} />
              <span className="absolute left-1.5 top-1.5 rounded-full bg-black/50 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur">
                {years === 1 ? 'Hace 1 año' : `Hace ${years} años`}
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
