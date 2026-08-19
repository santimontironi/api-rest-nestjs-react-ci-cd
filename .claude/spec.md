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

Existen cinco modelos: `User`, `Category`, `Product`, `Sale` y `SaleItem`. Una `Category` tiene
muchos `Product` (1 a N): cada producto pertenece a una única categoría. **No hay relación entre
`User` y `Product`**: los productos son un catálogo compartido, y la autenticación controla
*quién* puede operar sobre él, no *qué* productos ve cada uno.

El borrado (`DELETE`) de `Category` y `Product` es permanente, no soft delete: es seguro porque
el historial de ventas no depende de que sigan existiendo (ver `SaleItem` más abajo).

Una `Sale` agrupa una o más líneas (`SaleItem`), cada una referida a un `Product` con la cantidad
vendida y un snapshot de precio, nombre y categoría al momento de la venta. Una `Sale` tiene
muchos `SaleItem` (1 a N) y un `SaleItem` pertenece opcionalmente a un único `Product` (N a 1): la
relación es opcional porque el producto puede haberse eliminado después de la venta sin que la
línea pierda su información histórica.

Fuente de verdad: `backend/prisma/schema.prisma`.

### User

| Campo | Tipo | Notas |
|---|---|---|
| `id` | `String` | PK, `@default(uuid())` |
| `email` | `String` | `@unique` |
| `password` | `String` | Hasheada con bcrypt, nunca se devuelve en las respuestas |
| `name` | `String` | |
| `surname` | `String` | |
| `createdAt` | `DateTime` | `@default(now())` |
| `updatedAt` | `DateTime` | `@updatedAt` |

### Category

| Campo | Tipo | Notas |
|---|---|---|
| `id` | `String` | PK, `@default(uuid())` |
| `name` | `String` | |
| `products` | `Product[]` | Lado inverso de la relación con `Product` |
| `createdAt` | `DateTime` | `@default(now())` |
| `updatedAt` | `DateTime` | `@updatedAt` |

### Product

| Campo | Tipo | Notas |
|---|---|---|
| `id` | `String` | PK, `@default(uuid())` |
| `image` | `String` | URL de la imagen en Cloudinary. Obligatoria |
| `name` | `String` | |
| `description` | `String` | |
| `stock` | `Int` | No negativo |
| `price` | `Float` | No negativo |
| `categoryId` | `String` | FK a `Category.id`. Obligatoria: todo producto pertenece a una categoría |
| `category` | `Category` | `@relation(fields: [categoryId], references: [id])` |
| `saleItems` | `SaleItem[]` | Lado inverso de la relación con `SaleItem` |
| `createdAt` | `DateTime` | `@default(now())` |
| `updatedAt` | `DateTime` | `@updatedAt` |

### Sale

| Campo | Tipo | Notas |
|---|---|---|
| `id` | `String` | PK, `@default(uuid())` |
| `total` | `Float` | Suma de `quantity * unitPrice` de todas sus líneas |
| `items` | `SaleItem[]` | Lado inverso de la relación con `SaleItem` |
| `createdAt` | `DateTime` | `@default(now())`. Fecha de la venta, usada para los filtros de reportes |
| `updatedAt` | `DateTime` | `@updatedAt` |

### SaleItem

| Campo | Tipo | Notas |
|---|---|---|
| `id` | `String` | PK, `@default(uuid())` |
| `saleId` | `String` | FK a `Sale.id` |
| `sale` | `Sale` | `@relation(fields: [saleId], references: [id])` |
| `productId` | `String?` | FK a `Product.id`, opcional. `onDelete: SetNull`: si el producto se borra, esta línea queda con `null` sin perder su información |
| `product` | `Product?` | `@relation(fields: [productId], references: [id])` |
| `quantity` | `Int` | Cantidad vendida, mayor a 0 |
| `unitPrice` | `Float` | Precio del producto al momento de la venta (snapshot, no se recalcula si el precio cambia después) |
| `productName` | `String` | Nombre del producto al momento de la venta (snapshot, no cambia si el producto se renombra después) |
| `categoryName` | `String` | Categoría del producto al momento de la venta (snapshot, no cambia si el producto se recategoriza después) |

## Autenticación

Todas las rutas del backend van prefijadas con **`/api`** (`app.setGlobalPrefix('api')` en
`main.ts`). Las rutas mencionadas en esta spec se listan sin ese prefijo por brevedad: por
ejemplo, `POST /auth/register` corresponde en la práctica a `POST /api/auth/register`.

