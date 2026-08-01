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

## Backend (NestJS)

- **Arquitectura modular**: un módulo por dominio (`auth`, `products`, `users`, `mail`,
  `cloudinary`, `prisma`, `redis`). Cada módulo con su `module`, `controller`, `service` y
  carpeta `dto/`.
- **Los controllers no tienen lógica de negocio.** Reciben, delegan al service y devuelven.
- **Prisma solo se usa dentro de los services**, nunca en un controller.
- Un `PrismaService` único, inyectado; no instanciar `PrismaClient` suelto.
- **DTOs con `class-validator`** para toda entrada. `ValidationPipe` global con `whitelist: true`
  y `forbidNonWhitelisted: true`.
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
- **Tailwind v4** para todos los estilos. Sin CSS suelto ni estilos inline salvo valores dinámicos.
- Estados de carga y error siempre visibles: nada de pantallas en blanco ni fallos silenciosos.

## Estructura de carpetas

```
backend/src/
  auth/          register, login, logout, verificación de email, guards, estrategia jwt
  users/
  products/
  mail/          MailService (nodemailer) + plantillas
  cloudinary/    CloudinaryService (subida de imágenes)
  prisma/
  redis/
  main.ts

frontend/src/
  api/           instancia de axios + servicios por dominio
  components/    componentes reutilizables
  features/      auth/, products/ (páginas, hooks y esquemas del dominio)
  hooks/
  schemas/       esquemas de zod
  lib/
  App.tsx
```

## Git y CI

- Trabajo sobre `develop`; `master` solo recibe cambios vía pull request.
- Nunca saltearse los hooks (`--no-verify`). Si el `pre-push` falla, se arregla la causa.
- No commitear ni pushear salvo que se pida explícitamente.
- No se mergea nada con el CI en rojo.

## Documentación

Si durante el desarrollo cambian los requerimientos, **actualizar `.claude/spec.md` (y
`context.md` si corresponde) antes de implementar**.
