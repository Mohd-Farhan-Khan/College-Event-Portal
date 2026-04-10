# Postman Testing Guide for College Event Portal Backend

## Purpose

This guide explains how to test the complete backend in Postman from the very beginning.

It covers:

- initial backend checks
- how to configure Postman
- how to create environments and variables
- how to send each request
- what to select in the Postman interface
- the correct order to test the APIs
- how to save IDs and tokens for later requests
- how to verify success and failure cases

This guide is written for the backend currently implemented in the project.

## APIs Available in This Backend

You can test these route groups:

- Root
- Health Check
- Auth
- Users
- Events
- Registrations
- Results
- Swagger / OpenAPI static docs

## Before Opening Postman

Make sure the backend is ready.

### 1. Confirm dependencies are installed

From the `backend` folder, make sure `node_modules` exists or run:

```bash
npm install
```

### 2. Confirm `.env` values are set

Check that these are available in `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/college_event_portal
JWT_SECRET=change_this_secret
JWT_EXPIRES=7d
NODE_ENV=development
```

If you use Cloudinary later, you can also set:

```env
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### 3. Start the backend server

Run:

```bash
npm run dev
```

or:

```bash
npm start
```

### 4. Confirm the server is running

You should see a message similar to:

```bash
MongoDB Connected
Server running on port http://localhost:5000
```

### 5. Optional database preparation

If you want a college user linked to a college, seed one college first:

```bash
npm run seed:college -- "ABC College" "Mumbai" "Sample college" "https://example.com/logo.png"
```

Save the created college ID because you may need it when registering a `college` user.

## Postman Setup

## 1. Create a Collection

In Postman:

1. Open Postman.
2. In the left sidebar, click `Collections`.
3. Click `+` or `New Collection`.
4. Name it `College Event Portal Backend`.
5. Click `Create`.

Recommended folders inside the collection:

- `00 Setup`
- `01 Root and Health`
- `02 Auth`
- `03 Users`
- `04 Events`
- `05 Registrations`
- `06 Results`
- `07 Negative Tests`

## 2. Create an Environment

In Postman:

1. Click `Environments` in the left sidebar.
2. Click `New`.
3. Name it `College Event Portal Local`.
4. Add these variables.

Suggested environment variables:

| Variable | Initial Value | Purpose |
|---|---|---|
| `baseUrl` | `http://localhost:5000` | API base URL |
| `studentEmail` | `student@example.com` | student login email |
| `studentPassword` | `secret123` | student login password |
| `collegeEmail` | `college@example.com` | college login email |
| `collegePassword` | `secret123` | college login password |
| `adminEmail` | `admin@example.com` | admin login email |
| `adminPassword` | `secret123` | admin login password |
| `collegeId` |  | seeded college ID |
| `studentToken` |  | JWT for student |
| `collegeToken` |  | JWT for college |
| `adminToken` |  | JWT for admin |
| `studentUserId` |  | saved after register/login |
| `collegeUserId` |  | saved after register/login |
| `adminUserId` |  | saved after register/login |
| `eventId` |  | saved after event creation |
| `registrationId` |  | saved after registration |
| `resultId` |  | optional |

5. Click `Save`.
6. At the top-right of Postman, select the environment `College Event Portal Local`.

Important:

- Use the environment dropdown in the top-right corner.
- Make sure the correct environment is selected before testing requests.

## 3. Useful Postman Interface Selections

For most requests:

- Method: choose the correct HTTP method from the dropdown left of the URL box
- URL: use `{{baseUrl}}/...`
- Body type: choose `raw`
- Format: choose `JSON`
- Headers tab: Postman usually adds `Content-Type: application/json` automatically when `raw` + `JSON` is selected

For authenticated requests:

1. Open the request.
2. Go to the `Authorization` tab.
3. In the `Type` dropdown, select `Bearer Token`.
4. In the `Token` field, enter one of:
   - `{{studentToken}}`
   - `{{collegeToken}}`
   - `{{adminToken}}`

Recommended:

- Prefer using the `Authorization` tab instead of manually typing the `Authorization` header.
- For requests that need JSON input, use `Body` -> `raw` -> `JSON`.
- For GET requests, use the `Params` tab when adding query parameters.

## Correct Testing Order

Follow this order:

