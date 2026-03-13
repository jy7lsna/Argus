# 🦉 Argus Production Deployment Guide

Follow these steps to move Argus from your local machine to a professional cloud environment.

## 1. 📂 Code Preparation
Ensure your latest changes are pushed to a **GitHub Repository**.
- Repository should contain both `backend/` and `frontend/` folders.
- Ensure `Dockerfile` exists in both directories.

## 2. 🗄️ Database Setup (Supabase)
Supabase provides a managed PostgreSQL database that is perfect for Argus.
1. Create a project at [supabase.com](https://supabase.com).
2. Go to **Project Settings** -> **Database**.
3. Copy the **Connection String** (URI format). 
   - *Example*: `postgres://postgres:[PASSWORD]@[HOST]:6432/postgres`
4. **Important**: Save this for the `DATABASE_URL` environment variable.

## 3. ⚙️ Backend Deployment (Render)
Render will host your Node.js API and your internal Background Workers.
1. Create a **New Web Service** on [render.com](https://render.com).
2. Connect your GitHub repository.
3. **Environment**: Select `Docker`.
4. **Environment Variables**:
   - `PORT`: `3001`
   - `DATABASE_URL`: (Your Supabase URI)
   - `JWT_SECRET`: (A long random string)
   - `FRONTEND_URL`: (Your Vercel/Render frontend URL)

## 4. 🎨 Frontend Deployment (Vercel or Render)
1. **Option A (Vercel)**: Connect your repo, select the `frontend` root, and deploy.
2. **Option B (Render)**: Create a **Static Site**, select `frontend`, use Build Command `npm run build` and Publish Directory `dist`.
3. **Env Vars**:
   - `VITE_API_BASE_URL`: (Your Render Backend URL, e.g., `https://argus-api.onrender.com/api`)

## 5. 🏁 Final Verification
1. Access your frontend URL.
2. Log in and trigger a scan.
3. Check the **Health Check** at `https://your-backend.onrender.com/health`.

---
**Need help with a specific step? Just ask!** 🚀🦉
