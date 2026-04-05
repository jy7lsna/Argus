# Argus - AI-Powered Cybersecurity and Risk Management Platform

Argus is a full-stack platform that discovers external assets, analyzes risk, and provides real-time monitoring with executive-ready reporting.

## Features

- Automated asset discovery and attack surface mapping
- Risk scoring across exposure, exploitability, and business impact
- Real-time scan updates via Socket.IO
- Reports export in JSON and PDF
- User authentication with JWT and optional 2FA
- API key management for programmatic access

## Tech Stack

- Backend: Node.js, Express, Sequelize, PostgreSQL, Socket.IO
- Frontend: React, TypeScript, Vite, Tailwind CSS, React Query, Recharts
- Auth: JWT, bcrypt, speakeasy (2FA)
- Reports: PDFKit
- Email: Nodemailer (optional)
- Cache: Redis (optional)

## Project Structure

```
Argus/
├── backend/
│   ├── server.ts
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   └── utils/
├── frontend/
│   ├── src/
│   ├── public/
│   └── vite.config.ts
├── docker-compose.yml
├── DEPLOYMENT_GUIDE.md
└── README.md
```

## Requirements

- Node.js 18+
- PostgreSQL (local or managed, e.g. Supabase)

## Local Development

### Backend

```bash
cd backend
npm install
npm run dev
```

The API listens on `http://localhost:3001` by default and exposes a health check at `/health`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The Vite dev server defaults to `http://localhost:5173`.

## Environment Variables

### Backend (backend/.env)

- `PORT` (default `3001`)
- `DATABASE_URL` (PostgreSQL connection string)
- `JWT_SECRET` (required)
- `EMAIL_USER` (optional)
- `EMAIL_PASS` (optional)
- `FRONTEND_URL` (used for CORS and Socket.IO)
- `DB_SSL_REJECT_UNAUTHORIZED` (optional, set to `false` to disable strict TLS)
- `SSL_SCAN_REJECT_UNAUTHORIZED` (optional, set to `false` to allow invalid certs in scan)
- `REDIS_URL` (optional, e.g. `redis://localhost:6379`)
- `REDIS_HOST` and `REDIS_PORT` (optional alternative to `REDIS_URL`)
- `COOKIE_SAMESITE` (optional: `lax`, `strict`, or `none`)
- `NODE_ENV` (set to `production` to enable secure cookies)

### Frontend (frontend/.env)

- `VITE_API_BASE_URL` (e.g. `http://localhost:3001/api` or your deployed API URL)

## API Overview

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/login/2fa`
- `GET /api/auth/me`
- `POST /api/auth/2fa/generate`
- `POST /api/auth/2fa/verify`
- `POST /api/auth/api-keys`
- `GET /api/auth/api-keys`
- `DELETE /api/auth/api-keys/:id`

### Analysis

- `POST /api/analyze`
- `GET /api/analyses`
- `GET /api/analyses/:id`
- `GET /api/analyses/:id/export`
- `GET /api/analyses/:id/export/pdf`

All analysis endpoints require a Bearer token in the Authorization header.

### Security Behavior

- Cookie-authenticated requests use CSRF protection. The server issues an `XSRF-TOKEN` cookie and expects an `x-csrf-token` header for non-GET requests.
- API key requests (`x-api-key`) skip CSRF checks.
- Bearer-token requests without auth cookies are not subject to CSRF checks.

## Deployment

See DEPLOYMENT_GUIDE.md for Render and Vercel deployment steps.

## Security Notes

- Passwords are hashed with bcrypt
- JWT tokens are used for auth
- Rate limiting is enabled for auth and analysis endpoints
- Schema updates are handled via migrations; set `DB_SYNC=true` only for local development

## License

ISC License
