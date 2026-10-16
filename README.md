# nestjs-react-ci-cd

## Qué problema resuelve

En muchos negocios, cuando un cliente pregunta por un producto (si hay stock, cuánto cuesta, si
lo trabajan), el dueño no tiene la respuesta a mano: tiene que revisar el depósito, buscar en
anotaciones o consultar al proveedor, y el cliente se queda esperando.

Este sistema le da al dueño una interfaz para **gestionar sus productos de forma rápida y
eficiente**: el catálogo, los precios y el stock están cargados y actualizados en un solo lugar,
y se encuentran al instante con el buscador. Así puede darle la información al cliente en el
momento, sin demoras ni consultas de por medio.

Aplicación fullstack de **gestión de inventario con autenticación**, pensada para que un negocio
lleve su catálogo de productos por categoría y, más adelante, registre ventas (con descuento
automático de stock). El detalle funcional completo vive en `.claude/spec.md`; este README
documenta el estado real del código.

El catálogo es **compartido**: la autenticación define _quién_ puede operar sobre él, no _qué_
productos ve cada uno. No hay autorregistro: las cuentas se dan de alta por fuera del panel.

## Es un proyecto universitario, con mirada a producto real

Nace como trabajo práctico de la carrera, pero el dominio (productos) se eligió simple a
propósito porque **el objetivo no es el CRUD en sí, sino practicar los conceptos que lo rodean**
e integrarlos de punta a punta con prácticas de producción reales — no solo lo mínimo para
aprobar. La idea es que, con la base técnica sólida, el día de mañana se pueda ofrecer como
sistema de gestión a negocios puntuales:

- **CI/CD** — GitHub Actions validando cada push a `develop` y cada pull request hacia `master`,
  más un hook de Husky en `pre-push` que corre en local exactamente lo mismo que el CI.
- **JWT en cookies httpOnly** — en lugar de guardar tokens en `localStorage`.
- **Recuperación de contraseña por email** — con Nodemailer y un token de un solo uso.
- **Rate limiting** — límite global de peticiones y uno más estricto en los endpoints de
  autenticación, con `@nestjs/throttler`.
- **PostgreSQL con SQL puro** — sin ORM: las queries se escriben a mano con `pg` (ver
  `backend/src/sql/`), por pedido explícito de la cátedra.
- **Subida de imágenes** — Multer (buffer en memoria) + almacenamiento en Cloudinary.
- **Validación en las dos puntas** — Zod en ambos lados, tanto de lo que se envía como de lo que
  se recibe, con los esquemas compartidos desde `shared/`.
- **Estado de servidor con TanStack Query** — caché, invalidación y estados de carga y error.

También sirve como base de referencia repetible para arrancar futuros proyectos fullstack con
autenticación, validación y CI ya resueltos.

## Stack

### Backend (`backend/`)

| Área                       | Tecnología                                   |
| -------------------------- | -------------------------------------------- |
| Framework                  | NestJS 11                                    |
| Lenguaje                   | TypeScript                                   |
| Base de datos              | PostgreSQL                                   |
| Acceso a datos             | SQL puro (`pg`), sin ORM                     |
| Autenticación              | JWT firmado, transportado en cookie httpOnly |
| Protección                 | Rate limiting (`@nestjs/throttler`)          |
| Hash de contraseñas        | bcrypt                                       |
| Envío de emails            | Nodemailer (servicio `gmail`)                |
| Carga de archivos          | Multer (`@nestjs/platform-express`)          |
| Almacenamiento de imágenes | Cloudinary                                   |

### Frontend (`frontend/`)

| Área               | Tecnología            |
| ------------------ | --------------------- |
| Librería           | React 19 + TypeScript |
| Build              | Vite                  |
| Estilos            | Tailwind CSS v4       |
| Estado de servidor | TanStack Query        |
| Formularios        | React Hook Form       |
| Validación         | Zod                   |
| Cliente HTTP       | Axios                 |
| Ruteo              | React Router          |
| Íconos             | Bootstrap Icons       |
| Alertas            | SweetAlert2           |

### Global

Husky (`pre-push`) y GitHub Actions para CI.

## Estructura

