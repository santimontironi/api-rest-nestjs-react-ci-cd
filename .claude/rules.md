# Reglas del proyecto

## Regla principal

**Ir directo al grano.** Escribir el código mínimo que resuelve lo pedido, y que ese código sea
legible, prolijo, mantenible y escalable.

## Prohibido

- **Sobreingeniería.** Nada de capas de abstracción, patrones o genéricos "por si algún día".
  Resolver el caso actual.
- **Código innecesario.** Sin helpers de un solo uso, sin wrappers que solo delegan, sin
  configuración que nadie consume, sin `try/catch` que solo re-lanzan.
- **Features no pedidas.** No agregar endpoints, campos, pantallas ni dependencias que no estén
  en la spec ni hayan sido solicitados.
- **Dependencias nuevas** sin justificación clara. Si el stack ya lo resuelve, usar el stack.
- **Comentarios obvios.** Comentar solo el *por qué* de una decisión no evidente, nunca el *qué*.
- **Archivos extra** (READMEs, resúmenes, documentación) salvo que se pidan.
- **`any`** en TypeScript. Si el tipo es difícil, modelarlo bien o usar `unknown` y estrechar.

## Convenciones generales

- Todo en **TypeScript**, con `strict` activo.
- Nombres en **inglés** en el código (variables, funciones, archivos, rutas, modelos).
  Los textos visibles al usuario y la documentación de `.claude/`, en español.
- Archivos en `kebab-case`, clases en `PascalCase`, variables y funciones en `camelCase`.
- Un archivo, una responsabilidad. Si un archivo hace dos cosas, separarlo.
- Nada de secretos hardcodeados: todo por variables de entorno.
- **No declarar `type` ni `interface` para todo.** Se declaran solo cuando el tipo se reutiliza en
  más de un lugar o cuando TypeScript no puede inferirlo. Un objeto intermedio, una variable local
  o el retorno de una función que ya se infiere solo **no llevan tipo explícito**.
  - Si el tipo ya existe en otro lado, **derivarlo**: `z.infer`, `Prisma.UserGetPayload`,
    `ReturnType`, `Pick`/`Omit`. Nunca reescribir a mano una forma que ya está modelada.
  - Sí llevan tipo explícito: los props de un componente, los DTOs y las firmas públicas de un
    service. Son los bordes; el resto se infiere.
- **Las constantes van a `utils/consts/`**, un archivo por dominio, en `kebab-case` y con sufijo
  `.consts.ts` (`auth.consts.ts`, `products.consts.ts`, `upload.consts.ts`). Nada de valores
  fijos sueltos dentro de componentes o services: si es un valor repetido o un "número mágico"
  (límites, tamaños máximos, tiempos de expiración, mensajes fijos, opciones de un select),
  se declara ahí y se importa. Los secretos siguen yendo por variables de entorno, no acá.

## Shared (`shared/`)

- Los esquemas de **Zod** que definen la forma de un payload usado tanto en el backend como en el
  frontend viven en `shared/schemas/`, un archivo por dominio (`auth.schema.ts`, ...). Es la fuente
  de verdad única: ni el backend ni el frontend redefinen esas reglas por su cuenta.
- No es un workspace de npm: `shared/` no tiene `package.json` propio. Backend y frontend lo
  importan por **ruta relativa** (`../../../shared/schemas/...`). `zod` está instalado tanto en la
  raíz del repo como en `backend/` y `frontend/`, porque Node resuelve `node_modules` subiendo
  desde la carpeta del archivo que hace el `import`, y `shared/` no es descendiente de ninguno de
  los dos paquetes.

## Backend (NestJS)

- **Arquitectura modular**: un módulo por dominio (`auth`, `products`, `users`, `mail`,
  `cloudinary`, `prisma`, `redis`). Cada módulo con su `module`, `controller`, `service` y
  carpeta `dto/`.
- **Los controllers no tienen lógica de negocio.** Reciben, delegan al service y devuelven.
- **Prisma solo se usa dentro de los services**, nunca en un controller.
- Un `PrismaService` único, inyectado; no instanciar `PrismaClient` suelto.
- **DTOs con `class-validator`** para toda entrada. `ValidationPipe` global con `whitelist: true`
  y `forbidNonWhitelisted: true`. **Excepción:** si el payload tiene un esquema en `shared/schemas/`,
  se valida con ese esquema vía `ZodValidationPipe` (`backend/src/common/pipes/zod-validation.pipe.ts`)
  en el controller, en vez de un DTO de `class-validator`.
- **Nunca devolver el campo `password`.** Excluirlo explícitamente en el `select` de Prisma.
- El **JWT de confirmación viaja únicamente en el mail**, nunca en el cuerpo de una respuesta
  ni en un log.
- **Todo el envío de mails pasa por el `MailService`.** Ningún otro service instancia Nodemailer
  ni arma transportes por su cuenta. Las plantillas viven en el módulo `mail`.
- Errores con las excepciones de Nest (`NotFoundException`, `UnauthorizedException`, etc.),
  no con `throw new Error`.
- **Toda la interacción con Cloudinary pasa por el `CloudinaryService`.** El módulo `products`
  recibe el buffer de Multer y delega; no configura el SDK ni conoce sus credenciales.
