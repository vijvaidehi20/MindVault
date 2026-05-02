# 🧠 MindVault

AI-powered personal study workspace that turns your documents into summaries, quizzes, and interactive chat.

---

## 🚀 What it does
- Upload PDFs, PPTs, or text files  
- Get **AI summaries** instantly  
- Generate **MCQs** for practice  
- **Chat with your documents**  
- Plan studies with tasks, deadlines, and AI-generated plans  

---

## 🛠 Tech Stack
- Frontend: React + TypeScript + Tailwind  
- Backend: Flask + Node.js  
- Database: MongoDB  
- AI: Google Gemini  

---

## ⚙️ Setup

```bash
git clone https://github.com/vijvaidehi20/MindVault.git
cd MindVault

# Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
npm install

# Frontend
cd ../frontend
npm install
npm run dev
```

Create `.env` in backend:
```
GEMINI_API_KEY=your_key
MONGO_URI=your_uri
JWT_SECRET=your_secret
```

---

## 📌 Why this project?
Students deal with scattered notes and inefficient tools. MindVault brings everything into one AI-powered workspace to make studying faster and smarter.

---

## 🔮 Future Scope
- Voice notes support  
- Global search  
- Collaboration features  
- Study analytics  

---
