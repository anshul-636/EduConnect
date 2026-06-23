<div align="center">

# 🎓 EduConnect

### A full-stack AI-powered school management platform

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-Python-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://postgresql.org)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker&logoColor=white)](https://docker.com)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

</div>

---

## 📌 What is EduConnect?

EduConnect is a school management system built as a **3-service architecture**: a Node.js REST API, a React frontend, and a dedicated Python AI microservice. Schools manage classes, attendance, assignments, announcements, and events, while students get an AI study assistant, a personalised study planner, and a real-time notification feed.

---

## ✨ Features

### 🏫 Core Platform
| Feature | Description |
|---|---|
| **4 Role System** | Admin, School, Teacher, Student — each with their own dashboard and permissions |
| **Auth Suite** | JWT access/refresh tokens, Google OAuth, OTP email verification, forgot password |
| **School Management** | School registration, admin-provisioned accounts, member management |
| **Class Management** | Multi-section classes, enrolment, timetables |
| **Announcements** | Role-targeted announcements (staff only — see Security Fixes below) |

### 📚 Academic
| Feature | Description |
|---|---|
| **Assignments** | Create, submit, and grade assignments with file attachments |
| **Attendance** | Daily marking (click-to-cycle), bulk mark-all, monthly report, student self-view |
| **Leaderboard** | Per-event rankings with score tracking |
| **Certificates** | Auto-generate PDF certificates and email them to all participants |
| **Resources** | Upload study materials with view count, upvotes, and type filtering |
| **Forum** | Threaded discussion board with edit, like, and delete |

### 🤖 AI Suite (Python / FastAPI)
| Feature | Description |
|---|---|
| **RAG Chatbot** | Answers questions from uploaded PDFs using ChromaDB vector search |
| **Platform Bot** | General assistant with live access to platform data (events, resources) |
| **Study Planner** | Generates a personalised weekly study plan from topic input |
| **Recommendations** | Suggests relevant resources based on user history |

### 📊 Dashboards
| Dashboard | Highlights |
|---|---|
| **Student** | Assignment breakdown, attendance %, event score trend |
| **Teacher** | Grading pipeline, per-class submission rate, top resources by views |
| **School** | Participation trend, event status, student & teacher counts |
| **Admin** | Platform-wide stats, users-by-role, recently joined schools |

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────┐
│                     Browser / Mobile                      │
│                  React 18 + Vite + Tailwind               │
└─────────────────────────┬────────────────────────────────┘
                          │ REST + WebSocket
┌─────────────────────────▼────────────────────────────────┐
│                   Node.js / Express API                   │
│         Prisma ORM · JWT · Multer · Nodemailer            │
│                     :3000                                 │
└──────────┬──────────────────────────────┬────────────────┘
           │ SQL                          │ HTTP (internal)
┌──────────▼──────────┐       ┌───────────▼───────────────┐
│    PostgreSQL 15     │       │   Python FastAPI           │
│    (primary store)  │       │   AI Microservice          │
└─────────────────────┘       │   ChromaDB · Groq LLM      │
                               │   :8000                    │
┌─────────────────────┐       └───────────────────────────┘
│    Redis             │
│  (OTP · rate limit)  │
└─────────────────────┘
```

### Directory Structure

```
EduConnect/
├── frontend/               # React 18 + Vite + Tailwind
│   └── src/
│       ├── pages/          # Route-level page components
│       ├── components/     # Shared UI (Layout, Loader, etc.)
│       ├── services/       # Axios API service modules
│       ├── store/          # Zustand auth store
│       └── hooks/          # useWebSocket, custom hooks
│
├── backend/                # Node.js + Express REST API
│   └── src/
│       ├── routes/         # Express routers (one per domain)
│       ├── controllers/    # Request handlers
│       ├── services/       # Business logic
│       ├── middleware/     # auth, role-based access control
│       └── utils/          # prisma, redis, email, passport
│
├── ai-service/              # Python FastAPI microservice
│   └── app/
│       ├── routers/        # chat, planner, recommend, embed
│       ├── services/       # RAG pipeline, platform bot
│       └── core/           # ChromaDB client, settings
│
├── docker-compose.yml      # Full stack orchestration
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Python 3.10+
- PostgreSQL 15 and Redis 7 (or just use Docker Compose for these)
- Docker & Docker Compose (recommended for Postgres/Redis even in manual setup)

---

### Option A — Docker Compose (Recommended)