- **Registro** (`POST /auth/register`): valida que el email no exista, hashea la contraseña y
  crea el usuario. Devuelve un mensaje de confirmación, nunca el usuario. **No** inicia sesión.
  No tiene pantalla propia en el frontend: el panel no tiene autorregistro, las cuentas se dan de
  alta por fuera de esa UI.
- **Login** (`POST /auth/login`): valida credenciales y emite un JWT en una **cookie httpOnly**
  (`secure` en producción, `sameSite` acorde al entorno). El token no se devuelve en el body.
- **Logout** (`POST /auth/logout`): limpia la cookie.
- **Sesión actual** (`GET /auth/me`): devuelve el usuario autenticado a partir de la cookie.
- **Cambio de contraseña** (`PATCH /auth/change-password`): protegido, requiere sesión activa.
  Vive dentro del panel, en la sección de ajustes de cuenta. Ver detalle en la sección siguiente.
- **Recuperación de contraseña** (`POST /auth/forgot-password` y
  `POST /auth/reset-password/:token`): para cuando el usuario no recuerda su contraseña y todavía
  no inició sesión. Ver detalle en la sección siguiente.
- Las rutas de productos requieren autenticación. Sin cookie válida se responde `401`.
- El frontend envía siempre las peticiones con `withCredentials: true`.

## Cambio y recuperación de contraseña

- **Cambio de contraseña** (con sesión activa, desde el panel): recibe `currentPassword` y
  `newPassword`. Compara `currentPassword` contra el hash guardado (`bcrypt.compare`); si no
  coincide, responde `400`. Si coincide, hashea `newPassword` con bcrypt y actualiza el `User`.
  No requiere email ni token: al estar autenticado, alcanza con confirmar la contraseña actual.
- **Recuperación de contraseña** (usuario deslogueado, no recuerda su contraseña):
  - `POST /auth/forgot-password`: recibe el `email`, genera un JWT de reseteo y envía un mail con
    el link al frontend. Si el email no está registrado, responde `404`.
  - `POST /auth/reset-password/:token`: verifica la firma y el vencimiento del JWT y recibe la
    nueva contraseña. Si el token es inválido o está vencido, responde `400`. Si es válido,
    hashea la contraseña y actualiza el `User`.
  - El token de reseteo es un **JWT** firmado con el mismo secret que el de sesión
    (`JWT_SECRET`). Vence a los **10 minutos**, valor que va hardcodeado en el `signAsync` que lo
    emite, no en una variable de entorno.
  - Su payload lleva `sub` (id del usuario) y `type: 'password-reset'`. Al resetear se valida ese
    `type`, de modo que un token de sesión no sirve como token de reseteo ni al revés. Esa
    validación del `type` es lo que separa ambos tokens: por eso alcanza con un único secret.
  - El token **no se guarda en la base**: su vencimiento viaja en el propio JWT.
  - El mail contiene un link al frontend: `${FRONTEND_URL}/restablecer-contrasena/:token`. Esa
    página del frontend toma el token de la ruta, pide la nueva contraseña y llama a
    `POST /auth/reset-password/:token`.
- El envío de mails se hace con **Nodemailer** usando el servicio `gmail`, encapsulado en el
  módulo `mail` del backend (`MailService`). El transporter se configura en
  `backend/src/config/mail.config.ts`.
- Un fallo en el envío del mail se informa como error: el usuario puede volver a pedir la
  recuperación.
- Se usa una cuenta de Gmail con **contraseña de aplicación** (requiere 2FA activo en la cuenta);
  la contraseña normal no sirve. En desarrollo los mails se envían de verdad.

## Endpoints de productos

