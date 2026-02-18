require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Mission = require('./models/Mission');

const app = express();

// Explicit CORS: allow all origins (needed for Vercel -> Render communication)
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());


const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI;

// --- MONGODB CONNECTION ---
mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB Atlas'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// --- ROUTES ---

app.get('/', (req, res) => {
    res.send('Zero-G Mission Control Server Online (MongoDB Edition) 🚀');
});

// GET: Fetch user missions
app.get('/api/missions', async (req, res) => {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'Missing userId' });

    try {
        const missions = await Mission.find({ userId });
        res.json({ success: true, missions });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST: Sync/Upsert Task
app.post('/api/sync', async (req, res) => {
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
        };


        // Upsert: Update if exists, Insert if new
        const result = await Mission.findOneAndUpdate(
            { taskId: task.id },
            missionData,
            { upsert: true, new: true, setDefaultsOnInsert: true }
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

// --- Leaderboard Routes ---
app.get('/api/leaderboard', async (req, res) => {
    try {
        const board = await Leaderboard.find().sort({ xp: -1 }).limit(50);
        res.json(board);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/leaderboard/sync', async (req, res) => {
    const { userId, displayName, avatar, xp, level } = req.body;
    try {
        const entry = await Leaderboard.findOneAndUpdate(
            { userId },
            { displayName, avatar, xp, level, lastSync: new Date() },
            { upsert: true, new: true }
        );
        res.json(entry);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Server Start ---
app.listen(PORT, () => {
    console.log(`\n🚀 Zero-G Backend running on http://localhost:${PORT}`);
    console.log(`📡 Connected to MongoDB Atlas...`);
});
