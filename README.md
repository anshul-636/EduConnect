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

EduConnect is a production-grade school management system that goes beyond typical CRUD — it's a **3-service architecture** combining a REST API, a React frontend, and a dedicated Python AI microservice. Schools can manage classes, attendance, assignments, announcements, and events, while students get an intelligent study assistant, personalised recommendations, and a real-time notification feed.

---

## ✨ Features

### 🏫 Core Platform
| Feature | Description |
|---|---|
| **4 Role System** | Admin, School, Teacher, Student — each with their own dashboard and permissions |
| **Auth Suite** | JWT access/refresh tokens, Google OAuth, OTP email verification, forgot password |
| **School Management** | School registration, admin-provisioned accounts, member management |
| **Class Management** | Multi-section classes, enrolment, timetables |
| **Announcements** | Role-targeted announcements with real-time delivery via WebSocket |

### 📚 Academic
| Feature | Description |
|---|---|
| **Assignments** | Create, submit, and grade assignments with file attachments |
| **Attendance** | Daily marking (click-to-cycle), bulk mark-all, monthly report, heatmap calendar |
| **Leaderboard** | Per-event rankings with score tracking |
| **Certificates** | Issue and download achievement certificates |
| **Resources** | Upload study materials with view count, upvotes, and type filtering |
| **Forum** | Threaded discussion board with inline edit and delete for posts and replies |

### 🤖 AI Suite (Python / FastAPI)
| Feature | Description |
|---|---|
| **RAG Chatbot** | School knowledge base assistant powered by ChromaDB vector search |
| **Study Planner** | Generates a personalised weekly study plan from topic input |
| **Recommendations** | Suggests relevant resources and events based on user history |
| **Embeddings** | Automatic content embedding for semantic search |

### 📊 Dashboards & Analytics
| Dashboard | Highlights |
|---|---|
| **Student** | Assignment breakdown (pending/submitted/overdue), attendance donut with status badge, monthly attendance bar chart, event score trend |
| **Teacher** | Grading pipeline progress bar, per-class submission rate chart, top resources by views |
| **School** | Participation trend area chart, event status donut, student & teacher counts |
| **Admin** | Platform-wide stats, users-by-role bar chart, recently joined schools |

### ⚡ Real-time
- WebSocket notification feed — live bell updates without polling
- Per-class announcements pushed instantly to enrolled users

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
└─────────────────────┘       │   ChromaDB · LangChain     │
                               │   :8000                    │
┌─────────────────────┐       └───────────────────────────┘
│    Redis            │
│  (OTP · sessions)   │
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
│       ├── middleware/     # auth, error, upload
│       └── utils/          # prisma, redis, websocket, email
│
├── ai-service/             # Python FastAPI microservice
│   └── app/
│       ├── routers/        # chat, planner, recommend, embed
│       └── core/           # ChromaDB client, LLM config
│
├── docker-compose.yml      # Full stack orchestration
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Python 3.10+
- PostgreSQL 15
- Redis 7
- Docker & Docker Compose (optional but recommended)

---

### Option A — Docker Compose (Recommended)

```bash
# 1. Clone
git clone https://github.com/your-username/EduConnect.git
cd EduConnect

# 2. Environment files
cp backend/.env.example backend/.env
cp ai-service/.env.example ai-service/.env
# Edit both files with your keys (see Environment Variables below)

# 3. Start everything
docker compose up --build

# 4. Run database migrations (first time only)
docker exec -it educonnect_backend npx prisma migrate deploy
```

The app will be available at `http://localhost:5173` (frontend) and `http://localhost:3000` (API).

---

### Option B — Manual Setup

#### 1. Backend

```bash
cd backend
npm install

# Set up environment
cp .env.example .env
# Edit .env with your DATABASE_URL, JWT_SECRET, etc.

# Run migrations & generate Prisma client
npx prisma migrate dev
npx prisma generate

# Start dev server
npm run dev
```

#### 2. Frontend

```bash
cd frontend
npm install

# Create .env
echo "VITE_API_URL=http://localhost:3000/api/v1" > .env

# Start dev server
npm run dev
```

#### 3. AI Service

```bash
cd ai-service
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate

pip install -r requirements.txt

# Create .env
cp .env.example .env
# Set NODE_BACKEND_URL=http://localhost:3000

uvicorn main:app --reload --port 8000
```

---

## 🔐 Environment Variables

### `backend/.env`

| Variable | Description | Required |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `JWT_SECRET` | Random 32-byte hex string | ✅ |
| `JWT_ACCESS_EXPIRES` | e.g. `30m` | ✅ |
| `JWT_REFRESH_EXPIRES` | e.g. `7d` | ✅ |
| `PORT` | Backend port (default `3000`) | ✅ |
| `REDIS_URL` | Redis connection URL | ✅ |
| `AI_SERVICE_URL` | URL of the Python AI service | ✅ |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Optional |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret | Optional |
| `GOOGLE_CALLBACK_URL` | e.g. `http://localhost:3000/api/v1/auth/google/callback` | Optional |
| `SENDGRID_API_KEY` | For OTP & notification emails | Optional |
| `FROM_EMAIL` | Sender email address | Optional |
| `CLOUDINARY_CLOUD_NAME` | For file uploads | Optional |
| `CLOUDINARY_API_KEY` | Cloudinary key | Optional |
| `CLOUDINARY_API_SECRET` | Cloudinary secret | Optional |

### `frontend/.env`

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API base URL — e.g. `http://localhost:3000/api/v1` |

### `ai-service/.env`

| Variable | Description |
|---|---|
| `NODE_BACKEND_URL` | Backend URL for internal calls — e.g. `http://localhost:3000` |
| `OPENAI_API_KEY` | OpenAI key for LLM features |

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
| `/schools` | CRUD for schools, admin-create |
| `/classes` | Class management, enrolment, timetable |
| `/assignments` | Create, submit, grade, list |
| `/attendance` | Mark bulk, get by date, monthly report |
| `/events` | Event CRUD, registration |
| `/resources` | Upload, view, upvote |
| `/forum` | Posts, replies, edit, delete |
| `/announcements` | Create and list announcements |
| `/notifications` | List, mark read |
| `/leaderboard` | Rankings per event |
| `/certificates` | Issue, list, download |
| `/dashboard` | Role-aware summary with analytics |
| `/ai` | Proxy to Python AI service (chat, planner, recommend) |

Full Postman collection: `backend/EduConnect.postman_collection.json` *(if included)*

---

## 🧑‍💻 User Roles

| Role | What they can do |
|---|---|
| **ADMIN** | Platform oversight, create schools, view all data |
| **SCHOOL** | Manage their school, create events, issue certificates, post announcements |
| **TEACHER** | Manage classes, mark attendance, create assignments, grade submissions, upload resources |
| **STUDENT** | Enrol in classes, submit assignments, register for events, use AI assistant |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Zustand, Recharts, React Router v6, Lucide Icons |
| Backend | Node.js, Express, Prisma ORM, PostgreSQL, Redis, Passport.js (Google OAuth), JWT, Multer |
| AI Service | Python, FastAPI, LangChain, ChromaDB, OpenAI API |
| DevOps | Docker, Docker Compose |
| Email | SendGrid (OTP, notifications) |
| File Storage | Cloudinary (or local fallback) |

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
  Built with ❤️ as a portfolio project · EduConnect 2025
</div>
