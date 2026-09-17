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

`frontend/src/components/` y `frontend/src/hooks/` se organizan por dominio, una subcarpeta por
entidad (`categories/`, `products/`, `customers/`, `sales/`), con `auth/` para el flujo de
autenticación y `ui/` para el resto de componentes sin dominio propio. Las subcarpetas de
`hooks/` llevan el sufijo `Hooks` (`categoriesHooks/`, `productsHooks/`, `authHooks/`) para no
confundirse con las de `components/`. Detalle completo del árbol en `.claude/rules.md`.

### Global

| Área | Tecnología |
|---|---|
| Git hooks | Husky (`pre-push`) |
| CI | GitHub Actions |

## Modelos de base de datos

Existen seis modelos: `User`, `Customer`, `Category`, `Product`, `Sale` y `SaleItem`. Una
`Category` tiene muchos `Product` (1 a N): cada producto pertenece a una única categoría. **No hay
relación entre `User` y `Product`**: los productos son un catálogo compartido, y la autenticación
controla *quién* puede operar sobre él, no *qué* productos ve cada uno.

Un `Customer` puede tener muchas `Sale` (1 a N), pero la relación es **opcional**: solo se dan de
alta los clientes frecuentes, así que una venta puede no tener ningún cliente asociado.

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

### Customer

| Campo | Tipo | Notas |
|---|---|---|
| `id` | `String` | PK, `@default(uuid())` |
| `name` | `String` | |
| `surname` | `String` | |
| `phone` | `String` | |
| `sales` | `Sale[]` | Lado inverso de la relación con `Sale` |

### Category

| Campo | Tipo | Notas |
|---|---|---|
| `id` | `String` | PK, `@default(uuid())` |
| `name` | `String` | `@unique` |
| `products` | `Product[]` | Lado inverso de la relación con `Product` |
| `createdAt` | `DateTime` | `@default(now())` |

### Product

| Campo | Tipo | Notas |
|---|---|---|
| `id` | `String` | PK, `@default(uuid())` |
| `image` | `String?` | URL de la imagen en Cloudinary. `null` si el producto no tiene imagen propia |
| `imagePublicId` | `String?` | `public_id` de Cloudinary de la imagen actual. Se usa para borrarla del storage cuando se reemplaza o cuando se borra el producto. `null` si `image` no vino de una subida propia (por ejemplo, la importación por Excel con URL externa, ver esa sección) |
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
| `paymentMethod` | `PaymentMethod` | Enum (`CASH` \| `TRANSFER`), obligatorio |
| `customerId` | `String?` | FK a `Customer.id`, opcional. `onDelete: SetNull`: si el cliente se borra, la venta queda sin cliente asociado, sin perder el resto de su información |
| `customer` | `Customer?` | `@relation(fields: [customerId], references: [id])` |
| `customerName` | `String?` | Nombre del cliente al momento de la venta (snapshot, no cambia si el cliente se renombra o se borra después). `null` si la venta no tuvo cliente asociado |
| `customerSurname` | `String?` | Apellido del cliente al momento de la venta (snapshot, mismo criterio que `customerName`) |
| `customerPhone` | `String?` | Teléfono del cliente al momento de la venta (snapshot, mismo criterio que `customerName`). Se snapshotea porque son clientes frecuentes: si el cliente avisa que cambió de número, se actualiza en `Customer`, pero el historial conserva el que tenía en el momento de cada venta |
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

> **Estado actual**: implementado `register`, `login`, `logout`, `forgot-password`,
> `reset-password/:token` y `me`. **No implementados todavía**: la confirmación de cuenta por
> email (`User` no tiene campo de verificación en `schema.prisma`, y `register` no envía mail ni
> bloquea el login de una cuenta sin confirmar) ni `PATCH /auth/change-password` (no existe en
> `auth.controller.ts`; `ChangePassword.tsx` es un placeholder). Estas dos secciones documentan
> el comportamiento objetivo.

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
- `GET /products` responde `200` con un array vacío si el catálogo está vacío.
- `PATCH` reemplaza la imagen solo si viene un archivo nuevo; si no viene, conserva `image` e
  `imagePublicId` actuales. Cuando sí viene, primero sube la nueva imagen a Cloudinary y recién
  después borra de Cloudinary la que tenía antes (usando `imagePublicId`), para no quedarse sin
  imagen si la subida falla.
- `DELETE` es un borrado real, no soft delete: es seguro porque `SaleItem` guarda su propio
  snapshot (`productName`, `categoryName`, `unitPrice`) y no depende de que el producto siga
  existiendo. Además de borrar el registro, si el producto tenía `imagePublicId` borra también su
  imagen de Cloudinary.

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
- `GET /categories` responde `200` con un array vacío si no hay categorías cargadas, mismo
  criterio que `GET /products`.
- `name` es único (`@unique` en el schema): `POST` y `PATCH` responden `400` si ya existe otra
  categoría con ese nombre.
