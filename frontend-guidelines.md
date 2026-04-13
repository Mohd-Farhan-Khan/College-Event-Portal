# Frontend Development Guidelines

## Scope

This document defines the frontend implementation plan based on the backend that currently exists in `college-event-portal/backend`.

It is intended for:

- developers building the frontend
- AI coding tools generating frontend code
- reviewers validating frontend-to-backend integration

This guide is implementation-oriented and only relies on currently implemented backend behavior.

## Source of Truth

Use the backend implementation as the source of truth, not the PRD.

Confirmed implemented backend areas:

- authentication with JWT
- role-based authorization for `student`, `college`, `admin`
- current user profile lookup
- admin user listing and detail
- public event listing and event detail
- event creation for `college` and `admin`
- student event registration
- registration listing and status update for `college` and `admin`
- result publishing for `college` and `admin`
- public result listing

Not implemented in backend and therefore frontend pages/features are `[blocked]`:

- logout endpoint
- refresh token endpoint
- forgot password
- reset password
- change password
- update event
- delete event
- upload endpoint
- certificate generation endpoint
- certificate download endpoint
- analytics endpoints
- college management endpoints
- CRUD for colleges
- student-specific “my registrations” endpoint

## Minimal Assumptions

These assumptions are necessary because the frontend codebase and router structure were not provided here:

- the frontend will use client-side routing
- the frontend will store the JWT token locally after login
- the frontend can decode role from the `/api/auth/me` response instead of decoding JWT client-side
- a single frontend app will serve all roles

If the frontend framework has already been chosen, adapt route implementation details to that framework, but keep the page responsibilities and endpoint usage the same.

## Backend Base Configuration

Backend base URL in local development:

```text
http://localhost:8000
```

Note:

- this project intentionally uses port `8000` locally because port `5000` is commonly occupied on macOS development machines

All protected requests must send:

```http
Authorization: Bearer <token>
```

Content type for JSON requests:

```http
Content-Type: application/json
```

## Auth Model

### Login

Endpoint:

- `POST /api/auth/login`

Required request body:

```json
{
  "email": "user@example.com",
  "password": "secret123"
}
```

Success response:

```json
{
  "token": "jwt-token",
  "user": {
    "id": "userObjectId",
    "name": "User Name",
    "email": "user@example.com",
    "role": "student"
  }
}
```

### Signup

Endpoint:

- `POST /api/auth/register`

Required request body:

```json
{
  "name": "User Name",
  "email": "user@example.com",
  "password": "secret123"
}
```

Optional body fields:

- `role`: `student | college`
- `college`: `collegeObjectId`

Important:

- only pass `college` when creating a `college` role user and you already have a valid college ObjectId
- public signup must not create `admin` users; admin accounts require administrator provisioning outside the public signup flow
- for local development, create or update an admin account from the backend with `npm run seed:admin -- "<name>" "<email>" "<password>"`
- there is no backend endpoint to fetch college options, so a college selection UI is currently `[blocked]` unless college IDs are provided externally

### Current User

Endpoint:

- `GET /api/auth/me`

Use this after login or app refresh to restore the authenticated session.

## Recommended Frontend Page Map

Build these core pages for the currently implemented backend. Treat optional/backlog pages as product decisions, not launch blockers.

## 1. Public Pages

### Page 1. Landing / Home

Route:

- `/`

Purpose:

- project entry page
- entry point to browse events
- entry point to login or signup

Backend endpoints used:

- none required
- optional: `GET /api/events` if you want to preview featured events on home

Information to display:

- app branding
- short explanation of student / college / admin roles
- navigation to:
  - events
  - login
  - signup

Required backend fields if showing featured events:

- `_id`
- `title`
- `description`
- `category`
- `date`
- `venue`
- `poster_url` or `posterUrl`
- `college_id.name` if populated

### Page 2. Login

Route:

- `/login`

Purpose:

- authenticate a user and obtain JWT token

Backend endpoints used:

- `POST /api/auth/login`
- `GET /api/auth/me` immediately after login or during app boot

Form fields required:

- `email`
- `password`

What to submit:

```json
{
  "email": "<email>",
  "password": "<password>"
}
```

What to save on success:

- `token`
- `user.id`
- `user.name`
- `user.email`
- `user.role`

Frontend behavior:

- store token in app auth state
- store token in persistent storage if session restore is required
- redirect by role after successful login

Recommended role-based redirect:

- `student` -> `/events`
- `college` -> `/college/events/new`
- `admin` -> `/admin/users`

### Page 3. Signup

Route:

- `/signup`

Purpose:

- create a new account

Backend endpoints used:

- `POST /api/auth/register`
- optional follow-up `GET /api/auth/me`

Form fields required:

- `name`
- `email`
- `password`

Form fields conditionally required:

- `role`
- `college` only when role is `college`

Safe frontend behavior:

- default role to `student`
- allow role selection only if product owners want it

Important backend limitation:

- because there is no college list endpoint, a college signup flow with dynamic college selection is `[blocked]`
- if the UI supports college signup, it must receive a valid `college` ObjectId from configuration, admin provisioning, or external setup

Example student signup payload:

```json
{
  "name": "Student One",
  "email": "student@example.com",
  "password": "secret123",
  "role": "student"
}
```

Example college signup payload:

```json
{
  "name": "College Organizer",
  "email": "college@example.com",
  "password": "secret123",
  "role": "college",
  "college": "collegeObjectId"
}
```

### Page 4. Event Listing

Route:

- `/events`

Purpose:

- show all events publicly

Backend endpoints used:

- `GET /api/events`

Information to display for each event:

- `_id`
- `title`
- `description`
- `category`
- `date`
- `venue`
- `poster_url` or `posterUrl`
- `college_id`
- `createdBy`

Display rules:

- if `college_id` is populated, display `college_id.name`
- if `createdBy` is populated, display `createdBy.name`
- format the `date`

UI actions:

- `View Details`
- `Register` button if logged in as student
- `Login to Register` if not authenticated

### Page 5. Event Detail

Route:

- `/events/:eventId`

Purpose:

- show one event’s full details
- allow student registration
- optionally show result summary if frontend also fetches results separately

Backend endpoints used:

- `GET /api/events/:id`
- `POST /api/registrations` or `POST /api/registrations/:eventId` for student registration
- optional: `GET /api/results?event_id=:eventId`

Information to display:

- `_id`
- `title`
- `description`
- `category`
- `date`
- `venue`
- `poster_url`
- `college_id.name` if populated
- `createdBy.name` if populated

Student action:

- register for event

Student registration request:

```json
{
  "event_id": "<eventId>"
}
```

Token required:

- student token only

## 2. Shared Authenticated Pages

### Page 6. Profile / Session Check

Route:

- `/me`

Purpose:

- verify current logged-in user
- useful as a basic protected page

Backend endpoints used:

- `GET /api/auth/me`

Information to display:

- `_id`
- `name`
- `email`
- `role`
- `college_id` if present

Use cases:

- auth debug page
- app shell bootstrap page
- profile summary widget source

Note:

- there is no update-profile endpoint in the current backend

## 3. Student Pages

Student functionality currently supported by the backend is limited.

### Page 7. Student Event Registration Flow

Route:

- no separate route required beyond `/events/:eventId`

Purpose:

- student registers for an event

Backend endpoints used:

- `POST /api/registrations`
- or `POST /api/registrations/:eventId`

Required backend request fields:

- `event_id` or path param `eventId`

Auth requirement:

- must be logged in as `student`

Expected success data to use in UI:

- registration `_id`
- `student_id`
- `event_id`
- `status`
- `registeredAt`

### Page 8. Student Results Page

Route:

- `/results`

Purpose:

- allow students and public users to browse results

Backend endpoints used:

- `GET /api/results`
- `GET /api/results?student_id=:studentUserId`
- `GET /api/results?event_id=:eventId`

Information to display:

- result `_id`
- `event_id`
- `student_id`
- `position`
- `certificate_url`
- `issuedAt`

If populated:

- `event_id.title`
- `student_id.name`

Important limitation:

- there is no dedicated “my certificates” endpoint
- `GET /api/registrations` is available to students and returns only the logged-in student’s registrations

### Page 9. Student Dashboard

Route:

- `/student/dashboard`

Status:

- `[optional/backlog]`

Reason:

- backend does not expose a certificate download endpoint
- backend does not expose student-specific dashboard analytics
- the current frontend uses `/me`, `/events`, and `/results` for the student experience instead of a separate dashboard route

Allowed scope if product wants this route later:

- show profile summary from `GET /api/auth/me`
- show the student’s registrations from `GET /api/registrations`
- link to `/events`
- link to `/results`

## 4. College Pages

### Page 10. Create Event

Route:

- `/college/events/new`

Purpose:

- allow `college` and `admin` users to create events

Backend endpoints used:

- `POST /api/events`

Required request fields:

- `title`
- `date`

Optional request fields:

- `description`
- `category`
- `venue`
- `poster_url`
- `posterUrl`
- `bannerUrl`
- `college_id`
- `college`

Recommended frontend form fields:

- `title`
- `description`
- `category`
- `date`
- `venue`
- `posterUrl`

