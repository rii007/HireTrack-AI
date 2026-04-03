# AI Job Tracker & Resume Analyzer

Production-ready SaaS starter for tracking job applications, AI-powered resume analysis, interview prep, and analytics.

## Project Structure

- `frontend/` - React + Vite + TypeScript + Tailwind CSS
- `backend/` - Node.js + Express + MongoDB (Mongoose) using MVC

## Core Features Implemented

- JWT authentication (signup/login/protected routes/logout)
- Job tracker with CRUD, duplicate action, search/filter API
- Drag-and-drop Kanban board by status
- Alternate table view with quick actions
- Analytics dashboard (metrics + charts via Recharts)
- AI resume analyzer endpoint (PDF/DOCX parsing + LLM analysis)
- Job description matching endpoint
- Interview prep question generation endpoint
- Profile management endpoint + UI

## Backend API Design

### Auth
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Jobs
- `POST /api/jobs`
- `GET /api/jobs?search=&status=&location=&page=&limit=&sortBy=&order=`
- `PATCH /api/jobs/:id`
- `DELETE /api/jobs/:id`
- `POST /api/jobs/:id/duplicate`

### Analytics / Profile / AI
- `GET /api/analytics`
- `GET /api/profile`
- `PATCH /api/profile`
- `POST /api/ai/resume/analyze`
- `POST /api/ai/resume/match`
- `POST /api/ai/interview-prep`

## Database Schemas

### User
- `name`, `email`, `password`
- `targetRoles[]`, `skills[]`, `preferredLocations[]`

### Job
- `user`, `company`, `role`, `description`, `location`
- `status`: Applied | Online Assessment | Interview | Offer | Rejected
- `salary`, `postingUrl`, `notes`
- `dateApplied`, `interviewDate`, `lastStatusUpdateAt`, timestamps

Indexes include `user+status+dateApplied`, plus company/role/location/status.

## Environment Variables

### `backend/.env`
Use `backend/.env.example` as template:
- `PORT`
- `MONGO_URI`
- `JWT_SECRET`
- `CLIENT_URL`
- `AI_PROVIDER=GEMINI`
- `GOOGLE_API_KEY`
- `GEMINI_MODEL`

### `frontend/.env`
Use `frontend/.env.example` as template:
- `VITE_API_URL=http://localhost:5000/api`

## Local Development

```bash
# terminal 1
cd backend
npm install
npm run dev

# terminal 2
cd frontend
npm install
npm run dev
```

## Deployment

### Frontend (Vercel)
- Root directory: `frontend`
- Build command: `npm run build`
- Output directory: `dist`
- Env: `VITE_API_URL=https://<backend-domain>/api`

### Backend (Render or Railway)
- Root directory: `backend`
- Start command: `npm start`
- Add all backend env vars
- Set `CLIENT_URL` to deployed frontend URL

## Scalability Notes

- API follows modular MVC separation for maintainability
- Indexed MongoDB queries for high-volume job records
- Query params for pagination/sort/filter
- AI service abstracted for provider swap and rate limiting
- Frontend componentized for growth into team-scale codebase
