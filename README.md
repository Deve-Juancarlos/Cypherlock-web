# CYPHERLOCK · Panel de administración (web)

Panel web **solo para cuentas ADMIN** de CYPHERLOCK: resumen operativo, domicilios y
dispositivos de cada puerta, cuentas, solicitudes de instalación y actividad en vivo.
Proyecto independiente de la API (FastAPI) y de la app Flutter; comparte su paleta.

**Stack:** React 19 · TypeScript · Vite 8 · Tailwind CSS 4 · Motion · TanStack Query ·
React Router 7 · Zod · Lucide · Vitest.

## Arquitectura por capas

```
src/
├─ core/            # transversal: config, errores (AppError), sesión, utilidades
│  ├─ config/env.ts
│  ├─ errors/AppError.ts        # traduce {detail, error:{code,message,request_id}}
│  ├─ auth/tokenStorage.ts      # access en memoria, refresh en sessionStorage
│  └─ utils/
├─ network/         # HTTP y canal en vivo
│  ├─ httpClient.ts             # Bearer, refresh single-flight, validación zod
│  ├─ eventStream.ts            # WebSocket con auth por primer mensaje
│  └─ endpoints.ts
├─ data/            # contrato con la API
│  ├─ dto/                      # esquemas zod (snake_case, tal cual el backend)
│  └─ datasources/remote.ts     # una función por endpoint
├─ domain/          # modelo del negocio (independiente de HTTP)
│  ├─ models/                   # entidades camelCase + máquina de estados
│  └─ repositories/             # interfaces (contratos)
├─ repository/      # implementación HTTP de los repositorios + mappers DTO→dominio
└─ presentation/    # implementación de la UI
   ├─ app/                      # DI de repositorios, sesión, router
   ├─ hooks/                    # casos de uso con TanStack Query + canal en vivo
   ├─ components/ui|layout/     # sistema de componentes
   └─ features/                 # auth · dashboard · domicilios · usuarios · solicitudes · eventos
```

La UI solo conoce `domain/repositories`. `main.tsx` inyecta la implementación HTTP
(`createHttpRepositories()`); en las pruebas se inyectan fakes.

## Puesta en marcha

```bash
npm install
cp .env.example .env        # VITE_API_PROXY_TARGET = URL del backend
npm run dev                 # http://localhost:5173 (usa --port si está ocupado)
```

En desarrollo, Vite reenvía `/api` y `/ws` al backend (sin CORS).

| Script | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo con proxy a la API |
| `npm run build` | Typecheck + build de producción en `dist/` |
| `npm test` | Pruebas (Vitest + Testing Library) |
| `npm run typecheck` | Solo TypeScript |
| `npx impeccable detect src` | Detector de anti-patrones de UI |

## Producción

1. `VITE_API_BASE_URL=https://cypherlock-api.onrender.com npm run build` y publicar `dist/`
   como sitio estático (con *rewrite* de todas las rutas a `index.html`).
2. **El backend debe permitir el origen del panel en CORS.** Hoy, con `PRODUCTION=true`,
   la API tiene `allow_origins=[]`, así que un panel en otro dominio será bloqueado
   por el navegador. Hace falta configurar el origen del panel en el backend.

## Seguridad

- Solo entra `rol = ADMIN` (se verifica con `/me` tras el login; cualquier otro rol se
  rechaza y su sesión se revoca).
- Access token solo en memoria; refresh en `sessionStorage` (muere con la pestaña). El
  backend rota el refresh en cada uso: el cliente lo renueva **una sola vez** aunque
  lleguen varios 401 a la vez, para no disparar la detección de reuso.
- WebSocket: el JWT va en el primer mensaje, nunca en la URL.
- Las credenciales de un dispositivo nuevo se muestran **una sola vez** en pantalla.
- Ningún secreto vive en el bundle: todo lo que empieza por `VITE_` es público.

## Diseño

- Paleta idéntica a `AppColors` de Flutter (tokens en `src/index.css`, `@theme`).
- Modo *Operate* de [impeccable](https://github.com/pbakaus/impeccable): familiaridad,
  estados completos (hover, foco, cargando, vacío, error), movimiento solo para estado.
- Sistema recomendado por **UI UX Pro Max**: tema oscuro, Fira Sans (UI) + Fira Code
  (datos).
- Componentes al estilo shadcn / 21st.dev, animados con **Motion**.
- Escena del login con la técnica de **riso-windowseat**: cada cuadro es una función
  pura del tiempo (`seek(t)`), determinista y sin librerías; se congela con
  `prefers-reduced-motion`.
- Las skills de impeccable y UI UX Pro Max están instaladas en `.claude/` de este
  proyecto: abre Claude Code en esta carpeta para usar `/impeccable audit`, `polish`, etc.