Do not rely on editable `college_id` for college users:

- the backend will force the logged-in college user’s `college_id`

Expected success data to store or navigate with:

- event `_id`

Recommended post-submit behavior:

- redirect to `/events/:eventId`

### Page 11. College Registrations Management

Route:

- `/college/registrations`

Purpose:

- allow a college organizer to view registrations for their own events
- allow status changes

Backend endpoints used:

- `GET /api/registrations`
- `GET /api/registrations?event_id=:eventId`
- `GET /api/registrations?status=:status`
- `PATCH /api/registrations/:id`

Data to display per registration:

- registration `_id`
- `student_id`
- `event_id`
- `status`
- `registeredAt`

If populated:

- `student_id.name`
- `event_id.title`

Filters to support in UI:

- by event
- by student
- by status

Update request body:

```json
{
  "status": "confirmed"
}
```

Allowed values:

- `pending`
- `confirmed`
- `cancelled`

Important access rule:

- college users only receive registrations for their own events

### Page 12. College Publish Results

Route:

- `/college/results/new`

Purpose:

- publish results for a student in an event owned by that college

Backend endpoints used:

- `POST /api/results`
- or `POST /api/results/:eventId`

Required request fields:

- `event_id` or path `eventId`
- `student_id`
- `position`

Optional request fields:

- `certificate_url`
- `certificateUrl`
- `user`

Recommended form fields:

- `eventId`
- `studentId`
- `position`
- `certificateUrl`

Important access rule:

- college users can only publish results for events they own

### Page 13. College Dashboard

Route:

- `/college/dashboard`

Status:

- partially supported

Supported backend data:

- `GET /api/auth/me`
- `GET /api/registrations`

Recommended content:

- organizer profile summary
- quick links to create event, manage registrations, publish results
- recent registrations list

Missing backend support for a richer dashboard:

- no event update/delete
- no owned-events endpoint with filters beyond public `GET /api/events`
- no analytics endpoint

## 5. Admin Pages

### Page 14. Admin Users List

Route:

- `/admin/users`

Purpose:

- list all users

Backend endpoints used:

- `GET /api/users`

Information to display:

- `_id`
- `name`
- `email`
- `role`
- `college_id`
- `createdAt`
- `updatedAt`

Important:

- `passwordHash` is excluded by backend and should never be expected

### Page 15. Admin User Detail

Route:

- `/admin/users/:userId`

Purpose:

- inspect one user record

Backend endpoints used:

- `GET /api/users/:id`

Information to display:

- `_id`
- `name`
- `email`
- `role`
- `college_id`
- `createdAt`
- `updatedAt`

### Page 16. Admin Event Creation

Route:

- `/admin/events/new`

Purpose:

- allow admins to create events

Backend endpoints used:

- `POST /api/events`

Required request fields:

- `title`
- `date`

Optional request fields:

- `description`
- `category`
- `venue`
- `poster_url`
- `posterUrl`
- `bannerUrl`
- `college_id`
- `college`

Important:

- unlike college users, admin users may pass `college_id` if the product wants to associate an event with a college
- however, there is no college listing endpoint, so choosing a college dynamically is `[blocked]` unless IDs are known externally

### Page 17. Admin Registrations Management

Route:

- `/admin/registrations`

Purpose:

- list and manage all registrations

Backend endpoints used:

- `GET /api/registrations`
- `GET /api/registrations?event_id=:eventId`
- `GET /api/registrations?student_id=:studentId`
- `GET /api/registrations?status=:status`
- `PATCH /api/registrations/:id`

Information to display:

- registration `_id`
- `student_id`
- `event_id`
- `status`
- `registeredAt`

If populated:

- `student_id.name`
- `event_id.title`

### Page 18. Admin Publish Results

Route:

- `/admin/results/new`

Purpose:

- publish results for any event

Backend endpoints used:

- `POST /api/results`
- `POST /api/results/:eventId`

Required request fields:

- `event_id`
- `student_id`
- `position`

Optional request fields:

- `certificate_url`
- `certificateUrl`

### Page 19. Admin Dashboard

Route:

- `/admin/dashboard`

Status:

- partially supported

Supported backend endpoints:

- `GET /api/users`
- `GET /api/registrations`
- `GET /api/results`

Recommended content:

- quick summary cards derived client-side from fetched lists
- counts of users, registrations, results
- quick links to user detail, registration management, result publishing

Missing backend support:

- no analytics endpoint
- no event administration endpoint beyond creation

## Page Count Summary

For the currently implemented backend, build these core routes. `/student/dashboard` is optional/backlog unless product owners explicitly want a separate student dashboard:

