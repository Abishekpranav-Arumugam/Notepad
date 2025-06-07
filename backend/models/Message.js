// backend/models/Message.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    room: {
        type: String, // Can be a room ID or a general room name like 'general'
        required: true,
        index: true,
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    senderUsername: { // Denormalize username for easier display
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
        trim: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Message', messageSchema);