// src/components/Notepad.js
import React, { useState, useEffect } from 'react';
import api from '../../../services/api'; // Import your API utility

// Component accepts noteToEdit for editing mode
function Notepad({ noteToEdit, onSaveSuccess, onCancel }) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (noteToEdit) {
            console.log("Notepad Effect: Pre-filling form for editing using API data.", noteToEdit);
            setTitle(noteToEdit.title || '');
            setContent(noteToEdit.content || '');
            setError(null);
        } else {
            console.log("Notepad Effect: Clearing form for adding new note.");
            setTitle('');
            setContent('');
            setError(null);
        }
    }, [noteToEdit]);

    const handleSave = async () => {
        if (!content.trim()) {
            setError("Note content cannot be empty.");
            return;
        }
        if (title && title.length > 150) {
            setError("Title is too long (max 150 characters).");
            return;
        }

        setError(null);
        setIsSaving(true);

        const noteData = {
             title: title.trim(),
             content: content.trim(),
        };

        try {
            if (noteToEdit && noteToEdit._id) {
                const noteId = noteToEdit._id;
                console.log(`Attempting to UPDATE note ID via API PUT /notes/${noteId}`);
                await api.put(`/notes/${noteId}`, noteData);
                console.log("Note updated successfully via API");
            } else {
                console.log(`Attempting to ADD new note via API POST /notes`);
                await api.post('/notes', noteData);
                console.log("Note added successfully via API");
            }

            setIsSaving(false);
            if (onSaveSuccess) {
                onSaveSuccess();
            }
        } catch (err) {
            console.error("Error saving note via API:", err);
            const errorMsg = err.response?.data?.msg || err.message || 'Could not save note.';
            setError(`Failed to save note: ${errorMsg}`);
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        console.log("Notepad: Cancel button clicked.");
        setError(null);
        if (onCancel) {
            onCancel();
        }
    };

    const isEditing = !!noteToEdit;

    return (
        <div className="mb-8 rounded-lg border border-gray-200 bg-white p-4 shadow-lg transition-all sm:p-6">
            <h3 className="mb-4 text-lg font-medium leading-6 text-gray-900 sm:text-xl">
                {isEditing ? 'Edit Note' : 'Add New Note'}
            </h3>

            {error && (
                <div className="mb-4 rounded-md border-l-4 border-red-400 bg-red-50 p-4" role="alert">
                    <p className="text-sm font-medium text-red-700">{error}</p>
                </div>
             )}

            <div className="space-y-4">
                 <div>
                    <label htmlFor="note-title" className="mb-1 block text-sm font-medium text-gray-700">
                         Title <span className="text-xs text-gray-500">(Optional)</span>
                     </label>
                     <input
                        type="text"
                        id="note-title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="E.g., Project Ideas, Meeting Summary"
                        className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        disabled={isSaving}
                        maxLength={150}
                     />
                 </div>
                 <div>
                     <label htmlFor="note-content" className="mb-1 block text-sm font-medium text-gray-700">
                        Content<span className="text-red-500">*</span>
                     </label>
                    <textarea
                        id="note-content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows="5" // Increased rows for better usability
                        placeholder="Enter your note details here..."
                        className="block w-full resize-y rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        required
                        disabled={isSaving}
                    />
                 </div>
            </div>

            <div className="mt-5 space-y-3 sm:mt-6 sm:flex sm:flex-row-reverse sm:space-x-3 sm:space-y-0 sm:space-x-reverse">
                 <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving || !content.trim()}
                    className={`inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm ${isSaving || !content.trim() ? 'cursor-not-allowed opacity-50' : ''}`}
                >
                     {isSaving ? (isEditing ? 'Updating...' : 'Saving...') : (isEditing ? 'Update Note' : 'Save Note')}
                </button>
                 <button
                    type="button"
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm disabled:opacity-50"
                 >
                    Cancel
                 </button>
            </div>
        </div>
    );
}

export default Notepad;