1. `/`
2. `/login`
3. `/signup`
4. `/events`
5. `/events/:eventId`
6. `/me`
7. student registration flow inside `/events/:eventId`
8. `/results`
9. `/student/dashboard` `[optional/backlog]`
10. `/college/events/new`
11. `/college/registrations`
12. `/college/results/new`
13. `/college/dashboard`
14. `/admin/users`
15. `/admin/users/:userId`
16. `/admin/events/new`
17. `/admin/registrations`
18. `/admin/results/new`
19. `/admin/dashboard`

If the product wants a lean first release, the minimum non-blocked launch set is:

- `/`
- `/login`
- `/signup`
- `/events`
- `/events/:eventId`
- `/results`
- `/college/events/new`
- `/college/registrations`
- `/college/results/new`
- `/admin/users`
- `/admin/users/:userId`
- `/admin/registrations`
- `/admin/results/new`

## Endpoint-to-Page Mapping

### Public

- `/` -> no backend required, optional `GET /api/events`
- `/login` -> `POST /api/auth/login`, `GET /api/auth/me`
- `/signup` -> `POST /api/auth/register`
- `/events` -> `GET /api/events`
- `/events/:eventId` -> `GET /api/events/:id`, student registration endpoint
- `/results` -> `GET /api/results`

### Shared Auth

- `/me` -> `GET /api/auth/me`

### College

- `/college/events/new` -> `POST /api/events`
- `/college/registrations` -> `GET /api/registrations`, `PATCH /api/registrations/:id`
- `/college/results/new` -> `POST /api/results`, `POST /api/results/:eventId`
- `/college/dashboard` -> `GET /api/auth/me`, `GET /api/registrations`

### Admin

- `/admin/users` -> `GET /api/users`
- `/admin/users/:userId` -> `GET /api/users/:id`
- `/admin/events/new` -> `POST /api/events`
- `/admin/registrations` -> `GET /api/registrations`, `PATCH /api/registrations/:id`
- `/admin/results/new` -> `POST /api/results`, `POST /api/results/:eventId`
- `/admin/dashboard` -> `GET /api/users`, `GET /api/registrations`, `GET /api/results`

## Data Contracts to Use in Frontend Types

### Auth User

```ts
type AuthUser = {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  role: "student" | "college" | "admin";
  college_id?: string | { _id?: string; name?: string };
};
```

### Event

```ts
type Event = {
  _id: string;
  title: string;
  description?: string;
  category?: string;
  date: string;
  venue?: string;
  poster_url?: string;
  posterUrl?: string;
  college_id?: string | { _id?: string; name?: string };
  createdBy?: string | { _id?: string; name?: string };
};
```

### Registration

```ts
type Registration = {
  _id: string;
  student_id: string | { _id?: string; name?: string };
  event_id: string | { _id?: string; title?: string };
  status: "pending" | "confirmed" | "cancelled";
  registeredAt: string;
};
```

### Result

```ts
type Result = {
  _id: string;
  event_id: string | { _id?: string; title?: string };
  student_id: string | { _id?: string; name?: string };
  position: number;
  certificate_url?: string;
  issuedAt?: string;
};
```

## Required UI State and App Infrastructure

Implement these shared frontend concerns before deep page work:

- auth provider or global auth state
- API client wrapper with base URL
- bearer token injection for protected calls
- route guards by role
- loading states
- empty states
- error messaging for `400`, `401`, `403`, `404`, `409`

Recommended guarded-route behavior:

- unauthenticated user visiting protected route -> redirect to `/login`
- authenticated user with wrong role -> show access denied page or redirect to safe home route

## Exact Role Rules to Enforce in Frontend

### Student

Can access:

- `/`
- `/login`
- `/signup`
- `/events`
- `/events/:eventId`
- `/results`
- `/me`

Can trigger:

- login
- signup
- event registration

Should not see:

- admin pages
- college pages

### College

Can access:

- all public pages
- `/me`
- `/college/events/new`
- `/college/registrations`
- `/college/results/new`
- `/college/dashboard`

Should not see:

- admin routes

### Admin

Can access:

- all public pages
- `/me`
- `/admin/users`
- `/admin/users/:userId`
- `/admin/events/new`
- `/admin/registrations`
- `/admin/results/new`
- `/admin/dashboard`

## Step-by-Step Frontend Implementation Order

Build in this order.

## Step 1. Setup app shell and API layer

Build first:

- router
- layout shell
- API client
- environment config for backend base URL
- auth state management

Required details:

- base URL config
- token storage
- auth header injection
- shared request error handling

