# Especificaciones del proyecto

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
| Envío de emails | Nodemailer (SMTP) |
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

| Área | Tecnología |
|---|---|
| Git hooks | Husky (`pre-push`) |
| CI | GitHub Actions |

## Modelos de base de datos

Solo existen dos modelos: `User` y `Product`. **No hay relación entre ellos**: los productos son
un catálogo compartido, y la autenticación controla *quién* puede operar sobre él, no *qué*
productos ve cada uno.

Fuente de verdad: `backend/prisma/schema.prisma`.

### User

| Campo | Tipo | Notas |
|---|---|---|
| `id` | `Int` | PK, `@default(autoincrement())` |
| `email` | `String` | `@unique` |
| `password` | `String` | Hasheada con bcrypt, nunca se devuelve en las respuestas |
| `name` | `String` | |
| `surname` | `String` | |
| `emailVerified` | `Boolean` | `@default(false)`. Pasa a `true` recién al confirmar el email |
| `createdAt` | `DateTime` | `@default(now())` |
| `updatedAt` | `DateTime` | `@updatedAt` |

### Product

| Campo | Tipo | Notas |
|---|---|---|
| `id` | `Int` | PK, `@default(autoincrement())` |
| `image` | `String` | URL de la imagen en Cloudinary. Obligatoria |
| `name` | `String` | |
| `description` | `String` | |
| `price` | `Float` | No negativo |
| `createdAt` | `DateTime` | `@default(now())` |
| `updatedAt` | `DateTime` | `@updatedAt` |

## Autenticación

- **Registro** (`POST /auth/register`): valida que el email no exista, hashea la contraseña y
  crea el usuario con `emailVerified: false`. Genera un token de confirmación y **envía el mail
  de confirmación**. Devuelve el usuario sin la contraseña. **No** inicia sesión.
- **Confirmación de cuenta** (`GET /auth/verify-email?token=...`): verifica la firma y el
  vencimiento del JWT y marca `emailVerified: true`. Si el token es inválido o está vencido,
  responde `400`. Si la cuenta ya estaba confirmada, responde `200` (operación idempotente).
- **Reenvío de confirmación** (`POST /auth/resend-verification`): emite un JWT nuevo y vuelve
  a enviar el mail. Responde siempre igual exista o no el email, para no filtrar usuarios registrados.
- **Login** (`POST /auth/login`): valida credenciales y emite un JWT en una **cookie httpOnly**
  (`secure` en producción, `sameSite` acorde al entorno). El token no se devuelve en el body.
  Si la cuenta no está confirmada, responde `403` y no emite cookie.
- **Logout** (`POST /auth/logout`): limpia la cookie.
- **Sesión actual** (`GET /auth/me`): devuelve el usuario autenticado a partir de la cookie.
- Las rutas de productos requieren autenticación. Sin cookie válida se responde `401`.
- El frontend envía siempre las peticiones con `withCredentials: true`.

## Confirmación de cuenta por email

- El envío se hace con **Nodemailer** sobre SMTP, encapsulado en un módulo `mail` del backend.
- El token de confirmación es un **JWT**, firmado con un secret propio
  (`JWT_VERIFICATION_SECRET`), distinto del secret de sesión. Vence a las **24 horas**
  (`JWT_VERIFICATION_EXPIRES_IN`).
- Su payload lleva `sub` (id del usuario) y `type: 'email-verification'`. Al confirmar se valida
  ese `type`, de modo que un token de sesión no sirve como token de confirmación ni al revés.
- El token **no se guarda en la base**: su vencimiento viaja en el propio JWT. Como la
  confirmación solo pone `emailVerified` en `true`, reusar un token ya usado no tiene efecto.
- El mail contiene un link al frontend: `${APP_URL}/verify-email?token=...`. Esa página del
  frontend llama al endpoint de confirmación y muestra el resultado (éxito, token inválido o
  vencido, con opción de reenviar).
- Un fallo en el envío del mail **no debe dejar el registro a medias**: si el mail no se pudo
  enviar, se informa el error y el usuario puede pedir el reenvío.
- En desarrollo se usa una cuenta SMTP de prueba; no se envían mails reales.

## Endpoints de productos

