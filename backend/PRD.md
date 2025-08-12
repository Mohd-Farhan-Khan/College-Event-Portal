# Product Requirements Document (PRD)

## College Event Portal

### 1. Product Overview

**Product Name:** College Event Portal  
**Version:** 1.0.0  
**Product Type:** Web-based Centralised Portal (Frontend + Backend + Database)

The College Event Portal is a web-based platform enabling colleges to **publish and manage events/fests**, students to **register and track participation**, and admins to **upload results, issue certificates, and view analytics**.  
It ensures a seamless experience for **organizers, participants, and administrators** in managing large-scale multi-college events.

---

### 2. Target Users
- **Students:** Browse events, register, track participation, and download certificates.
- **College Organizers:** Publish/manage events, approve/reject registrations, upload results, and issue certificates.
- **Admins:** Oversee all colleges/events, generate analytics, and manage the overall platform.

---

### 3. Core Features

#### 3.1 User Authentication & Authorization
- User Registration with role assignment (`student`, `college`, `admin`)
- Secure login with JWT tokens
- Role-based access control
- Password management (change, reset)
- Token refresh mechanism

#### 3.2 Event Management
- Create, update, delete events (college role)
- Event listing with filters (date, category, college)
- Event details view with poster and description
- Cloudinary-based poster upload

#### 3.3 Registration Management
- Student event registration
- College approval/rejection for events (optional)
- My Events dashboard for students
- Participant list for organizers

#### 3.4 Results & Certificates
- Result upload (CSV/manual)
- Auto-generation of certificates (PDF)
- Cloudinary storage for certificates
- Student certificate download portal

#### 3.5 Analytics Dashboard
- Participation statistics
- Popular events and categories
- College-wise participation trends
- Graphs/charts via Chart.js

#### 3.6 System Health
- API health check endpoint for uptime monitoring

---

### 4. Technical Specifications

#### 4.1 API Endpoint Structure

**Auth Routes** (`/api/auth/`)
- `POST /register` – Register user
- `POST /login` – User login
- `POST /logout` – Logout (secured)
- `GET /me` – Current user profile (secured)
- `POST /change-password` – Change password (secured)
- `POST /refresh-token` – Refresh JWT
- `POST /forgot-password` – Request reset link
- `POST /reset-password/:token` – Reset password

**Event Routes** (`/api/events/`)
- `GET /` – List all events (public)
- `POST /` – Create event (college only)
- `GET /:id` – Event details
- `PUT /:id` – Update event (college only)
- `DELETE /:id` – Delete event (college only)

**Registration Routes** (`/api/registrations/`)
- `POST /:eventId` – Register for event (student only)
- `GET /myevents` – My registrations (student only)
- `PUT /:id` – Update status (college only)

**Result Routes** (`/api/results/`)
- `POST /:eventId` – Upload results (college/admin)
- `GET /:eventId` – View event results
- `GET /my` – View my results (student only)

**File Upload Routes** (`/api/upload/`)
- `POST /` – Upload files to Cloudinary (secured)

**Health Check** (`/api/healthcheck/`)
- `GET /` – System status

---

#### 4.2 Permission Matrix

| Feature                         | Admin | College | Student |
|---------------------------------|-------|---------|---------|
| Create Event                    | ✗     | ✓       | ✗       |
| Update/Delete Event             | ✗     | ✓       | ✗       |
| View Events                     | ✓     | ✓       | ✓       |
| Register for Event              | ✗     | ✗       | ✓       |
| Approve/Reject Registrations    | ✗     | ✓       | ✗       |
| Upload Results                  | ✓     | ✓       | ✗       |
| View Certificates               | ✓     | ✓       | ✓       |
| View Analytics                  | ✓     | ✗       | ✗       |
| Manage All Colleges             | ✓     | ✗       | ✗       |

---

#### 4.3 Data Models

**User Roles:**
- `admin` – Full system access
- `college` – College event organizer
- `student` – Participant

**Event Categories:**
- `technical`
- `cultural`
- `sports`
- `workshop`

**Registration Status:**
- `registered`
- `approved`
- `rejected`

---

### 5. Security Features
- JWT-based authentication
- Role-based authorization
- Input validation
- Secure password storage (bcrypt)
- File upload validation
- CORS configuration

---

### 6. File Management
- Posters and certificates stored in **Cloudinary**
- Metadata (URL, type, size) stored in MongoDB
- Secure uploads via Multer middleware

---

### 7. Success Criteria
- Fully functional **multi-role** event management system
- End-to-end certificate generation and download
- Analytics for participation insights
- Scalable backend with secure authentication
- Clean, user-friendly frontend with responsive design
