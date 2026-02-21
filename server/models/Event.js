const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
    userId: { type: String, required: true, index: true },
    id: { type: String, required: true, unique: true }, // Internal UUID
    title: { type: String, required: true },
    date: { type: Date, required: true },
    isAllDay: { type: Boolean, default: false },
    color: { type: String, default: '#3b82f6' },
    icon: { type: String, default: '📅' },
    category: {
        type: String,
        enum: ['birthday', 'meeting', 'special_day', 'other'],
        default: 'other'
    },
    recurrence: {
        type: String,
        enum: ['none', 'daily', 'weekly', 'monthly', 'yearly'],
        default: 'none'
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Event', EventSchema);
