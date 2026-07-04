# Nosotros — App de recuerdos para dos

Aplicación privada de recuerdos (fotos, vídeos, notas, álbumes, línea de tiempo)
para dos personas, con un editor visual libre inspirado en Pinterest/Canva/Notion.

📄 **Documento de producto y arquitectura:** [`docs/ARQUITECTURA.md`](./docs/ARQUITECTURA.md)

## Stack

- **Frontend:** React + Vite + TypeScript + TailwindCSS + React Query + Zustand + Framer Motion + Socket.io-client
- **Backend:** Node + Express + TypeScript + Mongoose (MongoDB) + JWT + Socket.io + Cloudinary
- **Compartido:** paquete `shared` con tipos TS y esquemas `zod` reutilizados en front y back
- **Monorepo:** pnpm workspaces
- **Tests:** Vitest + supertest (backend)

## Estructura

```
apps/
  web/       # Frontend (feature-based)
  api/       # Backend (módulos por dominio)
packages/
  shared/    # Tipos + esquemas zod compartidos
```

## Puesta en marcha

Requisitos: Node ≥ 20, pnpm 9, una instancia de MongoDB (local o Atlas) y una
cuenta de Cloudinary.

```bash
pnpm install
pnpm --filter shared build

# Variables de entorno
cp apps/api/.env.example apps/api/.env   # rellena MONGODB_URI y CLOUDINARY_*
cp apps/web/.env.example apps/web/.env

pnpm dev      # arranca web (5173) y api (4000) en paralelo
```

Scripts: `pnpm typecheck`, `pnpm build`, `pnpm test` (por workspace con `--filter`).

## Funcionalidades implementadas

- **Autenticación:** registro/login con JWT + refresh tokens rotativos (cookie
  httpOnly), refresh automático en el cliente.
- **Spaces (pareja):** crear/unirse con código de invitación; todo el contenido
  se escopa por `spaceId`.
- **Álbumes:** CRUD, favoritos, archivado, tags, color, icono, filtros.
- **Recuerdos:** fotos, vídeos y notas de texto; subida directa firmada a
  Cloudinary con progreso; paginación por cursor; favoritos.
- **Editor visual freeform:** arrastrar, redimensionar (snap a grid), rotar,
  capas, bloquear, guardar el diseño (concurrencia optimista).
- **Timeline:** línea vertical por año con animaciones al hacer scroll.
- **"Un día como hoy":** recuerdos de este día en años anteriores.
- **Búsqueda y filtros:** por texto, tipo y favoritos.
- **Comentarios y reacciones:** con emojis, en un lightbox por recuerdo.
- **Notificaciones en tiempo real:** Socket.io (recuerdo/comentario/reacción).
- **Estadísticas:** recuentos, días juntos, lugar top, mapa de calor de actividad.
- **Calendario:** cuadrícula mensual con miniaturas por día.
- **Personalización:** tema claro/oscuro/sistema, colores, tipografía, radios,
  densidad y animaciones — aplicado en runtime vía variables CSS.

## Roadmap pendiente (futuro)

- Compartir álbumes con terceros y permisos finos (viewer/editor/admin).
- Respuestas anidadas en comentarios (el modelo ya lo soporta).
- Subida de avatar de perfil (endpoint listo, falta UI).
- Recuerdos de audio y ubicación con mapa.
- Notificaciones push (FCM) y PWA offline.
- Suite E2E con Playwright.

## Seguridad

Helmet, CORS con whitelist, rate limiting (agresivo en `/auth`), bcrypt,
validación y sanitización con zod, `express-mongo-sanitize`, verificación de
pertenencia al Space como middleware transversal. El secret de Cloudinary vive
solo en el backend (`.env`, gitignored) y firma las subidas; nunca se expone al
cliente.
