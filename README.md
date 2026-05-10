<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Documentacion para Frontend

- Guia de endpoints para consumo desde frontend: `docs/frontend-api.md`
- OpenAPI JSON para generar cliente: `http://localhost:3000/docs-json`

## Project setup

```bash
$ npm install
```
## subir todo los cambios a docker
docker compose up -d --build api

## Arrancar el proyecto con Docker

### 1) Preparar variables de entorno

Crea tu `.env` a partir del archivo de ejemplo.

```bash
# Linux/Mac
cp .env.example .env

# Windows PowerShell
copy .env.example .env
```

### 2) Levantar contenedores

```bash
docker compose up -d --build
```

Esto levanta:

- API NestJS en `http://localhost:3000`
- Swagger en `http://localhost:3000/docs`
- PostgreSQL en `localhost:5432`
- pgAdmin en `http://localhost:5050`

### 3) Ejecutar migraciones Prisma

En este proyecto el `DATABASE_URL` del `.env` usa el host **`db`** (nombre del servicio en Docker). Ese nombre solo resuelve **dentro de la red de Compose**, por eso las migraciones deben ejecutarse **dentro del contenedor `api`** (o usar una URL con `localhost` si ejecutas Prisma desde tu máquina).

Si ya tienes migraciones creadas:

```bash
docker compose exec api npx prisma migrate deploy
```

Si es la primera migracion del proyecto:

```bash
docker compose exec api npx prisma migrate dev --name init
```

**Prisma desde el host (Cursor / terminal local):** si `npx prisma migrate` falla con *Can't reach database server at `db:5432`*, o bien levanta solo la base con `docker compose up -d db` y usa en esa sesión una `DATABASE_URL` equivalente apuntando a `localhost:5432`, o ejecuta siempre los comandos Prisma con `docker compose exec api ...` como arriba.

El contenedor de la API **no** aplica migraciones al arrancar; hay que ejecutar `migrate deploy` (o tu flujo con `db push`) tras cambios en el esquema.

### Materias: modalidad e inscripción del estudiante

- Cada **materia** (`Subject`) tiene una **modalidad**: presencial (`IN_PERSON`), virtual (`VIRTUAL`) o híbrida (`HYBRID`). Si es presencial o híbrida, debe llevar **edificio** (`building`), **sección** (`section`) y **número de curso** (`courseNumber`); en virtual esos campos quedan vacíos. Detalle en `docs/frontend-api.md` (Subjects).
- El **estudiante** elige su carrera con `POST /user-careers/me` y luego puede registrar sus materias del plan con `POST /user-approved-subjects/me` (solo materias de esa carrera). Ver la misma guía para rutas y cuerpos de ejemplo.
- **Varios horarios por materia** (ej. lunes 8–10 y viernes 18–20): modelo `SubjectSchedule` y rutas bajo `GET/POST/PATCH/DELETE /subjects/:subjectId/schedules` (detalle en `docs/frontend-api.md`). Tras desplegar el esquema, aplica también la migración `20260209140000_subject_schedules` con `docker compose exec api npx prisma migrate deploy`.

### 3.1) Cargar datos de prueba (seed)

Local (solo si tu `DATABASE_URL` apunta a una BD accesible desde tu host):

```bash
npm run prisma:seed
```

En Docker (recomendado para este proyecto):

```bash
docker compose exec api npx prisma db seed
```

Usuarios de prueba que crea el seed:

- Admin: `admin@study.com` / `12345678`
- Student: `student@study.com` / `12345678`

### 4) Conectar pgAdmin a PostgreSQL

1. Entra a pgAdmin en [http://localhost:5050](http://localhost:5050) con las credenciales de tu `.env`:
   - Email: `PGADMIN_DEFAULT_EMAIL`
   - Password: `PGADMIN_DEFAULT_PASSWORD`

2. Crea un servidor nuevo (**Register - Server**) y completa las pestañas así:

**Pestaña General**

| Campo | Valor |
|-------|--------|
| Name | Cualquier nombre (obligatorio), por ejemplo `Study Manager DB` |

**Pestaña Connection**

| Campo | Valor |
|-------|--------|
| Host name/address | `db` |
| Port | `5432` |
| Maintenance database | `POSTGRES_DB` del `.env` (por defecto `study_manager`; también sirve `postgres`) |
| Username | `POSTGRES_USER` del `.env` (por defecto `postgres`) |
| Password | `POSTGRES_PASSWORD` del `.env` (por defecto `postgres`) |

**Importante:** desde dentro de Docker Compose, el host de Postgres es el nombre del servicio (`db`), no `localhost`.

### 5) Logs y apagado

```bash
# ver logs de la API
docker compose logs -f api

# detener contenedores
docker compose down

# detener y borrar volumenes (borra datos de BD)
docker compose down -v
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