1. Root check
2. Health check
3. Register users
4. Login users
5. Check `/me`
6. Admin user APIs
7. Create event
8. Read event APIs
9. Register student for event
10. Read registrations
11. Update registration status
12. Publish results
13. Read results
14. Test error and permission cases
15. Check Swagger and OpenAPI routes

This order matters because later requests need IDs and tokens from earlier requests.

## Step-by-Step Testing

## Step 1. Test Root API

Create a request:

- Name: `GET Root`
- Method: `GET`
- URL: `{{baseUrl}}/`

What to select:

- No Authorization
- No Body

Click `Send`.

Expected result:

- Status `200 OK`
- Response text:

```text
Welcome to UniVerse
```

## Step 2. Test Health Check API

Create a request:

- Name: `GET Health Check`
- Method: `GET`
- URL: `{{baseUrl}}/api/healthcheck`

What to select:

- No Authorization
- No Body

Click `Send`.

Expected result:

- Status `200 OK`
- JSON response with message `Server is running`

## Step 3. Register a Student User

Create a request:

- Name: `POST Register Student`
- Method: `POST`
- URL: `{{baseUrl}}/api/auth/register`

What to select:

- `Body` tab
- choose `raw`
- choose `JSON`

Body:

```json
{
  "name": "Student One",
  "email": "{{studentEmail}}",
  "password": "{{studentPassword}}",
  "role": "student"
}
```

Click `Send`.

Expected result:

- Status `201 Created`
- response contains `token`
- response contains `user.id`

After success:

1. Copy the token if you are not using scripts.
2. Copy the returned user ID.
3. Save them into environment variables:
   - `studentToken`
   - `studentUserId`

Recommended Postman test script:

Open the `Tests` tab and add:

```javascript
const json = pm.response.json();
if (json.token) pm.environment.set("studentToken", json.token);
if (json.user?.id) pm.environment.set("studentUserId", json.user.id);
```

Then click `Save`.

## Step 4. Register a College User

Create a request:

- Name: `POST Register College`
- Method: `POST`
- URL: `{{baseUrl}}/api/auth/register`

Select:

- `Body` -> `raw` -> `JSON`

Body:

```json
{
  "name": "College Organizer",
  "email": "{{collegeEmail}}",
  "password": "{{collegePassword}}",
  "role": "college",
  "college": "{{collegeId}}"
}
```

Click `Send`.

Expected result:

- Status `201 Created`
- response contains token and user info

Save:

- `collegeToken`
- `collegeUserId`

Suggested `Tests` script:

```javascript
const json = pm.response.json();
if (json.token) pm.environment.set("collegeToken", json.token);
if (json.user?.id) pm.environment.set("collegeUserId", json.user.id);
```

## Step 5. Register an Admin User

Create a request:

- Name: `POST Register Admin`
- Method: `POST`
- URL: `{{baseUrl}}/api/auth/register`

Select:

- `Body` -> `raw` -> `JSON`

Body:

```json
{
  "name": "Admin User",
  "email": "{{adminEmail}}",
  "password": "{{adminPassword}}",
  "role": "admin"
}
```

Click `Send`.

Expected result:

- Status `201 Created`

Save:

- `adminToken`
- `adminUserId`

Suggested `Tests` script:

```javascript
const json = pm.response.json();
if (json.token) pm.environment.set("adminToken", json.token);
if (json.user?.id) pm.environment.set("adminUserId", json.user.id);
```

## Step 6. Login Student

Create a request:

- Name: `POST Login Student`
- Method: `POST`
- URL: `{{baseUrl}}/api/auth/login`

Select:

- `Body` -> `raw` -> `JSON`

Body:

```json
{
  "email": "{{studentEmail}}",
  "password": "{{studentPassword}}"
}
```

Click `Send`.

Expected result:

- Status `200 OK`
- token returned

Save token again to refresh `studentToken` if needed.

## Step 7. Login College

Create a request:

- Name: `POST Login College`
- Method: `POST`
- URL: `{{baseUrl}}/api/auth/login`

Body:

```json
{
  "email": "{{collegeEmail}}",
  "password": "{{collegePassword}}"
}
```

Save returned token to `collegeToken`.

## Step 8. Login Admin

Create a request:

- Name: `POST Login Admin`
- Method: `POST`
- URL: `{{baseUrl}}/api/auth/login`

Body:

```json
{
  "email": "{{adminEmail}}",
  "password": "{{adminPassword}}"
}
```

