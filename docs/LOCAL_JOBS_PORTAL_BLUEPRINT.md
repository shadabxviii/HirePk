# 🚀 AI-Powered Local Jobs & Internship Portal — Project Blueprint

> **Solo Project | MERN Stack + Groq AI | Production-Grade**
> Senior-level architecture, clean code, atomic design, full Git workflow.

---

## 📌 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Core Features](#2-core-features)
3. [AI Features (Groq-Powered)](#3-ai-features-groq-powered)
4. [Tech Stack](#4-tech-stack)
5. [Folder Structure](#5-folder-structure)
6. [Atomic Design System](#6-atomic-design-system)
7. [Database Schema (MongoDB)](#7-database-schema-mongodb)
8. [API Routes](#8-api-routes)
9. [Environment Variables (.env)](#9-environment-variables-env)
10. [Git & GitHub Workflow](#10-git--github-workflow)
11. [Branch Strategy](#11-branch-strategy)
12. [Sprint Plan (Aaj Complete Karna Hai)](#12-sprint-plan-aaj-complete-karna-hai)
13. [Setup Instructions](#13-setup-instructions)
14. [Free APIs Used](#14-free-apis-used)
15. [Coding Standards](#15-coding-standards)

---

## 1. Project Overview

**Project Name:** `HirePK` — AI-Powered Local Jobs & Internship Portal
**Tagline:** *"Pakistan ka pehla AI-powered hyperlocal job portal"*

### Problem Statement
Pakistani students aur fresher professionals ko local jobs aur internships dhundhne mein mushkil hoti hai — platforms generic hain, AI nahi use karte, aur local market ko target nahi karte.

### Solution
Ek full-stack MERN platform jo:
- Local businesses aur companies ko job/internship post karne deta hai
- Job seekers ko AI-powered resume feedback, job matching, aur cover letter generation deta hai
- Google OAuth se seamless login deta hai
- Groq LLM ke sath real-time AI features provide karta hai

---

## 2. Core Features

### 👤 Authentication
- [x] Google OAuth 2.0 (Passport.js)
- [x] JWT-based session management
- [x] Role-based access: `jobseeker` | `employer` | `admin`
- [x] Protected routes (frontend + backend)

### 🧑‍💼 Job Seeker Features
- [x] Profile creation with skills, education, experience
- [x] Resume upload (PDF) — stored on Cloudinary (free tier)
- [x] Browse jobs with filters: city, category, type (remote/onsite), salary
- [x] Apply to jobs with one click
- [x] Application tracking dashboard
- [x] Save/bookmark jobs
- [x] AI Resume Reviewer (Groq)
- [x] AI Cover Letter Generator (Groq)
- [x] AI Job Match Score (Groq)
- [x] AI Interview Prep Questions (Groq)

### 🏢 Employer Features
- [x] Company profile creation
- [x] Post jobs / internships with rich details
- [x] Manage posted jobs (CRUD)
- [x] View applicants list per job
- [x] Shortlist / reject applicants
- [x] AI Job Description Writer (Groq)

### 🔍 Job Discovery
- [x] Search with keyword + city filter
- [x] Category-based browsing (IT, Finance, Marketing, etc.)
- [x] Latest / Featured jobs on homepage
- [x] Pagination (cursor-based)
- [x] Job detail page with company info

### 📊 Admin Panel
- [x] User management
- [x] Job moderation (approve/reject)
- [x] Basic analytics: total users, jobs, applications

---

## 3. AI Features (Groq-Powered)

> Model used: `llama3-8b-8192` (fast + free on Groq)

| Feature | Endpoint | Description |
|---|---|---|
| Resume Reviewer | `POST /api/ai/review-resume` | User paste kare resume text → AI detailed feedback de |
| Cover Letter Generator | `POST /api/ai/cover-letter` | Job description + user profile → personalized cover letter |
| Job Match Score | `POST /api/ai/match-score` | Resume vs Job Description → % match + gaps |
| Interview Prep | `POST /api/ai/interview-prep` | Job role → 10 likely interview questions with tips |
| JD Writer (Employer) | `POST /api/ai/write-jd` | Job title + company info → full job description draft |
| Skills Gap Analysis | `POST /api/ai/skills-gap` | User skills vs market demand → learning recommendations |

### Groq Implementation Pattern

```js
// server/utils/groq.js
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const askGroq = async (systemPrompt, userMessage) => {
  const completion = await groq.chat.completions.create({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
    model: "llama3-8b-8192",
    temperature: 0.7,
    max_tokens: 1024,
  });
  return completion.choices[0]?.message?.content || "";
};
```

---

## 4. Tech Stack

### Frontend
| Tool | Purpose |
|---|---|
| React 18 + Vite | UI framework |
| React Router v6 | Client-side routing |
| TailwindCSS | Utility-first styling |
| shadcn/ui | Pre-built accessible components |
| Lucide React | Icons |
| Axios | HTTP client |
| React Query (TanStack) | Server state management |
| React Hook Form + Zod | Form handling + validation |
| Zustand | Global client state (auth, UI) |

### Backend
| Tool | Purpose |
|---|---|
| Node.js + Express.js | REST API server |
| MongoDB + Mongoose | Database + ODM |
| Passport.js | Google OAuth strategy |
| JWT (jsonwebtoken) | Auth tokens |
| Groq SDK | AI completions |
| Cloudinary | File/image storage (free) |
| Multer | File upload middleware |
| bcryptjs | Password hashing |
| express-validator | Input validation |
| cors, helmet, morgan | Security + logging |
| dotenv | Env management |

### DevOps / Tools
| Tool | Purpose |
|---|---|
| Git + GitHub | Version control |
| GitHub Projects | Kanban board |
| Vercel | Frontend deploy (free) |
| Render / Railway | Backend deploy (free) |
| MongoDB Atlas | Cloud DB (free M0) |

---

## 5. Folder Structure

```
hirepk/
├── client/                          # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/              # Atomic Design
│   │   │   ├── atoms/
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Input.jsx
│   │   │   │   ├── Badge.jsx
│   │   │   │   ├── Avatar.jsx
│   │   │   │   ├── Spinner.jsx
│   │   │   │   └── index.js
│   │   │   ├── molecules/
│   │   │   │   ├── JobCard.jsx
│   │   │   │   ├── SearchBar.jsx
│   │   │   │   ├── FilterPanel.jsx
│   │   │   │   ├── AIPromptBox.jsx
│   │   │   │   └── index.js
│   │   │   ├── organisms/
│   │   │   │   ├── Navbar.jsx
│   │   │   │   ├── JobList.jsx
│   │   │   │   ├── ApplicationForm.jsx
│   │   │   │   ├── AIResultCard.jsx
│   │   │   │   └── index.js
│   │   │   └── templates/
│   │   │       ├── DashboardLayout.jsx
│   │   │       ├── AuthLayout.jsx
│   │   │       └── PublicLayout.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Jobs.jsx
│   │   │   ├── JobDetail.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard/
│   │   │   │   ├── SeekerDashboard.jsx
│   │   │   │   ├── EmployerDashboard.jsx
│   │   │   │   └── AdminDashboard.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── PostJob.jsx
│   │   │   ├── AITools.jsx
│   │   │   └── NotFound.jsx
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   ├── useJobs.js
│   │   │   └── useAI.js
│   │   ├── store/
│   │   │   └── authStore.js         # Zustand
│   │   ├── services/
│   │   │   ├── api.js               # Axios instance
│   │   │   ├── jobService.js
│   │   │   ├── authService.js
│   │   │   └── aiService.js
│   │   ├── utils/
│   │   │   ├── constants.js
│   │   │   └── helpers.js
│   │   ├── lib/
│   │   │   └── utils.js             # shadcn cn() helper
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── server/                          # Express Backend
│   ├── config/
│   │   ├── db.js                    # MongoDB connection
│   │   ├── passport.js              # Google OAuth config
│   │   └── cloudinary.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Job.js
│   │   ├── Application.js
│   │   └── Company.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── job.routes.js
│   │   ├── application.routes.js
│   │   ├── user.routes.js
│   │   ├── company.routes.js
│   │   └── ai.routes.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── job.controller.js
│   │   ├── application.controller.js
│   │   ├── user.controller.js
│   │   ├── company.controller.js
│   │   └── ai.controller.js
│   ├── middleware/
│   │   ├── auth.middleware.js       # JWT verify
│   │   ├── role.middleware.js       # RBAC
│   │   ├── upload.middleware.js     # Multer
│   │   └── validate.middleware.js
│   ├── utils/
│   │   ├── groq.js                  # Groq helper
│   │   ├── generateToken.js
│   │   └── ApiResponse.js           # Standardized responses
│   ├── .env
│   ├── server.js
│   └── package.json
│
├── .gitignore
├── README.md
└── LOCAL_JOBS_PORTAL_BLUEPRINT.md   # (this file)
```

---

## 6. Atomic Design System

### Philosophy
> "Components chote se chote hone chahiye, phir combine ho ke bade banein."

```
Atoms      → Smallest UI units (Button, Input, Badge)
Molecules  → Atoms ka combination (JobCard = Badge + Button + text)
Organisms  → Complex sections (Navbar = Logo + SearchBar + AuthButtons)
Templates  → Page layouts (DashboardLayout wraps organisms)
Pages      → Actual route pages (fill templates with real data)
```

### Example: JobCard (Molecule)

```jsx
// client/src/components/molecules/JobCard.jsx
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { MapPin, Clock, Briefcase } from "lucide-react";
import { Link } from "react-router-dom";

const JobCard = ({ job }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-gray-900 text-lg">{job.title}</h3>
          <p className="text-gray-500 text-sm mt-1">{job.company?.name}</p>
        </div>
        {job.company?.logo && (
          <img src={job.company.logo} alt="logo" className="w-12 h-12 rounded-lg object-cover" />
        )}
      </div>

      <div className="flex flex-wrap gap-2 mt-3">
        <Badge variant="outline" icon={<MapPin size={12} />}>{job.location}</Badge>
        <Badge variant="outline" icon={<Clock size={12} />}>{job.type}</Badge>
        <Badge variant="outline" icon={<Briefcase size={12} />}>{job.category}</Badge>
      </div>

      {job.salary && (
        <p className="text-green-600 font-medium text-sm mt-2">
          PKR {job.salary.min?.toLocaleString()} – {job.salary.max?.toLocaleString()} / month
        </p>
      )}

      <div className="flex items-center justify-between mt-4">
        <span className="text-xs text-gray-400">
          {new Date(job.createdAt).toLocaleDateString("en-PK")}
        </span>
        <Link to={`/jobs/${job._id}`}>
          <Button size="sm" variant="default">View Job</Button>
        </Link>
      </div>
    </div>
  );
};

export default JobCard;
```

---

## 7. Database Schema (MongoDB)

### User Model
```js
// server/models/User.js
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String },                          // null for OAuth users
  googleId: { type: String },
  avatar: { type: String, default: "" },
  role: { type: String, enum: ["jobseeker", "employer", "admin"], default: "jobseeker" },
  profile: {
    headline: String,
    bio: String,
    skills: [String],
    resumeUrl: String,                                 // Cloudinary URL
    city: String,
    phone: String,
    linkedin: String,
    github: String,
    portfolio: String,
  },
  savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Job" }],
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});
```

### Job Model
```js
// server/models/Job.js
const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  category: {
    type: String,
    enum: ["IT", "Finance", "Marketing", "Design", "HR", "Sales", "Engineering", "Other"],
    required: true,
  },
  type: { type: String, enum: ["full-time", "part-time", "internship", "remote", "contract"] },
  location: { type: String, required: true },          // City name
  salary: {
    min: Number,
    max: Number,
    currency: { type: String, default: "PKR" },
    negotiable: { type: Boolean, default: false },
  },
  skills: [String],
  requirements: [String],
  deadline: Date,
  status: { type: String, enum: ["active", "closed", "draft"], default: "active" },
  applicantsCount: { type: Number, default: 0 },
  isFeatured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

jobSchema.index({ title: "text", description: "text", location: "text" });
```

### Application Model
```js
// server/models/Application.js
const applicationSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
  applicant: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  coverLetter: String,
  resumeUrl: String,
  status: {
    type: String,
    enum: ["pending", "viewed", "shortlisted", "rejected", "hired"],
    default: "pending",
  },
  appliedAt: { type: Date, default: Date.now },
});
```

### Company Model
```js
// server/models/Company.js
const companySchema = new mongoose.Schema({
  name: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  logo: String,
  website: String,
  industry: String,
  size: { type: String, enum: ["1-10", "11-50", "51-200", "201-500", "500+"] },
  city: String,
  description: String,
  verified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});
```

---

## 8. API Routes

### Auth Routes (`/api/auth`)
```
GET    /google                    → Google OAuth redirect
GET    /google/callback            → OAuth callback, return JWT
POST   /logout                    → Clear session
GET    /me                        → Get current user (requires JWT)
```

### Job Routes (`/api/jobs`)
```
GET    /                          → Get all jobs (with filters + pagination)
GET    /:id                       → Get single job
POST   /                          → Create job (employer only)
PUT    /:id                       → Update job (owner only)
DELETE /:id                       → Delete job (owner only)
GET    /my/listings               → Employer's own jobs
POST   /:id/save                  → Save/unsave job (seeker)
```

### Application Routes (`/api/applications`)
```
POST   /                          → Apply to a job
GET    /my                        → My applications (seeker)
GET    /job/:jobId                → Applicants for a job (employer)
PATCH  /:id/status                → Update status (employer)
```

### User Routes (`/api/users`)
```
GET    /profile                   → Get own profile
PUT    /profile                   → Update profile
POST   /upload-resume             → Upload resume PDF to Cloudinary
GET    /saved-jobs                → Get saved jobs
```

### AI Routes (`/api/ai`)
```
POST   /review-resume             → Groq: resume review
POST   /cover-letter              → Groq: cover letter generation
POST   /match-score               → Groq: job match analysis
POST   /interview-prep            → Groq: interview questions
POST   /write-jd                  → Groq: job description writer
POST   /skills-gap                → Groq: skills gap analysis
```

---

## 9. Environment Variables (.env)

### Server `.env` (`server/.env`)
```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB Atlas
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/hirepk?retryWrites=true&w=majority

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Groq AI
GROQ_API_KEY=your_groq_api_key_here

# Cloudinary (free tier)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Frontend URL (CORS)
CLIENT_URL=http://localhost:5173
```

### Client `.env` (`client/.env`)
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
```

### Production `.env` (Update before deploy)
```env
# Server production values
CLIENT_URL=https://hirepk.vercel.app
GOOGLE_CALLBACK_URL=https://hirepk-api.render.com/api/auth/google/callback
NODE_ENV=production
```

---

## 10. Git & GitHub Workflow

### Initial Setup
```bash
# 1. GitHub pr naya repo banao: hirepk
# 2. Local mein clone karo
git clone https://github.com/<your-username>/hirepk.git
cd hirepk

# 3. Monorepo structure banao
mkdir client server
touch .gitignore README.md

# 4. .gitignore
echo "node_modules/
.env
dist/
build/
*.log
.DS_Store" > .gitignore

# 5. Initial commit
git add .
git commit -m "chore: initial project structure"
git push origin main
```

### Commit Message Convention (Conventional Commits)
```
feat:     new feature
fix:      bug fix
chore:    build/config changes
docs:     documentation
style:    formatting only
refactor: code restructure, no feature change
test:     adding tests
perf:     performance improvement

Examples:
feat: add Google OAuth login
feat(ai): add Groq cover letter generator
fix(api): fix job filter query bug
chore: add tailwind config
docs: update API routes in blueprint
```

### Daily Workflow
```bash
# Kaam shuru karte waqt — always pull latest
git checkout develop
git pull origin develop

# Naya feature branch banao
git checkout -b feat/job-search-filters

# Kaam karo, phir commit
git add .
git commit -m "feat: add city and category filters to job search"

# Push karo
git push origin feat/job-search-filters

# GitHub pr Pull Request banao: feat/job-search-filters → develop
# Review karo, phir merge karo
```

---

## 11. Branch Strategy

```
main                  → Production-ready code only
  └── develop         → Integration branch (features merge here first)
        ├── feat/google-oauth
        ├── feat/job-listing-page
        ├── feat/ai-resume-reviewer
        ├── feat/employer-dashboard
        ├── feat/application-system
        ├── feat/admin-panel
        ├── fix/job-search-query
        └── chore/setup-cloudinary
```

### Rules
- `main` branch mein **directly push nahi karna** — always PR via `develop`
- Har feature ek alag branch mein hoga
- Branch naam: `feat/`, `fix/`, `chore/`, `docs/` prefix se start karo
- PR merge hone ke baad feature branch delete karo (clean history)

### GitHub Setup Commands
```bash
# develop branch banao
git checkout -b develop
git push origin develop

# GitHub Settings mein develop ko default branch banao
# Settings → Branches → Default branch → develop

# Branch protection (optional but good practice)
# Settings → Branches → Add rule → main
# ✅ Require pull request before merging
```

---

## 12. Sprint Plan (Aaj Complete Karna Hai)

> **Total Estimated Time: ~8-10 hours**

### Phase 1 — Setup (30 min)
- [ ] GitHub repo create karo + `develop` branch
- [ ] Monorepo folder structure banao
- [ ] `.gitignore`, `README.md` add karo
- [ ] `git commit -m "chore: initial project structure"`

### Phase 2 — Backend Foundation (2 hrs)
- [ ] `server/` mein Node + Express setup
- [ ] MongoDB Atlas connect karo
- [ ] Mongoose models: User, Job, Application, Company
- [ ] Google OAuth with Passport.js
- [ ] JWT middleware
- [ ] `chore/backend-setup` → merge to develop

### Phase 3 — Core API Routes (2 hrs)
- [ ] Auth routes (Google OAuth + /me)
- [ ] Job CRUD routes
- [ ] Application routes
- [ ] User profile routes
- [ ] Groq AI routes (all 6 endpoints)
- [ ] Cloudinary integration
- [ ] `feat/backend-api-routes` → merge to develop

### Phase 4 — Frontend Foundation (1.5 hrs)
- [ ] Vite + React setup
- [ ] TailwindCSS + shadcn/ui install
- [ ] Zustand store (auth state)
- [ ] Axios instance + React Query setup
- [ ] Routing setup (React Router v6)
- [ ] Atom components: Button, Input, Badge, Spinner
- [ ] `chore/frontend-setup` → merge to develop

### Phase 5 — Core Pages (2 hrs)
- [ ] Home page (featured jobs)
- [ ] Jobs listing page with filters
- [ ] Job detail page
- [ ] Login page (Google OAuth button)
- [ ] JobCard molecule component
- [ ] `feat/core-pages` → merge to develop

### Phase 6 — Dashboards + AI Tools (1.5 hrs)
- [ ] Job Seeker Dashboard (applications list)
- [ ] Employer Dashboard (posted jobs)
- [ ] AI Tools page (resume review, cover letter, match score)
- [ ] `feat/dashboards-ai-tools` → merge to develop

### Phase 7 — Polish & Deploy (30 min)
- [ ] `.env.example` files add karo
- [ ] README update karo
- [ ] Vercel (frontend) + Render (backend) deploy
- [ ] develop → main merge (final PR)

---

## 13. Setup Instructions

### Prerequisites
```bash
node --version   # >= 18.x
npm --version    # >= 9.x
git --version    # any
```

### Backend Setup
```bash
cd server
npm init -y
npm install express mongoose dotenv cors helmet morgan
npm install passport passport-google-oauth20 jsonwebtoken bcryptjs
npm install groq-sdk cloudinary multer multer-storage-cloudinary
npm install express-validator
npm install -D nodemon
```

`server/package.json` scripts:
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "type": "module"
}
```

### Frontend Setup
```bash
cd client
npm create vite@latest . -- --template react
npm install
npm install tailwindcss @tailwindcss/vite
npm install axios @tanstack/react-query react-router-dom zustand
npm install react-hook-form @hookform/resolvers zod
npm install lucide-react
npx shadcn@latest init
npx shadcn@latest add button input badge card dialog sheet
```

### Run Both Servers
```bash
# Terminal 1 - Backend
cd server && npm run dev

# Terminal 2 - Frontend
cd client && npm run dev
```

---

## 14. Free APIs Used

| API | Purpose | Free Tier |
|---|---|---|
| **Groq API** | AI completions (LLaMA 3) | 14,400 req/day free | 
| **Google OAuth 2.0** | Social login | Free |
| **MongoDB Atlas** | Cloud database | M0 = 512MB free forever |
| **Cloudinary** | Resume/image storage | 25GB storage free |
| **Vercel** | Frontend hosting | Free forever |
| **Render** | Backend hosting | Free tier (spins down) |

### API Keys Kahan Se Milenge
```
Groq API Key     → https://console.groq.com
Google OAuth     → https://console.cloud.google.com → APIs & Services → Credentials
MongoDB Atlas    → https://cloud.mongodb.com
Cloudinary       → https://cloudinary.com/console
```

---

## 15. Coding Standards

### General Rules
- ES6+ Modules (`import/export`) — CommonJS (`require`) nahi
- Async/await use karo, `.then()` chains avoid karo
- Error handling: try/catch in all controllers
- No hardcoded values — `.env` mein rakhna
- `console.log` production mein nahi — proper logger use karo

### API Response Format (Standardized)
```js
// server/utils/ApiResponse.js
class ApiResponse {
  constructor(statusCode, data, message = "Success") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }
}

// Usage in controller:
res.status(200).json(new ApiResponse(200, jobs, "Jobs fetched successfully"));
```

### Error Handler Middleware
```js
// server/middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};

export default errorHandler;
```

### React Component Naming
```
PascalCase for components:   JobCard.jsx, SearchBar.jsx
camelCase for hooks:         useAuth.js, useJobs.js
camelCase for utilities:     generateToken.js, apiHelpers.js
SCREAMING_SNAKE for consts:  JOB_CATEGORIES, CITIES_PK
```

### TailwindCSS Best Practice
```jsx
// ❌ Avoid inline long class strings directly in JSX templates
// ✅ Use cn() utility from shadcn + extract variants

import { cn } from "@/lib/utils";

const Button = ({ variant = "default", className, ...props }) => {
  return (
    <button
      className={cn(
        "px-4 py-2 rounded-lg font-medium transition-colors",
        variant === "default" && "bg-blue-600 text-white hover:bg-blue-700",
        variant === "outline" && "border border-gray-300 text-gray-700 hover:bg-gray-50",
        variant === "ghost" && "text-gray-600 hover:bg-gray-100",
        className
      )}
      {...props}
    />
  );
};
```

---

## 🎯 Final Notes

```
✅  Senior mindset: har decision ko justify karo (WHY this pattern?)
✅  Clean > Clever: readable code > smart one-liners
✅  Commit early, commit often — har feature complete hone ke baad
✅  .env file kabhi commit mat karna — .gitignore mein daalo
✅  PR description likhna — even solo projects mein habit banao
✅  DRY principle: ek hi kaam 2 jagah nahi — helper/utils mein nikalo
```

---

*Blueprint by Bazed | HirePK v1.0 | MERN + Groq + Google OAuth*
