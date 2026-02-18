const mongoose = require('mongoose');

const MissionSchema = new mongoose.Schema({
    userId: { type: String, required: true, index: true }, // Clerk User ID or Email
    taskId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    status: { type: String, enum: ['active', 'completed'], default: 'active' },
    urgency: { type: Number, default: 1 },
    deadline: { type: Date },
    createdAt: { type: Date, default: Date.now },
    xpAwarded: { type: Boolean, default: false }
}, {
    timestamps: true
});

module.exports = mongoose.model('Mission', MissionSchema);
