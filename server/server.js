/**
 * 🪐 Zero-G Planner — Backend Server
 * 
 * This is the main entry point for the backend API.
 * It connects to MongoDB Atlas and provides endpoints for:
 * 1. Managing Missions (Create, Read, Update, Delete)
 * 2. Updating Leaderboard Stats
 * 3. Handling AI Chat requests via Groq
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Mission = require('./models/Mission');
const Leaderboard = require('./models/Leaderboard');
const Event = require('./models/Event');

const app = express();

// --- Middleware Configuration ---
// Enable CORS to allow requests from any origin (e.g., localhost or Vercel)
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json()); // Parse JSON bodies


const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI;

// --- MONGODB CONNECTION ---
// Connects to the database using the URI from .env file
mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB Atlas'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// --- BASE ROUTE ---
// Simple health check to verify server is running
app.get('/', (req, res) => {
    res.send('Zero-G Mission Control Server Online (MongoDB Edition) 🚀');
});

// --- MISSION ROUTES ---

/**
 * GET /api/missions
 * Retrieves all missions for a specific user.
 * Query Param: userId (string)
 */
app.get('/api/missions', async (req, res) => {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'Missing userId parameter' });

    try {
        const missions = await Mission.find({ userId });
        res.json(missions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * POST /api/missions/sync
 * Creates or Updates a mission based on its taskId (UUID).
 * Uses 'upsert' to handle both creation and updates in one go.
 */
app.post('/api/missions/sync', async (req, res) => {
    const { task, user } = req.body;

    if (!task || !user) {
        return res.status(400).json({ success: false, error: "Missing task or user data" });
    }

    try {
        const missionData = {
            userId: user.email,
            taskId: task.id,
            title: task.title,
            status: task.status,
            urgency: task.urgency,
            deadline: task.deadline,
            createdAt: task.createdAt,
            xpAwarded: task.xpAwarded,
            color: task.color || '#00cc88',
            description: task.description || '',
            // New fields from the updated schema, if provided in task
            category: task.category,
            recurrence: task.recurrence,
            subtasks: task.subtasks,
            groupId: task.groupId,
            completionNote: task.completionNote,
            reminderOffset: task.reminderOffset || 0,
        };


        // Upsert: Update if exists, Insert if new
        const result = await Mission.findOneAndUpdate(
            { taskId: task.id },
            missionData,
            { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
        );

        console.log(`✅ Synced task "${task.title}" for ${user.email}`);
        res.json({ success: true, mission: result });

    } catch (error) {
        console.error("❌ Sync Error:", error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// DELETE: Remove Task
app.delete('/api/missions/:taskId', async (req, res) => {
    const { taskId } = req.params;
    try {
        const result = await Mission.findOneAndDelete({ taskId });
        if (result) {
            console.log(`🗑️ Deleted task "${result.title}"`);
            res.json({ success: true });
        } else {
            res.status(404).json({ success: false, error: 'Task not found' });
        }
    } catch (error) {
        console.error("❌ Delete Error:", error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// --- EVENT ROUTES ---

/**
 * Helper to schedule notifications via OneSignal
 * - Push (Standard Desktop/Mobile Notification)
 */
async function scheduleOneSignalEvent(event, userEmail) {
    const ONESIGNAL_APP_ID = process.env.VITE_ONESIGNAL_APP_ID || process.env.ONESIGNAL_APP_ID;
    const ONESIGNAL_REST_API_KEY = process.env.ONESIGNAL_REST_API_KEY;

    // Check if event is in the past
    if (new Date(event.date) < new Date()) return;

    if (!ONESIGNAL_APP_ID || !ONESIGNAL_REST_API_KEY) {
        console.log(`[OneSignal] Skipped scheduling "${event.title}" - Missing API Keys.`);
        return;
    }
    // Calculate offset
    const offsetMinutes = event.reminderOffset || 0;
    const targetDate = new Date(event.date);
    if (offsetMinutes > 0) {
        targetDate.setMinutes(targetDate.getMinutes() - offsetMinutes);
    }

    // Check if the scheduled time is already in the past
    if (targetDate < new Date()) {
        console.log(`[OneSignal] Skipped scheduling "${event.title}" - Send time is in the past.`);
        return;
    }

    const sendAfter = targetDate.toISOString();

    try {
        const payload = {
            app_id: ONESIGNAL_APP_ID,
            include_aliases: { "external_id": [userEmail] },
            send_after: sendAfter,
            target_channel: "push",
            headings: { en: "🗓️ Upcoming Special Event" },
            contents: { en: event.title }
        };

        const response = await fetch('https://onesignal.com/api/v1/notifications', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${ONESIGNAL_REST_API_KEY}`
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (data.id) {
            console.log(`[OneSignal] ✅ Scheduled Push for "${event.title}"`);
        } else {
            console.warn(`[OneSignal] ⚠️ Push failed:`, data);
        }

    } catch (error) {
        console.error(`[OneSignal] ❌ Routing Error:`, error.message);
    }
}

/**
 * GET /api/events
 * Retrieves all events for a specific user.
 */
app.get('/api/events', async (req, res) => {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'Missing userId parameter' });

    try {
        const events = await Event.find({ userId });
        res.json(events);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * POST /api/events/sync
 * Creates or Updates an event based on its ID.
 */
app.post('/api/events/sync', async (req, res) => {
    const { event, user } = req.body;

    if (!event || !user) {
        return res.status(400).json({ success: false, error: "Missing event or user data" });
    }

    try {
        const eventData = {
            userId: user.email,
            id: event.id,
            title: event.title,
            date: event.date,
            isAllDay: event.isAllDay || false,
            color: event.color || '#3b82f6',
            icon: event.icon || '📅',
            category: event.category || 'other',
            recurrence: event.recurrence || 'none',
        };

        const result = await Event.findOneAndUpdate(
            { id: event.id, userId: user.email },
            eventData,
            { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
        );

        // Schedule Notification
        scheduleOneSignalEvent(eventData, user.email);

        console.log(`📅 Synced event "${event.title}" for ${user.email}`);
        res.json({ success: true, event: result });

    } catch (error) {
        console.error("❌ Event Sync Error:", error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// DELETE: Remove Event
app.delete('/api/events/:id', async (req, res) => {
    const { id } = req.params;
    const { userId } = req.query;

    if (!userId) return res.status(400).json({ error: 'Missing userId parameter' });

    try {
        const result = await Event.findOneAndDelete({ id, userId });
        if (result) {
            console.log(`🗑️ Deleted event "${result.title}"`);
            res.json({ success: true });
        } else {
            res.status(404).json({ success: false, error: 'Event not found' });
        }
    } catch (error) {
        console.error("❌ Delete Event Error:", error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// --- LEADERBOARD ROUTES ---

/**
 * GET /api/leaderboard
 * Returns top 50 commanders sorted by XP (descending).
 */
app.get('/api/leaderboard', async (req, res) => {
    try {
        const board = await Leaderboard.find().sort({ xp: -1 }).limit(50);
        res.json(board);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * POST /api/leaderboard/sync
 * Updates a user's XP, Level, and Profile info on the leaderboard.
 */
app.post('/api/leaderboard/sync', async (req, res) => {
    const { userId, displayName, avatar, xp, level, streak, achievements, lastCompletedDate, soundTheme } = req.body;
    try {
        const entry = await Leaderboard.findOneAndUpdate(
            { userId },
            {
                displayName, avatar, xp, level,
                streak: streak || 0,
                achievements: achievements || [],
                lastCompletedDate: lastCompletedDate || null,
                soundTheme: soundTheme, // Add soundTheme here
                lastSync: new Date()
            },
            { upsert: true, returnDocument: 'after' }
        );
        res.json(entry);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /api/user/:userId
 * Retrieves specific user's stats for hydration.
 */
app.get('/api/user/:userId', async (req, res) => {
    try {
        const entry = await Leaderboard.findOne({ userId: req.params.userId });
        if (!entry) return res.status(404).json({ error: 'User not found' });
        res.json(entry);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- AI MISSION ASSISTANT (Groq Integration) ---

/**
 * POST /api/ai/chat
 * Handles chat requests. Fetches user's missions for context and sends to Groq.
 * Body: { userId, message, history }
 */
const Groq = require('groq-sdk');

app.post('/api/ai/chat', async (req, res) => {
    const { userId, message, history = [] } = req.body;
    if (!userId || !message) {
        return res.status(400).json({ error: 'Missing userId or message' });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'GROQ_API_KEY not configured on server' });
    }

    try {
        // Fetch user's missions from MongoDB
        const missions = await Mission.find({ userId }).lean();

        // Format missions as compact context
        const missionContext = missions.length === 0
            ? 'The user has no missions yet.'
            : missions.map(m => {
                const deadline = m.deadline ? new Date(m.deadline).toLocaleDateString() : 'No deadline';
                const status = m.status || 'active';
                return `- [${status.toUpperCase()}] "${m.title}" | Category: ${m.category || 'other'} | Deadline: ${deadline} | Urgency: ${m.urgency || 1}/5 | XP Awarded: ${m.xpAwarded ? 'Yes' : 'No'}`;
            }).join('\n');

        const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

        const systemPrompt = `You are ARIA (Artificial Reconnaissance & Intelligence Assistant), the AI co-pilot for Zero-G Planner — a space-themed productivity app. You help commanders (users) manage their missions (tasks).

Today's date: ${today}
Commander ID: ${userId}

Here are all of the commander's current missions:
${missionContext}

Guidelines:
- Refer to tasks as "missions", users as "commanders"  
- Be concise, helpful, and slightly space-themed  
- Answer based ONLY on the mission data above  
- If asked about productivity patterns, analyze the data insightfully  
- Keep responses under 150 words unless detailed analysis is requested`;

        const groq = new Groq({ apiKey });

        const messages = [
            { role: 'system', content: systemPrompt },
            ...history.slice(-8), // Keep last 8 messages for context
            { role: 'user', content: message }
        ];

        const completion = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages,
            max_tokens: 400,
            temperature: 0.7,
        });

        const reply = completion.choices[0]?.message?.content || 'Unable to process request.';
        console.log(`🤖 AI chat for ${userId}: "${message.substring(0, 50)}..."`);
        res.json({ reply });

    } catch (error) {
        console.error('❌ AI Chat Error:', error.message);
        res.status(500).json({ error: 'AI service unavailable. Check GROQ_API_KEY.' });
    }
});

// --- Server Start ---
app.listen(PORT, () => {
    console.log(`\n🚀 Zero-G Backend running on http://localhost:${PORT}`);
    console.log(`📡 Connected to MongoDB Atlas...`);
});
