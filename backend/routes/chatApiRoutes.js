// backend/routes/chatApiRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware'); // Your existing JWT auth middleware
const Message = require('../models/Message');
// const ChatRoom = require('../models/ChatRoom'); // If you create a ChatRoom model

// Get messages for a specific room (paginated)
router.get('/rooms/:roomName/messages', authMiddleware, async (req, res) => {
    try {
        const { roomName } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        const messages = await Message.find({ room: roomName })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('sender', 'username _id')
            .lean();

        const totalMessages = await Message.countDocuments({ room: roomName });

        res.json({
            messages: messages.reverse(),
            currentPage: page,
            totalPages: Math.ceil(totalMessages / limit),
            totalMessages
        });
    } catch (error) {
        console.error('Error fetching room messages:', error);
        res.status(500).json({ msg: 'Server error' });
    }
});

// You could add routes to create rooms, get user's rooms, etc.
// POST /rooms - create a new room
// GET /rooms - get list of rooms user is part of

module.exports = router;