Todos requieren autenticación y operan sobre el catálogo compartido.

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/products` | Lista los productos |
| `GET` | `/products/:id` | Detalle de un producto |
| `POST` | `/products` | Crea un producto (`multipart/form-data`, incluye la imagen) |
| `PATCH` | `/products/:id` | Actualiza un producto (la imagen es opcional) |
| `DELETE` | `/products/:id` | Elimina un producto |

Un `id` inexistente responde `404`.

## Imágenes de productos

- El archivo se recibe con **Multer** en `memoryStorage` (buffer, sin escribir a disco) y se
  sube a **Cloudinary** desde un módulo `cloudinary` del backend. En `Product.image` se guarda
  la URL segura que devuelve Cloudinary, nunca el archivo.
- Validaciones del archivo en el backend: tipo `image/jpeg`, `image/png` o `image/webp`, y un
  tamaño máximo de **2 MB**. Si no cumple, responde `400`.
- **Crear** exige imagen. **Actualizar** la acepta como opcional: si no viene, se conserva la
  que ya estaba.
- Si la subida a Cloudinary falla, **no se crea el producto**: primero se sube la imagen y solo
  con la URL en mano se escribe en la base.
- En el frontend el formulario envía `FormData`. El esquema de Zod valida el archivo (tipo y
  tamaño) antes de enviarlo, con las mismas reglas que el backend.

## Validación

- **Backend**: DTOs validados con `ValidationPipe` global (`whitelist: true`,
  `forbidNonWhitelisted: true`).
- **Frontend**: esquemas de Zod para **lo que se envía** a los endpoints `POST`/`PATCH`
  (integrados con React Hook Form vía resolver) y para **lo que se recibe**, parseando las
  respuestas antes de usarlas. Los tipos del frontend se infieren de los esquemas de Zod.
- Los campos que viajan por `multipart/form-data` llegan como texto: `price` se convierte a
  número antes de validarlo (`Type`/`transform` en el DTO del backend, `coerce` en Zod).

## Rate limiting

Se aplica rate limiting global, con un límite más estricto en los endpoints de autenticación
(`register`, `login` y `resend-verification`) para mitigar fuerza bruta y el abuso del envío
de mails. Al superarse se responde `429`.

## Redis

Se usa como caché de lecturas frecuentes (listado y detalle de productos). Toda mutación sobre
un producto invalida las claves afectadas.

## Variables de entorno

Cada app tiene su propio `.env`, versionado como `.env.example` sin valores reales.

**Backend:** `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `PORT`,
`CORS_ORIGIN`, `NODE_ENV`, `JWT_VERIFICATION_SECRET`, `JWT_VERIFICATION_EXPIRES_IN`,
`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`,
`APP_URL` (base del frontend, usada para armar el link de confirmación),
`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.

**Frontend:** `VITE_API_URL`.

## Calidad y CI

- **Husky `pre-push`** (`.husky/pre-push`): corre en orden `lint:check`, `typecheck` y `build`,
  primero de backend y después de frontend. Usa `set -e`, así que el primer comando que falle
  aborta el push.
  - `backend`: `lint:check` = `eslint "{src,apps,libs,test}/**/*.ts"`,
    `typecheck` = `tsc --noEmit -p tsconfig.json`, `build` = `nest build`.
  - `frontend`: `lint:check` = `eslint --max-warnings 0 .`, `typecheck` = `tsc -b --noEmit`,
    `build` = `tsc -b && vite build`.
  - **`lint:check` nunca lleva `--fix`**: el hook valida, no corrige. Para corregir está el
    script `lint` de cada app, que se corre a mano.
  - El `package.json` de la raíz tiene el script `prepare: husky` (instala los hooks al correr
    `npm install`) y los atajos `lint:check`, `typecheck` y `build` que ejecutan ambas apps.
- **GitHub Actions** (`.github/workflows/ci.yml`): se dispara en los pull requests hacia
  `master` y en los push a `develop`.
  - Dos jobs independientes que corren en paralelo, `backend` y `frontend`, cada uno sobre
    Node 22 con caché de npm apuntada a su propio `package-lock.json`.
  - Ambos ejecutan `npm ci` y después `lint:check`, `typecheck` y `build` — los mismos scripts
    que corre el `pre-push`, así que lo que pasa en local pasa en el CI.
  - El job de backend agrega `npx prisma generate` antes de lintear: el cliente generado no se
    versiona (está en `backend/.gitignore`), así que sin ese paso no compila.
  - `concurrency` con `cancel-in-progress` para que un push nuevo cancele el run anterior de la
    misma rama.

## Criterios de aceptación

Una funcionalidad se considera correcta cuando:

1. Compila sin errores de TypeScript en ambas apps.
2. Los datos se validan en el backend (DTO) y en el frontend (Zod), en envío y recepción.
3. Los endpoints protegidos rechazan peticiones sin cookie válida.
4. La imagen se sube a Cloudinary y en la base queda su URL, nunca el archivo. Un archivo con
   tipo o tamaño inválido se rechaza en el frontend y en el backend.
5. Las contraseñas y los tokens de confirmación nunca aparecen en una respuesta.
6. Una cuenta sin confirmar no puede iniciar sesión, y el token de confirmación vencido se rechaza.
7. Las mutaciones invalidan las queries de TanStack Query afectadas.
8. Los errores de la API se muestran en la UI (no se fallan en silencio).
9. El `pre-push` y el CI pasan.

## Pendiente de instalar

Ya incorporados: Prisma (`@prisma/client`, `@prisma/adapter-pg`, `pg`), Husky
(`.husky/pre-push`) y Tailwind v4 (`tailwindcss`, `@tailwindcss/vite`).

Todavía faltan: Redis, `@nestjs/jwt`, `@nestjs/throttler`, `cookie-parser`, bcrypt, nodemailer,
multer (`@types/multer`), cloudinary y TanStack Query. Actualizar esta sección a medida que se
agreguen.
