# College Event Portal Backend Reference

## Overview

This backend is an Express + MongoDB API for a college event portal. It supports:

- user registration and login with JWT authentication
- role-based authorization for `student`, `college`, and `admin`
- event creation and public event browsing
- student event registrations
- registration status management by organizers/admins
- result publishing for events
- a health check endpoint
- static Swagger/OpenAPI documentation under `/swagger`

The codebase uses ES modules and Mongoose models.

## Runtime Architecture

### Entry points

- `src/server.js`
  - loads environment variables
  - connects to MongoDB
  - registers all Mongoose models early
  - starts the Express server
- `src/app.js`
  - configures middleware
  - mounts routes
  - serves static files from `backend/public`
  - installs the 404 handler and global error handler

### Main layers

- `routes/`
  - declares endpoint URLs and attaches middleware/controller handlers
- `controllers/`
  - contains request handling logic
- `models/`
  - Mongoose schemas for MongoDB collections
- `middleware/`
  - JWT auth and centralized error handling
- `config/`
  - database, JWT, and Cloudinary configuration
- `utils/`
  - shared helpers and placeholders for uploads/certificates

## Request Flow

1. Request reaches Express in `src/app.js`.
2. `express.json()` / `express.urlencoded()` parse body data.
3. `cors()` validates the frontend origin from `CORS_ORIGIN`.
4. Route-level middleware runs.
5. Protected routes call `auth()` from `src/middleware/authMiddleware.js`.
6. `auth()`:
   - reads `Authorization: Bearer <token>`
   - verifies JWT with `verifyToken()`
   - loads the current user from MongoDB
   - checks allowed roles when a route requires specific roles
7. Controller executes business logic and talks to MongoDB via Mongoose models.
8. Any thrown error reaches `src/middleware/errorHandler.js`.

## Authentication and Authorization

### JWT flow

- Login and registration return a JWT.
- JWT payload contains:
  - `id`
  - `role`
- Default token expiry comes from `JWT_EXPIRES` and defaults to `7d`.

### Auth middleware behavior

- Missing token: `401`
- Invalid/expired token: `401`
- Authenticated but wrong role: `403`

### Roles used in the current backend

- `student`
  - can register for events
- `college`
  - can create events
  - can list/manage registrations for events they own
  - can publish results for events they own
- `admin`
  - can access all user list/detail routes
  - can create events
  - can list/manage all registrations
  - can publish results for any event

## Middleware

### Global middleware in `src/app.js`

- `express.json({ limit: "16kb" })`
- `express.urlencoded({ extended: true, limit: "16kb" })`
- `express.static("public")`
- `cors({...})`

### Custom middleware

- `src/middleware/authMiddleware.js`
  - JWT authentication
  - optional role guard
- `src/middleware/errorHandler.js`
  - duplicate key handling
  - Mongoose validation handling
  - generic error response

## Data Model / Database Design

MongoDB is the only database in the current backend. The default database name shown in `.env` / README is `college_event_portal`.

### 1. `users` collection

Model: `src/models/userModel.js`

Fields:

- `name`: `String`, required
- `email`: `String`, required, unique, stored lowercase
- `passwordHash`: `String`, required
- `role`: `String`, enum: `student | college | admin`, default `student`
- `college_id`: `ObjectId`, optional reference to `College`
- `createdAt`, `updatedAt`: automatic timestamps

Behavior:

- password is hashed with bcrypt in a `pre("save")` hook
- `matchPassword()` compares a raw password with the stored hash

Aliases:

- request field `password` maps to `passwordHash`
- request field `college` maps to `college_id`

### 2. `colleges` collection

Model: `src/models/collegeModel.js`

Fields:

- `name`: `String`, required
- `location`: `String`
- `description`: `String`
- `logo_url`: `String`
- `createdAt`, `updatedAt`: automatic timestamps

### 3. `events` collection

Model: `src/models/eventModel.js`

Fields:

- `title`: `String`, required
- `description`: `String`
- `category`: `String`
- `date`: `Date`, required
- `venue`: `String`
- `poster_url`: `String`
- `createdBy`: `ObjectId`, required reference to `User`
- `college_id`: `ObjectId`, optional reference to `College`
- `createdAt`, `updatedAt`: automatic timestamps

Aliases / virtuals:

- `posterUrl` alias maps to `poster_url`
- `bannerUrl` virtual also reads/writes `poster_url`
- `college` alias maps to `college_id`

Important behavior:

- when a `college` user creates an event, the backend now forces `college_id` to the logged-in user’s `college_id`

### 4. `registrations` collection

Model: `src/models/registrationModel.js`

Fields:

- `student_id`: `ObjectId`, required reference to `User`
- `event_id`: `ObjectId`, required reference to `Event`
- `status`: `String`, enum: `pending | confirmed | cancelled`, default `pending`
- `registeredAt`: auto timestamp

Indexes:

- unique compound index on `{ student_id, event_id }`
  - prevents duplicate registration for the same student/event pair

Aliases:

