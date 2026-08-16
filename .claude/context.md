# Contexto del proyecto

## De qué trata

Aplicación fullstack de **gestión de productos con autenticación**. Un usuario se registra,
confirma su cuenta por email, inicia sesión y a partir de ahí puede administrar el catálogo de
productos (crear, listar, editar y eliminar), con una imagen por producto.

El catálogo es **compartido**: la autenticación define quién puede operar sobre él, no qué
productos ve cada uno.

Además del catálogo, la aplicación cubre el ciclo de venta: el usuario puede **registrar ventas**
de uno o más productos, lo que **descuenta el stock** correspondiente, y consultar **reportes**
sobre esa actividad (filtros por mes, año, ventas y productos por categoría, con un dashboard
que incluye gráfico de barras).

El proyecto se divide en dos aplicaciones dentro del mismo repositorio:

- `backend/` — API REST con NestJS.
- `frontend/` — SPA con React + TypeScript.

## Objetivo

Nace como **proyecto de aprendizaje**, pero la intención a futuro es ofrecerlo a **negocios de
la zona** como sistema de gestión de catálogo de productos. No es un SaaS con planes pagos ni
multi-tenant: la idea es acercarse a negocios puntuales y ofrecerles este sistema (cada uno con
su propia instancia/despliegue). Por eso el stack y las prácticas se eligen pensando en
producción real, no solo en practicar: autenticación sólida, validación en ambas puntas, CI y
buenas prácticas ya forman parte del proyecto desde la base, en vez de agregarse después como
parche.

El dominio (productos) se mantiene deliberadamente simple por ahora: la prioridad es tener la
base técnica (auth, validación, CI, infraestructura) sólida antes de sumar features pensadas
para un negocio real (por ahora sin definir).

Concretamente, se busca aprender/integrar:

- Autenticación con **JWT en cookies httpOnly** (en lugar de guardar tokens en localStorage).
- **Confirmación de cuenta por email** con Nodemailer: al registrarse se envía un mail con un
  link que el usuario debe abrir para activar la cuenta antes de poder iniciar sesión.
- Persistencia con **PostgreSQL + Prisma**, incluyendo migraciones.
- **Subida de imágenes** con Multer y almacenamiento en **Cloudinary**.
- Uso de **Redis** como capa de caché.
- Protección de la API con **rate limiting**.
- Validación de datos en el frontend con **Zod**, tanto de lo que se envía a los endpoints
  como de lo que se recibe de ellos.
- Manejo de estado de servidor con **TanStack Query** (caché, invalidación, estados de carga y error).
- Automatización de calidad: **Husky** en pre-push y **CI con GitHub Actions** para validar el
  pasaje de `develop` a `master`.

## Qué problema resuelve

Para el usuario final (un negocio local que lo adopte), resuelve tener un lugar privado y
confiable donde registrar y consultar sus productos.

Para quien lo desarrolla, resuelve además algo más importante: sirve como base de referencia
repetible para arrancar futuros proyectos fullstack con autenticación, validación y CI ya
resueltos, y como sistema listo para ofrecer a negocios de la zona.

## Estado

Proyecto en etapa inicial. Ambas apps están scaffoldeadas (NestJS y Vite + React) y las
funcionalidades se construyen de forma incremental.
