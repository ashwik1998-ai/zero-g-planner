require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Mission = require('./models/Mission');

const app = express();
app.use(cors());
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
            userId: user.email, // Using email as ID for simplicity
            taskId: task.id,
            title: task.title,
            status: task.status,
            urgency: task.urgency,
            deadline: task.deadline,
            createdAt: task.createdAt,
            xpAwarded: task.xpAwarded
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

app.listen(PORT, () => {
    console.log(`\n🚀 Zero-G Backend running on http://localhost:${PORT}`);
    console.log(`📡 Connected to MongoDB Atlas...`);
});
