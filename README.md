# 🚀 HirePK — AI-Powered Local Jobs & Internship Portal

**HirePK** is Pakistan's first hyperlocal, AI-powered job and internship search platform designed specifically for students, fresh graduates, and local businesses. 

---

## ✨ Features & Architecture

### 1. 🎙️ Hyperlocal & Pakistan-Centric Focus
* **Audio Resumes / 1-Minute Pitch:** Candidates can upload a short audio introduction to stand out.
* **Neighborhood/Area Filters:** Search jobs at the neighborhood level (e.g., Clifton, Gulberg, DHA, Gulshan) inside major Pakistani cities (Karachi, Lahore, Islamabad, etc.).
* **PKR Currency Support:** All salaries are listed and filtered in Pakistan Rupees (PKR).

### 2. 🤖 Groq AI Features (LLaMA-3)
* **ATS Resume Auditor:** Get immediate scoring and structural suggestions for your CV content.
* **Smart Cover Letter Generator:** Generate matching cover letters from job descriptions.
* **AI Match Score & Skill Gap Gauge:** A dynamic circular match gauge highlighting matching skills vs missing skill gaps.
* **AI Interview Prep:** Generate 10 technical & behavioral interview questions with custom answers tips.
* **AI Job Description (JD) Writer:** Quick JD drafting for employers based on a job title.

### 3. 💼 Recruitments Pipeline (Kanban Board)
* Trello-style applicant tracking pipelines for employers (Applied ➡️ Shortlisted ➡️ Interviewing ➡️ Hired/Rejected) to manage candidate workflows.

---

## 🛠️ Tech Stack

* **Frontend:** React 18/19, Vite, TailwindCSS (v4), Zustand, Axios
* **Backend:** Node.js, Express, MongoDB + Mongoose, Passport.js (Google OAuth), JWT Cookies
* **AI Integrations:** Groq Cloud SDK (LLaMA-3 8B model)
* **File Uploads:** Multer (Local fallback and Cloudinary integration support)

---

## 📂 Project Organization

```
hirepk/
├── docs/                            # Blueprint and design document specs
├── client/                          # React Frontend (Vite)
│   ├── src/
│   │   ├── components/              # Buttons, inputs, card components
│   │   ├── pages/                   # Views (Home, Jobs, Dashboard, AI playground)
│   │   ├── services/                # Axios API requests
│   │   └── store/                   # Zustand global stores
└── server/                          # Node/Express Backend
    ├── config/                      # Mongoose & Passport configs
    ├── controllers/                 # Endpoint logic controllers
    ├── middleware/                  # Protected routes, uploads, validation
    └── models/                      # MongoDB Schemas
```

---

## ⚡ Setup & Launch Instructions

### Prerequisites
* **Node.js** >= 18.x
* **MongoDB** (Local instance or Atlas cloud URI)
* **Groq API Key** (from console.groq.com)

### 1. Environment Configurations
Create a `.env` file in the `server/` directory (see [server/.env.example](server/.env.example) for layout):
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/hirepk
JWT_SECRET=your_jwt_secret_key
GROQ_API_KEY=your_groq_api_key
CLIENT_URL=http://localhost:5173
```

### 2. Install Dependencies

**For Backend:**
```bash
cd server
npm install
```

**For Frontend:**
```bash
cd client
npm install
```

### 3. Run Development Servers

**Start Backend API (Server runs on port 5000):**
```bash
cd server
npm run dev
```

**Start Frontend Application (Runs on port 5173):**
```bash
cd client
npm run dev
```

---

## 🪵 Git Branching Policy (Git Flow)
1. **`main`**: Production code release only. Direct pushes are protected.
2. **`develop`**: Primary integration branch. All features merge here first.
3. **`feat/*`**: Branched from `develop` for individual features (e.g. `feat/ai-reviewer`).
4. **Conventional Commits**: Format commit messages like:
   - `feat(ai): integrate groq resume auditor`
   - `fix(auth): redirect oauth callbacks correctly`
