// backend/models/Note.js
const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema(
    {
        userId: { // This will store the Firebase UID
            type: String,
            required: true,
            index: true, // Index for faster querying by user
        },
        title: {
            type: String,
            trim: true, // Remove leading/trailing whitespace
            // required: false // Title is optional as per frontend
        },
        content: {
            type: String,
            required: [true, 'Note content cannot be empty'],
        },
        // Timestamps will add createdAt and updatedAt automatically
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Note', NoteSchema);