- Multer siempre en `memoryStorage`. **Nunca escribir archivos subidos al disco del servidor.**
- Los cambios de esquema van siempre por **migración de Prisma**, nunca editando la base a mano.
- `schema.prisma` es la fuente de verdad de los modelos. Si un cambio lo requiere, actualizar
  también `.claude/spec.md`.

## Frontend (React)

- **Componentes funcionales** con hooks. Nada de clases.
- Un componente por archivo. Si supera ~150 líneas o mezcla responsabilidades, dividirlo.
- **TanStack Query es el dueño del estado de servidor.** No duplicar datos de la API en
  `useState`; `useState` es solo para estado de UI local.
- Toda mutación invalida las queries afectadas.
- **Axios**: una única instancia configurada (`baseURL`, `withCredentials: true`). Las llamadas
  a la API viven en una capa de servicios, no dentro de los componentes.
- **Zod**: un esquema por payload de entrada y otro por respuesta. Los tipos se **infieren** con
  `z.infer`; no se declaran interfaces duplicadas a mano.
- **React Hook Form** con resolver de Zod para todos los formularios. Nada de manejar inputs con
  `useState`.
- **Componentes repetidos: se escriben a mano, no se mapean.** Cuando un componente reutilizable
  se usa una cantidad **conocida y fija** de veces en el padre, se renderiza esa cantidad de veces
  en el JSX, pasando los props explícitamente en cada uno. Prohibido armar un array de objetos de
  configuración y recorrerlo con `.map()` solo para ahorrar líneas: esconde los props reales,
  obliga a saltar a otro archivo para entender qué se está renderizando y agrega una `key`
  artificial.

  ```tsx
  // ❌ No
  const fields = [
    { name: 'email', label: 'Email', type: 'email' },
    { name: 'password', label: 'Contraseña', type: 'password' },
  ];
  return fields.map((f) => <Input key={f.name} {...f} />);

  // ✅ Sí
  return (
    <>
      <Input name="email" label="Email" type="email" />
      <Input name="password" label="Contraseña" type="password" />
    </>
  );
  ```

  **La excepción son los datos dinámicos**: si la cantidad de elementos sale de la API o del estado
  (lista de productos, resultados de una búsqueda), ahí `.map()` es lo correcto y obligatorio.
  La regla aplica al contenido fijo escrito por nosotros, no a las colecciones.
- **Tailwind v4** para todos los estilos. Sin CSS suelto ni estilos inline salvo valores dinámicos.
- Estados de carga y error siempre visibles: nada de pantallas en blanco ni fallos silenciosos.

## Estructura de carpetas

```
shared/
  schemas/       esquemas de zod compartidos entre backend y frontend

backend/src/
  auth/          register, login, logout, verificación de email, guards, estrategia jwt
  users/
  products/
  mail/          MailService (nodemailer) + plantillas
  cloudinary/    CloudinaryService (subida de imágenes)
  prisma/
  redis/
  common/
    pipes/       pipes de Nest transversales (ZodValidationPipe, ...)
  utils/
    consts/      <dominio>-consts.ts
  main.ts

frontend/src/
  services/      instancia de axios + servicios por dominio
  components/    organizados por dominio: una subcarpeta por entidad
                 (categories/, products/, customers/, sales/), auth/ para
                 componentes del flujo de autenticación (VerifyAuth,
                 InputMailModal) y ui/ para el resto: componentes genéricos
                 sin dominio propio (Loader, Sidebar) y pantallas que no son
                 una entidad (Dashboard, Settings)
  hooks/         organizados por dominio: una subcarpeta por entidad con
                 sufijo "Hooks" (categoriesHooks/, productsHooks/, authHooks/),
                 para no confundirse con las subcarpetas de components/
  pages/         rutas de nivel superior (Login, Home, ResetPassword, ...)
  types/         tipos de TypeScript que no derivan de un esquema de Zod
  utils/
    consts/      <dominio>-consts.ts
  App.tsx
```

- **Regla de nomenclatura**: dentro de `components/<entidad>/` el nombre de la subcarpeta es solo el
  nombre de la entidad (`products/`, `categories/`). Dentro de `hooks/<entidad>Hooks/` lleva el
  sufijo `Hooks` (`productsHooks/`, `categoriesHooks/`), justamente para diferenciarlas de las de
  `components/` cuando se navega el árbol.
- Un componente o hook que pertenece a una entidad va en su subcarpeta, aunque se use desde otro
  dominio (ej. `ProductsTable` vive en `components/products/` aunque `CategoryDetail`, en
  `components/categories/`, lo importe).

## Git y CI

- Trabajo sobre `develop`; `master` solo recibe cambios vía pull request.
- Nunca saltearse los hooks (`--no-verify`). Si el `pre-push` falla, se arregla la causa.
- No commitear ni pushear salvo que se pida explícitamente.
- No se mergea nada con el CI en rojo.

## Documentación

Si durante el desarrollo cambian los requerimientos, **actualizar `.claude/spec.md` (y
`context.md` si corresponde) antes de implementar**.
