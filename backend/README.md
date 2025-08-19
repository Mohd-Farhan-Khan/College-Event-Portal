# College Event Portal Backend

Express + MongoDB API for managing colleges, events, registrations, and results.

## Features

- Auth (register/login/me) with JWT
- Role-based access (student, college, admin)
- Manage events, registrations, results
- Cloudinary integration placeholder
- Certificate generation placeholder

## Env Variables (.env)

```
PORT=5000
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

## API Overview

- `GET /` health
- `GET /api/healthcheck`

Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me` (Bearer)

Events
- `POST /api/events` (Bearer; role: college|admin)
- `GET /api/events`
- `GET /api/events/:id`

Registrations
- `POST /api/registrations` (Bearer; role: student) body: `{ "event_id": "<eventId>" }`
- `POST /api/registrations/:eventId` (Bearer; role: student)
- `GET /api/registrations` (Bearer; role: college|admin) query: `event_id`, `student_id`
- `PATCH /api/registrations/:id` (Bearer; role: college|admin) body: `{ "status": "pending|confirmed|cancelled" }`

Results
- `POST /api/results` (Bearer; role: college|admin)
- `POST /api/results/:eventId` (Bearer; role: college|admin)
- `GET /api/results` query: `event_id`, `student_id`

## Notes

- Project uses ES Modules (`"type": "module"`).
- Mongoose models are registered at startup via `src/models/index.js` import in `src/server.js`.
- Field naming follows the schema diagram; aliases allow legacy names in requests:
	- Users: send `password` and `college` (aliases to `passwordHash` and `college_id`).
	- Events: send `posterUrl` or `bannerUrl` (alias/virtual to `poster_url`), send `college` (alias to `college_id`).
	- Registrations: `user` alias -> `student_id`, `event` alias -> `event_id`.
	- Results: accept `certificateUrl` (alias -> `certificate_url`); filter by `event_id`/`student_id` or `event`/`user`.

## TODO

- Add validation (Joi / Zod)
- Add pagination & filtering
- Improve error classes
- Implement file uploads & certificate PDF
- Add tests
