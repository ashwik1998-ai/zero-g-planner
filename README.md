# 🪐 Zero-G Planner

**Zero-G Planner** is a sci-fi themed productivity application that gamifies task management. It visualizes your daily tasks as planets orbiting a star, where urgency determines orbit distance. Complete missions to earn XP, level up your commander rank, and unlock new cosmic themes.

![Zero-G Screenshot](/public/screenshot.png)

## 🚀 Key Features

### 🎮 Gamified Productivity
- **Orbital Visualization**: Tasks are planets. Urgent tasks orbit closer to the sun; less urgent ones drift in the outer rim.
- **XP & Leveling System**:
  - **Cadet (Lvl 1)** → **Pilot (Lvl 2)** → **Commander (Lvl 3)** → **Ace (Lvl 4)**
  - Unlocks: New planet skins, orbital rings, and sound effects at each rank.
- **Achievements**: Earn badges for streaks (🔥), volume (💯), night owl work (🌙), and more.
- **Leaderboard**: Compete globally with other commanders for highest XP.

### 🤖 ARIA AI Co-Pilot
- **Integrated AI Chat**: Powered by **Groq (Llama 3.3 70B)**.
- **Context-Aware**: ARIA reads your real-time MongoDB mission logs.
- **Natural Language**: Ask "What's overdue?", "How productive was I this week?", or "Suggest a plan for today."

### 🛠️ Strategic Tools
- **Mission Control Dashboard**: Analytics grid showing completion rates, category breakdown, and productivity score.
- **Focus Mode**: Built-in Pomodoro timer with ambient space sounds (Deep Space, Space Station, Alpha Waves).
- **Cross-Device Sync**: Real-time synchronization via MongoDB Atlas. Start on desktop, finish on mobile.
- **PWA Capabilities**: Installable on mobile with touch-optimized "Quick Add" sheet and haptic feedback.

### 📱 Mobile Experience
- **Vertical Scroll Layout**: A seamless, app-like experience stacking the 3D view, calendar, and mission log.
- **Touch Controls**:
  - **Swipe** to rotate the celestial sphere.
  - **Pinch** to zoom in/out of the 3D view.
  - **floating Action Button (FAB)** for quick mission entry.


---

## 🛠️ Tech Stack

### Frontend
- **React 18** (Vite)
- **Three.js / React Three Fiber** (3D rendering)
- **Framer Motion** (UI animations)
- **Clerk** (Authentication)
- **Zustand** (State management)
- **Groq SDK** (AI integration)

### Backend
- **Node.js / Express**
- **MongoDB Atlas** (Mongoose)
- **Render** (Hosting)

---

## 📦 Installation

### Prerequisites
- Node.js 18+
- MongoDB Atlas Cluster
- Clerk Account
- Groq API Key

### 1. Clone & Install
```bash
git clone https://github.com/yourusername/zero-g-planner.git
cd zero-g-planner

# Install dependencies (root = frontend)
npm install

# Install backend dependencies
cd server
npm install
```

### 2. Environment Setup
Create `.env` in the **root** directory:
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_API_URL=http://localhost:3001
VITE_BACKEND_URL=http://localhost:3001
```

Create `.env` in the **server** directory:
```env
MONGO_URI=mongodb+srv://...
PORT=3001
GROQ_API_KEY=gsk_...
```

### 3. Run Locally
**Terminal 1 (Backend):**
```bash
cd server
node server.js
```

**Terminal 2 (Frontend):**
```bash
npm run dev
```
Open `http://localhost:5173`.

---

## 🛰️ Deployment

### Frontend (Vercel)
1. Import repo to Vercel.
2. Set Environment Variables:
   - `VITE_CLERK_PUBLISHABLE_KEY`
   - `VITE_API_URL` (Your Render backend URL)
   - `VITE_BACKEND_URL` (Your Render backend URL)

### Backend (Render)
1. Create new Web Service on Render.
2. Root Directory: `server`
3. Build Command: `npm install`
4. Start Command: `node server.js`
5. Environment Variables:
   - `MONGO_URI`
   - `GROQ_API_KEY`
