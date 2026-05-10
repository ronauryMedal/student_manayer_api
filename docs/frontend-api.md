# API Guide para Frontend

Guia rapida de endpoints para consumir la API desde frontend.

- Base URL local: `http://localhost:3000`
- Swagger UI: `http://localhost:3000/docs`
- OpenAPI JSON: `http://localhost:3000/docs-json`
- Auth: `Bearer <access_token>` en header `Authorization`.

## Flujo de autenticacion

1. Registrar o loguear usuario.
2. Guardar `access_token`.
3. Enviar token en cada request protegida.

### `POST /auth/register`

Body:

```json
{
  "name": "Juan Perez",
  "email": "usuario@ejemplo.com",
  "password": "Contrasena123"
}
```

Response (resumen):

```json
{
  "access_token": "jwt...",
  "user": {
    "id": "uuid",
    "name": "Juan Perez",
    "email": "usuario@ejemplo.com"
  }
}
```

### `POST /auth/login`

Body:

```json
{
  "email": "usuario@ejemplo.com",
  "password": "Contrasena123"
}
```

Response (resumen):

```json
{
  "access_token": "jwt...",
  "user": {
    "id": "uuid",
    "name": "Juan Perez",
    "email": "usuario@ejemplo.com",
    "careers": null
  }
}
```

## Reglas de permisos (resumen)

- **ADMIN**: puede crear/editar/eliminar catalogos y relaciones administrativas.
- **STUDENT**: acceso autenticado a lectura y recursos personales.
- `tasks`: requiere JWT; cada usuario solo ve/edita sus tareas.
- `user-careers/me`: estudiante puede seleccionar su carrera una sola vez.
- `user-approved-subjects/me`: solo **STUDENT**; el estudiante lista, agrega o quita **sus** materias. La materia debe pertenecer a la misma carrera en la que está inscrito (`UserCareer`).

## Endpoints por modulo

## App

- `GET /`

## Users

- `POST /users`
- `GET /users`
- `GET /users/:id`
- `PATCH /users/:id`
- `DELETE /users/:id`
- `GET /users/:id/progress` (JWT, admin o propietario)
- `GET /users/:id/progress/summary` (JWT, admin o propietario)

## Careers

- `GET /careers` (JWT)
- `GET /careers/:id` (JWT)
- `POST /careers` (JWT + ADMIN)
- `PATCH /careers/:id` (JWT + ADMIN)
- `DELETE /careers/:id` (JWT + ADMIN)

Body create/update:

```json
{
  "name": "Ingenieria de Software",
  "description": "Carrera orientada al desarrollo de software",
  "totalCredits": 240,
  "totalSemester": 12
}
```

## Teachers

- `GET /teachers` (JWT)
- `GET /teachers/:id` (JWT)
- `POST /teachers` (JWT + ADMIN)
- `PATCH /teachers/:id` (JWT + ADMIN)
- `DELETE /teachers/:id` (JWT + ADMIN)

Body create/update:

```json
{
  "name": "Ana Martinez",
  "email": "ana@study.com"
}
```

## Subjects

- `GET /subjects` (JWT)
- `GET /subjects/:id` (JWT)
- `POST /subjects` (JWT + ADMIN)
- `PATCH /subjects/:id` (JWT + ADMIN)
- `DELETE /subjects/:id` (JWT + ADMIN)

### Modalidad (`modality`)

Valores permitidos (misma convención que en base de datos / Prisma):

| Valor        | Significado   |
|-------------|---------------|
| `IN_PERSON` | Presencial    |
| `VIRTUAL`   | Virtual       |
| `HYBRID`    | Híbrida       |

Si no envías `modality` al crear una materia, el backend usa **`IN_PERSON`** por defecto.

Body create/update:

```json
{
  "name": "Programacion I",
  "credits": 4,
  "semesterNumber": 1,
  "careerId": "career_uuid",
  "modality": "VIRTUAL"
}
```

`modality` es opcional en create y en update (partial).

Las respuestas de `GET /subjects`, `GET /subjects/:id` y los updates incluyen un arreglo **`schedules`**: bloques horarios ordenados por día y hora de inicio (puede estar vacío).

## Horarios de materia (`subject-schedules`)

Una misma materia puede tener **varios bloques** (ej. lunes 08:00–10:00 y viernes 18:00–20:00). Cada bloque es un registro con día de semana, hora inicio/fin (24 h) y aula opcional.

### Días (`weekday`)

| Valor       | Día        |
|------------|------------|
| `MONDAY`   | Lunes      |
| `TUESDAY`  | Martes     |
| `WEDNESDAY`| Miércoles  |
| `THURSDAY` | Jueves     |
| `FRIDAY`   | Viernes    |
| `SATURDAY` | Sábado     |
| `SUNDAY`   | Domingo    |

### Endpoints

- `GET /subjects/:subjectId/schedules` (JWT): lista horarios de esa materia.
- `POST /subjects/:subjectId/schedules` (JWT + ADMIN): crea un bloque.
- `PATCH /subjects/:subjectId/schedules/:scheduleId` (JWT + ADMIN): actualiza un bloque.
- `DELETE /subjects/:subjectId/schedules/:scheduleId` (JWT + ADMIN): elimina un bloque.

