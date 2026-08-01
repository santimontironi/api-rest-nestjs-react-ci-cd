# Contexto del proyecto

## De qué trata

Aplicación fullstack de **gestión de productos con autenticación**. Un usuario se registra,
confirma su cuenta por email, inicia sesión y a partir de ahí puede administrar el catálogo de
productos (crear, listar, editar y eliminar), con una imagen por producto.

El catálogo es **compartido**: la autenticación define quién puede operar sobre él, no qué
productos ve cada uno.

El proyecto se divide en dos aplicaciones dentro del mismo repositorio:

- `backend/` — API REST con NestJS.
- `frontend/` — SPA con React + TypeScript.

## Objetivo

Es un **proyecto de aprendizaje**. El dominio (productos) se mantiene deliberadamente simple
porque no es el punto: el objetivo es practicar e integrar de punta a punta un stack fullstack
moderno con prácticas de producción.

Concretamente, se busca aprender:

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

Para el usuario final, resuelve tener un lugar privado donde registrar y consultar sus productos.

Para quien lo desarrolla, resuelve algo más importante: sirve como base de referencia repetible
para arrancar futuros proyectos fullstack con autenticación, validación y CI ya resueltos.

## Estado

Proyecto en etapa inicial. Ambas apps están scaffoldeadas (NestJS y Vite + React) y las
funcionalidades se construyen de forma incremental.