```
.
├── backend/            API REST con NestJS
│   └── src/
│       ├── auth/       register, login, logout, forgot/reset password, me, guard de sesión
│       ├── products/   CRUD completo (listar, detalle, crear, editar, borrar) con imagen
│       ├── categories/ listar, detalle, crear y borrar (con cascada de sus productos); falta editar
│       ├── customers/  clientes frecuentes: listar, crear y borrar; faltan detalle y editar
│       ├── sales/      scaffold vacío (module/controller/service sin rutas ni lógica)
│       ├── sql/        SqlService (pool de `pg`) + SqlModule, reemplaza al antiguo PrismaService
│       ├── cloudinary/ CloudinaryService (sube el buffer de la imagen, devuelve la URL; también borra)
│       ├── config/     configuración de Nodemailer y de Cloudinary
│       ├── mail/       MailService + plantilla del mail de recuperación
│       ├── common/     pipes compartidos (validación con Zod)
│       ├── utils/      constantes (rate limiting, validación de archivos)
│       └── main.ts
├── frontend/           SPA con React + Vite
│   └── src/
│       ├── components/
│       │   ├── products/   Products, ProductsTable, ProductDetail, InputProductModal, EditProductModal
│       │   ├── categories/ Categories, CategoryCard, CategoryDetail, InputCategoryModal
│       │   ├── customers/  Customers, CustomersTable, InputCustomerModal
│       │   ├── sales/      Sales (placeholder)
│       │   ├── auth/       InputMailModal, VerifyAuth (guard de rutas)
│       │   └── ui/         Sidebar, Settings (toggle de tema claro/oscuro), Loader, GoBack
│       ├── hooks/       una carpeta con sufijo "Hooks" por entidad (authHooks, productsHooks,
│       │               categoriesHooks, customersHooks)
│       ├── pages/       Login, Home (panel con Sidebar), ChangePassword (placeholder), ResetPassword
│       ├── services/    cliente de Axios + auth/product/category/customer.service
│       ├── context/     ThemeContext (tema claro/oscuro)
│       ├── types/
│       └── App.tsx
├── shared/schemas/     esquemas de Zod compartidos entre backend y frontend
├── .github/workflows/ci.yml
├── .husky/pre-push
└── package.json        coordinador del monorepo
```

La raíz **no** es un workspace de npm: cada app tiene su propio `package.json` y su propio
`package-lock.json`. Los scripts de la raíz son atajos que delegan con `npm --prefix`.

## Requisitos

- Node.js 22 (la versión que usa el CI)
- PostgreSQL
- Una cuenta de Gmail con **2FA activo** y una **contraseña de aplicación** (la contraseña normal
  de la cuenta no sirve para SMTP)
- Una cuenta de Cloudinary

Redis todavía no lo usa ningún módulo, así que no hace falta para levantar el proyecto hoy.

## Puesta en marcha

```bash
# 1. Dependencias (la raíz instala los hooks de Husky vía `prepare`)
npm install
npm --prefix backend install
npm --prefix frontend install

# 2. Variables de entorno: crear backend/.env y frontend/.env (ver más abajo)

# 3. Base de datos: crearla y correr las tablas a mano contra Postgres (psql o pgAdmin).
#    No hay ORM ni migraciones versionadas en el repo: el detalle de columnas, tipos y
#    relaciones de cada tabla está en .claude/spec.md ("Modelos de base de datos").

# 4. Levantar cada app en una terminal
npm --prefix backend run start:dev   # http://localhost:3000
npm --prefix frontend run dev        # http://localhost:5173
```

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

PORT=3000
NODE_ENV="development"

CLOUDINARY_CLOUD_NAME="tu-cloud-name"
CLOUDINARY_API_KEY="tu-api-key"
CLOUDINARY_API_SECRET="tu-api-secret"
```

| Variable                                                               | Descripción                                                                                             |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`                                                         | Cadena de conexión a PostgreSQL, usada por `SqlService` (pool de `pg`)                                  |
| `EMAIL_USER`                                                           | Cuenta de Gmail remitente                                                                               |
| `EMAIL_PASS`                                                           | **Contraseña de aplicación** de esa cuenta (requiere 2FA activo; la contraseña normal no sirve)         |
| `JWT_SECRET`                                                           | Secret con el que se firman los JWT: el de sesión y el de recuperación de contraseña                    |
| `FRONTEND_URL`                                                         | Base del frontend: arma el link del mail de recuperación y es el `origin` habilitado en CORS            |
| `PORT`                                                                 | Puerto de la API. Sin ella, `main.ts` cae a `3000`                                                      |
| `NODE_ENV`                                                             | `development` / `production`: controla `secure` y `sameSite` de la cookie de sesión                     |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Credenciales de Cloudinary, usadas por `CloudinaryService` para subir y borrar las imágenes de producto |

