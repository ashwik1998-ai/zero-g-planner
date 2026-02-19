# 🏗️ Zero-G Planner — Codebase Tour

This guide explains **how the code is organized** and how the different pieces fit together. It is designed to help developers understand the architecture.

## 📂 File Structure

### 1. `server/` (The Backend)
The brain of the operation. Runs on Node.js/Express.
- **`server.js`**: The main entry point.
  - Connects to MongoDB Atlas.
  - Defines API routes (`/api/missions`, `/api/leaderboard`, `/api/ai/chat`).
  - Handles the Groq AI integration.
- **`models/`**: Mongoose schemas defining data structure.
  - `Mission.js`: Schema for tasks (title, deadline, coordinates).
  - `Leaderboard.js`: Schema for user XP and rank.

### 2. `src/` (The Frontend)
The visual interface. Runs on React + Vite.

#### Core
- **`App.tsx`**: The root component.
  - Handles Authentication (Clerk).
  - Manages Global Layout (Canvas, Panels).
  - Contains the main state loops.
- **`main.tsx`**: React entry point, mounts App to DOM.
- **`index.css`**: Global styles, Scrollbar styling, Tailwind directives.

#### Key Components (`src/components/`)
- **`LandingPage.tsx`**: The first thing users see.
  - Contains the "How It Works" animations, Hero section, and Features grid.
- **`AIChat.tsx`**: The floating chat widget.
  - Manages chat state and API calls to Groq.
- **`OrbitDemo.tsx`**: The interactive 3D solar system on the landing page.
- **`MobileNavBar.tsx`**: The bottom navigation bar for mobile users.
- **`MissionLog.tsx`**: The side panel listing all tasks textually.
- **`CalendarWindow.tsx`**: The calendar date picker.

#### 3D Engine (`react-three-fiber`)
- **`App.tsx` contains the `<Canvas>`**:
  - `<Stars />`: Background starfield.
  - `<TimeRing />`: Visual representation of time.
  - `<CategoryRing />`: Colored rings indicating task categories.
  - `<BlackHole />`: Animation for deleted tasks.

#### State & Logic (`src/store/`, `src/services/`)
- **`useTaskStore.ts`**: (Zustand) Global state for tasks, XP, and level.
- **`MongoService.ts`**: API client. Handles fetching/saving data to the backend.
- **`SoundService.ts`**: Manages all SFX (hover, click, completion).

---

## 🔄 Data Flow

1.  **User Login**: Clerk authenticates user in `App.tsx`.
2.  **Initial Load**: `App.tsx` calls `MongoService.fetchMissions()`.
3.  **Backend Fetch**: `server.js` queries MongoDB for missions matching `userId`.
4.  **Render**:
    *   Missions are loaded into `useTaskStore`.
    *   `App.tsx` maps missions to 3D spheres in the `<Canvas>`.
    *   `MissionLog.tsx` maps missions to text rows.
5.  **Interaction**:
    *   User talks to AI → `AIChat.tsx` posts to `/api/ai/chat`.
    *   Server forwards to Groq API.
    *   Response returns to UI.

## 🛠️ Key Technologies
- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **3D**: Three.js, React Three Fiber, Drei
- **Backend**: Node.js, Express, Mongoose
- **Database**: MongoDB Atlas
- **AI**: Groq SDK (Llama 3)