Do not start page-specific work before this is stable.

## Step 2. Build authentication pages

Build next:

- `/login`
- `/signup`
- `/me`

Why this comes second:

- all protected areas depend on working auth state

Required backend dependencies:

- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/auth/me`

Success criteria:

- login works for all roles
- signup works for at least student role
- route redirects by role work
- page refresh can restore session using stored token and `/api/auth/me`

## Step 3. Build public event browsing

Build next:

- `/`
- `/events`
- `/events/:eventId`

Required backend dependencies:

- `GET /api/events`
- `GET /api/events/:id`

Success criteria:

- public users can browse event list and detail
- event detail route works by URL param

## Step 4. Add student event registration flow

Build next:

- registration action inside `/events/:eventId`

Required backend dependency:

- `POST /api/registrations`

Success criteria:

- logged-in student can register
- duplicate registration shows clean `409` message
- non-student users do not see a registration action

## Step 5. Build public/student results page

Build next:

- `/results`

Required backend dependency:

- `GET /api/results`

Success criteria:

- results list renders
- filtering by event or student can be supported via query params

## Step 6. Build college event creation

Build next:

- `/college/events/new`

Required backend dependency:

- `POST /api/events`

Success criteria:

- college users can create events
- admin users can optionally reuse same form pattern in admin area

## Step 7. Build college registration management

Build next:

- `/college/registrations`

Required backend dependencies:

- `GET /api/registrations`
- `PATCH /api/registrations/:id`

Success criteria:

- organizer sees registrations for owned events only
- status update works
- filters by status and event work

## Step 8. Build college result publishing

Build next:

- `/college/results/new`

Required backend dependency:

- `POST /api/results`

Success criteria:

- college user can publish results for owned events
- duplicate result shows `409`

## Step 9. Build admin user management read-only pages

Build next:

- `/admin/users`
- `/admin/users/:userId`

Required backend dependencies:

- `GET /api/users`
- `GET /api/users/:id`

Success criteria:

- admin sees all users
- detail route works

## Step 10. Build admin registration and result pages

Build next:

- `/admin/registrations`
- `/admin/results/new`
- optional `/admin/events/new`

Required backend dependencies:

- `GET /api/registrations`
- `PATCH /api/registrations/:id`
- `POST /api/results`
- `POST /api/events`

Success criteria:

- admin can manage all registrations
- admin can publish results for any event
- admin can create events if this flow is needed

## Step 11. Add dashboards last

Build after all core flows:

- `/college/dashboard`
- `/admin/dashboard`
- `/student/dashboard` only if the product wants a separate student dashboard beyond `/me`, `/events`, and `/results`

Why last:

- dashboards depend on multiple data sources
- they are not required for core CRUD/integration success

Success criteria:

- dashboards are summaries assembled from existing endpoints
- blocked areas are explicitly labeled in UI rather than faked

## Fields Checklist by Feature

### Login fields

- `email`
- `password`

### Signup fields

- `name`
- `email`
- `password`
- `role`
- `college` only for college role and only if valid college ID is available

### Event creation fields

- required:
  - `title`
  - `date`
- optional:
  - `description`
  - `category`
  - `venue`
  - `posterUrl`

### Registration fields

- `event_id`

### Registration status update fields

- `status`

Allowed values:

- `pending`
- `confirmed`
- `cancelled`

### Result publishing fields

- required:
  - `event_id`
  - `student_id`
  - `position`
- optional:
  - `certificateUrl`

## Error Handling Rules

Map backend errors clearly in the frontend:

- `400` -> invalid form input or missing required field
- `401` -> token missing/expired, redirect to login
- `403` -> role not allowed, show access denied
- `404` -> record not found
- `409` -> duplicate email, duplicate registration, or duplicate result

Recommended UI messages:

- duplicate email -> “This email is already registered.”
- duplicate registration -> “You have already registered for this event.”
- duplicate result -> “A result has already been published for this student in this event.”

## Blocked Features Register

These should not be silently invented by frontend code:

- college picker driven by backend data `[blocked]`
- event editing `[blocked]`
- event deletion `[blocked]`
- certificate downloads `[blocked]`
- password reset flows `[blocked]`
- analytics pages `[blocked]`

If placeholders are implemented, label them clearly as:

```text
Blocked by missing backend endpoint
```

## Final Delivery Expectation

A correct frontend implementation based on this guide must:

- use only implemented backend endpoints
- send the correct request body fields
- send `Authorization: Bearer <token>` on protected routes
- separate routes by user role
- avoid inventing unsupported features
- explicitly mark blocked flows
- follow the implementation order above so dependencies are built before dependent pages