Las variables se cargan con `dotenv/config` (importado como primera línea de `backend/src/main.ts`)
y con `@nestjs/config` registrado global en `AppModule`.

Todavía no está en el `.env` porque el módulo que la usa no existe:

| Variable    | Para qué                                                   |
| ----------- | ---------------------------------------------------------- |
| `REDIS_URL` | Cadena de conexión a Redis (caché de productos, pendiente) |

### `frontend/.env`

```bash
VITE_BACKEND_URL="http://localhost:3000/api"
```

| Variable           | Descripción                                                                                                      |
| ------------------ | ---------------------------------------------------------------------------------------------------------------- |
| `VITE_BACKEND_URL` | Base URL de la API, usada por la instancia de Axios en `frontend/src/services/api.ts`. Incluye el prefijo `/api` |

## Modelos

No hay ORM: el esquema se gestiona directamente en Postgres, sin archivo versionado en el repo.
La fuente de verdad documentada es `.claude/spec.md`. Hoy existen seis tablas, pero **`Sale` y
`SaleItem` todavía no tienen ningún módulo que los use** — el módulo `sales` está scaffoldeado a
la espera de sus endpoints.

- **User**: `id`, `email` (único), `password` (hasheada con bcrypt, nunca se devuelve), `name`,
  `surname`, `createdAt`, `updatedAt`.
- **Category**: `id`, `name` (único), `createdAt`, relación uno a muchos con `Product`.
- **Product**: `id`, `image`/`imagePublicId` (Cloudinary, opcionales), `name`, `description`,
  `stock`, `price`, `categoryId` (relación con `Category`), `createdAt`, `updatedAt`.
- **Customer**: `id`, `name`, `surname`, `phone`. Solo se cargan clientes frecuentes, no todos los
  que compran.
- **Sale**: `id`, `total`, `paymentMethod` (`CASH` | `TRANSFER`), referencia opcional a
  `Customer` con snapshot de nombre/apellido/teléfono, relación uno a muchos con `SaleItem`.
- **SaleItem**: línea de una venta — `quantity`, `unitPrice`, `productName` y `categoryName`
  desnormalizados (para conservar el detalle aunque el producto o la categoría cambien o se
  borren después), más una referencia opcional a `Product`.

## API

Todas las rutas llevan el prefijo global `/api` (configurado en `main.ts`).

### Autenticación (`/api/auth`) — implementado

| Método | Ruta                          | Descripción                                                                                   |
| ------ | ----------------------------- | --------------------------------------------------------------------------------------------- |
| `POST` | `/auth/register`              | Crea el usuario. No inicia sesión                                                             |
| `POST` | `/auth/login`                 | Valida credenciales y emite el JWT en una cookie httpOnly (`session_token`)                   |
| `POST` | `/auth/logout`                | Limpia la cookie de sesión                                                                    |
| `POST` | `/auth/forgot-password`       | Si el email existe, envía un link de recuperación                                             |
| `POST` | `/auth/reset-password/:token` | Actualiza la contraseña si el token es válido. Token inválido, vencido o de otro tipo → `400` |
| `GET`  | `/auth/me`                    | Devuelve el usuario de la sesión actual (requiere `JwtAuthGuard`)                             |

`POST /auth/register` no tiene pantalla en el frontend a propósito (ver spec): el panel no tiene
autorregistro, las cuentas se dan de alta por fuera de esa UI. `PATCH /auth/change-password`
todavía **no** está implementado: `ChangePassword.tsx` es un placeholder.

### Productos (`/api/products`) — implementado

| Método   | Ruta            | Descripción                                                                                    |
| -------- | --------------- | ---------------------------------------------------------------------------------------------- |
| `GET`    | `/products`     | Lista los productos, con su categoría (requiere `JwtAuthGuard`)                                |
| `GET`    | `/products/:id` | Detalle de un producto                                                                         |
| `POST`   | `/products`     | Crea un producto con imagen (`multipart/form-data`, sube a Cloudinary vía `CloudinaryService`) |
| `PATCH`  | `/products/:id` | Actualiza un producto; la imagen es opcional (si no viene, conserva la que tenía)              |
| `DELETE` | `/products/:id` | Borra el producto y, si tenía imagen propia, también la borra de Cloudinary                    |

