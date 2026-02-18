const mongoose = require('mongoose');

const MissionSchema = new mongoose.Schema({
    userId: { type: String, required: true, index: true },
    taskId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    status: { type: String, enum: ['active', 'completed'], default: 'active' },
    urgency: { type: Number, default: 1 },
    deadline: { type: Date },
    createdAt: { type: Date, default: Date.now },
    xpAwarded: { type: Boolean, default: false },
    color: { type: String, default: '#00cc88' },
    description: { type: String, default: '' },
    category: { type: String },
    recurrence: { type: String },
    subtasks: { type: Array, default: [] },
    groupId: { type: String },
    completionNote: { type: String },
}, {
    timestamps: true
});

module.exports = mongoose.model('Mission', MissionSchema);
