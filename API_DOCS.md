# Zero-G Planner — API Documentation

Base URL: `http://localhost:3001` (Dev) / `https://zero-g-planner-backend.onrender.com` (Prod)

## 📡 Endpoints

### 1. Missions

#### **GET /api/missions**
Retrieve all missions for a specific user.
- **Query Params:**
  - `userId`: (string) User's email or Clerk ID
- **Response:** Array of `Mission` objects
```json
[
  {
    "_id": "65d4a...",
    "taskId": "uuid-v4...",
    "userId": "user@example.com",
    "title": "Complete Project",
    "status": "active",
    "deadline": "2024-03-01T12:00:00.000Z",
    "urgency": 5,
    "xpAwarded": false
  }
]
```

#### **POST /api/missions/sync**
Sync a single mission to the database (Create or Update).
- **Body:**
```json
{
  "taskId": "uuid-v4...",
  "userId": "user@example.com",
  "title": "New Mission",
  "status": "completed",
  "xpAwarded": true,
  // ...other fields
}
```
- **Response:** Updated `Mission` object

#### **DELETE /api/missions/:taskId**
Delete a mission by its UUID.
- **Response:** `{ message: "Mission deleted" }`

---

### 2. Leaderboard

#### **GET /api/leaderboard**
Get global top 50 commanders by XP.
- **Response:** Array of `Leaderboard` entries
```json
[
  {
    "displayName": "Commander Shep",
    "xp": 1500,
    "level": 4,
    "avatar": "https://img.clerk.com/..."
  }
]
```

#### **POST /api/leaderboard/sync**
Update user's XP and Level on the leaderboard.
- **Body:**
```json
{
  "userId": "user@example.com",
  "displayName": "New Name",
  "xp": 1200,
  "level": 3,
  "avatar": "..."
}
```

---

### 3. AI Assistant (ARIA)

#### **POST /api/ai/chat**
Send a message to ARIA. The backend fetches the user's mission context securely and forwards it to Groq.
- **Body:**
```json
{
  "userId": "user@example.com",
  "message": "What is my most urgent task?",
  "history": [
    { "role": "user", "content": "Hi" },
    { "role": "assistant", "content": "Hello Commander..." }
  ]
}
```
- **Response:** `{ reply: "Your most urgent task is 'Submit Report' due today." }`

---

## 🔒 Security
- All endpoints are protected by `userId` validation.
- CORS is configured to allow requests from `localhost` and the production Vercel domain.
