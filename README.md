# nestjs-react-ci-cd

Aplicación fullstack de **gestión de productos con autenticación**. El usuario se registra,
confirma su cuenta por email, inicia sesión y a partir de ahí administra el catálogo de productos
(crear, listar, editar y eliminar), con una imagen por producto.

El catálogo es **compartido**: la autenticación define *quién* puede operar sobre él, no *qué*
productos ve cada uno.

## Es un proyecto de aprendizaje

Los productos son una excusa. El dominio se mantiene deliberadamente simple porque **el objetivo
no es el CRUD, sino practicar los conceptos que lo rodean** e integrarlos de punta a punta con
prácticas de producción:

- **CI/CD** — GitHub Actions validando cada push a `develop` y cada pull request hacia `master`,
  más un hook de Husky en `pre-push` que corre en local exactamente lo mismo que el CI.
- **Rate limiting** — protección de la API con `@nestjs/throttler`, con un límite más estricto en
  los endpoints de autenticación para mitigar fuerza bruta y el abuso del envío de mails.
- **Redis** — caché de las lecturas frecuentes (listado y detalle de productos) e invalidación de
  las claves afectadas en cada mutación.
- **JWT en cookies httpOnly** — en lugar de guardar tokens en `localStorage`.
- **Confirmación de cuenta por email** — con Nodemailer y un token de verificación propio.
- **PostgreSQL + Prisma** — incluyendo migraciones.
- **Subida de imágenes** — Multer en memoria y almacenamiento en Cloudinary.
- **Validación en las dos puntas** — DTOs con `class-validator` en el backend y Zod en el
  frontend, tanto de lo que se envía como de lo que se recibe.
- **Estado de servidor con TanStack Query** — caché, invalidación y estados de carga y error.

También sirve como base de referencia repetible para arrancar futuros proyectos fullstack con
autenticación, validación y CI ya resueltos.

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
| Protección | Rate limiting (`@nestjs/throttler`) |
| Hash de contraseñas | bcrypt |
| Envío de emails | Nodemailer (servicio `gmail`) |
| Carga de archivos | Multer (`@nestjs/platform-express`) |
| Almacenamiento de imágenes | Cloudinary |

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
│       ├── auth/     register, login, logout, verificación de email, guards
│       ├── config/   configuración del transporter de Nodemailer
│       ├── mail/     MailService + plantillas de email
│       ├── products/ CRUD del catálogo
│       └── main.ts
├── frontend/         SPA con React + Vite
│   └── src/
│       ├── components/
│       ├── hooks/
│       ├── pages/
│       ├── validations/  esquemas de Zod
│       └── App.tsx
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
| `JWT_SECRET` | Secret con el que se firman los JWT: el de sesión y el de confirmación de email |
| `FRONTEND_URL` | Base del frontend, usada para armar el link de confirmación del mail |

Las variables se cargan con `dotenv/config` (importado como primera línea de `backend/src/main.ts`)
y con `@nestjs/config` registrado global en `AppModule`. Prisma no las carga solo: las toma vía
`backend/prisma.config.ts`.

Todavía no están en el `.env` porque los módulos que las usan no existen; se agregan cuando se
implementen:

| Variable | Para qué |
|---|---|
| `PORT` | Puerto de la API. Sin ella, `main.ts` cae a `3000` |
| `NODE_ENV` | `development` / `production` (cookie `secure`, `sameSite`) |
| `CORS_ORIGIN` | Origen permitido para el frontend |
| `REDIS_URL` | Cadena de conexión a Redis |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Credenciales de Cloudinary |

### `frontend/.env`

Todavía no existe: el frontend no consume ninguna variable por ahora. Cuando se agregue la
instancia de Axios va a necesitar:

```bash
VITE_API_URL="http://localhost:3000"
```

## Modelos

Solo existen `User` y `Product`, **sin relación entre ellos** (catálogo compartido). La fuente de
verdad es `backend/prisma/schema.prisma`.

- **User**: `id`, `email` (único), `password` (hasheada, nunca se devuelve), `name`, `surname`,
  `emailVerified` (arranca en `false`), `createdAt`, `updatedAt`.
- **Product**: `id`, `image` (URL de Cloudinary, obligatoria), `name`, `description`, `price`,
  `createdAt`, `updatedAt`.

## API

### Autenticación

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/auth/register` | Crea el usuario con `emailVerified: false` y envía el mail de confirmación. No inicia sesión |
| `GET` | `/auth/verify-email?token=...` | Confirma la cuenta. Token inválido o vencido → `400`. Cuenta ya confirmada → `200` (idempotente) |
| `POST` | `/auth/resend-verification` | Reemite el token y reenvía el mail. Responde igual exista o no el email |
| `POST` | `/auth/login` | Emite el JWT en una cookie httpOnly. Cuenta sin confirmar → `403` |
| `POST` | `/auth/logout` | Limpia la cookie |
| `GET` | `/auth/me` | Devuelve el usuario de la sesión actual |

### Productos

Todos requieren cookie de sesión válida; sin ella responden `401`. Un `id` inexistente → `404`.

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/products` | Lista los productos |
| `GET` | `/products/:id` | Detalle de un producto |
| `POST` | `/products` | Crea un producto (`multipart/form-data`, imagen obligatoria) |
| `PATCH` | `/products/:id` | Actualiza un producto (imagen opcional) |
| `DELETE` | `/products/:id` | Elimina un producto |

### Decisiones a tener en cuenta

- El token de sesión **nunca** viaja en el body: solo en la cookie httpOnly. El frontend hace
  todas las peticiones con `withCredentials: true`.
- El token de confirmación es un JWT firmado con el mismo `JWT_SECRET` que el de sesión, pero con
  `type: 'email-verification'` en el payload: esa validación es la que separa ambos tokens, así un
  token de sesión no sirve como token de confirmación ni al revés. No se guarda en la base.
- Las duraciones de los tokens **no** son variables de entorno: van hardcodeadas donde se firman
  (`1d` el de sesión en el `JwtModule`, `24h` el de confirmación en su `signAsync`).
- Las imágenes se reciben con Multer en `memoryStorage` y se suben a Cloudinary; en la base queda
  la URL, nunca el archivo. Si la subida falla, el producto no se crea.
- Validación de archivos (`image/jpeg`, `image/png`, `image/webp`, máx. 2 MB) tanto en el
  frontend con Zod como en el backend.
- Rate limiting global, más estricto en `register`, `login` y `resend-verification` → `429`.
- Redis cachea el listado y el detalle de productos; toda mutación invalida las claves afectadas.

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

Proyecto en etapa inicial: la spec está completa y las funcionalidades se construyen de forma
incremental. Hoy están hechos el scaffolding de ambas apps, el esquema de Prisma con sus
migraciones, el `PrismaService`, el módulo `mail` (transporter de Gmail, `MailService` y plantilla
del mail de confirmación) y las páginas de login y registro del frontend.

Los módulos `auth` y `products` del backend todavía son scaffolds vacíos, y faltan los módulos
`cloudinary` y `redis`. Dependencias pendientes de instalar: Redis, `@nestjs/throttler`,
`cookie-parser`, bcrypt, `@types/multer`, cloudinary y TanStack Query.

## Documentación

El detalle vive en `.claude/`:

- `context.md` — de qué trata el proyecto y qué problema resuelve.
- `spec.md` — especificaciones, requerimientos y criterios de aceptación.
- `rules.md` — convenciones, arquitectura y restricciones de código.

Si cambian los requerimientos, se actualiza esa documentación **antes** de implementar.
