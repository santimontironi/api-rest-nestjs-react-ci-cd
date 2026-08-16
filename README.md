# nestjs-react-ci-cd

> 🚧 **Proyecto en desarrollo activo.** La autenticación (registro, login, recuperación de
> contraseña) ya funciona de punta a punta; el resto de la app (productos, categorías, ventas,
> reportes) es todavía scaffolding. Ver [Estado](#estado) para el detalle de qué está hecho y qué
> falta.

Aplicación fullstack de **gestión de inventario con autenticación**, pensada para que un negocio
lleve su catálogo de productos por categoría, registre ventas (con descuento automático de stock)
y consulte reportes de esa actividad en un dashboard. El detalle funcional completo vive en
`.claude/spec.md`; este README documenta el estado real del código.

El catálogo es **compartido**: la autenticación define *quién* puede operar sobre él, no *qué*
productos ve cada uno. No hay autorregistro: las cuentas se dan de alta por fuera del panel.

## Es un proyecto de aprendizaje

Los productos son una excusa. El dominio se mantiene deliberadamente simple porque **el objetivo
no es el CRUD, sino practicar los conceptos que lo rodean** e integrarlos de punta a punta con
prácticas de producción:

- **CI/CD** — GitHub Actions validando cada push a `develop` y cada pull request hacia `master`,
  más un hook de Husky en `pre-push` que corre en local exactamente lo mismo que el CI.
- **JWT en cookies httpOnly** — en lugar de guardar tokens en `localStorage`.
- **Recuperación de contraseña por email** — con Nodemailer y un token de un solo uso.
- **PostgreSQL + Prisma** — incluyendo migraciones.
- **Validación en las dos puntas** — Zod en ambos lados, tanto de lo que se envía como de lo que
  se recibe, con los esquemas compartidos desde `shared/`.
- **Estado de servidor con TanStack Query** — caché, invalidación y estados de carga y error.

Pendientes de incorporar (están en la idea del proyecto, todavía no en el código):

- **Rate limiting** con `@nestjs/throttler`, más estricto en los endpoints de autenticación.
- **Redis** como caché de lecturas frecuentes, invalidada en cada mutación.
- **Subida de imágenes** con Multer y almacenamiento en Cloudinary.

También sirve como base de referencia repetible para arrancar futuros proyectos fullstack con
autenticación, validación y CI ya resueltos, y como sistema listo para ofrecer a negocios de la
zona (no es un SaaS: cada negocio tendría su propia instancia).

## Stack

### Backend (`backend/`)

| Área | Tecnología |
|---|---|
| Framework | NestJS 11 |
| Lenguaje | TypeScript |
| Base de datos | PostgreSQL |
| ORM | Prisma |
| Caché | Redis |
| Autenticación | JWT firmado, transportado en cookie httpOnly |
| Hash de contraseñas | bcrypt |
| Envío de emails | Nodemailer (servicio `gmail`) |

Pendientes: rate limiting (`@nestjs/throttler`), Redis, carga de imágenes con Multer y
Cloudinary.

### Frontend (`frontend/`)

| Área | Tecnología |
|---|---|
| Librería | React 19 + TypeScript |
| Build | Vite |
| Estilos | Tailwind CSS v4 |
| Estado de servidor | TanStack Query |
| Formularios | React Hook Form |
| Validación | Zod |
| Cliente HTTP | Axios |
| Ruteo | React Router |

### Global

Husky (`pre-push`) y GitHub Actions para CI.

## Estructura

```
.
├── backend/          API REST con NestJS
│   ├── prisma/       schema.prisma + migraciones
│   └── src/
│       ├── auth/     register, login, forgot/reset password, guard de sesión
│       ├── config/   configuración del transporter de Nodemailer
│       ├── mail/     MailService + plantilla del mail de recuperación
│       ├── products/ scaffold vacío (controller y service sin implementar)
│       └── main.ts
├── frontend/         SPA con React + Vite
│   └── src/
│       ├── hooks/     useLogin
│       ├── pages/     Login (implementada), ResetPassword (placeholder)
│       ├── services/  cliente de Axios + auth.service
│       ├── types/
│       └── App.tsx
├── shared/schemas/    esquemas de Zod compartidos entre backend y frontend
├── .github/workflows/ci.yml
├── .husky/pre-push
└── package.json      coordinador del monorepo
```

La raíz **no** es un workspace de npm: cada app tiene su propio `package.json` y su propio
`package-lock.json`. Los scripts de la raíz son atajos que delegan con `npm --prefix`.

## Requisitos

- Node.js 22 (la versión que usa el CI)
- PostgreSQL
- Redis
- Una cuenta de Gmail con **2FA activo** y una **contraseña de aplicación** (la contraseña normal
  de la cuenta no sirve para SMTP)
- Una cuenta de Cloudinary

## Puesta en marcha

```bash
# 1. Dependencias (la raíz instala los hooks de Husky vía `prepare`)
npm install
npm --prefix backend install
npm --prefix frontend install

# 2. Variables de entorno: crear backend/.env (ver más abajo)

# 3. Base de datos
npm --prefix backend exec prisma migrate dev
npm --prefix backend exec prisma generate

# 4. Levantar cada app en una terminal
npm --prefix backend run start:dev   # http://localhost:3000
npm --prefix frontend run dev        # http://localhost:5173
```

El cliente de Prisma se genera en `backend/generated/prisma` y **no se versiona**: después de
clonar el repo o de tocar `schema.prisma` hay que correr `prisma generate`.

## Variables de entorno

El `.env` de cada app **no se versiona**. Los valores de abajo son de ejemplo: hay que
reemplazarlos por los propios.

### `backend/.env`

Lo que hoy consume el backend:

```bash
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/nestjs-react-ci-cd?schema=public"

EMAIL_USER="tu-cuenta@gmail.com"
EMAIL_PASS="contraseña-de-aplicacion-de-gmail"

JWT_SECRET="un-secret-largo-y-aleatorio"

FRONTEND_URL="http://localhost:5173"
```

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | Cadena de conexión a PostgreSQL. La lee Prisma |
| `EMAIL_USER` | Cuenta de Gmail remitente |
| `EMAIL_PASS` | **Contraseña de aplicación** de esa cuenta (requiere 2FA activo; la contraseña normal no sirve) |
| `JWT_SECRET` | Secret con el que se firman los JWT: el de sesión y el de recuperación de contraseña |
| `FRONTEND_URL` | Base del frontend: arma el link del mail de recuperación y es el `origin` habilitado en CORS |

Las variables se cargan con `dotenv/config` (importado como primera línea de `backend/src/main.ts`)
y con `@nestjs/config` registrado global en `AppModule`. Prisma no las carga solo: las toma vía
`backend/prisma.config.ts`.

Todavía no están en el `.env` porque los módulos que las usan no existen; se agregan cuando se
implementen:

| Variable | Para qué |
|---|---|
| `PORT` | Puerto de la API. Sin ella, `main.ts` cae a `3000` |
| `NODE_ENV` | `development` / `production` (cookie `secure`, `sameSite`) |
| `REDIS_URL` | Cadena de conexión a Redis |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Credenciales de Cloudinary |

### `frontend/.env`

```bash
VITE_BACKEND_URL="http://localhost:3000/api"
```

| Variable | Descripción |
|---|---|
| `VITE_BACKEND_URL` | Base URL de la API, usada por la instancia de Axios en `frontend/src/services/api.ts`. Incluye el prefijo `/api` |

## Modelos

La fuente de verdad es `backend/prisma/schema.prisma`. Hoy define cinco modelos, pero **solo
`User` tiene lógica de negocio implementada** — el resto existe en el schema (con sus migraciones
aplicadas) a la espera de los módulos que los usen.

- **User**: `id`, `email` (único), `password` (hasheada, nunca se devuelve), `name`, `surname`,
  `createdAt`, `updatedAt`.
- **Category**: `id`, `name`, relación uno a muchos con `Product`.
- **Product**: `id`, `image`, `name`, `description`, `stock`, `price`, `categoryId` (relación con
  `Category`).
- **Sale**: `id`, `total`, relación uno a muchos con `SaleItem`.
- **SaleItem**: línea de una venta — `quantity`, `unitPrice`, `productName` y `categoryName`
  desnormalizados (para conservar el detalle aunque el producto o la categoría cambien o se
  borren después), más una referencia opcional a `Product` (`onDelete: SetNull`).

## API

Todas las rutas llevan el prefijo global `/api` (configurado en `main.ts`).

### Autenticación (`/api/auth`) — implementado

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/auth/register` | Crea el usuario. No inicia sesión |
| `POST` | `/auth/login` | Valida credenciales y emite el JWT en una cookie httpOnly (`session_token`) |
| `POST` | `/auth/forgot-password` | Si el email existe, envía un link de recuperación. Responde igual en ambos casos |
| `POST` | `/auth/reset-password/:token` | Actualiza la contraseña si el token es válido. Token inválido, vencido o de otro tipo → `400` |
| `GET` | `/auth/me` | Devuelve el usuario de la sesión actual (requiere `JwtAuthGuard`) |

`POST /auth/register` no tiene pantalla en el frontend a propósito (ver spec): el panel no tiene
autorregistro, las cuentas se dan de alta por fuera de esa UI. Todavía faltan por implementar
`POST /auth/logout` y `PATCH /auth/change-password` (cambio de contraseña con sesión activa),
ambos ya especificados en `.claude/spec.md`.

### Catálogo, ventas y reportes — planeado

Los modelos ya están en el schema; los endpoints están especificados en `.claude/spec.md` pero
ninguno tiene controller ni service todavía (`products/` es un scaffold vacío, y no existen
módulos `categories`, `sales` ni `reports` en `backend/src`).

| Grupo | Rutas | Qué van a hacer |
|---|---|---|
| Productos | `GET/POST/PATCH/DELETE /products`, `POST /products/import` | CRUD del catálogo (imagen en Cloudinary) + alta masiva desde un Excel |
| Categorías | `GET/POST/PATCH/DELETE /categories` | CRUD; borrar una categoría borra en cascada sus productos |
| Ventas | `GET/POST /sales` | Registrar una venta con una o más líneas; descuenta stock en una transacción atómica |
| Reportes | `GET /reports/*` (7 endpoints) | Agregaciones de solo lectura para un dashboard: ventas por período/categoría, top productos, stock bajo, etc. |

Detalle de cada endpoint, validaciones y reglas de negocio: `.claude/spec.md`.

### Decisiones a tener en cuenta

- El token de sesión **nunca** viaja en el body: solo en la cookie httpOnly `session_token`.
- El token de recuperación de contraseña es un JWT firmado con el mismo `JWT_SECRET` que el de
  sesión, pero con `type: 'password-reset'` en el payload y `expiresIn: '1h'`; esa validación es
  la que impide reutilizar un token de sesión como token de recuperación. No se guarda en la base.
- La duración del token de sesión **no** es una variable de entorno: va hardcodeada (`1d`) en el
  `signOptions` del `JwtModule`.

## Scripts

Desde la raíz, para las dos apps en orden (backend y después frontend):

| Script | Qué hace |
|---|---|
| `npm run lint:check` | Lintea sin corregir |
| `npm run typecheck` | Chequeo de tipos sin emitir |
| `npm run build` | Compila ambas apps |

Por app:

| App | Script | Qué hace |
|---|---|---|
| backend | `start:dev` | Levanta la API en modo watch |
| backend | `lint` | Lintea **corrigiendo** (`--fix`) |
| backend | `test`, `test:e2e` | Jest |
| frontend | `dev` | Levanta Vite |
| frontend | `preview` | Sirve el build |
| frontend | `lint` | Lintea sin `--max-warnings 0` |

`lint:check` nunca lleva `--fix`: valida, no corrige. Para corregir está `lint`, que se corre a
mano.

## Calidad y CI

**Husky `pre-push`** (`.husky/pre-push`) corre 6 pasos con `set -e`, así que el primero que falle
aborta el push: `lint:check`, `typecheck` y `build` del backend, y después los mismos tres del
frontend.

**GitHub Actions** (`.github/workflows/ci.yml`) se dispara en los pull requests hacia `master` y
en los push a `develop`. Dos jobs en paralelo, `backend` y `frontend`, sobre Node 22 con caché de
npm apuntada a cada `package-lock.json`. Cada uno corre `npm ci` y después los mismos
`lint:check`, `typecheck` y `build` del hook, así que lo que pasa en local pasa en el CI. El job
de backend agrega `npx prisma generate` antes de lintear. Hay `concurrency` con
`cancel-in-progress`: un push nuevo cancela el run anterior de la misma rama.

Nunca saltear los hooks con `--no-verify`. Si el `pre-push` falla, se arregla la causa.

## Flujo de trabajo

Se trabaja sobre `develop`. `master` solo recibe cambios vía pull request, y no se mergea nada con
el CI en rojo.

## Estado

**🚧 Proyecto en desarrollo**, construido de forma incremental.

Hecho:

- Esquema de Prisma (`User`, `Category`, `Product`, `Sale`, `SaleItem`) con sus migraciones.
- Auth completa: registro, login con cookie httpOnly, recuperación de contraseña
  (`forgot-password` / `reset-password/:token`) y `me`, con guard de sesión (`JwtAuthGuard`).
- Módulo `mail` con el transporter de Gmail y la plantilla del mail de recuperación de contraseña.
- Frontend: página de login estilada y funcional contra la API.
- CI/CD: hook de Husky en `pre-push` y GitHub Actions con los mismos checks.

Pendiente:

- Módulos `products`, `categories`, `sales` y `reports` (ver tabla de arriba): sus modelos ya
  están en el schema, pero ningún endpoint está implementado.
- `POST /auth/logout` y `PATCH /auth/change-password`.
- Página de recuperación de contraseña en el frontend (`ResetPassword.tsx` es un placeholder).
- Rate limiting (`@nestjs/throttler`), Redis, y subida/importación de imágenes con Multer +
  Cloudinary.

## Documentación

El detalle funcional y las convenciones del proyecto viven en `.claude/`:

- `context.md` — de qué trata el proyecto, su objetivo y qué problema resuelve.
- `spec.md` — especificaciones, modelos, endpoints (implementados y planeados) y criterios de
  aceptación. Es la fuente de verdad del alcance funcional; este README solo resume el estado
  actual del código.
- `rules.md` — convenciones, arquitectura y restricciones de código.

Si cambian los requerimientos, esa documentación se actualiza **antes** de implementar.