```bash
# 1. Clone
git clone https://github.com/your-username/EduConnect.git
cd EduConnect

# 2. Environment files
cp backend/.env.example backend/.env
cp ai-service/.env.example ai-service/.env
# Edit both — at minimum set EMAIL_USER/EMAIL_PASS, GOOGLE_* (optional),
# and GROQ_API_KEY (required for the AI service — see below)

# 3. Start everything
docker compose up --build

# 4. Run database migrations (first time only)
docker exec -it educonnect_backend npx prisma migrate deploy
```

The app will be available at `http://localhost:5173` (frontend) and `http://localhost:3000` (API).

> Postgres and Redis are exposed on **5433** and **6380** on the host (not the
> defaults 5432/6379) to avoid clashing with anything already running on your
> machine. The containers talk to each other on the standard ports internally
> — you only need 5433/6380 if connecting from outside Docker (e.g. `psql`,
> a local non-Dockerized backend, or Prisma Studio).

---

### Option B — Manual Setup

#### 1. Postgres & Redis (via Docker, or install natively)
```bash
docker compose up postgres redis -d
```

#### 2. Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env — DATABASE_URL/REDIS_URL already point at the Docker ports above

npx prisma migrate deploy   # or: npx prisma db push
npx prisma generate

npm run dev
```

#### 3. Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

#### 4. AI Service
```bash
cd ai-service
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate

pip install -r requirements.txt
cp .env.example .env
# Set GROQ_API_KEY — the service will not start without it

