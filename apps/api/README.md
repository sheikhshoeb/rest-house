Rest House API

This repository contains the backend API service for the Rest House platform.
The API is built using Node.js, Express, and MongoDB and provides endpoints for
authentication, bookings, properties, zones, and admin operations.

PRODUCTION API

Base URL
https://rest-house-production.up.railway.app

API DOCUMENTATION (SWAGGER)

Interactive API documentation is available via Swagger UI.

Swagger URL
https://rest-house-production.up.railway.app/api-docs

The Swagger UI provides:

- Complete list of APIs
- Request & response schemas
- Authentication support (JWT Bearer token)
- Live API testing in browser

AUTHENTICATION

Most APIs are protected using JWT (JSON Web Token) authentication.

Authorization Header Format
Authorization: Bearer <JWT_TOKEN>

Token Generation Endpoints

- User Login: /api/auth/login
- Admin Login: /api/admin-auth/login

API MODULES OVERVIEW

1. Auth APIs

- Employee / Ex-Employee registration
- Guest registration
- Login / Logout
- Get logged-in user profile

2. Booking APIs

- Create booking
- Fetch bookings for logged-in user
- Pay at rest house option

3. Property & Zone APIs

- Fetch all zones
- Fetch properties by zone

4. Admin APIs (Admin access required)

- Guest approval / rejection
- User management
- Booking management
- Manual booking creation
- Pricing management
- Zone & property management
- Employee ID management

PROJECT STRUCTURE

apps/api
├── server.js Application entry point
├── swagger/ Swagger configuration
├── routes/ API routes
├── models/ Mongoose models
├── middleware/ Auth & upload middleware
├── utils/ Utility functions
└── README.md API documentation

LOCAL DEVELOPMENT

Prerequisites

- Node.js (v18 or above)
- MongoDB
- npm

Setup and Run
cd apps/api
npm install
npm run dev

Local API URL
http://localhost:5001

Local Swagger URL
http://localhost:5001/api-docs

NOTES

- Admin APIs require admin role authorization
- Guest users must be approved by admin before booking
- File uploads use multipart/form-data
- Dates should be sent in ISO format (YYYY-MM-DD)
