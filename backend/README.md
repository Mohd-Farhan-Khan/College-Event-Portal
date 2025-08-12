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

## API Overview

- `GET /` health
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/events` (college/admin)
- `GET /api/events`
- `GET /api/events/:id`
- `POST /api/registrations/:eventId` (student)
- `GET /api/registrations` (college/admin)
- `POST /api/results/:eventId` (college/admin)
- `GET /api/results`

## TODO

- Add validation (Joi / Zod)
- Add pagination & filtering
- Improve error classes
- Implement file uploads & certificate PDF
- Add tests