Todos requieren autenticación y operan sobre el catálogo compartido.

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/products` | Lista los productos |
| `GET` | `/products/:id` | Detalle de un producto |
| `POST` | `/products` | Crea un producto (`multipart/form-data`, incluye la imagen) |
| `PATCH` | `/products/:id` | Actualiza un producto (la imagen es opcional) |
| `DELETE` | `/products/:id` | Elimina el producto de forma permanente |

- Un `id` inexistente responde `404`.
- `DELETE` es un borrado real, no soft delete: es seguro porque `SaleItem` guarda su propio
  snapshot (`productName`, `categoryName`, `unitPrice`) y no depende de que el producto siga
  existiendo.

## Endpoints de categorías

Todos requieren autenticación.

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/categories` | Lista las categorías. Alimenta el selector de categoría del formulario de producto |
| `GET` | `/categories/:id` | Detalle de una categoría |
| `POST` | `/categories` | Crea una categoría (`name`) |
| `PATCH` | `/categories/:id` | Actualiza una categoría (`name`) |
| `DELETE` | `/categories/:id` | Elimina la categoría y sus productos de forma permanente, en cascada |

- Un `id` inexistente responde `404`.
- `DELETE` borra la categoría y todos sus productos en una **transacción atómica**, mismo criterio
  que la importación por Excel y el registro de una venta. El frontend muestra una advertencia
  antes de confirmar si la categoría tiene productos.
- Igual que en productos, el borrado es seguro porque el historial de ventas no depende de que la
  categoría o sus productos sigan existiendo (ver `SaleItem`).

## Endpoints de ventas

Todos requieren autenticación.

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/sales` | Lista las ventas (soporta filtros por rango de fechas) |
| `GET` | `/sales/:id` | Detalle de una venta con sus líneas |
| `POST` | `/sales` | Registra una venta con una o más líneas (`productId` + `quantity`) |

- Al registrar una venta se valida que cada producto tenga **stock suficiente**; si no lo tiene,
  responde `400` y no se crea la venta ni se descuenta stock de ninguna línea.
- La creación de la venta y el descuento de stock de todos los productos involucrados es una
  **operación atómica** (transacción de Prisma): si falla un paso, no queda nada aplicado.
- `unitPrice`, `productName` y `categoryName` de cada línea se toman del producto en el momento de
  la venta, no los envía el cliente. Quedan como snapshot en `SaleItem` y no cambian después,
  aunque el producto se edite o se elimine.
- Un `id` inexistente responde `404`.

## Reportes y dashboard

Sección de solo lectura sobre los datos de ventas y catálogo, pensada para que el negocio vea
su actividad de un vistazo.

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/reports/sales` | Ventas agregadas, filtrables por `month` y/o `year` |
| `GET` | `/reports/sales-by-category` | Ventas agrupadas por categoría de producto, en el rango filtrado |
| `GET` | `/reports/sales-trend` | Ventas agrupadas por período (`day` o `month`, vía query param `granularity`), para ver evolución en el tiempo |
| `GET` | `/reports/top-products` | Top N productos más vendidos en el rango filtrado, ordenable por cantidad o por monto (`orderBy`), con `limit` |
| `GET` | `/reports/stock-by-category` | Stock actual agrupado por categoría |
| `GET` | `/reports/low-stock` | Productos con stock por debajo de un umbral (`threshold`) |
| `GET` | `/reports/products-by-category` | Cantidad de productos por categoría (foto fija del catálogo, no depende del rango de fechas) |

- Los filtros de fecha (`month`, `year`) son query params opcionales; sin filtro, se devuelve el
  total histórico.
- El frontend consume estos endpoints para armar un **dashboard** con: selector de mes/año,
  total de ventas del período, y los siguientes gráficos:
  - **Barras** — comparación entre categorías o evolución en el tiempo:
    - Ventas por categoría (`/reports/sales-by-category`)
    - Ventas por mes/día, últimos 6-12 meses o últimos 30 días (`/reports/sales-trend`)
    - Top N productos más vendidos, por cantidad o por monto (`/reports/top-products`)
    - Stock actual por categoría o productos con stock bajo (`/reports/stock-by-category`, `/reports/low-stock`)
  - **Torta/dona** — relación parte-todo con pocas categorías, no series temporales:
    - Cantidad de productos por categoría (`/reports/products-by-category`)
    - Participación % de cada categoría sobre el total vendido, misma data que
      `/reports/sales-by-category` pero expresada como porcentaje en vez de monto absoluto
- `/reports/sales`, `/reports/sales-by-category`, `/reports/sales-trend` y `/reports/top-products`
  agrupan usando `productName`/`categoryName`/`unitPrice` de `SaleItem` (snapshot), no hacen join
  a `Product`/`Category`: siguen siendo precisos aunque el producto o la categoría se hayan
  editado o eliminado después de la venta. `/reports/stock-by-category`, `/reports/low-stock` y
  `/reports/products-by-category` sí reflejan el catálogo **actual** (`Product`/`Category`),
  porque son fotos del estado presente, no del histórico de ventas.