- `user` alias maps to `student_id`
- `event` alias maps to `event_id`

### 5. `results` collection

Model: `src/models/resultModel.js`

Fields:

- `event_id`: `ObjectId`, required reference to `Event`
- `student_id`: `ObjectId`, required reference to `User`
- `position`: `Number`, required
- `certificate_url`: `String`
- `issuedAt`: auto timestamp

Indexes:

- unique compound index on `{ event_id, student_id }`
  - prevents multiple results for the same student/event pair

Aliases:

- `user` alias maps to `student_id`
- `certificateUrl` alias maps to `certificate_url`

## API Endpoints

Base URL in local development is typically `http://localhost:5000`.

### Root and docs

#### `GET /`

Purpose:

- basic welcome response

Response:

- plain text: `"Welcome to UniVerse"`

#### `GET /swagger`

Purpose:

- redirects to static Swagger UI

Redirect target:

- `/swagger/index.html`

#### `GET /swagger/index.html`

Purpose:

- interactive API documentation UI

#### `GET /openapi.json`

Purpose:

- raw OpenAPI JSON file served from `backend/public/openapi.json`

### Health

#### `GET /api/healthcheck`

Purpose:

- uptime/health endpoint for backend availability

Response shape:

```json
{
  "statusCode": 200,
  "data": {
    "message": "Server is running"
  },
  "message": "Success",
  "success": true
}
```

### Auth

#### `POST /api/auth/register`

Purpose:

- create a new user account and immediately return a JWT

Auth:

- public

Required body:

```json
{
  "name": "Aarav Sharma",
  "email": "aarav@example.com",
  "password": "secret123"
}
```

Optional body fields:

- `role`: `student | college | admin`
- `college`: college ObjectId alias for `college_id`

Success response:

```json
{
  "token": "jwt-token",
  "user": {
    "id": "userObjectId",
    "name": "Aarav Sharma",
    "email": "aarav@example.com",
    "role": "student"
  }
}
```

Common errors:

- `400` if email already exists
- `400` on schema validation failure

#### `POST /api/auth/login`

Purpose:

- authenticate a user and return a JWT

Auth:

- public

Required body:

```json
{
  "email": "aarav@example.com",
  "password": "secret123"
}
```

Success response:

```json
{
  "token": "jwt-token",
  "user": {
    "id": "userObjectId",
    "name": "Aarav Sharma",
    "email": "aarav@example.com",
    "role": "student"
  }
}
```

Common errors:

- `401` invalid credentials

#### `GET /api/auth/me`

Purpose:

- return the currently authenticated user

Auth:

- required for any valid logged-in user

Headers:

```http
Authorization: Bearer <jwt>
```

Success response:

```json
{
  "user": {
    "_id": "userObjectId",
    "name": "Aarav Sharma",
    "email": "aarav@example.com",
    "role": "student",
    "college_id": "collegeObjectId"
  }
}
```

### Users

#### `GET /api/users`

Purpose:

- list all users

Auth:

- admin only

Behavior:

- excludes `passwordHash` from output

#### `GET /api/users/:id`

Purpose:

- fetch one user by MongoDB ObjectId

Auth:

- admin only

Behavior:

- excludes `passwordHash` from output

Common errors:

- `404` if user does not exist

### Events

#### `POST /api/events`

Purpose:

- create a new event

Auth:

- `college` or `admin`

Required body:

```json
{
  "title": "Hackathon 2026",
  "date": "2026-09-15T10:00:00.000Z"
}
```

Optional body fields:

- `description`
- `category`
- `venue`
- `poster_url`
- `posterUrl`
- `bannerUrl`
- `college_id`
- `college`

Behavior:

- request `id` and `_id` are ignored if sent
- `createdBy` is always set from the logged-in user
- for `college` users, `college_id` is forced to the user’s own `college_id`

Success response:

- returns the created event document

#### `GET /api/events`

Purpose:

- list all events publicly

Auth:

- public

Behavior:

- populates `college_id` and `createdBy` with `name`

#### `GET /api/events/:id`

Purpose:

- get one event by id

Auth:

- public

Behavior:

- populates `college_id` and `createdBy` with `name`

Common errors:

- `404` if event is missing

### Registrations

#### `POST /api/registrations`

Purpose:

- register the logged-in student for an event using request body

Auth:

- `student` only

Required body:

```json
{
  "event_id": "eventObjectId"
}
```

Accepted alternatives:

- `event`

Behavior:

- validates that the event exists
- prevents duplicate registration for the same student/event
- logged-in user becomes `student_id`

Success response:

- returns the created registration document

Common errors:

- `400` if `event_id` is missing
- `404` if event does not exist
- `409` if already registered

#### `POST /api/registrations/:eventId`

Purpose:

- register the logged-in student for an event using the URL path

Auth:

- `student` only

Behavior:

- same logic as the body-based endpoint

#### `GET /api/registrations`

Purpose:

- list registrations

Auth:

- `college` or `admin`

Supported query params:

