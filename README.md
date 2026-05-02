<![CDATA[<div align="center">

# 🧠 MindVault

**AI-Powered Personal Knowledge Workspace for Students**

Upload your study materials → Get instant summaries, auto-generated quizzes, and a document-aware AI chatbot — all in one place.

[![React](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Gemini](https://img.shields.io/badge/Google_Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)

[Features](#-features) • [Data Flow](#-data-flow) • [Tech Stack](#-tech-stack) • [Setup](#-setup--installation) • [API Reference](#-api-reference)

</div>

---

## 📌 Description

Students are overwhelmed with fragmented study tools, scattered PDFs, lengthy slides, and dense textbooks — with no intelligent way to process them. **MindVault** is a full-stack web application that acts as a centralized AI-powered study workspace.

Upload any document (PDF, PPT, TXT), and MindVault will:
- **Summarize** it using Google Gemini AI
- **Generate quizzes** (MCQs) to test your understanding  
- Let you **chat with the document** — ask questions and get contextual answers
- Help you **plan your studies** with AI-generated study plans, tasks, calendar events, and deadline alerts

All your files, notes, and progress are stored in a personal vault tied to your account.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📄 **Document Upload & Storage** | Upload PDFs, PowerPoints, and text files to your personal vault. Search, preview, and manage files. |
| 📝 **AI Summarization** | Get concise AI-generated summaries of any uploaded document with one click. |
| 🧪 **Quiz Generation** | Auto-generate MCQs from document content to test your knowledge. |
| 💬 **Document Chat** | Ask questions about any file — the AI reads the document and answers contextually, with chat history per file. |
| 📅 **Study Planner** | Create tasks, schedule calendar events, track upcoming deadlines, and get smart alerts. |
| 🤖 **AI Study Plans** | Generate personalized, day-wise study plans based on your goals, subjects, and timeframe. |
| 🔐 **Authentication** | Secure JWT-based auth with user registration and login. All data is per-user. |
| 🔔 **Background Alerts** | A background thread monitors deadlines and auto-creates alerts for expired events. |

---

## 🔄 Data Flow

```
┌────────────────────────────────────────────────────────┐
│                   USER (Browser)                       │
│                                                        │
│   Upload File ──→  View Summary ──→  Take Quiz         │
│       │                                    │           │
│       ▼                                    ▼           │
│   Chat with Doc ──→  Plan Studies ──→  Track Deadlines │
└────────────┬───────────────────────────────┬───────────┘
             │           REST API            │
             ▼                               ▼
┌────────────────────────────────────────────────────────┐
│                  Flask Backend (:5000)                  │
│                                                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐ │
│  │  Upload   │  │  AI      │  │  Chat    │  │ Planner│ │
│  │  & Vault  │  │ Summary  │  │  per     │  │ Tasks  │ │
│  │  Manager  │  │ MCQ Gen  │  │  File    │  │ Events │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └───┬────┘ │
│       │              │             │             │      │
│       ▼              ▼             ▼             ▼      │
│  ┌─────────┐   ┌──────────┐  ┌─────────┐  ┌─────────┐ │
│  │MongoDB  │   │ Gemini   │  │ MongoDB │  │ MongoDB │ │
│  │ files   │   │   API    │  │file_chats│  │ tasks / │ │
│  │collection│  │(2.0/2.5) │  │collection│  │ events  │ │
│  └─────────┘   └──────────┘  └─────────┘  └─────────┘ │
└────────────────────────────────────────────────────────┘

Upload Flow:
  User → POST /api/upload → File saved to myvault_files/ → Metadata stored in MongoDB

Summarize Flow:
  User → GET /api/summarize/:id → Extract text (PyMuPDF/python-pptx) → Gemini AI → Summary

Quiz Flow:
  User → GET /api/mcqs/:id → Extract text → Gemini AI → JSON MCQs array

Chat Flow:
  User → POST /api/chat/:id/ask → Load file text + chat history → Gemini AI → Answer

Planner Flow:
  User → POST /api/planner/generate-plan → Gemini AI → Markdown study plan
```

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| **React 19** | UI framework with functional components and hooks |
| **TypeScript** | Type-safe development |
| **Vite** | Fast dev server and build tool |
| **Tailwind CSS** | Utility-first responsive styling |
| **Framer Motion** | Smooth page transitions and animations |
| **React Router v7** | Client-side routing |
| **Zustand** | Lightweight global state management |
| **Axios** | HTTP client for API calls |
| **Lucide React** | Icon library |

### Backend
| Technology | Purpose |
|-----------|---------|
| **Flask** | Python web framework (REST API) |
| **Flask-MongoEngine** | MongoDB ODM for Flask |
| **Google Generative AI** | Gemini API for summarization, MCQs, chat, study plans |
| **PyMuPDF (fitz)** | PDF text extraction |
| **python-pptx** | PowerPoint text extraction |
| **PyJWT** | JSON Web Token authentication |
| **bcrypt** | Password hashing |
| **Flask-CORS** | Cross-origin request handling |

### Database & Infrastructure
| Technology | Purpose |
|-----------|---------|
| **MongoDB Atlas** | Cloud-hosted NoSQL database |
| **Node.js + Express** | Secondary auth server |

---

## 📂 Project Structure

```
MindVault/
│
├── frontend/                        # React + TypeScript SPA
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx           # Navigation bar
│   │   │   ├── Footer.tsx           # Page footer
│   │   │   ├── Layout.tsx           # Shared layout wrapper
│   │   │   ├── FeatureCard.tsx      # Landing page feature cards
│   │   │   └── ProtectedRoute.tsx   # Auth route guard
│   │   ├── pages/
│   │   │   ├── Home.tsx             # Landing page
│   │   │   ├── About.tsx            # About page
│   │   │   ├── login.tsx            # Login form
│   │   │   ├── signup.tsx           # Registration form
│   │   │   ├── uploadNotes.tsx      # File upload interface
│   │   │   ├── Workspace/           # Main app workspace
│   │   │   │   ├── Workspace.tsx    # Workspace shell
│   │   │   │   ├── Dashboard.tsx    # User dashboard
│   │   │   │   ├── Sidebar.tsx      # Navigation sidebar
│   │   │   │   ├── MainSection.tsx  # Primary content area
│   │   │   │   ├── MyVaultView.tsx  # File management & viewer
│   │   │   │   ├── VaultAI.tsx      # AI chat interface
│   │   │   │   └── ChatModal.tsx    # Per-file chat modal
│   │   │   └── Planner/            # Study planner module
│   │   │       ├── AIStudyPlan.tsx  # AI plan generator UI
│   │   │       ├── CalendarBox.tsx  # Calendar widget
│   │   │       ├── MyTasks.tsx      # Task management
│   │   │       ├── AlertsBox.tsx    # Deadline alerts
│   │   │       └── UpcomingDeadlines.tsx
│   │   ├── api/
│   │   │   └── planner.ts          # Planner API service
│   │   ├── context/
│   │   │   └── AuthContext.tsx      # Auth state provider
│   │   ├── App.tsx                  # Root routes
│   │   └── main.tsx                 # Entry point
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── package.json
│
├── backend/                         # Flask + Express API
│   ├── backend_app.py               # Main Flask app (all routes & models)
│   ├── server.js                    # Express server (auth proxy)
│   ├── models/
│   │   └── User.js                  # Mongoose user schema
│   ├── routes/
│   │   ├── auth.js                  # Express auth routes
│   │   └── planner_routes.py        # Planner route definitions
│   ├── myvault_files/               # Uploaded file storage (gitignored)
│   ├── requirements.txt             # Python dependencies
│   └── package.json                 # Node dependencies
│
├── .gitignore
├── package.json
└── README.md
```

---

## 🚀 Setup & Installation

### Prerequisites

| Requirement | Version |
|------------|---------|
| Node.js | ≥ 18.x |
| Python | ≥ 3.9 |
| MongoDB | Atlas or local |
| Google Gemini API Key | [Get one →](https://ai.google.dev/) |

### 1. Clone the Repository

```bash
git clone https://github.com/vijvaidehi20/MindVault.git
cd MindVault
```

### 2. Backend Setup

```bash
cd backend

# Create Python virtual environment
python -m venv venv
source venv/bin/activate          # macOS/Linux
# venv\Scripts\activate           # Windows

# Install Python dependencies
pip install -r requirements.txt

# Install Node dependencies (for Express auth server)
npm install
```

### 3. Configure Environment Variables

Create a `.env` file inside `backend/`:

```env
GEMINI_API_KEY=your_gemini_api_key_here
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/mindvault_db
JWT_SECRET=your_jwt_secret_here
PORT=5000
```

> ⚠️ **Do NOT commit the `.env` file.** It is already in `.gitignore`.

### 4. Frontend Setup

```bash
cd frontend
npm install
```

### 5. Run the Application

Start **two terminals**:

```bash
# Terminal 1 — Backend (Flask)
cd backend
source venv/bin/activate
python backend_app.py
# → http://localhost:5000
```

```bash
# Terminal 2 — Frontend (Vite)
cd frontend
npm run dev
# → http://localhost:5173
```

Open **http://localhost:5173** in your browser.

---

## 📡 API Reference

All protected routes require the header: `Authorization: Bearer <token>`

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | ❌ | Register new user |
| POST | `/api/auth/login` | ❌ | Login, returns JWT |
| GET | `/api/auth/me` | ✅ | Get current user profile |

### File Management

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/upload` | ✅ | Upload a file (PDF/PPT/TXT) |
| GET | `/api/vault/files` | ✅ | List all user files (supports `?search=`) |
| GET | `/api/vault/file/:id/content` | ✅ | Download/preview file |
| DELETE | `/api/vault/file/:id/delete` | ✅ | Permanently delete file |

### AI Features

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/summarize/:file_id` | ✅ | AI summary of uploaded file |
| GET | `/api/mcqs/:file_id` | ✅ | Generate MCQs from file content |

### Document Chat

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/chat/:file_id/ask` | ✅ | Ask a question about a file |
| GET | `/api/chat/:file_id` | ✅ | Get saved chat history for file |
| POST | `/api/chat/:file_id/save` | ✅ | Save chat messages for file |

### Study Planner

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/planner/generate-plan` | ✅ | Generate AI study plan |
| POST | `/api/planner/tasks` | ✅ | Create a new task |
| GET | `/api/planner/tasks` | ✅ | List all tasks |
| PATCH | `/api/planner/tasks/:id` | ✅ | Update task (title/details/done) |
| POST | `/api/planner/events` | ✅ | Create calendar event |
| GET | `/api/planner/events` | ✅ | List calendar events |
| GET | `/api/planner/upcoming-deadlines` | ✅ | Get future deadlines |
| GET | `/api/planner/alerts` | ✅ | Get expired/upcoming/reminder alerts |

---

## 🗄️ Database Collections

| Collection | Key Fields |
|------------|-----------|
| `users` | firstName, email, password (hashed) |
| `files` | user_id, filename, file_id, storage_path, mime_type, size, upload_date |
| `file_chats` | user_id, file_id, messages[], updated_at |
| `planner_tasks` | user_id, title, details, done |
| `planner_events` | user_id, title, description, deadline |
| `planner_alerts` | user_id, message, related_event, read |
| `ai_plans` | user_id, prompt, plan_text |

---

## 🔮 Roadmap

- [ ] 🎙 Voice note transcription & audio support
- [ ] 📜 Global search across all documents
- [ ] 👥 Collaborative study rooms
- [ ] 📊 Study analytics & progress tracking
- [ ] 📱 Mobile-responsive PWA

---

<div align="center">

**Built with ❤️ using React, Flask & Google Gemini**

</div>
]]>
