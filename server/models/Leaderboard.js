const mongoose = require('mongoose');

const LeaderboardSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    displayName: { type: String, default: 'Commander' },
    avatar: { type: String, default: '' },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    streak: { type: Number, default: 0 },
    achievements: { type: [String], default: [] },
    lastCompletedDate: { type: String, default: null }, // ISO date string
    soundTheme: { type: String, default: 'default' },
    lastSync: { type: Date, default: Date.now },
}, {
    timestamps: true
});

module.exports = mongoose.model('Leaderboard', LeaderboardSchema);
