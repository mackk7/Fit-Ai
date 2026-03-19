# FitAI — AI-Powered Personal Fitness Coach

A full-stack fitness coaching web app built with **React**, **Node.js/Express**, and **MongoDB Atlas**, powered by **Groq LLaMA 3.3-70B** AI for real-time coaching, workout plan generation, and nutrition calculation.

🔗 **Live Demo:** [https://fitai.vercel.app](https://fit-plqgwrhfd-mayanks-projects-415e1968.vercel.app)  
📁 **GitHub:** https://github.com/mackk7/Fit-Ai

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Context API, React Router |
| Backend | Node.js, Express 4 |
| Database | MongoDB Atlas, Mongoose ODM |
| AI | Groq API — LLaMA 3.3-70B |
| Auth | JWT, bcrypt |
| Styling | Custom CSS (no UI library) |
| Deployment | Render (backend) + Vercel (frontend) |

---

## Features

- **JWT Authentication** — Secure register/login with bcrypt password hashing and protected API routes
- **AI Coach Chat** — Multi-turn conversation with LLaMA 3.3-70B, persistent chat history per user stored in MongoDB
- **AI Workout Plan Generator** — Input goal/level/days/equipment → AI generates a full weekly program
- **AI Nutrition Calculator** — BMR/TDEE + personalised macro breakdown based on user biometrics
- **Activity Log** — Full CRUD workout tracking with auto calorie calculation, saved to MongoDB per user
- **Real-time Dashboard** — Live streak tracking, weekly activity bars, monthly goal progress from real data
- **Progress Analytics** — 8-week calorie trend, workout type split, session milestones, all-time totals
- **Custom Goals** — Users set their own monthly targets (sessions, minutes, calories) with quick presets
- **Workout Library** — Filterable by type (Strength, Cardio, HIIT, Yoga)
- **Rate Limiting** — 100 req/15min per IP
- **CORS + Helmet** — Security headers and origin protection on all responses

---

## Project Structure

```
fitai/
├── backend/
│   ├── models/
│   │   ├── User.js            # User schema + bcrypt password hashing
│   │   ├── WorkoutLog.js      # Workout entry schema
│   │   ├── ChatMessage.js     # AI chat history schema
│   │   └── Goal.js            # Per-user monthly goal targets
│   ├── routes/
│   │   ├── auth.js            # Register, login, profile
│   │   ├── logs.js            # Workout CRUD + streak update
│   │   ├── chatHistory.js     # Save/fetch/clear AI chat history
│   │   ├── goals.js           # Get/update user goals
│   │   └── stats.js           # Dashboard + progress analytics
│   ├── middleware/
│   │   └── authMiddleware.js  # JWT verification middleware
│   ├── server.js              # Express app + MongoDB connection
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── context/
    │   │   └── AuthContext.js     # Global auth state
    │   ├── pages/
    │   │   ├── AuthPage.jsx       # Login + Register
    │   │   ├── Dashboard.jsx      # Real-time stats dashboard
    │   │   ├── AICoach.jsx        # AI chat coach
    │   │   ├── Workouts.jsx       # Workout library
    │   │   ├── WorkoutPlan.jsx    # AI plan generator
    │   │   ├── Nutrition.jsx      # AI macro calculator
    │   │   ├── ActivityLog.jsx    # CRUD workout log
    │   │   ├── Progress.jsx       # Analytics + charts
    │   │   └── Goals.jsx          # Custom goal setting
    │   ├── components/
    │   │   └── Sidebar.jsx
    │   ├── utils/
    │   │   └── api.js             # All backend API calls
    │   ├── App.js
    │   └── index.css              # Design system + variables
    └── package.json
```

---

## Local Development Setup

### 1. Clone the repo
```bash
git clone https://github.com/mackk7/Fit-Ai.git
cd Fit-Ai
```

### 2. Get your free API keys
- **Groq** (AI) — [console.groq.com](https://console.groq.com) → free, no card needed
- **MongoDB Atlas** (database) — [mongodb.com/atlas](https://mongodb.com/atlas) → free M0 cluster

### 3. Backend setup
```bash
cd backend
npm install
cp .env.example .env
# Fill in your keys in .env
npm run dev
# Runs on http://localhost:5000
```

### 4. Frontend setup
```bash
cd frontend
npm install
echo "REACT_APP_API_URL=http://localhost:5000" > .env.local
npm start
# Runs on http://localhost:3000
```

---

## Environment Variables

### Backend (`backend/.env`)
| Variable | Description |
|----------|-------------|
| `GROQ_API_KEY` | Groq API key from console.groq.com |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Any long random string |
| `JWT_EXPIRES_IN` | Token expiry e.g. `7d` |
| `PORT` | Server port (default `5000`) |
| `FRONTEND_URL` | Allowed CORS origin |

### Frontend (`frontend/.env.local`)
| Variable | Description |
|----------|-------------|
| `REACT_APP_API_URL` | Backend URL |

---

## API Endpoints

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login + get JWT |
| GET | `/api/auth/me` | Get current user |
| PATCH | `/api/auth/profile` | Update profile |

### Workout Logs
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/logs` | Get all user logs |
| POST | `/api/logs` | Add workout entry |
| PATCH | `/api/logs/:id` | Edit entry |
| DELETE | `/api/logs/:id` | Delete entry |
| GET | `/api/logs/stats` | Summary stats |

### AI
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/chat` | AI coach message |
| POST | `/api/workout-plan` | Generate workout plan |
| POST | `/api/nutrition` | Calculate macros |

### Stats & Goals
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/stats/dashboard` | Dashboard data |
| GET | `/api/stats/progress` | Progress analytics |
| GET | `/api/goals` | Get user goals |
| PUT | `/api/goals` | Save user goals |

---

## Deployment

### Backend — Render (Free)
1. Go to [render.com](https://render.com) → New Web Service
2. Connect GitHub repo → Root directory: `backend`
3. Build: `npm install` · Start: `node server.js`
4. Add all 6 environment variables in Render dashboard
5. Deploy → copy your URL e.g. `https://fitai-api.onrender.com`

### Frontend — Vercel (Free)
1. Go to [vercel.com](https://vercel.com) → Import GitHub repo
2. Root directory: `frontend`
3. Add env variable: `REACT_APP_API_URL=https://fitai-api.onrender.com`
4. Deploy → get your live URL

> **Note:** Render free tier sleeps after 15 min inactivity. First request may take ~30s to wake up.

---

## Resume Bullets

- Built and deployed a full-stack AI fitness web app using **React, Node.js, and Express**, implementing RESTful APIs with modular route architecture, middleware-based authentication, and clean separation of frontend and backend concerns
- Designed **MongoDB schemas** with Mongoose for 4 relational-style models (User, WorkoutLog, Goal, ChatMessage), handling data relationships, validation, and efficient querying for real-time analytics dashboards
- Developed a responsive, component-based **React frontend** with Context API for global state management, dynamic routing across 8 pages, and real-time UI updates reflecting live database changes without page refresh
- Integrated **Groq LLaMA 3.3 AI API** with multi-turn conversation handling and prompt engineering to deliver contextual fitness coaching, replacing and iterating across multiple AI providers (OpenAI, Gemini, Groq) to solve quota and compatibility issues in production

---

## License
MIT © 2026 mackk7