- `DELETE` borra la categoría y todos sus productos en una **transacción atómica**, mismo criterio
  que la importación por Excel y el registro de una venta. El frontend muestra una advertencia
  antes de confirmar si la categoría tiene productos.
- Igual que en productos, el borrado es seguro porque el historial de ventas no depende de que la
  categoría o sus productos sigan existiendo (ver `SaleItem`).

## Endpoints de clientes

Todos requieren autenticación. Permiten dar de alta, modificar y dar de baja clientes dentro del
sistema; solo se cargan los clientes **frecuentes**, no todos los que compran.

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/customers` | Lista los clientes. Alimenta el selector de cliente del formulario de venta |
| `GET` | `/customers/:id` | Detalle de un cliente |
| `POST` | `/customers` | Da de alta un cliente (`name`, `surname`, `phone`) |
| `PATCH` | `/customers/:id` | Modifica un cliente |
| `DELETE` | `/customers/:id` | Da de baja (elimina) un cliente de forma permanente |

- Un `id` inexistente responde `404`.
- `DELETE` es un borrado real, no soft delete: es seguro porque `Sale.customerId` queda en `null`
  (`onDelete: SetNull`) sin perder el resto de la información de la venta.

## Endpoints de ventas

> **Estado actual**: el módulo `sales` está scaffoldeado (`module`/`controller`/`service` vacíos)
> pero la lógica descripta abajo todavía no está implementada, igual que `Sales.tsx` en el
> frontend. Esta sección documenta el comportamiento objetivo, no el actual.

Todos requieren autenticación.

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/sales` | Lista las ventas (soporta filtros por rango de fechas y por `customerId`) |
| `GET` | `/sales/:id` | Detalle de una venta con sus líneas |
| `POST` | `/sales` | Registra una venta con una o más líneas (`productId` + `quantity`), un `paymentMethod` (`CASH` \| `TRANSFER`) y, opcionalmente, un `customerId` |

- El `paymentMethod` de una venta es **obligatorio**: `CASH` (efectivo) o `TRANSFER` (transferencia).
- El `customerId` de una venta es **opcional**: solo se asocia cuando el comprador es un cliente
  frecuente ya dado de alta. Cuando se envía, `customerName`, `customerSurname` y `customerPhone`
  se toman del cliente en ese momento y quedan como snapshot (no cambian si el cliente actualiza
  su teléfono, se renombra o se borra después).
- El filtro `customerId` de `GET /sales` alimenta la vista de historial de compras de un cliente:
  al hacer click en un cliente desde el frontend, se listan sus ventas reusando este mismo
  endpoint.
- Al registrar una venta se valida que cada producto tenga **stock suficiente**; si no lo tiene,
  responde `400` y no se crea la venta ni se descuenta stock de ninguna línea.
- La creación de la venta y el descuento de stock de todos los productos involucrados es una
  **operación atómica** (transacción de Prisma): si falla un paso, no queda nada aplicado.
- `unitPrice`, `productName` y `categoryName` de cada línea se toman del producto en el momento de
  la venta, no los envía el cliente. Quedan como snapshot en `SaleItem` y no cambian después,
  aunque el producto se edite o se elimine.
- Un `id` inexistente responde `404`.

## Reportes y dashboard

> **Estado actual**: no implementado todavía. No existe módulo `reports` en el backend y
> `Dashboard.tsx` en el frontend es un placeholder. Esta sección documenta el comportamiento
> objetivo, no el actual.