Falta `POST /products/import` (alta masiva desde Excel), especificado en `.claude/spec.md`.

En el frontend, la sección "Productos" del panel lista el catálogo, permite dar de alta, editar y
borrar productos vía modal (`InputProductModal`/`EditProductModal`), y ver el detalle de cada uno
(`ProductDetail`).

### Categorías (`/api/categories`) — parcial

| Método   | Ruta              | Descripción                                                                        |
| -------- | ----------------- | ---------------------------------------------------------------------------------- |
| `GET`    | `/categories`     | Lista las categorías, con la cantidad de productos de cada una                     |
| `GET`    | `/categories/:id` | Detalle de una categoría, con sus productos                                        |
| `POST`   | `/categories`     | Crea una categoría (`name`, único). Responde `400` si ya existe una con ese nombre |
| `DELETE` | `/categories/:id` | Borra la categoría y todos sus productos, en cascada (transacción atómica)         |

Falta `PATCH /categories/:id` (editar), especificado en `.claude/spec.md`.

En el frontend, la sección "Categorías" del panel lista las categorías con su conteo de productos
(`CategoryCard`), permite dar de alta vía modal y ver el detalle de cada una (`CategoryDetail`).
Falta editar.

### Clientes frecuentes (`/api/customers`) — parcial

| Método   | Ruta             | Descripción                                               |
| -------- | ---------------- | --------------------------------------------------------- |
| `GET`    | `/customers`     | Lista los clientes, con la cantidad de ventas de cada uno |
| `POST`   | `/customers`     | Da de alta un cliente (`name`, `surname`, `phone`)        |
| `DELETE` | `/customers/:id` | Da de baja (borra) un cliente                             |

Faltan `GET /customers/:id` (detalle, con historial de compras) y `PATCH /customers/:id`
(editar), especificados en `.claude/spec.md`.

En el frontend, la sección "Clientes frecuentes" del panel lista los clientes (`CustomersTable`)
y permite dar de alta vía modal (`InputCustomerModal`). Falta detalle y editar.

### Ventas — planeado

El módulo `sales` existe (`sales.module.ts`, `sales.controller.ts`, `sales.service.ts`) pero está
**scaffoldeado**: sin rutas ni lógica todavía. `Sales.tsx` en el frontend es un placeholder.
Endpoints especificados en `.claude/spec.md`:

| Rutas             | Qué van a hacer                                                                      |
| ----------------- | ------------------------------------------------------------------------------------ |
| `GET/POST /sales` | Registrar una venta con una o más líneas; descuenta stock en una transacción atómica |

Detalle de validaciones y reglas de negocio: `.claude/spec.md`. La sección de reportes/dashboard
que estaba planeada se sacó del alcance del proyecto (no se pide en la consigna universitaria) y
ya no figura en la spec.

### Decisiones a tener en cuenta

- El token de sesión **nunca** viaja en el body: solo en la cookie httpOnly `session_token`.
- El token de recuperación de contraseña es un JWT firmado con el mismo `JWT_SECRET` que el de
  sesión, pero con `type: 'password-reset'` en el payload y `expiresIn: '10m'`; esa validación es
  la que impide reutilizar un token de sesión como token de recuperación. No se guarda en la base.
- La duración del token de sesión **no** es una variable de entorno: va hardcodeada (`1d`) en el
  `signOptions` del `JwtModule`.
- No hay ORM: cada service arma su SQL a mano y lo ejecuta a través de `SqlService`
  (`backend/src/sql/`), que solo envuelve un pool de `pg`. Las transacciones (borrado en cascada
  de categoría, y a futuro el registro de ventas) usan `SqlService.transaction()`.

## Scripts

Desde la raíz, para las dos apps en orden (backend y después frontend):

| Script               | Qué hace                    |
| -------------------- | --------------------------- |
| `npm run lint:check` | Lintea sin corregir         |
| `npm run typecheck`  | Chequeo de tipos sin emitir |
| `npm run build`      | Compila ambas apps          |

Por app:

| App      | Script             | Qué hace                         |
| -------- | ------------------ | -------------------------------- |
| backend  | `start:dev`        | Levanta la API en modo watch     |
| backend  | `lint`             | Lintea **corrigiendo** (`--fix`) |
| backend  | `test`, `test:e2e` | Jest                             |
| frontend | `dev`              | Levanta Vite                     |
| frontend | `preview`          | Sirve el build                   |
| frontend | `lint`             | Lintea sin `--max-warnings 0`    |

`lint:check` nunca lleva `--fix`: valida, no corrige. Para corregir está `lint`, que se corre a
mano.

## Calidad y CI

**Husky `pre-push`** (`.husky/pre-push`) corre 6 pasos con `set -e`, así que el primero que falle
aborta el push: `lint:check`, `typecheck` y `build` del backend, y después los mismos tres del
frontend.

**GitHub Actions** (`.github/workflows/ci.yml`) se dispara en los pull requests hacia `master` y
en los push a `develop`. Dos jobs en paralelo, `backend` y `frontend`, sobre Node 22 con caché de
npm apuntada a cada `package-lock.json`. Cada uno corre `npm ci` y después los mismos
`lint:check`, `typecheck` y `build` del hook, así que lo que pasa en local pasa en el CI. Hay
`concurrency` con `cancel-in-progress`: un push nuevo cancela el run anterior de la misma rama.

Nunca saltear los hooks con `--no-verify`. Si el `pre-push` falla, se arregla la causa.

## Flujo de trabajo

Se trabaja sobre `develop`. `master` solo recibe cambios vía pull request, y no se mergea nada con
el CI en rojo.

## Estado

**🚧 Proyecto en desarrollo**, construido de forma incremental. Es un trabajo universitario, con
la mira puesta en convertirlo en un producto que se pueda ofrecer a negocios reales más adelante.

Hecho:

- Esquema de Postgres (`User`, `Category`, `Product`, `Customer`, `Sale`, `SaleItem`) gestionado
  con SQL puro, sin ORM — por pedido explícito de la cátedra. `Sale`/`SaleItem` existen en la base
  pero ningún endpoint los usa todavía.
- Auth: registro, login/logout con cookie httpOnly, recuperación de contraseña
  (`forgot-password` / `reset-password/:token`) y `me`, con guard de sesión (`JwtAuthGuard`).
  Falta el cambio de contraseña con sesión activa.
- Rate limiting: límite global de peticiones y uno más estricto en los endpoints de autenticación
  (`@nestjs/throttler`).
- Productos: CRUD completo (listar, detalle, crear, editar, borrar), con subida y borrado de
  imagen en Cloudinary (`CloudinaryService`) vía Multer.
- Categorías: listar, detalle, crear y borrar (con cascada sobre sus productos, en transacción).
  Falta editar.
- Clientes frecuentes: listar, crear y borrar. Falta detalle y editar.
- Módulo `mail` con el transporter de Gmail y la plantilla del mail de recuperación de contraseña.
- Frontend — auth y cuenta: login, logout, `me` y recuperación de contraseña, funcionando contra
  la API.
- Frontend — panel: layout con `Sidebar` (branding "Vortex PC") + secciones (`Home.tsx`).
  Productos, Categorías y Clientes frecuentes listan datos reales, dan de alta vía modal, y
  Productos/Categorías también editan/borran y muestran detalle. Ajustes tiene un toggle de tema
  claro/oscuro funcional.
- CI/CD: hook de Husky en `pre-push` y GitHub Actions con los mismos checks.

Pendiente:

- Categorías: editar (endpoint + UI).
- Clientes frecuentes: detalle (con historial de compras) y editar (endpoint + UI).
- Productos: importación masiva desde Excel (endpoint + UI).
- Cambio de contraseña con sesión activa (endpoint + UI): `ChangePassword.tsx` es un placeholder.
- Módulo `sales` completo: está scaffoldeado (`module`/`controller`/`service` sin rutas), sin
  lógica ni UI (`Sales.tsx` es un placeholder).
- Redis como caché de productos.

## Documentación

El detalle funcional y las convenciones del proyecto viven en `.claude/`:

- `context.md` — de qué trata el proyecto, su objetivo y qué problema resuelve.
- `spec.md` — especificaciones, modelos, endpoints (implementados y planeados) y criterios de
  aceptación. Es la fuente de verdad del alcance funcional; este README solo resume el estado
  actual del código.
- `rules.md` — convenciones, arquitectura y restricciones de código.

Si cambian los requerimientos, esa documentación se actualiza **antes** de implementar.
