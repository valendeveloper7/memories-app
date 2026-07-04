import { useRef, useState, type DragEvent } from 'react';
import { motion } from 'framer-motion';
import { useUploadMemory } from '../hooks/useUploadMemory';

/** Zona de subida con drag & drop y selección de archivos. Muestra el progreso
 *  de cada archivo mientras sube a Cloudinary. */
export function MemoryUploader({ albumId }: { albumId?: string }) {
  const { upload, items } = useUploadMemory(albumId);
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragOver(false);
    if (event.dataTransfer.files.length > 0) upload(event.dataTransfer.files);
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${
          dragOver
            ? 'border-accent bg-accent/5'
            : 'border-neutral-300 hover:border-accent/60 dark:border-neutral-700'
        }`}
      >
        <span className="text-3xl">⬆️</span>
        <p className="mt-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Arrastra fotos o vídeos aquí, o haz clic para elegir
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && upload(e.target.files)}
        />
      </div>

      {items.length > 0 && (
        <div className="mt-3 space-y-2">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 text-sm">
              <span className="w-40 truncate text-neutral-500 dark:text-neutral-400">
                {item.file.name}
              </span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
                <motion.div
                  className={`h-full ${item.status === 'error' ? 'bg-red-400' : 'bg-accent'}`}
                  animate={{ width: `${item.progress}%` }}
                />
              </div>
              <span className="w-16 text-right text-xs text-neutral-400">
                {item.status === 'error' ? 'Error' : `${item.progress}%`}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