python main.py
```

---

## 🔐 Environment Variables

### `backend/.env`

| Variable | Description | Required |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `REDIS_URL` | Redis connection URL (OTP + login rate-limiting) | ✅ |
| `JWT_SECRET` | Random 32-byte hex string | ✅ |
| `JWT_ACCESS_EXPIRES` / `JWT_REFRESH_EXPIRES` | e.g. `30m` / `7d` | ✅ |
| `PORT` | Backend port (default `3000`) | ✅ |
| `FRONTEND_URL` | Used for OAuth redirects | ✅ |
| `ALLOWED_ORIGINS` | CORS allow-list (comma-separated) | Defaults to `http://localhost:5173` |
| `AI_SERVICE_URL` | URL of the Python AI service | ✅ |
| `EMAIL_USER` / `EMAIL_PASS` | Gmail address + [App Password](https://myaccount.google.com/apppasswords) — used for OTP & password reset emails | Required for email features |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` / `GOOGLE_CALLBACK_URL` | [Google OAuth credentials](https://console.cloud.google.com/apis/credentials) | Optional — server degrades gracefully if unset (see below) |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Used only for generated certificate PDFs — regular file uploads (resources, submissions) are stored locally in `backend/uploads/` | Required for certificate emailing |

### `frontend/.env`

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API base URL — e.g. `http://localhost:3000/api/v1` |
| `VITE_WS_URL` | WebSocket base URL (no path) — e.g. `ws://localhost:3000` |

### `ai-service/.env`

| Variable | Description | Required |
|---|---|---|
| `GROQ_API_KEY` | [Groq API key](https://console.groq.com/keys) — the LLM provider | ✅ — **the service will not start without this** |
| `GEMINI_API_KEY` | Optional fallback if Groq's quota is hit | Optional |
| `CHROMA_PERSIST_DIR` | Vector store location | Defaults to `./chroma_db` |
| `NODE_BACKEND_URL` | Used by the `/internal` session-store endpoints | ✅ |
| `PORT` | Defaults to `8000` | — |

---

## 🗄️ Database Schema

Core models: `User`, `School`, `Class`, `ClassEnrollment`, `Assignment`, `Submission`, `Attendance`, `Event`, `Registration`, `Resource`, `Leaderboard`, `Certificate`, `ForumPost`, `Announcement`, `Notification`, `TimetableSlot`, `StudyPlan`, `ChatSession`, `OTP`

Run `npx prisma studio` to browse the database in a GUI.

---

## 📡 API Overview

Base URL: `/api/v1`

| Prefix | Domain |
|---|---|
| `/auth` | Register, login, OTP, Google OAuth, refresh, logout |
| `/schools` | CRUD for schools, admin-create, join |
| `/classes` | Class management, enrolment, timetable slots |
| `/assignments` | Create, submit, grade, list |
| `/attendance` | Mark bulk, get by date, monthly report, student self-report |
| `/events` | Event CRUD, registration, results, leaderboard |
| `/resources` | Upload, view, upvote |
| `/forum` | Posts, replies, edit, like, delete |
| `/announcements` | Create (staff only) and list announcements |
| `/notifications` | List, mark read |
| `/leaderboard` | Rankings per event |
| `/certificates` | Generate, list, download, email |
| `/dashboard` | Role-aware summary with analytics |
| `/ai` | Proxy to the Python AI service (chat, planner, recommend) |
| `/internal` | Localhost-only routes the AI service uses to read/write chat sessions |

---

## 🧑‍💻 User Roles

| Role | What they can do |
|---|---|
| **ADMIN** | Platform oversight across all schools; can act as a fallback approver everywhere a SCHOOL admin normally would |
| **SCHOOL** | Manage their own school, classes, and timetables; create events; post announcements; issue certificates |
| **TEACHER** | Manage their assigned classes' timetable, mark attendance, create/grade assignments, post announcements, upload resources |
| **STUDENT** | Enrol (added by school staff), submit assignments, register for events, view own attendance, use the AI assistant |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Zustand, Recharts, React Router v6, Lucide Icons |
| Backend | Node.js, Express, Prisma ORM, PostgreSQL, Redis, Passport.js (Google OAuth), JWT, Multer |
| AI Service | Python, FastAPI, ChromaDB, Groq (primary LLM), Gemini (fallback) |
| DevOps | Docker, Docker Compose |
| Email | Gmail via Nodemailer (OTP, password reset) |
| File Storage | Local disk for resources/submissions · Cloudinary for generated certificate PDFs |

---

## 🔒 Security fixes applied

A full authorization audit was done across every route/controller/service.
These were real, exploitable gaps that have since been fixed in this repo —
documented here for transparency rather than swept under the rug:

| Area | Issue | Fix |
|---|---|---|
| Announcements | Any authenticated user (including students) could post school-wide announcements via the API, even though the UI hid the button | Route now restricted to `SCHOOL`/`TEACHER`/`ADMIN`, enforced again at the service layer |
| Assignment submission | No check that the submitter was an enrolled student — any role could submit to any assignment | `submit()` now requires `STUDENT` role + active class enrollment |
| Assignment deletion | Route allowed `SCHOOL` to delete, but the service only checked the exact original teacher's ID — SCHOOL admins got a 403 | Service now accepts `SCHOOL`/`ADMIN` as well as the original teacher |
| Event answer key / registrations / results | Routes allowed `ADMIN`, but services derived the caller's school via `adminId` lookup, which doesn't exist for `ADMIN` — silently 403'd | Ownership is now derived from the event's own school, with an explicit `ADMIN` bypass |
| Certificates (email sending) | Same pattern — `ADMIN` got a 404 "School not found" instead of being able to send certificates | Same fix as above |
| Leaderboard scoring | Same pattern — `ADMIN` blocked from `POST /leaderboard/score` | Same fix as above |
| School update | Same pattern — `ADMIN` blocked from `PUT /schools/:id` | Same fix as above |
| Class enrollment / timetable / attendance | (Fixed in a prior pass) Students could enroll/unenroll arbitrary users and view classmates' attendance by calling the API directly | Routes now role-gated; teacher actions scoped to classes they actually teach |

**Startup reliability:**
- Google OAuth (`passport-google-oauth20`) used to crash the **entire backend** on boot if `GOOGLE_CLIENT_ID`/`SECRET` were unset — the strategy constructor throws synchronously. The server now detects this and disables only the Google routes (returning a clear `503`) instead of refusing to start at all.
- `backend/package.json` listed `multer-storage-cloudinary`, which isn't imported anywhere in the codebase and has a peer-dependency conflict with the `cloudinary` v2 SDK actually in use — causing `npm install` to fail outright without `--legacy-peer-deps`. Removed; plain `npm install` now works.
- `backend/dockerfile` and `ai-service/dockerfile` were saved in lowercase, but `docker-compose.yml` references `Dockerfile` (capital D). This works by accident on case-insensitive filesystems (Windows/macOS default) but breaks `docker compose build` on Linux/CI. Renamed to match.
- `backend/.env.example` documented `SENDGRID_API_KEY`/`FROM_EMAIL` and the AI service's docs referenced `OPENAI_API_KEY` — neither matches what the code actually reads (`EMAIL_USER`/`EMAIL_PASS` via Gmail, `GROQ_API_KEY` via Groq). Both `.env.example` files have been corrected; `ai-service/.env.example` didn't exist at all and has been added, since the AI service won't even start without `GROQ_API_KEY`.

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">
  Built as a portfolio project · EduConnect
</div>