- Estos endpoints, al ser de solo lectura y agregación, no participan del caché de Redis de
  productos (ver sección Redis).

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

## Importación de productos por Excel

Permite dar de alta muchos productos de una sola vez a partir de una planilla, en vez de
cargarlos uno por uno desde el formulario.

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/products/import` | Importa productos desde un archivo Excel (`multipart/form-data`) |

- Requiere autenticación, igual que el resto de los endpoints de productos.
- El archivo llega por **Multer** en `memoryStorage` (mismo criterio que la imagen de un
  producto: buffer, nunca se escribe a disco). Formato aceptado: `.xlsx`. Si el archivo no es un
  Excel válido, responde `400`.
- Cada fila representa un producto, con las columnas `name`, `description`, `stock`, `price`,
  `category` e `image`.
  - `name`, `description`, `stock`, `price` y `category` son obligatorios en cada fila. `stock`
    debe ser un entero no negativo y `price` un número no negativo, mismas reglas que al crear
    un producto desde el formulario.
  - `image` es **opcional**: si la celda trae una URL, se guarda tal cual en `Product.image` (no
    pasa por Cloudinary, ya que es una imagen alojada en otro lado); si la celda viene vacía, el
    producto se crea con una imagen placeholder por defecto.
- `category` matchea contra `Category.name` sin distinguir mayúsculas/minúsculas. Si no existe
  una categoría con ese nombre, se crea automáticamente antes de crear el producto.
- La importación es **todo o nada**: si alguna fila es inválida (campo faltante, `stock`/`price`
  negativo, etc.), no se crea ningún producto ni ninguna categoría nueva de esa planilla. La
  respuesta `400` incluye el detalle de qué fila falló y por qué.
- Si todas las filas son válidas, la creación de los productos y de las categorías nuevas que
  hicieran falta es una **operación atómica** (transacción de Prisma), mismo criterio que el
  registro de una venta.

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
(`register`, `login` y `forgot-password`) para mitigar fuerza bruta y el abuso del envío
de mails. Al superarse se responde `429`.

## Redis

Se usa como caché de lecturas frecuentes (listado y detalle de productos). Toda mutación sobre
un producto invalida las claves afectadas.

## Variables de entorno

Cada app tiene su propio `.env`, versionado como `.env.example` sin valores reales.

**Backend:** `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET` (único secret, tanto para el token de
sesión como para el de reseteo de contraseña), `PORT`, `CORS_ORIGIN`, `NODE_ENV`,
`EMAIL_USER` (cuenta de Gmail remitente), `EMAIL_PASS` (contraseña de aplicación),
`FRONTEND_URL` (base del frontend, usada para armar el link de reseteo de contraseña),
`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.

Las duraciones de los tokens **no** son variables de entorno: van hardcodeadas donde se firman
(`1d` para el de sesión en `JwtModule`, `10m` para el de reseteo de contraseña en su `signAsync`).

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
5. Las contraseñas y los tokens de reseteo de contraseña nunca aparecen en una respuesta.
6. El cambio de contraseña exige la contraseña actual correcta, y el token de reseteo vencido o
   inválido se rechaza.
7. Las mutaciones invalidan las queries de TanStack Query afectadas.
8. Los errores de la API se muestran en la UI (no se fallan en silencio).
9. El `pre-push` y el CI pasan.

## Pendiente de instalar

Ya incorporados: Prisma (`@prisma/client`, `@prisma/adapter-pg`, `pg`), Husky
(`.husky/pre-push`), Tailwind v4 (`tailwindcss`, `@tailwindcss/vite`), Nodemailer
(`nodemailer`, `@types/nodemailer`), la carga de variables de entorno (`@nestjs/config`,
`dotenv`), JWT (`@nestjs/jwt`), bcrypt (`bcrypt`, `@types/bcrypt`), la validación de DTOs
(`class-validator`, `class-transformer`) y `cookie-parser` (`cookie-parser`,
`@types/cookie-parser`).

Todavía faltan: Redis, `@nestjs/throttler`,
multer (`@types/multer`), cloudinary, TanStack Query y `xlsx` (parseo del Excel de importación
de productos). Actualizar esta sección a medida que se agreguen.
