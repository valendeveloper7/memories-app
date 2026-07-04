# Nosotros — App de recuerdos para dos

Aplicación privada de recuerdos (fotos, vídeos, álbumes, línea de tiempo) para
dos personas, con un editor visual libre inspirado en Pinterest/Canva/Notion.

📄 **Documento completo de producto y arquitectura:** [`docs/ARQUITECTURA.md`](./docs/ARQUITECTURA.md)

Este documento cubre visión de producto, decisiones de arquitectura,
estructura de carpetas, modelo de datos, diagramas de flujo, diseño de la
API REST y el roadmap por fases. **Léelo antes de continuar** — el desarrollo
avanza paso a paso y cada fase se construye sobre las decisiones descritas ahí.

## Estructura del monorepo

Monorepo gestionado con **pnpm workspaces**:

```
apps/
  web/       # Frontend — React + Vite + TS + Tailwind + React Query + Zustand
  api/       # Backend — Express + TS + Mongoose (módulos por dominio)
packages/
  shared/    # Tipos TS + esquemas zod compartidos entre front y back
```

## Puesta en marcha

```bash
pnpm install
pnpm --filter shared build          # compila los tipos compartidos

# copia y rellena las variables de entorno
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

pnpm dev                            # arranca web (5173) y api (4000) en paralelo
```

Scripts útiles: `pnpm typecheck`, `pnpm lint`, `pnpm build`, `pnpm test`.

## Stack de testing

Vitest (unit) + Playwright (e2e) — deciden compartir configuración con Vite.

## Estado actual

✅ **Fase 0 — Fundación completada.** Esqueleto del monorepo operativo.

✅ **Paso 2 — Autenticación completada.**
- Backend: registro (bcrypt), login, `refresh` con **rotación de refresh tokens**
  (opacos, hasheados en BD, en cookie httpOnly), `logout`, middleware
  `requireAuth`, validación con zod y rate limiting en `/auth/*`.
- Frontend: store de sesión (Zustand, token en memoria), interceptor de axios
  con refresh automático y single-flight, guards de ruta, y páginas de
  login/registro que validan con los **mismos esquemas zod** del backend.
- Tests de runtime (Vitest + supertest) sobre la cadena de middlewares.

➡️ **Siguiente:** Paso 3 — módulo de Spaces (emparejar a la pareja).
