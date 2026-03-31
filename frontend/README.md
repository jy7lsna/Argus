# Argus Frontend

React + TypeScript + Vite frontend for the Argus platform.

## Requirements

- Node.js 18+

## Local Development

```bash
npm install
npm run dev
```

The dev server runs on `http://localhost:5173` by default.

## Environment Variables

Create `frontend/.env` with:

- `VITE_API_BASE_URL` (e.g. `http://localhost:3001/api` or `https://your-backend.onrender.com/api`)

## Scripts

- `npm run dev` - Start Vite dev server
- `npm run build` - Typecheck and build for production
- `npm run preview` - Preview the production build
- `npm run lint` - Run ESLint

## WebSocket

The dashboard connects to Socket.IO using the API base URL with `/api` removed.

## Notes

- Auth tokens are stored in localStorage; consider migrating to httpOnly cookies if you need stricter XSS resilience.
