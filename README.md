<p align="center">
  <h1 align="center">🎓 EduConnect</h1>
  <p align="center">
    <strong>A Full-Stack AI-Powered Educational Collaboration Platform</strong>
  </p>
  <p align="center">
    Connecting Students, Teachers, Schools & Administrators with Intelligent Tools
  </p>
  <p align="center">
    <a href="#features">Features</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#architecture">Architecture</a> •
    <a href="#getting-started">Getting Started</a> •
    <a href="#api-reference">API Reference</a> •
    <a href="#screenshots">Screenshots</a>
  </p>
</p>

---

## 📖 About

**EduConnect** is a comprehensive educational platform that bridges the gap between students, teachers, and schools. It provides a unified space for managing academic events, sharing educational resources, fostering community discussions, and leveraging **AI-powered tools** for personalized learning.

Built with a modern microservices architecture, EduConnect features:
- **Role-Based Access Control** (Admin, School, Teacher, Student)
- **Real-Time Notifications** via WebSockets
- **AI Study Assistant** powered by Google Gemini & LangGraph
- **Automated Certificate Generation** with PDFKit
- **Secure Authentication** via JWT + Google OAuth 2.0

---

## ✨ Features

### 🏫 School Management
- Register and manage school profiles with logos, affiliations (CBSE, ICSE, State Board), and locations
- School administrators can manage members, events, and resources
- Campus directory with search and detailed school profiles

### 📅 Event Management
- Create and manage academic events (Debates, Quizzes, Science Fairs, Sports, Arts)
- Team-based registration with configurable team sizes
- Event leaderboards, results tracking, and prize pool management
- Answer key support with automated scoring

### 📚 Resource Library
- Upload and share educational resources (PDFs, Videos, Links, Notes)
- Categorize by subject, topic, and difficulty level (Beginner → Advanced)
- Cloud storage via **Cloudinary** for file management
- Upvote system and view count tracking
- AI-powered semantic search through vectorized resources (ChromaDB)

### 💬 Community Forum
- Threaded discussion forum linked to events
- Create posts, reply with nested threads
- Event-specific discussion channels

### 🏆 Leaderboard & Certificates
- Real-time student rankings by score across events
- School-level and event-level leaderboards
- **Automated PDF certificate generation** (Participation, Winner, Runner-Up)

### 🤖 AI-Powered Features
| Feature | Description | Technology |
|---------|-------------|------------|
| **Study Assistant** | Chat with your uploaded resources using RAG | LangChain + ChromaDB |
| **Platform Bot** | Get instant answers about platform features | Gemini + LangChain |
| **Study Planner** | AI-generated personalized study plans for events | LangGraph Agents |
| **Smart Recommendations** | Get resource suggestions based on your interests | Sentence Transformers |

