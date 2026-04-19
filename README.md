# College Event Portal

A centralized web-based platform designed to streamline the management of multi-college events and fests. The platform connects students, college organizers, and administrators through a cohesive ecosystem for event discovery, registration, result publishing, and analytics.

## Table of Contents
- [Features](#features)
- [Architecture & Tech Stack](#architecture--tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [User Roles](#user-roles)

## Features

- **For Students:** Browse college events, register for participation, view personal dashboards, and download certificates of achievement.
- **For College Organizers:** Publish events, manage event details, view/approve student registrations, and publish event results.
- **For Administrators:** Oversee all colleges and events across the platform, manage college accounts, publish results on behalf of any college, and view comprehensive platform analytics.
- **Secure File Storage:** Centralized media handling for event posters and college logos, with automatic Cloudinary integration.
- **Dynamic Certificate Generation:** Automated PDF generation for event certificates directly from the backend.

## Architecture & Tech Stack

This project is a full-stack application built with modern web technologies:

### Frontend
- **Framework:** React + Vite
- **Styling:** Custom CSS (Modular and responsive design using custom properties and variables)
- **Routing:** React Router DOM
- **Icons:** Lucide React

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (via Mongoose)
- **Authentication:** JWT (JSON Web Tokens)
- **File Storage:** Local filesystem with drop-in support for Cloudinary
- **PDF Generation:** PDFKit

## Project Structure

The repository is structured as a monorepo containing both the frontend and backend applications:

- `/frontend` - Contains the React application. See the [Frontend README](./frontend/README.md) for more details.
- `/backend` - Contains the Express.js API server. See the [Backend README](./backend/README.md) for more details.

## Getting Started

To run this project locally, you will need Node.js and MongoDB installed on your system.

### 1. Backend Setup
1. Navigate to the `backend` directory.
2. Install dependencies: `npm install`
3. Configure your `.env` file (see `backend/README.md` for required variables).
4. Start the development server: `npm run dev`

### 2. Frontend Setup
1. Navigate to the `frontend` directory.
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`

By default, the backend runs on `http://localhost:8000` and the frontend runs on `http://localhost:5173`.

## User Roles

The platform supports three distinct user roles with strict Role-Based Access Control (RBAC):

1. **Student (`student`):** Can register for events and view/download certificates.
2. **College (`college`):** Can create and manage their own events, manage registrations for their events, and publish results.
3. **Admin (`admin`):** Full system access. Can manage colleges, oversee all events, view global analytics, and perform any action on behalf of colleges.