Save returned token to `adminToken`.

## Step 9. Test Current User API for Each Role

### 9A. `GET /api/auth/me` as student

- Method: `GET`
- URL: `{{baseUrl}}/api/auth/me`
- `Authorization` tab -> `Bearer Token`
- Token: `{{studentToken}}`

Expected:

- Status `200 OK`
- returns student user info

### 9B. `GET /api/auth/me` as college

- same request
- token: `{{collegeToken}}`

### 9C. `GET /api/auth/me` as admin

- same request
- token: `{{adminToken}}`

## Step 10. Test Admin-Only User APIs

### 10A. List all users

Create request:

- Name: `GET Users`
- Method: `GET`
- URL: `{{baseUrl}}/api/users`

Select:

- `Authorization` -> `Bearer Token`
- Token: `{{adminToken}}`

Expected:

- Status `200 OK`
- array of users
- password hash should not be returned

### 10B. Get one user by ID

Create request:

- Name: `GET User By ID`
- Method: `GET`
- URL: `{{baseUrl}}/api/users/{{studentUserId}}`

Select:

- `Authorization` -> `Bearer Token`
- Token: `{{adminToken}}`

Expected:

- Status `200 OK`

### 10C. Permission check

Send the same `GET /api/users` request with:

- Token: `{{studentToken}}`

Expected:

- Status `403 Forbidden`

## Step 11. Create an Event

Use the college user first.

Create request:

- Name: `POST Create Event`
- Method: `POST`
- URL: `{{baseUrl}}/api/events`

Select:

- `Authorization` -> `Bearer Token`
- Token: `{{collegeToken}}`
- `Body` -> `raw` -> `JSON`

Body:

```json
{
  "title": "Hackathon 2026",
  "description": "Annual coding event",
  "category": "technical",
  "date": "2026-09-15T10:00:00.000Z",
  "venue": "Main Auditorium",
  "posterUrl": "https://example.com/poster.jpg"
}
```

Expected:

- Status `201 Created`
- event object returned
- `_id` returned

Save:

- `eventId`

Suggested `Tests` script:

```javascript
const json = pm.response.json();
if (json._id) pm.environment.set("eventId", json._id);
```

Important note:

- The backend now ties a college user’s event to that college user’s own `college_id`.
- You do not need to manually trust client-side `college_id` when testing as a college user.

## Step 12. Test Public Event APIs

### 12A. List events

- Method: `GET`
- URL: `{{baseUrl}}/api/events`
- No Authorization

Expected:

- Status `200 OK`
- array of events

### 12B. Get event by ID

- Method: `GET`
- URL: `{{baseUrl}}/api/events/{{eventId}}`
- No Authorization

Expected:

- Status `200 OK`

## Step 13. Register a Student for an Event

### 13A. Register using request body

Create request:

- Name: `POST Register For Event`
- Method: `POST`
- URL: `{{baseUrl}}/api/registrations`

Select:

- `Authorization` -> `Bearer Token`
- Token: `{{studentToken}}`
- `Body` -> `raw` -> `JSON`

Body:

```json
{
  "event_id": "{{eventId}}"
}
```

Expected:

- Status `201 Created`
- registration document returned

Save:

- `registrationId`

Suggested `Tests` script:

```javascript
const json = pm.response.json();
if (json._id) pm.environment.set("registrationId", json._id);
```

### 13B. Register using path parameter

Create another request:

- Name: `POST Register For Event By Path`
- Method: `POST`
- URL: `{{baseUrl}}/api/registrations/{{eventId}}`

Use:

- `Authorization` -> `Bearer Token`
- Token: `{{studentToken}}`

Expected:

- Since the student is already registered, this should usually return:
  - Status `409 Conflict`

This is a good duplicate-registration test.

## Step 14. Check Registration Read APIs

### 14A. List all registrations as admin

- Method: `GET`
- URL: `{{baseUrl}}/api/registrations`
- `Authorization` -> `Bearer Token`
- Token: `{{adminToken}}`

Expected:

- Status `200 OK`

### 14B. List registrations filtered by event

Use:

- Method: `GET`
- URL: `{{baseUrl}}/api/registrations`
- `Params` tab:
  - key: `event_id`
  - value: `{{eventId}}`
- Token: `{{adminToken}}`

Expected:

- only registrations for that event

### 14C. List registrations filtered by student

Use `Params`:

- `student_id` = `{{studentUserId}}`

### 14D. List registrations filtered by status

Use `Params`:

- `status` = `pending`

Expected:

- only registrations whose status is `pending`

### 14E. List registrations as college

- Method: `GET`
- URL: `{{baseUrl}}/api/registrations`
- Token: `{{collegeToken}}`

Expected:

- college user should see registrations only for their own events

## Step 15. Update Registration Status

Create request:

- Name: `PATCH Registration Status`
- Method: `PATCH`
- URL: `{{baseUrl}}/api/registrations/{{registrationId}}`

Select:

- `Authorization` -> `Bearer Token`
- Token: `{{collegeToken}}`
- `Body` -> `raw` -> `JSON`

Body:

```json
{
  "status": "confirmed"
}
```

Expected:

- Status `200 OK`
- updated registration returned

Repeat with:

```json
{
  "status": "cancelled"
}
```

and later set it back if needed.

## Step 16. Publish Results

### 16A. Publish result using body

Create request:

- Name: `POST Publish Result`
- Method: `POST`
- URL: `{{baseUrl}}/api/results`

Select:

- `Authorization` -> `Bearer Token`
- Token: `{{collegeToken}}`
- `Body` -> `raw` -> `JSON`

Body:

```json
{
  "event_id": "{{eventId}}",
  "student_id": "{{studentUserId}}",
  "position": 1,
  "certificateUrl": "https://example.com/certificate.pdf"
}
```

Expected:

- Status `201 Created`
- result document returned

Optional `Tests` script:

```javascript
const json = pm.response.json();
if (json._id) pm.environment.set("resultId", json._id);
```

### 16B. Publish duplicate result

Send the same request again.

Expected:

- Status `409 Conflict`
- message about result already being published

### 16C. Publish using path parameter

Create request:

- Name: `POST Publish Result By Path`
- Method: `POST`
- URL: `{{baseUrl}}/api/results/{{eventId}}`

Body:

```json
{
  "student_id": "{{studentUserId}}",
  "position": 2
}
```

Expected:

- if a result already exists for that student/event, this should also return `409`

## Step 17. Read Results

### 17A. Get all results

- Method: `GET`
- URL: `{{baseUrl}}/api/results`
- No Authorization required in the current backend

Expected:

- Status `200 OK`

### 17B. Filter results by event

Use:

- `Method`: `GET`
- `URL`: `{{baseUrl}}/api/results`
- `Params` tab:
  - `event_id` = `{{eventId}}`

### 17C. Filter results by student

Use:

- `Params` tab:
  - `student_id` = `{{studentUserId}}`

## Step 18. Test Error Cases Carefully

These tests help confirm backend validation and permission rules.

## Auth error tests

### 18A. Login with wrong password

- `POST /api/auth/login`

Body:

```json
{
  "email": "{{studentEmail}}",
  "password": "wrongpassword"
}
```

Expected:

- `401 Unauthorized`

### 18B. Access `/api/auth/me` without token

- `GET /api/auth/me`
- no auth

Expected:

- `401 Unauthorized`

## Users permission tests

### 18C. Call `/api/users` with student token

Expected:

- `403 Forbidden`

## Event validation tests

### 18D. Create event without date

Use `POST /api/events` with college token:

```json
{
  "title": "Broken Event"
}
```

Expected:

- `400` validation error or `500` if validation bubbles through generic handling
- response should indicate required field issue

## Registration validation tests

### 18E. Register without event ID

- `POST /api/registrations`
- student token

Body:

```json
{}
```

Expected:

- `400`

### 18F. Register with fake event ID

Body:

```json
{
  "event_id": "507f1f77bcf86cd799439011"
}
```

Expected:

- `404 Event not found`

### 18G. Update registration with invalid status

- `PATCH /api/registrations/{{registrationId}}`
- college token

Body:

```json
{
  "status": "approved"
}
```

Expected:

- `400 Invalid status`

## Result validation tests

### 18H. Publish result without student ID

Body:

```json
{
  "event_id": "{{eventId}}",
  "position": 1
}
```

Expected:

- `400`

### 18I. Publish result without event ID

Body:

```json
{
  "student_id": "{{studentUserId}}",
  "position": 1
}
```

Expected:

- `400`

## Step 19. Swagger and OpenAPI Static Route Checks

### 19A. OpenAPI JSON

