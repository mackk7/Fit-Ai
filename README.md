# FitAI — AI-Powered Personal Fitness Coach

A full-stack fitness coaching web app powered by **Node.js + Express** (backend) and **React** (frontend), with **OpenAI GPT-4o** AI integration for real-time coaching, workout plan generation, and nutrition calculation.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6 |
| Backend | Node.js, Express 4 |
| AI | OpenAI GPT-4o API |
| Styling | Custom CSS (no UI library) |
| Deployment | Vercel (frontend + backend) or AWS |

---

## Project Structure

```
fitai/
├── backend/
│   ├── server.js          # Express server + OpenAI integration
│   ├── package.json
│   ├── vercel.json        # Vercel serverless config
│   └── .env.example       # Environment variable template
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── App.js             # Root component + routing
    │   ├── index.js
    │   ├── index.css          # Global design system
    │   ├── components/
    │   │   └── Sidebar.jsx
    │   ├── pages/
    │   │   ├── Dashboard.jsx
    │   │   ├── AICoach.jsx        # ← Real-time AI chat
    │   │   ├── Workouts.jsx
    │   │   ├── WorkoutPlan.jsx    # ← AI plan generator
    │   │   ├── Nutrition.jsx      # ← AI macro calculator
    │   │   ├── ActivityLog.jsx
    │   │   └── Progress.jsx
    │   └── utils/
    │       └── api.js         # All backend API calls
    ├── package.json
    └── vercel.json
```

---

## Local Development Setup

### 1. Get an OpenAI API Key
- Go to https://platform.openai.com/api-keys
- Create a new secret key
- Copy it — you'll need it in the next step

### 2. Backend Setup

```bash
cd backend
npm install

# Create .env file
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY

npm run dev
# Backend runs on http://localhost:5000
```

### 3. Frontend Setup

```bash
cd frontend
npm install

# Create .env.local
echo "REACT_APP_API_URL=http://localhost:5000" > .env.local

npm start
# Frontend runs on http://localhost:3000
```

---

## API Endpoints

### `GET /api/health`
Health check — returns `{ status: "ok" }`

### `POST /api/chat`
AI coaching chat.
```json
Request:  { "messages": [{ "role": "user", "content": "Build me a workout plan" }] }
Response: { "reply": "...", "usage": { "total_tokens": 450 } }
```

### `POST /api/workout-plan`
Generate a custom workout plan.
```json
Request:  { "goal": "build muscle", "level": "intermediate", "days": 4, "equipment": "full gym" }
Response: { "plan": "DAY 1: Push Day\n..." }
```

### `POST /api/nutrition`
Calculate personalized macros.
```json
Request:  { "weight": 75, "height": 175, "age": 25, "gender": "male", "activityLevel": "moderately active", "goal": "build muscle" }
Response: { "nutrition": "BMR: 1820 kcal\nTDEE: 2820 kcal\n..." }
```

---

## Deployment

### Option A: Vercel (Recommended — Free)

**Deploy Backend:**
```bash
cd backend
npm install -g vercel
vercel login
vercel

# In Vercel dashboard → Settings → Environment Variables:
# Add: OPENAI_API_KEY = sk-your-key
# Add: FRONTEND_URL = https://your-frontend.vercel.app
```

**Deploy Frontend:**
```bash
cd frontend
# Edit .env.local → set REACT_APP_API_URL to your backend Vercel URL
vercel
```

### Option B: AWS (EC2 + S3/CloudFront)

**Backend on EC2:**
```bash
# On your EC2 instance (Ubuntu):
sudo apt update && sudo apt install nodejs npm nginx -y
git clone <your-repo>
cd fitai/backend
npm install

# Set environment variables
export OPENAI_API_KEY=sk-your-key
export PORT=5000
export FRONTEND_URL=https://your-cloudfront-domain.com

# Run with PM2 for persistence
npm install -g pm2
pm2 start server.js --name fitai-api
pm2 save && pm2 startup

# Configure Nginx as reverse proxy (port 80 → 5000)
```

**Frontend on S3 + CloudFront:**
```bash
cd frontend
REACT_APP_API_URL=https://your-ec2-ip-or-domain npm run build
# Upload /build folder contents to your S3 bucket
# Enable Static Website Hosting on S3
# Attach CloudFront distribution for HTTPS
```

---

## Environment Variables Reference

### Backend (.env)
| Variable | Description | Example |
|----------|-------------|---------|
| `OPENAI_API_KEY` | OpenAI secret key | `sk-proj-...` |
| `PORT` | Server port | `5000` |
| `FRONTEND_URL` | Allowed CORS origin | `https://fitai.vercel.app` |

### Frontend (.env.local)
| Variable | Description | Example |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend URL | `https://fitai-api.vercel.app` |

---

## Features

- **AI Chat Coach** — Multi-turn conversation with GPT-4o, persistent message history per session
- **Workout Plan Generator** — Input goal/level/days → AI generates a full weekly program
- **Nutrition Calculator** — BMR/TDEE + macro breakdown via AI
- **Workout Library** — Filter by type (Strength, Cardio, HIIT, Yoga)
- **Activity Log** — Session history with calories and time tracking
- **Progress Tracker** — Strength PRs, body composition, monthly goals
- **Rate Limiting** — 60 req/15min per IP to protect your OpenAI bill
- **CORS Protection** — Only your frontend domain can call the API
- **Helmet** — Security headers on all responses

---

## Resume Description

> Built a full-stack AI fitness coaching web application using **React** (frontend) and **Node.js/Express** (backend), integrated with **OpenAI GPT-4o** to deliver real-time personalized workout coaching, dynamic workout plan generation, and macro nutrition calculations. Implemented REST APIs with rate limiting, CORS protection, and security headers. Deployed on **Vercel** with environment-based configuration. Features include multi-turn AI chat, workout library with filtering, activity log, and progress analytics dashboard.

---

## License
MIT — free to use, modify, and deploy.