### 🔐 Authentication & Security
- **JWT-based authentication** with access & refresh tokens
- **Google OAuth 2.0** for seamless sign-in
- **Email verification** with OTP
- **Password reset** flow via email
- Role-based route protection on both frontend and backend

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| [React 18](https://react.dev/) | UI Framework |
| [Vite](https://vitejs.dev/) | Build Tool & Dev Server |
| [TailwindCSS](https://tailwindcss.com/) | Utility-First CSS |
| [Zustand](https://zustand-demo.pmnd.rs/) | Lightweight State Management |
| [React Router v6](https://reactrouter.com/) | Client-Side Routing |
| [Axios](https://axios-http.com/) | HTTP Client |

### Backend
| Technology | Purpose |
|-----------|---------|
| [Express.js](https://expressjs.com/) | Web Server Framework |
| [Prisma ORM](https://www.prisma.io/) | Database ORM & Schema Management |
| [PostgreSQL](https://www.postgresql.org/) | Relational Database |
| [Passport.js](http://www.passportjs.org/) | Authentication Middleware |
| [JSON Web Tokens](https://jwt.io/) | Stateless Auth Tokens |
| [Cloudinary](https://cloudinary.com/) | Cloud Media Storage |
| [PDFKit](https://pdfkit.org/) | PDF Certificate Generation |
| [Nodemailer](https://nodemailer.com/) | Email Delivery |
| [WebSocket (ws)](https://github.com/websockets/ws) | Real-Time Communication |

### AI Service
| Technology | Purpose |
|-----------|---------|
| [FastAPI](https://fastapi.tiangolo.com/) | High-Performance Python API |
| [LangChain](https://www.langchain.com/) | LLM Orchestration Framework |
| [LangGraph](https://langchain-ai.github.io/langgraph/) | Stateful AI Agent Workflows |
| [Google Gemini](https://ai.google.dev/) | Large Language Model |
| [ChromaDB](https://www.trychroma.com/) | Vector Database for RAG |
| [Sentence Transformers](https://www.sbert.net/) | Text Embeddings |
| [PyMuPDF](https://pymupdf.readthedocs.io/) | PDF Text Extraction |

### DevOps
| Technology | Purpose |
|-----------|---------|
| [Docker Compose](https://docs.docker.com/compose/) | Container Orchestration |
| [PostgreSQL 15 Alpine](https://hub.docker.com/_/postgres) | Containerized Database |
| [Redis 7 Alpine](https://hub.docker.com/_/redis) | Caching Layer |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     EduConnect Platform                       │
├──────────────┬──────────────────┬────────────────────────────┤
│   Frontend   │     Backend      │        AI Service           │
│   (React)    │   (Express.js)   │        (FastAPI)            │
│   Port 5173  │    Port 3000     │        Port 8001            │
├──────────────┴──────────────────┴────────────────────────────┤
│                                                               │
│  ┌──────────┐  ┌──────────────┐  ┌─────────────────────────┐ │
│  │  Vite    │  │  REST API    │  │  /api/v1/chat           │ │
│  │  Proxy   │──│  + WebSocket │  │  /api/v1/embed          │ │
│  │  Config  │  │  Server      │──│  /api/v1/planner        │ │
│  └──────────┘  └──────┬───────┘  │  /api/v1/recommend      │ │
│                        │         └───────────┬─────────────┘ │
│                        │                     │               │
│                ┌───────▼───────┐     ┌───────▼──────┐        │
│                │  PostgreSQL   │     │   ChromaDB   │        │
│                │  (Prisma ORM) │     │  (Vectors)   │        │
│                └───────────────┘     └──────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
educonnect/
├── frontend/                    # React + Vite Frontend
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── ai/              # AI chat interface components
│   │   │   └── common/          # Layout, Navbar, Loader
│   │   ├── hooks/               # Custom React hooks (WebSocket)
│   │   ├── pages/               # Application pages
│   │   │   ├── auth/            # Login, Register, OAuth, Password Reset
│   │   │   ├── dashboard/       # Role-specific dashboards
│   │   │   └── ai/              # AI-powered feature pages
│   │   ├── routes/              # Protected & role-based route guards
│   │   ├── services/            # API integration layer
│   │   └── store/               # Zustand state management
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── backend/                     # Express.js Backend
│   ├── prisma/
│   │   └── schema.prisma        # Database schema (10 models)
│   └── src/
│       ├── controllers/         # Request handlers
│       ├── middleware/           # Auth & RBAC guards
│       ├── routes/              # API route definitions
│       ├── services/            # Business logic layer
│       ├── utils/               # Utilities (JWT, email, cloud storage)
│       └── index.js             # Server entry point
│
├── ai-service/                  # FastAPI AI Microservice
│   ├── app/
│   │   ├── agents/              # LangGraph study planner agents
│   │   │   └── study_planner/   # State, nodes, and graph definition
│   │   ├── core/                # Config & database connections
│   │   ├── routers/             # API endpoints (chat, embed, planner)
│   │   └── services/            # RAG, ingestion, platform bot
│   ├── main.py                  # FastAPI app entry point
│   └── requirements.txt
│
├── docker-compose.yml           # PostgreSQL + Redis containers
└── .gitignore
```

---

## 📊 Database Schema

The application uses **10 interconnected models** managed by Prisma ORM:

```mermaid
erDiagram
    School
    User
    Event
    Resource
    Registration
    ForumPost
    Certificate
    ChatSession
    StudyPlan
    Leaderboard

    School ||--o{ User : has_members
    School ||--o{ Event : hosts
    School ||--o{ Resource : manages

    User ||--o{ Registration : registers
    User ||--o{ Resource : uploads
    User ||--o{ ForumPost : authors
    User ||--o{ Certificate : earns
    User ||--o{ ChatSession : creates
    User ||--o{ StudyPlan : receives

    Event ||--o{ Registration : accepts
    Event ||--o{ Leaderboard : tracks
    Event ||--o{ Certificate : awards
    Event ||--o{ ForumPost : discusses

    Resource ||--o{ ChatSession : references
```


### User Roles

| Role | Capabilities |
|------|-------------|
| **ADMIN** | Full platform management, user oversight |
| **SCHOOL** | Create events, manage members, upload resources, issue certificates |
| **TEACHER** | Upload resources, participate in forums, manage students |
| **STUDENT** | Register for events, access resources, earn certificates, use AI tools |


## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.x — [Download](https://nodejs.org/)
- **Python** ≥ 3.10 — [Download](https://www.python.org/)
- **PostgreSQL** ≥ 15 — [Download](https://www.postgresql.org/) or use Docker
- **Docker** (Optional) — [Download](https://www.docker.com/)

### 1. Clone the Repository

```bash
git clone https://github.com/anshul-636/EduConnect.git
cd EduConnect
```

### 2. Start the Database (Docker)

```bash
docker-compose up -d
```

This spins up:
- **PostgreSQL** on port `5433`
- **Redis** on port `6380`

### 3. Setup the Backend

```bash
cd backend
npm install
```

Create a `.env` file by copying the example:

```bash
cp .env.example .env
```

Update the `.env` with your credentials:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5433/educonnect
JWT_SECRET=your-super-secret-key
PORT=3000

# Cloudinary (for file uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/v1/auth/google/callback
```

Push the database schema and start the server:

```bash
npm run db:push
npm run dev
```

The backend will be running on **http://localhost:3000**

### 4. Setup the Frontend

```bash
cd ../frontend
npm install
npm run dev
```

The frontend will be running on **http://localhost:5173**

### 5. Setup the AI Service

```bash
cd ../ai-service
python -m venv venv

# Windows
./venv/Scripts/activate

# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
```

Create a `.env` file:

```env
GEMINI_API_KEY=your-gemini-api-key
CHROMA_PERSIST_DIR=./chroma_db
```

Start the AI service:

```bash
uvicorn main:app --reload --port 8001
```

The AI service will be running on **http://localhost:8001**

---

## 📡 API Reference

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/auth/register` | Register a new user |
| `POST` | `/api/v1/auth/login` | Login with email & password |
| `POST` | `/api/v1/auth/verify-email` | Verify email with OTP |
| `POST` | `/api/v1/auth/forgot-password` | Request password reset |
| `POST` | `/api/v1/auth/reset-password` | Reset password with OTP |
| `GET` | `/api/v1/auth/google` | Initiate Google OAuth |
| `GET` | `/api/v1/auth/google/callback` | Google OAuth callback |

### Event Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/events` | List all events |
| `POST` | `/api/v1/events` | Create a new event (School only) |
| `GET` | `/api/v1/events/:id` | Get event details |
| `POST` | `/api/v1/events/:id/register` | Register for an event |

### Resource Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/resources` | List all resources |
| `POST` | `/api/v1/resources` | Upload a resource (School/Teacher) |
| `GET` | `/api/v1/resources/:id` | Get resource details |

### AI Service Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/chat` | Chat with AI study assistant |
| `POST` | `/api/v1/embed` | Embed a document into ChromaDB |
| `POST` | `/api/v1/planner` | Generate a personalized study plan |
| `POST` | `/api/v1/recommend` | Get resource recommendations |
| `GET` | `/health` | Health check endpoint |

---

## 🔧 Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `JWT_SECRET` | Secret key for JWT signing | ✅ |
| `PORT` | Server port (default: 3000) | ✅ |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | ✅ |
| `CLOUDINARY_API_KEY` | Cloudinary API key | ✅ |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | ✅ |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | ⬜ |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | ⬜ |
| `SENDGRID_API_KEY` | SendGrid email API key | ⬜ |

### AI Service (`ai-service/.env`)

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Google Gemini API key | ✅ |
| `CHROMA_PERSIST_DIR` | ChromaDB storage path | ✅ |

---

## 🧪 Running Tests

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm run build   # Validates the production build
```

---

## 🐳 Docker Deployment

To run the full infrastructure stack:

```bash
# Start PostgreSQL and Redis
docker-compose up -d

# Verify containers are running
docker ps
```

---

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m "feat: add amazing feature"`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👤 Author

**Anshul**
- GitHub: [@anshul-636](https://github.com/anshul-636)

---

<p align="center">
  Made with ❤️ for the future of education
</p>
