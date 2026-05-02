<![CDATA[<div align="center">

# 🧠 MindVault

**Your AI-Powered Personal Knowledge Workspace**

Transform lectures, notes, and documents into interactive learning tools — summaries, quizzes, mind maps, and a personal AI tutor — all in one place.

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Flask](https://img.shields.io/badge/Flask-2.2-000000?logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Gemini](https://img.shields.io/badge/Google%20Gemini-AI-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)

</div>

---

## 📋 Table of Contents

- [About](#-about)
- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)

---

## 💡 About

Students deal with an overwhelming volume of study materials — scattered PDFs, lengthy lecture slides, and dense textbooks. Traditional tools are fragmented and lack intelligent integration, leading to cognitive overload and wasted time.

**MindVault** solves this by providing a centralized, AI-powered workspace that turns **passive content into active learning tools**. Upload any document, and MindVault will summarize it, generate quizzes, answer your questions from the content, and help you plan your study schedule — all powered by Google's Gemini AI.

---

## ✨ Features

### 📄 Smart Document Processing
Upload PDFs, PowerPoints, or text files and instantly get AI-generated summaries. MindVault extracts and understands your content so you don't have to read everything from scratch.

### 🧪 Auto-Generated Quizzes
Turn any uploaded document into a set of 10 MCQs with one click. Test your understanding and identify knowledge gaps — no manual effort required.

### 💬 Document-Aware Chat
Ask questions about any uploaded file and get contextual, accurate answers. MindVault reads the document for you and maintains conversation history per file.

### 🤖 Vault AI — Personal Tutor
A general-purpose AI chatbot with persistent chat history, auto-generated titles, and multi-session support. Use it as a study companion for any topic.

### 📅 Study Planner
A full-featured planner with tasks, calendar events, upcoming deadline tracking, and smart alerts. Generate AI-powered study plans based on your goals, subjects, and timeframe.

### 🗂️ My Vault — File Management
A personal knowledge vault to upload, search, preview, and manage all your documents. Supports in-app file viewing and permanent deletion.

### 🔐 Authentication
Secure JWT-based authentication with user registration, login, and protected routes.

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────┐
│                     Frontend                        │
│          React 19 + TypeScript + Vite               │
│     Tailwind CSS · Framer Motion · Zustand          │
│                                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │
│  │   Home   │ │Workspace │ │ Planner  │ │  Auth  │ │
│  └──────────┘ └──────────┘ └──────────┘ └────────┘ │
│       │            │             │           │      │
└───────┼────────────┼─────────────┼───────────┼──────┘
        │            │             │           │
        ▼            ▼             ▼           ▼
┌─────────────────────────────────────────────────────┐
│                  Backend (Flask)                     │
│                 Port 5000                            │
│                                                     │
│  ┌──────────────┐ ┌────────────┐ ┌───────────────┐  │
│  │  File Upload  │ │  AI Routes │ │  Auth Routes  │  │
│  │  & Vault API  │ │ Summarize  │ │ Register/Login│  │
│  │              │ │ MCQ Gen    │ │               │  │
│  │              │ │ Chat       │ │               │  │
│  └──────┬───────┘ └─────┬──────┘ └───────┬───────┘  │
│         │               │                │          │
│         ▼               ▼                ▼          │
│  ┌────────────┐  ┌────────────┐  ┌──────────────┐   │
│  │  MongoDB   │  │ Google     │  │   JWT Auth   │   │
│  │  (Atlas)   │  │ Gemini API │  │   + bcrypt   │   │
│  └────────────┘  └────────────┘  └──────────────┘   │
└─────────────────────────────────────────────────────┘
```

---

## 🛠 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 19, TypeScript, Vite | SPA with modern React features |
| **Styling** | Tailwind CSS, Framer Motion | Responsive design & animations |
| **State** | Zustand, React Context | Global & auth state management |
| **Routing** | React Router v7 | Client-side navigation |
| **Backend** | Flask (Python) | REST API server |
| **Database** | MongoDB (via MongoEngine) | Document storage & user data |
| **AI Engine** | Google Gemini (2.0 Flash / 2.5) | Summarization, MCQs, chat |
| **Auth** | JWT + bcrypt | Stateless authentication |
| **File Parsing** | PyMuPDF, python-pptx | PDF & PowerPoint text extraction |

---

## 📂 Project Structure

```
MindVault/
├── frontend/                    # React + TypeScript client
│   ├── src/
│   │   ├── api/                 # Axios API service layer
│   │   ├── assets/              # Static assets (images, icons)
│   │   ├── components/          # Shared UI components
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Layout.tsx
│   │   │   ├── FeatureCard.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── context/             # React Context (AuthContext)
│   │   ├── pages/
│   │   │   ├── Home.tsx         # Landing page
│   │   │   ├── About.tsx        # About page
│   │   │   ├── login.tsx        # Login page
│   │   │   ├── signup.tsx       # Registration page
│   │   │   ├── uploadNotes.tsx  # File upload interface
│   │   │   ├── Workspace/       # Main workspace module
│   │   │   │   ├── Workspace.tsx
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── MainSection.tsx
│   │   │   │   ├── MyVaultView.tsx
│   │   │   │   ├── VaultAI.tsx
│   │   │   │   └── ChatModal.tsx
│   │   │   └── Planner/         # Study planner module
│   │   │       ├── AIStudyPlan.tsx
│   │   │       ├── CalendarBox.tsx
│   │   │       ├── MyTasks.tsx
│   │   │       ├── AlertsBox.tsx
│   │   │       └── UpcomingDeadlines.tsx
│   │   ├── utils/               # Helper utilities
│   │   ├── App.tsx              # Root component & routing
│   │   └── main.tsx             # Entry point
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── package.json
│
├── backend/                     # Flask API server
│   ├── backend_app.py           # Main application (routes, models, AI logic)
│   ├── server.js                # Node.js Express server (auth, vault proxy)
│   ├── models/
│   │   └── User.js              # Mongoose user model
│   ├── routes/
│   │   ├── auth.js              # Express auth routes
│   │   └── planner_routes.py    # Planner route definitions
│   ├── myvault_files/           # Uploaded file storage
│   ├── temp_uploads/            # Temporary upload staging
│   ├── requirements.txt         # Python dependencies
│   └── package.json             # Node.js dependencies
│
├── .gitignore
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **Python** ≥ 3.9
- **MongoDB** (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- **Google Gemini API Key** → [Get one here](https://ai.google.dev/)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/MindVault.git
cd MindVault
```

### 2. Backend Setup

```bash
cd backend

# Create and activate a Python virtual environment
python -m venv venv
source venv/bin/activate        # macOS / Linux
# venv\Scripts\activate         # Windows

# Install Python dependencies
pip install -r requirements.txt

# Install Node.js dependencies (for the Express auth server)
npm install

# Create environment file
cp .env.example .env
# Edit .env with your actual values (see Environment Variables section)
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install
```

### 4. Run the Application

Open **three terminal windows**:

```bash
# Terminal 1 — Flask API server (AI, files, planner)
cd backend
source venv/bin/activate
python backend_app.py
# → Runs on http://localhost:5000

# Terminal 2 — Express server (auth)
cd backend
node server.js
# → Runs on http://localhost:5000 (or configured port)

# Terminal 3 — React dev server
cd frontend
npm run dev
# → Runs on http://localhost:5173
```

---

## 🔑 Environment Variables

Create a `.env` file in the `backend/` directory:

```env
GEMINI_API_KEY=your_google_gemini_api_key
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/mindvault_db
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

> ⚠️ **Never commit `.env` to version control.** It is already listed in `.gitignore`.

---

## 📡 API Reference

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Login & receive JWT token |
| `GET` | `/api/auth/me` | Get current user profile 🔒 |

### File Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/upload` | Upload a file (PDF, PPT, TXT) 🔒 |
| `GET` | `/api/vault/files` | List user's uploaded files 🔒 |
| `GET` | `/api/vault/file/:id/content` | Download/preview a file 🔒 |
| `DELETE` | `/api/vault/file/:id/delete` | Permanently delete a file 🔒 |

### AI Features

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/summarize/:file_id` | AI-generated summary of a file 🔒 |
| `GET` | `/api/mcqs/:file_id` | Generate 10 MCQs from a file 🔒 |
| `POST` | `/api/chat/:file_id/ask` | Ask a question about a file 🔒 |
| `GET` | `/api/chat/:file_id` | Get saved chat for a file 🔒 |
| `POST` | `/api/chat/:file_id/save` | Save chat messages for a file 🔒 |

### Vault AI (General Chat)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/vaultai/new` | Create a new chat session 🔒 |
| `GET` | `/api/vaultai/chats` | List all chat sessions 🔒 |
| `GET` | `/api/vaultai/chat/:id` | Get a specific chat 🔒 |
| `POST` | `/api/vaultai/:id` | Send a message in a chat 🔒 |
| `PATCH` | `/api/vaultai/rename/:id` | Rename a chat session 🔒 |
| `DELETE` | `/api/vaultai/:id` | Delete a chat session 🔒 |

### Study Planner

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/planner/generate-plan` | Generate an AI study plan 🔒 |
| `POST` | `/api/planner/tasks` | Create a task 🔒 |
| `GET` | `/api/planner/tasks` | List all tasks 🔒 |
| `PATCH` | `/api/planner/tasks/:id` | Update a task 🔒 |
| `DELETE` | `/api/planner/tasks/:id` | Delete a task 🔒 |
| `POST` | `/api/planner/events` | Create a calendar event 🔒 |
| `GET` | `/api/planner/events` | List calendar events 🔒 |
| `GET` | `/api/planner/upcoming-deadlines` | Get upcoming deadlines 🔒 |
| `GET` | `/api/planner/alerts` | Get deadline & reminder alerts 🔒 |

> 🔒 = Requires `Authorization: Bearer <token>` header

---

## 🗄️ Database Models

| Collection | Fields | Description |
|------------|--------|-------------|
| `users` | firstName, email, password | User accounts |
| `files` | user_id, filename, file_id, storage_path, file_type, mime_type, size | Uploaded documents |
| `file_chats` | user_id, file_id, messages[] | Per-file chat history |
| `vault_chats` | user_id, title, messages[] | General AI chat sessions |
| `planner_tasks` | user_id, title, details, done | To-do items |
| `planner_events` | user_id, title, description, deadline | Calendar events |
| `planner_alerts` | user_id, message, related_event, read | Notification alerts |
| `ai_plans` | user_id, prompt, plan_text | Saved AI study plans |

---

## 🔮 Roadmap

- [ ] 🎙 Voice note transcription & audio file support
- [ ] 📜 Global search across all documents
- [ ] 👥 Collaborative study rooms
- [ ] 📅 AI-powered calendar planning with smart scheduling
- [ ] 📊 Study analytics & progress tracking
- [ ] 🌐 Multi-language support
- [ ] 📱 Mobile-responsive PWA

---

## 🤝 Contributing

Contributions are welcome! To get started:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

<div align="center">

Built with ❤️ using React, Flask, and Google Gemini

</div>
]]>
