// backend/routes/notes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth'); // Your existing auth middleware
const Note = require('../models/Note'); // Import the Note model

// @route   POST api/notes
// @desc    Create a new note for the logged-in user
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
    const { title, content } = req.body;
    const userId = req.user.uid; // Get Firebase UID from middleware

    // Basic validation
    if (!content) {
        return res.status(400).json({ msg: 'Note content is required.' });
    }

    try {
        const newNote = new Note({
            userId: userId, // Associate note with the authenticated user
            title: title, // Can be null/undefined if not provided
            content: content,
        });

        const savedNote = await newNote.save();
        res.status(201).json(savedNote); // Return the newly created note
    } catch (err) {
        console.error('Error creating note:', err.message);
        res.status(500).json({ msg: 'Server Error: Could not save note.' });
    }
});

// @route   GET api/notes
// @desc    Get all notes for the logged-in user
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
    const userId = req.user.uid; // Get Firebase UID from middleware

    try {
        // Find all notes where userId matches the authenticated user's UID
        // Sort by newest first (optional, but common)
        const userNotes = await Note.find({ userId: userId }).sort({ createdAt: -1 });

        // Send the notes back in the format expected by the frontend
        res.json({ notes: userNotes });
    } catch (err) {
        console.error('Error fetching notes:', err.message);
        res.status(500).json({ msg: 'Server Error: Could not retrieve notes.' });
    }
});

// @route   DELETE api/notes/:id
// @desc    Delete a specific note by its ID, belonging to the logged-in user
// @access  Private
router.delete('/:id', authMiddleware, async (req, res) => {
    const userId = req.user.uid; // Get Firebase UID from middleware
    const noteId = req.params.id;

    try {
        // Find the note by its MongoDB _id
        const note = await Note.findById(noteId);

        // 1. Check if the note exists
        if (!note) {
            return res.status(404).json({ msg: 'Note not found.' });
        }

        // 2. SECURITY CHECK: Verify the note belongs to the requesting user
        if (note.userId.toString() !== userId) {
            // Use toString() just in case comparison issues arise, though UID should be string
            console.warn(`Unauthorized attempt to delete note ${noteId} by user ${userId}. Note belongs to ${note.userId}.`);
            // Return 403 Forbidden or 404 Not Found (404 hides existence)
            return res.status(404).json({ msg: 'Note not found.' }); // More secure
            // return res.status(403).json({ msg: 'Authorization denied.' }); // Less secure
        }

        // If checks pass, delete the note
        // await note.remove(); // Deprecated
        await Note.findByIdAndDelete(noteId);


        res.json({ msg: 'Note successfully deleted.' });
    } catch (err) {
        console.error('Error deleting note:', err.message);
        // Handle potential CastError if the ID format is invalid
        if (err.kind === 'ObjectId') {
             return res.status(400).json({ msg: 'Invalid note ID format.' });
        }
        res.status(500).json({ msg: 'Server Error: Could not delete note.' });
    }
});

router.put('/:id', authMiddleware, async (req, res) => {
    const { title, content } = req.body;
    const userId = req.user.uid;
    const noteId = req.params.id;

    // Build note object based on fields submitted
    const noteFields = {};
    if (title !== undefined) noteFields.title = title; // Allow clearing title
    if (content !== undefined) noteFields.content = content; // Allow updating content

    // Basic validation: Cannot have empty content if it's being updated
    if (noteFields.content !== undefined && !noteFields.content) {
        return res.status(400).json({ msg: 'Note content cannot be empty.' });
    }

    try {
        let note = await Note.findById(noteId);

        if (!note) {
            return res.status(404).json({ msg: 'Note not found.' });
        }

        // Verify ownership
        if (note.userId.toString() !== userId) {
             console.warn(`Unauthorized attempt to update note ${noteId} by user ${userId}. Note belongs to ${note.userId}.`);
            return res.status(404).json({ msg: 'Note not found.' });
        }

        // Update the note
        note = await Note.findByIdAndUpdate(
            noteId,
            { $set: noteFields },
            { new: true, runValidators: true } // Return the updated doc, run schema validators
        );

        res.json(note); // Return the updated note
    } catch (err) {
        console.error('Error updating note:', err.message);
        if (err.kind === 'ObjectId') {
             return res.status(400).json({ msg: 'Invalid note ID format.' });
        }
        res.status(500).json({ msg: 'Server Error: Could not update note.' });
    }
});
// --- End Optional Update Endpoint ---


module.exports = router;