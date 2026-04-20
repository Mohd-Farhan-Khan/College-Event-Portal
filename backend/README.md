# College Event Portal Backend

Express + MongoDB API for managing colleges, events, registrations, and results.

## Features

- Auth (register/login/me) with JWT
- Role-based access (student, college, admin)
- Manage events, registrations, and results
- Event update/delete for organizers and admins
- College CRUD plus college management helpers
- Scoped analytics endpoints for admin and organizers
- File upload endpoint with Cloudinary-or-local fallback
- Certificate generation and protected download endpoints
- Interactive API documentation (Swagger UI)

## Env Variables (.env)

```
PORT=8000
MONGO_URI=mongodb://localhost:27017/college_event_portal
JWT_SECRET=change_this_secret
JWT_EXPIRES=7d
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
NODE_ENV=development
```

## Scripts

- `npm run dev` - start with nodemon
- `npm start` - production start
- `npm run seed:college -- "<name>" "<location>" "<description>" "<logo_url>"` - seed a college (creates if not exists)
- `npm run seed:admin -- "<name>" "<email>" "<password>"` - create or update an admin account for local setup

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see `.env` section)
4. Create the first admin user if needed: `npm run seed:admin -- "Admin User" "admin@example.com" "secret123"`
5. Start the server: `npm run dev`
6. Access the API documentation: `http://localhost:8000/swagger/index.html`

## Admin Setup

Public signup intentionally supports only student and college accounts. To create an admin account for local development or a controlled deployment setup, run:

```bash
npm run seed:admin -- "Admin User" "admin@example.com" "secret123"
```

The command is idempotent by email. If the user already exists, it updates the name, resets the password, and ensures the role is `admin`. After running it, use the normal login flow with that email and password.

## API Documentation

Interactive API documentation is available via Swagger UI at:
- `http://localhost:8000/swagger/index.html`

## API Overview

- `GET /` health (welcome message)
- `GET /api/healthcheck`

Auth
- `POST /api/auth/register` (public signup supports student/college only; admin signup is blocked)
- `POST /api/auth/login`
- `GET /api/auth/me` (Bearer)

Events
- `POST /api/events` (Bearer; role: college|admin)
- `GET /api/events`
- `GET /api/events/:id`
- `PUT /api/events/:id` (Bearer; role: college|admin; owner-or-admin)
- `DELETE /api/events/:id` (Bearer; role: college|admin; owner-or-admin)

Registrations
- `POST /api/registrations` (Bearer; role: student) body: `{ "event_id": "<eventId>" }`
- `POST /api/registrations/:eventId` (Bearer; role: student)
- `GET /api/registrations/me` (Bearer; role: student)
- `GET /api/registrations` (Bearer; role: student|college|admin) query: `event_id`, `student_id`
- `PATCH /api/registrations/:id` (Bearer; role: college|admin) body: `{ "status": "pending|confirmed|cancelled" }`

Results
- `POST /api/results` (Bearer; role: college|admin)
- `POST /api/results/:eventId` (Bearer; role: college|admin)
- `GET /api/results` query: `event_id`, `student_id`
- `POST /api/results/:id/certificate` (Bearer; role: college|admin; owner-or-admin)
- `GET /api/results/:id/certificate` (Bearer; role: student|college|admin with ownership checks)

Uploads
- `POST /api/upload` (Bearer; role: college|admin; `multipart/form-data` with `file` and optional `kind`)

Colleges
- `GET /api/colleges`
- `GET /api/colleges/:id`
- `POST /api/colleges` (Bearer; role: admin)
- `PUT /api/colleges/:id` (Bearer; role: admin)
- `DELETE /api/colleges/:id` (Bearer; role: admin)
- `GET /api/colleges/:id/events`
- `GET /api/colleges/:id/users` (Bearer; role: admin)
- `GET /api/colleges/:id/overview` (Bearer; role: admin)

Analytics
- `GET /api/analytics/admin` (Bearer; role: admin; optional `college_id`)
- `GET /api/analytics/college` (Bearer; role: college|admin; admin may pass optional `college_id`)

## Notes

- Project uses ES Modules (`"type": "module"`).
- Mongoose models are registered at startup via `src/models/index.js` import in `src/server.js`.
- Field naming follows the schema diagram; aliases allow legacy names in requests:
	- Users: send `password` and `college` (aliases to `passwordHash` and `college_id`).
	- Events: send `posterUrl` or `bannerUrl` (alias/virtual to `poster_url`), send `college` (alias to `college_id`).
	- Registrations: `user` alias -> `student_id`, `event` alias -> `event_id`.
	- Results: accept `certificateUrl` (alias -> `certificate_url`); filter by `event_id`/`student_id` or `event`/`user`.
- Error handling:
    - Duplicate registrations are handled with a 409 Conflict response
    - Mongoose validation errors return meaningful messages
- **Orphaned file cleanup:** When events or colleges are deleted, their associated files (poster images, logos) are automatically cleaned up from Cloudinary or local storage. The `deleteStoredFile()` utility in `src/utils/storage.js` handles both storage backends. Cleanup failures are logged but do not block the deletion operation.
- **Cloudinary integration:** When `.env` variables (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`) are set, all file uploads and certificate generation use Cloudinary. When not set, files are stored locally in `public/`.

## API Documentation Setup

The API documentation is served via Swagger UI:
- OpenAPI 3.0 specification is at `public/openapi.json`
- Swagger UI is accessible at `/swagger/index.html`
- You can authenticate in the UI by providing your JWT token
- The documentation includes examples for all endpoints

## TODO

- Add validation (Joi / Zod)
- Add pagination & filtering
- Add tests