- `event_id`
- `event`
- `student_id`
- `user`
- `status`

Behavior:

- admin can query all registrations
- college users only see registrations belonging to events they created or events tied to their `college_id`
- populates:
  - `student_id` with `name`
  - `event_id` with `title`

#### `PATCH /api/registrations/:id`

Purpose:

- update a registration status

Auth:

- `college` or `admin`

Required body:

```json
{
  "status": "confirmed"
}
```

Allowed values:

- `pending`
- `confirmed`
- `cancelled`

Behavior:

- admin can update any registration
- college users can update only registrations for their own events

Common errors:

- `400` invalid status
- `403` event access denied
- `404` registration not found

### Results

#### `POST /api/results`

Purpose:

- publish a result using request body

Auth:

- `college` or `admin`

Required body:

```json
{
  "event_id": "eventObjectId",
  "student_id": "userObjectId",
  "position": 1
}
```

Optional body fields:

- `certificate_url`
- `certificateUrl`
- `user` as alias for `student_id`
- `event` as alias for `event_id`

Behavior:

- validates that the event exists
- admin can publish for any event
- college users can publish only for their own events
- unique result per event + student pair

Common errors:

- `400` missing required fields
- `403` event access denied
- `404` event not found
- `409` result already published for that student/event

#### `POST /api/results/:eventId`

Purpose:

- publish a result using the event id in the URL

Auth:

- `college` or `admin`

Required body:

```json
{
  "student_id": "userObjectId",
  "position": 1
}
```

Optional body fields:

- `certificate_url`
- `certificateUrl`
- `user`

Behavior:

- same logic as the body-based endpoint

#### `GET /api/results`

Purpose:

- list published results

Auth:

- public in the current implementation

Supported query params:

- `event_id`
- `event`
- `student_id`
- `user`

Behavior:

- populates:
  - `student_id` with `name`
  - `event_id` with `title`

## Current Route Map

Mounted in `src/app.js`:

- `/api/auth` -> `src/routes/authRoutes.js`
- `/api/users` -> `src/routes/userRoutes.js`
- `/api/events` -> `src/routes/eventRoutes.js`
- `/api/registrations` -> `src/routes/registrationRoutes.js`
- `/api/results` -> `src/routes/resultRoutes.js`
- `/api/healthcheck` -> `src/routes/healthRoutes.js`

## Important Implementation Notes for Frontend Integration

### 1. Bearer token format

For protected endpoints, always send:

```http
Authorization: Bearer <jwt>
```

### 2. ObjectId expectations

All entity relationships use MongoDB ObjectIds. Frontend code should treat ids as strings.

### 3. Field aliases supported by the backend

The backend accepts both canonical DB field names and some frontend-friendly aliases:

- user create:
  - `password` -> `passwordHash`
  - `college` -> `college_id`
- event create:
  - `posterUrl` -> `poster_url`
  - `bannerUrl` -> `poster_url`
  - `college` -> `college_id`
- registration create:
  - `event` -> `event_id`
  - `user` -> `student_id`
- result create:
  - `user` -> `student_id`
  - `certificateUrl` -> `certificate_url`

Using canonical names in new frontend code is usually safer for long-term consistency.

### 4. Populated responses

Some read endpoints return populated relations instead of plain ObjectIds:

- events may include populated `college_id` and `createdBy`
- registrations may include populated `student_id` and `event_id`
- results may include populated `student_id` and `event_id`

Frontend types should allow either an id string or a populated object if you plan to reuse the same type shape in multiple places.

### 5. Error response patterns

There is no single enforced response envelope for all routes.

Most routes return plain JSON objects like:

```json
{
  "message": "Invalid credentials"
}
```

The health route uses the custom `apiResponse` wrapper instead.

### 6. CORS

`CORS_ORIGIN` may contain a comma-separated list of allowed origins. Frontend environments must match one of those origins when credentials/authenticated requests are used.

## Known Gaps / Not Yet Implemented

The PRD mentions some features that are not present in the current backend implementation:

- logout endpoint
- refresh token endpoint
- change password / forgot password / reset password
- event update and delete endpoints
- upload endpoint
- Cloudinary upload flow in routes/controllers
- certificate generation flow in routes/controllers
- analytics endpoints
- pagination and advanced filtering
- automated tests

There are placeholders/utilities for Cloudinary and certificate generation, but no exposed API route currently uses them.

## Issues Found and Corrected During Review

The following backend issues were fixed while reviewing the code:

- college users could manage registrations outside their own events
- college users could publish results outside their own events
- registration listing ignored the documented `status` query filter
- registration creation did not verify that the target event exists
- result publishing did not verify that the target event exists
- duplicate result publishing did not return a clean `409` response
- college users could create an event for an arbitrary `college_id` sent by the client

## Useful Files

- `src/server.js`
- `src/app.js`
- `src/middleware/authMiddleware.js`
- `src/middleware/errorHandler.js`
- `src/controllers/`
- `src/models/`
- `public/openapi.json`
- `public/swagger/index.html`
