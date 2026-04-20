# College Event Portal - Frontend

The frontend application for the College Event Portal, built with React and Vite. It provides a responsive, aesthetic, and user-friendly interface for students, college organizers, and administrators.

## Tech Stack

- **Framework:** React 18
- **Build Tool:** Vite
- **Routing:** React Router DOM
- **Icons:** Lucide React
- **Styling:** Custom CSS with a centralized design system (`index.css`)
- **API Communication:** Custom Fetch wrapper (`src/services/api.js`)

## Directory Structure

```text
src/
├── assets/         # Static assets (images, fonts)
├── components/     # Reusable UI components (Navbar, Footer, etc.)
├── context/        # React Context providers (AuthContext)
├── pages/          # Route-level page components (Admin, CollegeDashboard, etc.)
├── services/       # External service integrations (API calls)
├── App.jsx         # Main application component and routing configuration
├── index.css       # Global design tokens and base styles
└── main.jsx        # Entry point
```

## Available Scripts

In the project directory, you can run:

### `npm run dev`

Runs the app in the development mode.\
Open [http://localhost:5173](http://localhost:5173) to view it in your browser.
The page will reload when you make changes.

### `npm run build`

Builds the app for production to the `dist` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

### `npm run preview`

Locally preview the production build.

## API Integration

All API calls are centralized in `src/services/api.js`. This service acts as a wrapper around the native `fetch` API, automatically handling:
- Attaching the JWT Bearer token to authenticated requests.
- Standardizing error handling and parsing JSON responses.
- Constructing query parameters dynamically.

### Key API Helpers

| Function | Description |
|----------|-------------|
| `uploadFile(file, kind)` | Uploads a file via `POST /api/upload` (multipart/form-data). Accepts a `File` object and a `kind` string (`'poster'`, `'certificate'`, or `'generic'`). Returns `{ url, publicId, filename, mimeType, size, storage }`. |
| `generateCertificate(resultId)` | Triggers backend PDF certificate generation via `POST /api/results/:id/certificate`. Returns the updated result object with `certificate_url`. |
| `request(endpoint, options)` | Generic JSON fetch wrapper. All other helpers (`login`, `register`, `getEvents`, etc.) are built on top of this. |

## Design System

The application relies on a robust design system defined in `src/index.css`. This file contains CSS custom properties (variables) for:
- Colors (Primary, secondary, accents, backgrounds)
- Typography (Font families, sizes, weights)
- Spacing, borders, and shadows
- Common component classes (buttons, form inputs, cards)

When creating new components, always utilize these established variables to maintain visual consistency across the platform.