Sección de solo lectura sobre los datos de ventas y catálogo, pensada para que el negocio vea
su actividad de un vistazo. **No hay un selector general de mes/año que dispare actualizaciones
en tiempo real de todo el dashboard**: cada reporte se calcula sobre todo el histórico. La única
excepción es el gráfico de ventas por mes, que trae su propio **selector de año** (independiente
del resto) para elegir qué año mostrar.

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/reports/sales-trend` | Total de ventas agregado por mes, filtrable por `year` |
| `GET` | `/reports/top-products` | Top 10 productos más vendidos, histórico, ordenado por cantidad |
| `GET` | `/reports/sales-by-category` | Categorías más vendidas históricas, en % sobre cantidad de ventas (no sobre monto) |
| `GET` | `/reports/top-customers` | Top 10 clientes con más compras, histórico, ordenado por cantidad de compras |
| `GET` | `/reports/stock-by-category` | Stock actual agrupado por categoría |
| `GET` | `/reports/low-stock` | Productos con stock por debajo de un umbral (`threshold`) |

El frontend consume estos endpoints para armar un **dashboard** con:

- **Barras**:
  - Ventas por mes (`/reports/sales-trend`): las 12 barras (una por mes) del año elegido en su
    selector de año.
  - Stock actual por categoría (`/reports/stock-by-category`).
- **Torta/dona**:
  - Categorías más vendidas históricas (`/reports/sales-by-category`): cantidad de ventas por
    categoría, expresada en % sobre el total histórico (no sobre monto).
- **Listados** (no son gráfico):
  - Top 10 productos más vendidos (`/reports/top-products`).
  - Top 10 clientes con más compras (`/reports/top-customers`).
- **Alertas / mensajes** (no es gráfico):
  - Stock bajo (`/reports/low-stock`): listado de mensajes, color **rojo** si el stock es
    **≤ 5 unidades**, color **amarillo** si es **≤ 10 unidades**.

- `/reports/sales-trend`, `/reports/sales-by-category` y `/reports/top-products` agrupan usando
  `productName`/`categoryName`/`unitPrice` de `SaleItem` (snapshot), no hacen join a
  `Product`/`Category`: siguen siendo precisos aunque el producto o la categoría se hayan editado
  o eliminado después de la venta. `/reports/stock-by-category` y `/reports/low-stock` sí reflejan
  el catálogo **actual** (`Product`/`Category`), porque son fotos del estado presente, no del
  histórico de ventas.
- `/reports/top-customers` agrupa por `customerId`, usando `customerName`/`customerSurname` de
  `Sale` (snapshot) para mostrar el nombre; las ventas sin `customerId` (sin cliente asociado) no
  entran en este reporte.
- Estos endpoints, al ser de solo lectura y agregación, no participan del caché de Redis de
  productos (ver sección Redis).

## Imágenes de productos

> **Estado actual**: la subida a Cloudinary y la validación de tipo/tamaño en el **backend**
> (`ParseFilePipeBuilder` + `upload.consts.ts`) ya funcionan. Lo que falta: la obligatoriedad de
> imagen al crear no está aplicada (`Product.image` es opcional en `schema.prisma`, `String?`, y el
> endpoint de creación marca el archivo como `fileIsRequired: false`), y no hay validación en el
> **frontend**: `addProductSchema` no valida el archivo (se maneja aparte con `useState`, no pasa
> por Zod) y el input de imagen en `InputProductModal`/`EditProductModal` no tiene `required` ni
> chequeo de tamaño (solo el atributo `accept`, que no es una validación real). Esta sección
> documenta el comportamiento objetivo en los puntos que faltan.

- El archivo se recibe con **Multer** en `memoryStorage` (buffer, sin escribir a disco) y se
  sube a **Cloudinary** desde un módulo `cloudinary` del backend (`CloudinaryService`). En
  `Product.image` se guarda la URL segura que devuelve Cloudinary y en `Product.imagePublicId` su
  `public_id`, nunca el archivo.
- Validaciones del archivo en el backend: tipo `image/jpeg`, `image/png` o `image/webp`, y un
  tamaño máximo de **2 MB**. Si no cumple, responde `400`.
- **Crear** exige imagen. **Actualizar** la acepta como opcional: si no viene, se conserva la
  que ya estaba.
- Si la subida a Cloudinary falla, **no se crea ni se actualiza el producto**: primero se sube la
  imagen y solo con la URL y el `public_id` en mano se escribe en la base.
- `imagePublicId` es lo que permite borrar la imagen vieja de Cloudinary cuando se reemplaza
  (`editProduct`) o cuando se borra el producto (`deleteProduct`), evitando dejar archivos
  huérfanos en el storage. El borrado en Cloudinary corre después de aplicar el cambio en la base,
  nunca antes: si Cloudinary falla, el producto ya quedó creado/actualizado/borrado igual.
- En el frontend el formulario envía `FormData`. El esquema de Zod valida el archivo (tipo y
  tamaño) antes de enviarlo, con las mismas reglas que el backend.

## Importación de productos por Excel

> **Estado actual**: no implementado todavía (`xlsx` no está instalado, ver
> `Pendiente de instalar`). No existe la ruta `POST /products/import`.

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

Se aplica rate limiting global de **70 peticiones por minuto**, con un límite más estricto de
**8 peticiones cada 10 minutos** en los endpoints de autenticación (`register`, `login` y
`forgot-password`) para mitigar fuerza bruta y el abuso del envío de mails. Al superarse se
responde `429`. Implementado con `@nestjs/throttler`; los valores están en
`backend/src/utils/consts/auth.consts.ts`.

## Redis

> **Estado actual**: no implementado todavía (ver `Pendiente de instalar`). No hay módulo `redis`
> en el backend.

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
(`class-validator`, `class-transformer`), `cookie-parser` (`cookie-parser`,
`@types/cookie-parser`), rate limiting (`@nestjs/throttler`), Multer
(`@nestjs/platform-express`, `@types/multer`), Cloudinary (`cloudinary`) y TanStack Query
(`@tanstack/react-query`).

Todavía faltan: Redis y `xlsx` (parseo del Excel de importación de productos). Actualizar esta
sección a medida que se agreguen.
