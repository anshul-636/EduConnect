<div align="center">

# 🎓 EduConnect

### A full-stack AI-powered school management platform

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-Python-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://postgresql.org)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?style=flat-square&logo=redis&logoColor=white)](https://redis.io)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker&logoColor=white)](https://docker.com)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

</div>

---

## 📌 What is EduConnect?

EduConnect is a full-stack, AI-powered school management platform built on a **3-service architecture**:

- A **React 18** frontend (Vite + Tailwind)
- A **Node.js / Express** REST API with WebSocket support
- A **Python / FastAPI** AI microservice with a RAG pipeline, study planner, and recommendation engine

Schools can manage classes, attendance, assignments, events, announcements, and more. Students get an AI study assistant, personalised study plans, real-time notifications, and a discussion forum — all from one platform.

---

## 📋 Table of Contents

- [Features](#-features)
- [Architecture](#️-architecture)
- [Tech Stack](#️-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Option A — Docker Compose](#option-a--docker-compose-recommended)
  - [Option B — Manual Setup](#option-b--manual-setup)
- [Environment Variables](#-environment-variables)
- [Database](#️-database)
- [API Reference](#-api-reference)
- [User Roles & Permissions](#-user-roles--permissions)
- [AI Features](#-ai-features)
- [Free Deployment Guide](#-free-deployment-guide)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 🏫 Core Platform

| Feature | Description |
|---|---|
| **4-Role System** | Admin, School, Teacher, Student — each with their own dashboard and scoped permissions |
| **Auth Suite** | JWT access/refresh tokens, Google OAuth 2.0, OTP email verification, forgot password flow |
| **School Management** | School registration, admin-provisioned staff and student accounts, member management |
| **Class Management** | Multi-section classes, enrolment, timetable slots per day/period |
| **Announcements** | Role-targeted announcements — only staff (School / Teacher / Admin) can post |

### 📚 Academic

| Feature | Description |
|---|---|
| **Assignments** | Create, submit, and grade assignments with file attachments (PDF, images, docs) |
| **Attendance** | Daily click-to-cycle marking (Present / Absent / Late), bulk mark-all, monthly report, student self-view |
| **Events** | Full lifecycle management: Draft → Published → Open → Ongoing → Completed (automated via cron) |
| **Leaderboard** | Per-event score tracking with live WebSocket updates |
| **Certificates** | Auto-generate PDF certificates and email them to all participants |
| **Resources** | Upload study materials (PDF, Video, Link, Notes) with view counts, upvotes, and type/difficulty filtering |
| **Forum** | Threaded discussion board with edit, like, and delete |

### 🤖 AI Suite (Python / FastAPI)

| Feature | Description |
|---|---|
| **RAG Study Assistant** | Ask questions about uploaded PDFs — ChromaDB finds the relevant chunks, Groq LLM answers |
| **Platform Bot** | General assistant with live access to platform data (events, resources, announcements) |
| **Study Planner** | LangGraph agent that generates a personalised weekly study plan from topic input and deadline |
| **Resource Recommendations** | Suggests relevant resources based on a search query using semantic vector similarity |

### 📊 Dashboards

| Dashboard | What you see |
|---|---|
| **Student** | Assignment submission breakdown, attendance %, upcoming events, event score trend |
| **Teacher** | Grading pipeline, per-class submission rate, top resources by views |
| **School** | Participation trend, event status distribution, student and teacher counts |
| **Admin** | Platform-wide stats, users by role, recently joined schools |

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                      Browser / Mobile                         │
│                React 18 + Vite + Tailwind CSS                 │
│                      :5173 (dev)                              │
└───────────────────────────┬──────────────────────────────────┘
                            │  REST API  +  WebSocket (/ws)
┌───────────────────────────▼──────────────────────────────────┐
│                    Node.js / Express API                       │
│          Prisma ORM · JWT · Passport.js · Multer              │
│                          :3000                                 │
└────────────┬─────────────────────────────────┬───────────────┘
             │ SQL (Prisma)                     │ HTTP (internal)
┌────────────▼───────────┐         ┌────────────▼──────────────┐
│     PostgreSQL 15       │         │    Python / FastAPI        │
│    (primary datastore)  │         │      AI Microservice       │
└────────────────────────┘         │  ChromaDB · Groq · Gemini  │
                                   │          :8000              │
┌────────────────────────┐         └───────────────────────────┘
│         Redis 7         │
│   OTP · Rate Limiting   │
│      Session Cache      │
└────────────────────────┘
```

**How the services talk to each other:**

- The **frontend** calls the Node.js backend over REST (`/api/v1/*`) and connects to the WebSocket endpoint (`/ws`) for live leaderboard and notification updates.
- The **backend** proxies AI requests to the Python service via internal HTTP. It also calls an `/internal` endpoint on the AI service to read/write chat session state.
- The **AI service** calls back to the backend's `/internal` routes to fetch live platform data (events, resources) when answering platform bot queries.
- **Redis** is used by the backend only — for OTP storage, login rate limiting, and general caching. The AI service has its own in-memory session store.
- **ChromaDB** is embedded inside the AI service and persists to disk (or a Docker volume in production).

---

## 🛠️ Tech Stack

| Layer | Technology | Why |
|---|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS | Fast builds, utility-first styling |
| **State** | Zustand | Lightweight global auth store |
| **Routing** | React Router v6 | Nested routes, protected routes |
| **Charts** | Recharts | Dashboard analytics |
| **Icons** | Lucide React | Clean, consistent icon set |
| **HTTP Client** | Axios | Interceptors for JWT token injection |
| **Backend** | Node.js 18, Express 4 | Widely supported, fast REST API |
| **ORM** | Prisma 5 | Type-safe DB access, migrations |
| **Database** | PostgreSQL 15 | Relational, reliable |
| **Cache / Queue** | Redis 7 | OTP TTL, rate limiting |
| **Auth** | JWT (access + refresh) + Passport.js | Stateless + Google OAuth |
| **Email** | Nodemailer (Gmail SMTP) | OTP, password reset, certificates |
| **File Uploads** | Multer + Cloudinary (prod) | Local disk in dev, CDN in production |
| **WebSocket** | ws (native) | Real-time leaderboard and notifications |
| **PDF Generation** | PDFKit | Certificate generation |
| **AI Runtime** | Python 3.11, FastAPI | Async, fast, great ML ecosystem |
| **LLM** | Groq (primary), Gemini (fallback) | Free tiers, fast inference |
| **Vector DB** | ChromaDB | Embedded, no extra service needed |
| **Embeddings** | sentence-transformers | Local embedding, no API cost |
| **Agent** | LangGraph | Study planner multi-step agent |
| **DevOps** | Docker, Docker Compose | One-command local stack |

---

## 📁 Project Structure

```
EduConnect/
│
├── frontend/                        # React 18 + Vite + Tailwind
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ai/                  # FloatingBot, ChatWindow
│   │   │   └── common/              # Layout, Navbar, Loader, NotificationBell
│   │   ├── hooks/
│   │   │   ├── useWebSocket.js      # Live leaderboard + notification feed
│   │   │   └── useScrollReveal.js
│   │   ├── pages/
│   │   │   ├── auth/                # Login, Register, ForgotPassword, VerifyEmail
│   │   │   ├── dashboard/           # Role-aware dashboard, Settings, SchoolManage
│   │   │   ├── ai/                  # StudyAssistant, StudyPlanner, PlatformBot
│   │   │   ├── assignments.jsx
│   │   │   ├── attendance.jsx
│   │   │   ├── Events.jsx / EventDetail.jsx / EventLeaderboard.jsx
│   │   │   ├── Resources.jsx / ResourceDetail.jsx / UploadResource.jsx
│   │   │   ├── Forum.jsx / ForumPost.jsx
│   │   │   ├── Classes.jsx / ClassDetail.jsx
│   │   │   ├── Timetable.jsx
│   │   │   ├── Certificates.jsx
│   │   │   ├── Notifications.jsx
│   │   │   ├── Leaderboard.jsx
│   │   │   ├── Schools.jsx / SchoolDetail.jsx
│   │   │   ├── Landing.jsx
│   │   │   └── Unauthorized.jsx
│   │   ├── routes/
│   │   │   ├── ProtectedRoute.jsx   # Redirects unauthenticated users to /login
│   │   │   └── RoleRoute.jsx        # Restricts pages by user role
│   │   ├── services/                # Axios API wrappers (one per domain)
│   │   ├── store/
│   │   │   └── authStore.js         # Zustand store — user, token, setAuth, logout
│   │   ├── App.jsx                  # All routes defined here
│   │   └── main.jsx
│   ├── vercel.json                  # SPA rewrite rule for Vercel
│   ├── vite.config.js
│   └── package.json
│
├── backend/                         # Node.js + Express REST API
│   ├── src/
│   │   ├── controllers/             # Thin request handlers — delegate to services
│   │   │   ├── auth.controller.js
│   │   │   ├── assignment.controller.js
│   │   │   ├── attendance.controller.js
│   │   │   ├── announcement.controller.js
│   │   │   ├── certificate.controller.js
│   │   │   ├── class.controller.js
│   │   │   ├── dashboard.controller.js
│   │   │   ├── event.controller.js
│   │   │   ├── forum.controller.js
│   │   │   ├── leaderboard.controller.js
│   │   │   ├── notification.controller.js
│   │   │   ├── resource.controller.js
│   │   │   ├── school.controller.js
│   │   │   └── timetable.controller.js
│   │   ├── services/                # Business logic layer
│   │   ├── routes/                  # Express routers — one per domain
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js   # JWT verification, attaches req.user
│   │   │   └── role.middleware.js   # restrictTo(...roles) guard
│   │   ├── utils/
│   │   │   ├── prisma.js            # Singleton Prisma client
│   │   │   ├── redis.js             # Redis client + getCache/setCache/rateLimit helpers
│   │   │   ├── email.js             # Nodemailer Gmail transporter
│   │   │   ├── jwt.js               # createAccessToken / createRefreshToken
│   │   │   ├── passport.js          # Google OAuth strategy (degrades gracefully if unconfigured)
│   │   │   ├── cloudinaryUpload.js  # Multer storage: Cloudinary in prod, local disk in dev
│   │   │   ├── localUpload.js       # Multer disk storage (used in dev)
│   │   │   ├── cloudinary.js        # Cloudinary SDK config
│   │   │   ├── generateCertificate.js # PDFKit certificate builder
│   │   │   ├── websocket.js         # WebSocket server — per-user broadcast + leaderboard
│   │   │   ├── cron.js              # Event status transitions + 24h reminder cron jobs
│   │   │   └── hash.js              # bcrypt helpers
│   │   └── index.js                 # App entry — wires middleware, routes, WebSocket, cron
│   ├── prisma/
│   │   ├── schema.prisma            # Full database schema
│   │   └── migrations/              # SQL migration history
│   ├── uploads/                     # Local file storage (dev only — not committed)
│   ├── .env.example                 # All required env variables documented
│   ├── dockerfile
│   └── package.json
│
├── ai-service/                      # Python FastAPI AI microservice
│   ├── main.py                      # FastAPI app entry — CORS, routers, startup model load
│   ├── requirements.txt
│   ├── dockerfile
│   └── app/
│       ├── routers/
│       │   ├── chat.py              # RAG chatbot + Platform Bot endpoints
│       │   ├── embed.py             # PDF ingestion → ChromaDB
│       │   ├── planner.py           # Study planner agent
│       │   └── recommend.py         # Resource recommendation
│       ├── services/
│       │   ├── rag_service.py       # PDF chunk retrieval + Groq answer generation
│       │   ├── platform_bot.py      # Platform-aware bot with live data fetching
│       │   ├── ingestion.py         # PDF parsing + embedding + ChromaDB upsert
│       │   └── session_store.py     # In-memory chat history per session
│       ├── agents/
│       │   └── study_planner/
│       │       ├── graph.py         # LangGraph state machine
│       │       ├── nodes.py         # LangGraph node functions
│       │       └── state.py         # TypedDict state definition
│       └── core/
│           ├── config.py            # Pydantic settings (reads .env)
│           └── database.py          # ChromaDB singleton client
│
├── render.yaml                      # Render.com one-click deployment blueprint
├── docker-compose.yml               # Full local stack (Postgres, Redis, backend, AI)
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

| Tool | Version | Notes |
|---|---|---|
| Node.js | 18+ | Backend and frontend |
| npm | 9+ | Comes with Node.js |
| Python | 3.10+ | AI service |
| Docker + Docker Compose | Latest | For Option A, or to spin up only Postgres/Redis |
| Git | Any | To clone the repo |

You will also need accounts at:
- **[Groq](https://console.groq.com)** — free API key for the AI service LLM (required)
- **[Cloudinary](https://cloudinary.com)** — free account for file uploads in production
- A **Gmail account** with an [App Password](https://myaccount.google.com/apppasswords) for sending emails

---

### Option A — Docker Compose (Recommended)

This starts the entire stack — Postgres, Redis, backend, and AI service — with a single command.

```bash
# 1. Clone the repository
git clone https://github.com/your-username/EduConnect.git
cd EduConnect

# 2. Set up environment files
cp backend/.env.example backend/.env
# Edit backend/.env — set EMAIL_USER, EMAIL_PASS, CLOUDINARY_*, and optionally GOOGLE_* for OAuth

# 3. Create the AI service .env
cat > ai-service/.env << EOF
GROQ_API_KEY=your_groq_api_key_here
GOOGLE_API_KEY=                      # optional Gemini fallback
NODE_BACKEND_URL=http://backend:3000
CHROMA_PERSIST_DIR=./chroma_db
PORT=8000
EOF

# 4. Build and start all services
docker compose up --build

# 5. Run database migrations (first time only — in a second terminal)
docker exec -it educonnect_backend npx prisma migrate deploy
```

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3000 |
| AI Service | http://localhost:8000 |
| Postgres (host) | localhost:**5433** |
| Redis (host) | localhost:**6380** |

> **Note on ports:** Postgres and Redis are mapped to **5433** and **6380** on your host machine to avoid conflicts with any locally installed instances. The containers talk to each other on the standard ports (5432, 6379) internally — this only matters if you connect from outside Docker (e.g. Prisma Studio, `redis-cli`).

---

### Option B — Manual Setup

Use this if you prefer to run each service directly without Docker, or want hot-reload on all three.

#### Step 1 — Start Postgres and Redis (still easiest via Docker)

```bash
docker compose up postgres redis -d
```

Or install PostgreSQL 15 and Redis 7 natively and create a database called `educonnect`.

#### Step 2 — Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env — the DATABASE_URL and REDIS_URL already point at the Docker ports above
```

Run database migrations:

```bash
npx prisma migrate deploy    # applies existing migrations
npx prisma generate          # generates the Prisma client
```

Start the server:

```bash
npm run dev       # hot-reload with nodemon
# or
npm start         # production mode
```

Backend runs at **http://localhost:3000**

#### Step 3 — Frontend

```bash
cd frontend
npm install
cp .env.example .env         # VITE_API_URL and VITE_WS_URL already set for local dev
npm run dev
```

Frontend runs at **http://localhost:5173** with the API proxied to port 3000.

#### Step 4 — AI Service

```bash
cd ai-service
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create the `.env` file:

```bash
cat > .env << EOF
GROQ_API_KEY=your_groq_api_key_here
GOOGLE_API_KEY=                      # optional
NODE_BACKEND_URL=http://localhost:3000
CHROMA_PERSIST_DIR=./chroma_db
PORT=8000
EOF
```

Start the service:

```bash
python main.py
```

AI service runs at **http://localhost:8000**

> The AI service pre-loads the sentence-transformers embedding model on startup (~90 MB). The first boot will take 30–60 seconds. Subsequent boots are fast if the model is cached.

---

## 🔐 Environment Variables

### `backend/.env`

| Variable | Description | Required |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string — `postgresql://user:pass@host:5432/dbname` | ✅ |
| `REDIS_URL` | Redis URL — `redis://localhost:6379` or `rediss://...` for TLS | ✅ |
| `JWT_SECRET` | Random 32-byte hex string. Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` | ✅ |
| `JWT_ACCESS_EXPIRES` | Access token lifetime — e.g. `30m` | ✅ |
| `JWT_REFRESH_EXPIRES` | Refresh token lifetime — e.g. `7d` | ✅ |
| `PORT` | Backend HTTP port (default: `3000`) | ✅ |
| `NODE_ENV` | `development` or `production` | ✅ |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins — e.g. `https://your-app.vercel.app` | Defaults to `http://localhost:5173` |
| `BACKEND_URL` | Full public URL of the backend — used to build file URLs in dev | ✅ |
| `AI_SERVICE_URL` | Base URL of the Python AI service — e.g. `http://localhost:8000` | ✅ |
| `EMAIL_USER` | Gmail address used to send OTP and password reset emails | Required for email features |
| `EMAIL_PASS` | Gmail **App Password** (not your real password) — [create one here](https://myaccount.google.com/apppasswords) | Required for email features |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | Required for file uploads in production |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Required for file uploads in production |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | Required for file uploads in production |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID — [create at Google Cloud Console](https://console.cloud.google.com/apis/credentials) | Optional |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Optional |
| `GOOGLE_CALLBACK_URL` | OAuth callback — `http://localhost:3000/api/v1/auth/google/callback` in dev | Optional |

> If `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` are left blank, the server starts normally — Google sign-in returns a `503` with a clear message instead of crashing on boot.

### `frontend/.env`

| Variable | Description | Default |
|---|---|---|
| `VITE_API_URL` | Backend API base URL | `http://localhost:3000/api/v1` |
| `VITE_WS_URL` | WebSocket base URL (the hook appends `/ws`) | `ws://localhost:3000` |

### `ai-service/.env`

| Variable | Description | Required |
|---|---|---|
| `GROQ_API_KEY` | Groq API key — [get one free at console.groq.com](https://console.groq.com/keys) | ✅ — service will not start without this |
| `GOOGLE_API_KEY` | Google / Gemini API key — optional fallback LLM | Optional |
| `NODE_BACKEND_URL` | Full URL of the backend service | ✅ |
| `CHROMA_PERSIST_DIR` | Directory where ChromaDB stores its vector data | Defaults to `./chroma_db` |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins for the AI service | Defaults to `http://localhost:5173,http://localhost:3000` |
| `PORT` | AI service port | Defaults to `8000` |

---

## 🗄️ Database

EduConnect uses **PostgreSQL 15** managed through **Prisma ORM**.

### Core Models

| Model | Description |
|---|---|
| `User` | All users — role field distinguishes Admin / School / Teacher / Student |
| `School` | School entity — owns classes, events, announcements |
| `Class` | A class within a school — has sections, enrolments, timetable |
| `ClassEnrollment` | Many-to-many join between User (student/teacher) and Class |
| `TimetableSlot` | Day + period + subject slot for a class |
| `Assignment` | Assignment created by a teacher for a class |
| `Submission` | A student's file submission for an assignment, with grade |
| `Attendance` | Daily attendance record per student per class |
| `Event` | School event with full status lifecycle |
| `Registration` | Student registration for an event |
| `Leaderboard` | Score entries per event |
| `Certificate` | Auto-generated PDF certificate for an event participant |
| `Resource` | Uploaded study material — PDF, Video, Link, or Notes |
| `ResourceUpvote` | Per-user upvote on a resource (idempotent toggle) |
| `ForumPost` | Thread or reply in the discussion forum |
| `Announcement` | School-wide announcement from staff |
| `Notification` | In-app notification per user |
| `OTP` | Time-limited OTP for email verification and password reset |
| `ChatSession` | AI chat session metadata |

### Useful Prisma Commands

```bash
# Apply all pending migrations (production)
npx prisma migrate deploy

# Create a new migration after editing schema.prisma (dev)
npx prisma migrate dev --name your_change_name

# Push schema changes directly without a migration file (quick dev iteration)
npx prisma db push

# Open the Prisma Studio GUI to browse and edit data
npx prisma studio

# Regenerate the Prisma client after schema changes
npx prisma generate
```

---

## 📡 API Reference

Base URL: `/api/v1`

All authenticated routes require the header: `Authorization: Bearer <access_token>`

### Auth — `/api/v1/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/register` | — | Register a new user |
| POST | `/login` | — | Login — returns `accessToken` + `refreshToken` |
| POST | `/refresh` | — | Exchange refresh token for a new access token |
| GET | `/me` | ✅ | Get current user profile |
| POST | `/verify-email` | — | Verify email with OTP |
| POST | `/resend-otp` | — | Resend email verification OTP |
| POST | `/forgot-password` | — | Send password reset OTP |
| POST | `/reset-password` | — | Reset password with OTP |
| POST | `/deactivate` | ✅ | Soft-deactivate own account |
| DELETE | `/delete-me` | ✅ | Hard-delete own account |
| POST | `/reactivate` | — | Reactivate a deactivated account |
| GET | `/google` | — | Start Google OAuth flow |
| GET | `/google/callback` | — | Google OAuth callback |
| POST | `/google/complete` | — | Complete Google signup with selected role |

### Schools — `/api/v1/schools`

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| GET | `/` | ✅ Any | List all schools |
| POST | `/` | Admin | Create a school |
| GET | `/:id` | ✅ Any | Get school details |
| PUT | `/:id` | Admin, School | Update school info |
| DELETE | `/:id` | Admin | Delete a school |
| POST | `/:id/teachers` | Admin, School | Add a teacher to the school |
| POST | `/:id/students` | Admin, School | Add a student to the school |
| DELETE | `/:id/members/:userId` | Admin, School | Remove a member |

### Classes — `/api/v1/classes`

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| POST | `/` | School, Admin | Create a class |
| GET | `/my` | ✅ Any | Get current user's classes |
| GET | `/:id` | ✅ Any | Get class details |
| PUT | `/:id` | School, Admin | Update class |
| DELETE | `/:id` | School, Admin | Delete class |
| POST | `/:id/enroll` | School, Admin | Enrol a student/teacher |
| DELETE | `/:id/enroll/:userId` | School, Admin | Remove from class |
| GET | `/:id/timetable` | ✅ Any | Get class timetable |
| PUT | `/:id/timetable` | School, Teacher, Admin | Update timetable slots |

### Assignments — `/api/v1/assignments`

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| POST | `/` | Teacher, Admin | Create an assignment |
| GET | `/class/:classId` | ✅ Any | List assignments for a class |
| GET | `/:id` | ✅ Any | Get assignment details |
| PUT | `/:id` | Teacher, Admin | Update assignment |
| DELETE | `/:id` | Teacher, School, Admin | Delete assignment |
| POST | `/:id/submit` | Student | Submit assignment (file upload) |
| GET | `/:id/submissions` | Teacher, School, Admin | List all submissions |
| PUT | `/:id/submissions/:subId/grade` | Teacher, Admin | Grade a submission |

### Attendance — `/api/v1/attendance`

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| POST | `/:classId/mark` | Teacher, Admin | Mark attendance for a date |
| POST | `/:classId/mark-all` | Teacher, Admin | Bulk mark all students |
| GET | `/:classId` | Teacher, School, Admin | Get attendance by date |
| GET | `/:classId/monthly` | ✅ Any | Monthly attendance report |
| GET | `/my/:classId` | Student | Student's own attendance |

### Events — `/api/v1/events`

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| POST | `/` | School, Admin | Create an event |
| GET | `/` | ✅ Any | List events |
| GET | `/:id` | ✅ Any | Get event details |
| PUT | `/:id` | School, Admin | Update event |
| DELETE | `/:id` | School, Admin | Delete event |
| PUT | `/:id/status` | School, Admin | Manually change event status |
| POST | `/:id/register` | Student | Register for an event |
| GET | `/:id/registrations` | School, Admin | List registrations |
| POST | `/:id/results` | School, Admin | Post event results / answer key |
| GET | `/:id/results` | ✅ Any | Get results |

### Resources — `/api/v1/resources`

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| POST | `/` | Teacher, School, Admin | Upload a resource (file upload) |
| GET | `/` | ✅ Any | List resources (with filters + pagination) |
| GET | `/:id` | ✅ Any | Get resource (increments view count) |
| DELETE | `/:id` | Owner, Admin | Delete resource |
| POST | `/:id/upvote` | ✅ Any | Toggle upvote (idempotent) |
| POST | `/:id/view` | ✅ Any | Explicitly increment view count |

### Forum — `/api/v1/forum`

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| POST | `/` | ✅ Any | Create a post or reply |
| GET | `/` | ✅ Any | List top-level posts |
| GET | `/:id` | ✅ Any | Get post with replies |
| PUT | `/:id` | Owner, Admin | Edit post |
| DELETE | `/:id` | Owner, Admin | Delete post |
| POST | `/:id/like` | ✅ Any | Toggle like |

### Announcements — `/api/v1/announcements`

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| POST | `/` | Teacher, School, Admin | Create announcement |
| GET | `/` | ✅ Any | List announcements (scoped by school) |

### Notifications — `/api/v1/notifications`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | ✅ | Get current user's notifications |
| PUT | `/:id/read` | ✅ | Mark one as read |
| PUT | `/read-all` | ✅ | Mark all as read |

### Leaderboard — `/api/v1/leaderboard`

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| GET | `/:eventId` | ✅ Any | Get ranked leaderboard for an event |
| POST | `/score` | School, Admin | Add or update a score entry |

### Certificates — `/api/v1/certificates`

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| POST | `/generate/:eventId` | School, Admin | Generate certificates for all participants |
| POST | `/email/:eventId` | School, Admin | Email certificates to all participants |
| GET | `/event/:eventId` | ✅ Any | List certificates for an event |
| GET | `/my` | Student | Student's own certificates |
| GET | `/download/:id` | ✅ Any | Download certificate PDF |

### Dashboard — `/api/v1/dashboard`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | ✅ | Role-aware dashboard data |

### AI — `/api/v1/ai`

These are proxied by the backend to the Python AI service.

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/chat/rag` | ✅ | Ask a question about an uploaded PDF |
| POST | `/chat/platform` | ✅ | Chat with the platform bot |
| DELETE | `/chat/session/:sessionId` | ✅ | Clear a chat session's history |
| POST | `/planner/generate` | ✅ | Generate a personalised study plan |
| GET | `/recommend/resources` | ✅ | Get resource recommendations by query |
| POST | `/embed/pdf` | Internal | Embed a PDF into ChromaDB (called by backend on upload) |

---

## 👥 User Roles & Permissions

| Role | Created By | What They Can Do |
|---|---|---|
| **ADMIN** | System / self-register | Full platform oversight across all schools. Can act anywhere a SCHOOL admin can. Cannot be assigned to a school. |
| **SCHOOL** | Self-register or Admin | Manage their own school, all its classes, timetables, events, announcements, certificates, and staff/student rosters. |
| **TEACHER** | Added by SCHOOL / ADMIN | Manage assigned classes — mark attendance, create and grade assignments, post announcements, upload resources. |
| **STUDENT** | Added by SCHOOL / ADMIN | Enrol in classes, submit assignments, register for events, view own attendance, use AI features, participate in forum. |

**Role-based routing in the frontend:**

- `ProtectedRoute` — redirects to `/login` if no valid token exists
- `RoleRoute` — redirects to `/unauthorized` if the user's role is not in the allowed list

---

## 🤖 AI Features

### RAG Study Assistant

Upload a PDF resource and ask questions about it. The system:

1. Chunks the PDF into segments and embeds them using `sentence-transformers`
2. Stores the embeddings in ChromaDB
3. On a question, retrieves the most semantically relevant chunks
4. Passes them to Groq (llama3 model) as context and returns the answer

The assistant maintains per-session conversation history for follow-up questions.

### Platform Bot

A general assistant that has access to live platform data. When you ask it about upcoming events, available resources, or platform features, it fetches real data from the backend's `/internal` routes before answering.

### Study Planner

A LangGraph multi-step agent that takes your topic and event deadline, builds a week-by-week study schedule, estimates hours per topic, and returns a structured plan in JSON format rendered as an interactive UI.

### Resource Recommendations

Semantic search over all embedded PDFs and resource metadata. Returns the top N most relevant resources for any natural-language query using cosine similarity in ChromaDB.

---

## 🌐 Free Deployment Guide

You can deploy the entire stack for free using these services:

| Service | Free Tier |
|---|---|
| **Vercel** | Frontend (unlimited static deployments) |
| **Render** | Backend + AI Service (free web services, sleep after 15 min inactivity) |
| **Neon.tech** | PostgreSQL (0.5 GB free) |
| **Upstash** | Redis (10,000 commands/day free) |
| **Cloudinary** | File storage (25 GB free) |
| **Groq** | LLM API (generous free tier, fast) |
| **Gmail** | Email via App Password (free) |

### Step 1 — Database (Neon.tech)

1. Sign up at [neon.tech](https://neon.tech)
2. Create a project → name it `educonnect`
3. Copy the **Connection String** — it looks like:
   `postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require`
4. Save it — this is your `DATABASE_URL`

### Step 2 — Redis (Upstash)

1. Sign up at [upstash.com](https://upstash.com)
2. Create a Redis database → choose the closest region
3. Copy the **REDIS_URL** (starts with `rediss://`)

### Step 3 — Cloudinary

1. Sign up at [cloudinary.com](https://cloudinary.com)
2. From the dashboard copy your `Cloud Name`, `API Key`, and `API Secret`

### Step 4 — Gmail App Password

1. Enable 2FA on your Google account
2. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Create an App Password for "Mail" — save the 16-character password

### Step 5 — Push to GitHub

```bash
git init
git add .
git commit -m "initial commit"
# Create a new repo at github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/educonnect.git
git push -u origin main
```

### Step 6 — Deploy Backend on Render

1. Go to [render.com](https://render.com) → sign up with GitHub
2. Click **New → Blueprint** and point it at your repo — Render will detect `render.yaml` automatically
3. Or manually: **New → Web Service** → connect repo →
   - Root Directory: `backend`
   - Build Command: `npm install && npx prisma generate`
   - Start Command: `node src/index.js`
4. Add all environment variables from `backend/.env.example` in the Render dashboard
5. After first deploy, open the **Shell** tab and run:
   ```bash
   npx prisma migrate deploy
   ```
6. Copy your backend URL — e.g. `https://educonnect-backend.onrender.com`

### Step 7 — Deploy AI Service on Render

1. **New → Web Service** → same GitHub repo →
   - Root Directory: `ai-service`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
2. Add env variables:
   ```
   GROQ_API_KEY        = your_groq_key
   GOOGLE_API_KEY      = your_gemini_key (optional)
   NODE_BACKEND_URL    = https://educonnect-backend.onrender.com
   ALLOWED_ORIGINS     = https://your-app.vercel.app,https://educonnect-backend.onrender.com
   ```
3. Copy your AI service URL — e.g. `https://educonnect-ai.onrender.com`
4. Go back to the **backend** service on Render and update:
   ```
   AI_SERVICE_URL = https://educonnect-ai.onrender.com
   ```

### Step 8 — Deploy Frontend on Vercel

1. Go to [vercel.com](https://vercel.com) → sign up with GitHub
2. **Add New Project** → import your repo →
   - Root Directory: `frontend`
   - Framework Preset: Vite (auto-detected)
3. Add environment variables:
   ```
   VITE_API_URL = https://educonnect-backend.onrender.com/api/v1
   VITE_WS_URL  = wss://educonnect-backend.onrender.com
   ```
4. Deploy — your app will be at `https://your-app.vercel.app`

### Step 9 — Final CORS Update

On the backend Render service, update:
```
ALLOWED_ORIGINS = https://your-app.vercel.app
```

And on the AI service, update:
```
ALLOWED_ORIGINS = https://your-app.vercel.app,https://educonnect-backend.onrender.com
```

### ⚠️ Free Tier Limitations

- **Render free services sleep after 15 minutes of inactivity.** The first request after sleep takes ~30 seconds to wake up. This is normal — upgrade to a paid plan ($7/month) to avoid it.
- **The AI service is heavy** (downloads ~90MB embedding model on first boot). It may time out on Render's free tier during the initial deployment. If it does, trigger a manual redeploy — the model will be cached on the second boot.
- **Neon free tier** gives 0.5 GB storage — enough for development and demos.
- **Upstash free tier** gives 10,000 Redis commands per day — sufficient for OTP and rate limiting.

---

## 🔒 Security Notes

- Passwords are hashed with **bcrypt** (cost factor 10)
- Access tokens expire in 30 minutes; refresh tokens in 7 days
- Login attempts are rate-limited per IP via Redis (10 attempts per 15 minutes)
- Email OTPs are time-limited and single-use
- All role-based access control is enforced **at the route level and again at the service layer** — the UI hiding a button is not the only protection
- File uploads are validated by Multer (25 MB max, stored in Cloudinary in production — not on the application server)
- Google OAuth degrades gracefully — the server starts and all other features work even when OAuth credentials are not configured

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

Please make sure to update tests where applicable and follow the existing code style.

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">
  Built with ❤️ · EduConnect
</div>