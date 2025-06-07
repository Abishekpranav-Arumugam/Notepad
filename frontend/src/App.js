// src/App.js
import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import LoginPage from './features/auth/pages/LoginPage';
import SignupPage from './features/auth/pages/SignupPage';
import DashboardPage from './features/profile/pages/DashboardPage';
import HomePage from './features/notes/pages/HomePage';
import ProtectedRoute from './features/auth/components/ProtectedRoute';
import Navbar from './features/notes/components/Navbar'; 
import './App.css';
import { auth } from './services/firebase';
import { onAuthStateChanged } from "firebase/auth"; 
import ForgotPasswordPage from './features/auth/pages/ForgotPasswordPage';
import landingPageBackgroundImage from './assets/images/dashboard.webp'; 


// --- Main App Component ---
function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loadingAuth, setLoadingAuth] = useState(true);

    useEffect(() => {
        console.log("App.js: Setting up Firebase Auth listener...");
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                console.log("App.js: onAuthStateChanged - User detected (Firebase):", user.uid);
                setIsAuthenticated(true);
                const customToken = localStorage.getItem('token');
                if (!customToken) {
                     console.warn("App.js: Firebase user detected, but NO custom JWT found in localStorage. API calls will likely fail.");
                } else {
                    console.log("App.js: Custom JWT found in localStorage.");
                }
            } else {
                console.log("App.js: onAuthStateChanged - User logged out (Firebase).");
                setIsAuthenticated(false);
                console.log("App.js: Removing custom JWT from localStorage due to Firebase logout.");
                localStorage.removeItem('token'); // Keep this here to ensure token is cleared on Firebase logout
            }
            setLoadingAuth(false);
            console.log(`App.js: Auth loading complete. isAuthenticated: ${!!user}`);
        });

        return () => {
            console.log("App.js: Cleaning up Firebase Auth listener.");
            unsubscribe();
        };
    }, []);

    if (loadingAuth) {
        return (
            <div className="flex h-screen items-center justify-center">
                 <div className="text-center py-8 text-lg font-medium text-gray-600">Loading Session...</div>
                 {/* You can add a spinner icon here if desired */}
            </div>
        );
    }

    return (
        <Router>
            {/* Pass isAuthenticated and setIsAuthenticated to AppContent so it can pass to Navbar */}
            <AppContent isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />
        </Router>
    );
}


// --- Sub-component to hold navigation and routes (has access to hooks) ---
function AppContent({ isAuthenticated, setIsAuthenticated }) {
    // const navigate = useNavigate(); // No longer needed here if Navbar handles logout navigation

    // handleLogout is now managed by Navbar.js
    // const handleLogout = useCallback(async () => { ... }, [navigate]);

    return (
        <div className="App flex min-h-screen flex-col bg-gray-100 text-gray-800">
            {/* Use the Navbar component here */}
            <Navbar isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />

            {/* Main content area that takes up remaining space */}
            <main className="flex-grow"> {/* Added flex-grow for better layout with sticky footer potential */}
                <Routes>
                     <Route path="/" element={
                        // --- START OF LANDING PAGE ELEMENT ---
                        <div 
                            className="page-container flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-cover bg-center bg-no-repeat px-4 py-10 text-center sm:px-6 lg:px-8"
                            style={{ backgroundImage: `url(${landingPageBackgroundImage})` }} // <--- USE THE IMPORTED VARIABLE
                >
                            {/* Overlay to ensure text is readable over the background image */}
                            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div> {/* Adjust opacity and blur as needed */}
                            
                            {/* Content - needs to be relative to be above the overlay */}
                            <div className="relative z-10 mx-auto max-w-3xl"> 
                                <h1 className="mb-4 text-4xl font-bold text-white drop-shadow-lg sm:text-5xl md:text-6xl"> {/* Text white, add drop shadow */}
                                    Welcome to Your Notepad!
                                </h1>
                                <p className="mb-8 text-lg text-gray-200 drop-shadow-md sm:text-xl"> {/* Lighter text, add drop shadow */}
                                    A simple and elegant place to jot down your thoughts, ideas, and reminders.
                                </p>
                                {!isAuthenticated ? (
                                    <div className="mt-10 flex flex-col items-center space-y-4 sm:flex-row sm:justify-center sm:space-y-0 sm:space-x-6">
                                        <Link
                                            to="/login"
                                            className="inline-flex w-full items-center justify-center rounded-lg bg-indigo-600 px-8 py-3 text-base font-medium text-white shadow-lg ring-2 ring-transparent ring-offset-2 ring-offset-black/20 transition hover:bg-indigo-700 focus:outline-none focus:ring-indigo-400 sm:w-auto"
                                        >
                                            Login
                                        </Link>
                                        <Link
                                            to="/signup"
                                            className="inline-flex w-full items-center justify-center rounded-lg border-2 border-white bg-white/20 px-8 py-3 text-base font-medium text-white shadow-lg backdrop-blur-md ring-2 ring-transparent ring-offset-2 ring-offset-black/20 transition hover:bg-white/30 focus:outline-none focus:ring-white/70 sm:w-auto"
                                        >
                                            Sign Up
                                        </Link>
                                    </div>
                                ) : (
                                     <div className="mt-10">
                                         <Link
                                            to="/home"
                                            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-8 py-3 text-base font-medium text-white shadow-lg ring-2 ring-transparent ring-offset-2 ring-offset-black/20 transition hover:bg-indigo-700 focus:outline-none focus:ring-indigo-400"
                                        >
                                            Go to My Notes
                                        </Link>
                                     </div>
                                )}
                            </div> 
                            {/* --- END OF CONTENT --- */}
                        </div>
                        // --- END OF LANDING PAGE ELEMENT ---
                    }/>

                    <Route
                        path="/signup"
                        element={isAuthenticated ? <Navigate to="/home" replace /> : <SignupPage />}
                    />
                    <Route
                        path="/login"
                        element={isAuthenticated ? <Navigate to="/home" replace /> : <LoginPage setIsAuthenticated={setIsAuthenticated} />}
                    />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />

                    <Route
                        path="/home"
                        element={
                            <ProtectedRoute isAuthenticated={isAuthenticated}>
                                <HomePage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute isAuthenticated={isAuthenticated}>
                                {/* Pass setIsAuthenticated if Dashboard still needs to call global logout */}
                                <DashboardPage setIsAuthenticated={setIsAuthenticated} />
                            </ProtectedRoute>
                        }
                    />

                    <Route path="*" element={
                        <div className="page-container mx-auto max-w-3xl px-4 py-10 text-center sm:px-6 lg:px-8">
                            <h1 className="text-6xl font-bold text-indigo-600 mb-4">404</h1>
                            <h2 className="mb-4 text-2xl font-semibold text-gray-800 sm:text-3xl">Oops! Page Not Found.</h2>
                            <p className="mb-8 text-md text-gray-600 sm:text-lg">
                                The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                            </p>
                            <Link
                                to={isAuthenticated ? "/home" : "/"}
                                className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                Go Back Home
                            </Link>
                        </div>
                    }/>
                </Routes>
            </main>
            {/* Optional Footer can go here */}
            {/* <footer className="bg-gray-800 text-white text-center p-4 mt-auto">
                © {new Date().getFullYear()} Notepad App
            </footer> */}
        </div>
    );
}

export default App;