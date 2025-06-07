// src/features/notes/pages/HomePage.js
import React, { useState, useEffect, useCallback } from 'react';
import Notepad from '../components/Notepad'; 
import { FaPlus, FaTrash, FaRegStickyNote, FaEdit, FaSpinner } from 'react-icons/fa';
import api from '../../../services/api';

import homePageBgImage from '../../../assets/images/notepad.jpg'; // Adjust path if necessary

function HomePage() {
    const [notes, setNotes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingNote, setEditingNote] = useState(null);

    const fetchNotes = useCallback(async (isInitialLoad = false) => {
        if (!isInitialLoad) {
            console.log("Attempting to refresh notes from API after save/update...");
        } else {
            console.log("Attempting to fetch initial notes from API...");
        }
        setIsLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        if (!token) {
            console.warn("fetchNotes: No token found. Aborting.");
            setIsLoading(false);
            setNotes([]);
            return;
        }
        try {
            const response = await api.get('/notes', {
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache', 'Expires': '0',
                },
            });
            if (response.data && Array.isArray(response.data.notes)) {
                setNotes(response.data.notes);
            } else {
                setNotes([]);
                setError("Received invalid data format from the server.");
            }
        } catch (err) {
            const errorMsg = err.response?.data?.msg || err.message || 'Could not fetch notes.';
            if (err.response?.status === 401) {
                 setError(`Authentication error: ${errorMsg}. Redirecting to login...`);
            } else {
                setError(`Failed to load notes: ${errorMsg}`);
            }
            setNotes([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNotes(true);
        return () => { console.log("HomePage Effect: Component unmounting."); };
    }, [fetchNotes]);

    const handleSaveOrUpdateSuccess = () => {
        setShowAddForm(false);
        setEditingNote(null);
        fetchNotes();
    };
    const handleCancelAddOrEdit = () => {
        setShowAddForm(false);
        setEditingNote(null);
    };
    const handleStartEdit = useCallback((noteToEdit) => {
        setEditingNote(noteToEdit);
        setShowAddForm(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);
    const handleDeleteNote = useCallback(async (noteId) => {
        if (!noteId || !window.confirm(`Are you sure you want to delete this note? This action cannot be undone.`)) return;
        try {
            await api.delete(`/notes/${noteId}`);
            fetchNotes();
            if (editingNote && editingNote._id === noteId) setEditingNote(null);
        } catch (err) {
            const errorMsg = err.response?.data?.msg || err.message || 'Could not delete note.';
            setError(`Failed to delete note: ${errorMsg}`);
        }
    }, [fetchNotes, editingNote]);
    const formatDate = useCallback((timestampString) => {
        if (!timestampString) return 'Date unknown';
        try {
            const date = new Date(timestampString);
            if (isNaN(date.getTime())) return 'Invalid date';
            return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        } catch (e) { return 'Invalid date format'; }
    }, []);


    return (
        // Main container for the page, relative positioning context for the background
        <div className="relative min-h-screen">
            {/* Blurred Background Image Layer */}
            <div
                className="absolute inset-0 h-full w-full bg-cover bg-center bg-no-repeat blur-md brightness-90 z-0"
                style={{ backgroundImage: `url(${homePageBgImage})` }}
                aria-hidden="true"
            ></div>
            {/* Content wrapper with higher z-index */}
            <div className="relative z-10 mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 bg-gray-100/70 backdrop-blur-sm rounded-lg my-8 shadow-lg">
            
                <div className="mb-8 flex flex-col items-center justify-between border-b border-gray-300 pb-4 sm:flex-row sm:pb-6">
                    <h1 className="mb-4 text-2xl font-bold text-gray-800 sm:mb-0 sm:text-3xl">My Notes</h1>
                    {!showAddForm && !editingNote && (
                        <button
                            onClick={() => { setShowAddForm(true); setEditingNote(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                            className="inline-flex transform items-center rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-transform hover:scale-105 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:px-5 sm:py-2.5 sm:text-base"
                            aria-label="Add new note"
                        >
                            <FaPlus className="-ml-1 mr-2 h-5 w-5" />
                            <span>Add Note</span>
                        </button>
                    )}
                </div>

                {(showAddForm || editingNote) && (
                    // The Notepad component itself has a white background, which is good for readability here
                    <div className="animate-fade-in mb-8"> 
                        <Notepad
                            noteToEdit={editingNote}
                            onSaveSuccess={handleSaveOrUpdateSuccess}
                            onCancel={handleCancelAddOrEdit}
                        />
                    </div>
                )}

                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-12 text-center bg-white/70 rounded-lg p-6 shadow"> {/* Background for loading */}
                        <FaSpinner className="h-8 w-8 animate-spin text-indigo-600 sm:h-10 sm:w-10" />
                        <p className="mt-3 text-sm text-gray-700 sm:text-base">Loading notes...</p>
                    </div>
                )}

                {!isLoading && error && (
                     <div className="my-8 rounded-md border-l-4 border-red-500 bg-red-50 p-4 py-6 shadow-lg" role="alert"> {/* Stronger shadow */}
                        <div className="flex">
                            <div className="ml-3">
                                <p className="text-base font-bold text-red-800">Error</p>
                                <p className="mt-1 text-sm text-red-700">{error}</p>
                            </div>
                        </div>
                     </div>
                 )}

                {!isLoading && !error && (
                    <div className={notes.length > 0 ? 'bg-white/50 backdrop-blur-sm p-4 rounded-lg shadow' : ''}> {/* Optional background for notes list if it exists */}
                        {notes.length === 0 && !showAddForm && !editingNote && (
                            <div className="mt-8 rounded-lg border-2 border-dashed border-gray-400 bg-gray-200/80 px-6 py-16 text-center shadow-inner sm:py-24"> {/* Slightly transparent empty state */}
                                <FaRegStickyNote className="mx-auto h-16 w-16 text-gray-500 sm:h-20 sm:w-20" />
                               <h3 className="mt-4 text-base font-medium text-gray-800 sm:text-lg">No notes yet!</h3>
                                <p className="mt-2 text-sm text-gray-600 sm:text-base">Looks like your notebook is empty. Ready to jot down your first thought?</p>
                                <div className="mt-6">
                                    <button
                                        onClick={() => { setShowAddForm(true); setEditingNote(null); window.scrollTo({ top: 0, behavior: 'smooth' });}}
                                        className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                    >
                                        <FaPlus className="-ml-1 mr-2 h-5 w-5" />
                                        Create First Note
                                    </button>
                                </div>
                           </div>
                        )}

                        {notes.length > 0 && (
                            // Note cards already have a solid white background, so they will contrast well
                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {notes.map((note) => (
                                    <div key={note._id} className="flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg transition-shadow duration-200 hover:shadow-2xl"> {/* Enhanced shadow */}
                                        <div className="flex-grow px-4 py-5 sm:p-6">
                                            {note.title && (
                                                <h4 className="mb-2 truncate text-base font-semibold text-gray-800 sm:text-lg" title={note.title}>
                                                    {note.title}
                                                </h4>
                                            )}
                                            <p className={`text-sm leading-relaxed text-gray-600 whitespace-pre-wrap break-words sm:text-base ${!note.title ? 'font-medium' : ''}`}>
                                                {note.content}
                                            </p>
                                        </div>
                                        <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-4 py-3 text-xs sm:px-6 sm:text-sm">
                                            <p className="mr-2 truncate text-gray-500" title={`Created: ${new Date(note.createdAt).toLocaleString()} | Updated: ${new Date(note.updatedAt || note.createdAt).toLocaleString()}`}>
                                                {formatDate(note.updatedAt || note.createdAt)}
                                            </p>
                                            <div className="flex items-center space-x-1 sm:space-x-2">
                                                <button
                                                    onClick={() => handleStartEdit(note)}
                                                    className="rounded-full p-1.5 text-gray-400 transition-colors duration-150 hover:bg-blue-100 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                                                    aria-label={`Edit note ${note.title ? `titled ${note.title}` : 'untitled'}`}
                                                    title="Edit Note"
                                                >
                                                   <FaEdit className="h-4 w-4 sm:h-5 sm:w-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteNote(note._id)}
                                                    className="rounded-full p-1.5 text-gray-400 transition-colors duration-150 hover:bg-red-100 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                                                    aria-label={`Delete note ${note.title ? `titled ${note.title}` : 'untitled'}`}
                                                    title="Delete Note"
                                                >
                                                    <FaTrash className="h-4 w-4 sm:h-5 sm:w-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div> {/* End of actual page content wrapper */}
        </div> // End of main relative container
    );
}
export default HomePage;