Body `POST` / campos en `PATCH` (partial):

```json
{
  "weekday": "FRIDAY",
  "startTime": "18:00",
  "endTime": "20:00",
  "room": "Lab 2"
}
```

`startTime` y `endTime` se envían como **`HH:mm`** (24 h). La fin debe ser **posterior** a la inicio (mismo bloque, mismo día).

En las respuestas JSON, Prisma suele devolver `startTime` y `endTime` como **fecha ISO** (solo importa la parte horaria en UTC, p. ej. `1970-01-01T18:00:00.000Z` para 18:00). El frontend puede leer hora y minutos en UTC o formatear según necesidad.

Al borrar una materia, sus horarios se eliminan en cascada.

## Subject Teachers

- `GET /subject-teachers` (JWT)
- `GET /subject-teachers/:id` (JWT)
- `POST /subject-teachers` (JWT + ADMIN)
- `PATCH /subject-teachers/:id` (JWT + ADMIN)
- `DELETE /subject-teachers/:id` (JWT + ADMIN)

Body create/update:

```json
{
  "subjectId": "subject_uuid",
  "teacherId": "teacher_uuid"
}
```

## User Careers

- `POST /user-careers/me` (JWT, estudiante/usuario autenticado)
- `GET /user-careers/:id` (JWT + ADMIN)
- `GET /user-careers` (JWT + ADMIN)
- `GET /user-careers/user/:userId` (JWT + ADMIN)
- `POST /user-careers` (JWT + ADMIN)
- `PATCH /user-careers/:id` (JWT + ADMIN)
- `DELETE /user-careers/:id` (JWT + ADMIN)

Body `POST /user-careers/me`:

```json
{
  "careerId": "career_uuid",
  "currentSemester": 1
}
```

## User Semesters

- `GET /user-semesters` (JWT)
- `GET /user-semesters/:id` (JWT)
- `POST /user-semesters` (JWT + ADMIN)
- `PATCH /user-semesters/:id` (JWT + ADMIN)
- `DELETE /user-semesters/:id` (JWT + ADMIN)

Body create/update:

```json
{
  "userCareerId": "user_career_uuid",
  "number": 2,
  "isActive": true
}
```

## Tasks

- `GET /tasks` (JWT)
- `GET /tasks/:id` (JWT)
- `POST /tasks` (JWT)
- `PATCH /tasks/:id` (JWT)
- `DELETE /tasks/:id` (JWT)

Body create/update:

```json
{
  "title": "Practica de funciones",
  "description": "Capitulo 1",
  "dueDate": "2026-05-20T23:59:00.000Z",
  "subjectId": "subject_uuid"
}
```

`userId` no se envia; se toma desde el JWT.

## User Approved Subjects

Inscripción de un usuario a una materia del catálogo (misma fila que `UserApprovedSubject` en Prisma).

### Estudiante (solo rol `STUDENT`)

Requisito: el usuario debe tener ya una carrera asignada (`POST /user-careers/me`). La materia debe tener `careerId` igual al de esa carrera; si no, la API responde **403**.

- `GET /user-approved-subjects/me` (JWT + STUDENT): lista las materias del usuario autenticado (incluye `subject` y `career` anidados en la respuesta).
- `POST /user-approved-subjects/me` (JWT + STUDENT): agrega una materia a su lista.

Body `POST /user-approved-subjects/me`:

```json
{
  "subjectId": "subject_uuid"
}
```

- `DELETE /user-approved-subjects/me/:id` (JWT + STUDENT): elimina una inscripción. `:id` es el **id del registro** `UserApprovedSubject`, no el `subjectId`. Solo puede borrar filas propias.

Errores frecuentes: **400** si aún no tiene carrera; **403** si la materia es de otra carrera; **409** si ya tenía esa materia registrada.

### Admin y listados generales

- `GET /user-approved-subjects` (JWT)
- `GET /user-approved-subjects/:id` (JWT)
- `POST /user-approved-subjects` (JWT + ADMIN)
- `PATCH /user-approved-subjects/:id` (JWT + ADMIN)
- `DELETE /user-approved-subjects/:id` (JWT + ADMIN)

Body create (admin):

```json
{
  "userId": "user_uuid",
  "subjectId": "subject_uuid",
  "approvedAt": "2026-05-07T10:00:00.000Z"
}
```

`approvedAt` es **opcional**; si se omite, se usa la fecha/hora actual.

Body update (admin): mismos campos en partial según `PATCH`.

## Generacion de cliente frontend (opcional)

Puedes generar cliente tipado con OpenAPI:

1. Asegura API arriba.
2. Usa `http://localhost:3000/docs-json`.
3. Genera cliente (ejemplo con `openapi-typescript`):

```bash
npx openapi-typescript http://localhost:3000/docs-json -o src/api/generated.ts
```

Esto te crea tipos TS para requests/responses en frontend.