- Method: `GET`
- URL: `{{baseUrl}}/openapi.json`

Expected:

- `200 OK`
- raw JSON document

### 19B. Swagger redirect

- Method: `GET`
- URL: `{{baseUrl}}/swagger`

Expected:

- redirect response or rendered static page depending on Postman behavior

### 19C. Swagger HTML

- Method: `GET`
- URL: `{{baseUrl}}/swagger/index.html`

Expected:

- `200 OK`
- HTML response

## Recommended Postman Collection Structure

You can organize the collection like this:

### Folder `00 Setup`

- `GET Root`
- `GET Health Check`
- `GET OpenAPI JSON`

### Folder `01 Auth`

- `POST Register Student`
- `POST Register College`
- `POST Register Admin`
- `POST Login Student`
- `POST Login College`
- `POST Login Admin`
- `GET Me Student`
- `GET Me College`
- `GET Me Admin`

### Folder `02 Users`

- `GET Users`
- `GET User By ID`

### Folder `03 Events`

- `POST Create Event`
- `GET Events`
- `GET Event By ID`

### Folder `04 Registrations`

- `POST Register For Event`
- `POST Register For Event By Path`
- `GET Registrations`
- `GET Registrations By Event`
- `GET Registrations By Student`
- `GET Registrations By Status`
- `PATCH Registration Status`

### Folder `05 Results`

- `POST Publish Result`
- `POST Publish Result By Path`
- `GET Results`
- `GET Results By Event`
- `GET Results By Student`

### Folder `06 Negative Tests`

- wrong password
- missing token
- duplicate registration
- invalid status
- missing event ID
- missing student ID
- duplicate result

## Optional Collection-Level Authorization Setup

If you want, you can avoid re-entering auth type on every protected request.

In Postman:

1. Open the collection.
2. Click the collection name.
3. Open the `Authorization` tab.
4. Select `Bearer Token`.
5. Enter a variable like `{{adminToken}}`.

Important:

- This works well only if many requests share the same token.
- Since this project uses multiple roles, request-level authorization is usually clearer.

## Optional Pre-request or Test Scripts

If you want automatic variable saving, add scripts in the `Tests` tab.

Example generic token saver:

```javascript
const json = pm.response.json();
if (json.token) {
  console.log("Token found");
}
```

Better approach:

- use separate login/register requests for each role
- save the correct token in that request’s `Tests` tab

## What Success Looks Like

A full successful Postman test run should confirm:

- backend server is reachable
- MongoDB connection is working
- users can register
- users can log in
- JWT-protected routes work
- role restrictions work
- admin-only user APIs work
- events can be created and fetched
- students can register for events
- duplicate registrations are blocked
- registration status can be updated
- results can be published
- duplicate results are blocked
- filters on registrations and results work
- static docs routes are accessible

## Troubleshooting

## 1. `401 Unauthorized`

Check:

- token exists in the environment
- correct environment is selected
- `Authorization` tab is set to `Bearer Token`
- token variable name is correct

## 2. `403 Forbidden`

Check:

- you are using the correct role token
- admin-only routes use `{{adminToken}}`
- student-only registration routes use `{{studentToken}}`
- college-only creation/publish/update routes use `{{collegeToken}}`

## 3. `404 Not Found`

Check:

- route path is correct
- `baseUrl` is correct
- ID values are valid and exist in the database

## 4. Duplicate email on register

If you rerun tests, registration may fail because the user already exists.

Options:

- change the email variable values
- or use only login after the first successful register

## 5. Duplicate registration/result

This is expected if you submit the same registration or result twice.

Expected response:

- `409 Conflict`

## 6. College user sees no registrations

That may be correct if:

- the event was not created by that college user
- the student has not registered yet
- the college user is linked to a different `college_id`

## Final Testing Checklist

Before finishing, verify all of these:

- `GET /`
- `GET /api/healthcheck`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/users`
- `GET /api/users/:id`
- `POST /api/events`
- `GET /api/events`
- `GET /api/events/:id`
- `POST /api/registrations`
- `POST /api/registrations/:eventId`
- `GET /api/registrations`
- `PATCH /api/registrations/:id`
- `POST /api/results`
- `POST /api/results/:eventId`
- `GET /api/results`
- `GET /openapi.json`
- `GET /swagger`
- `GET /swagger/index.html`

If all of these work in the correct role context, the backend is functionally testable from Postman end to end.
