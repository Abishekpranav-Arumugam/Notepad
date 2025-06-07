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
            // This logic now correctly reflects that authentication depends on the presence of the user.
            // The custom token's existence is checked within the components that need it.
            if (user) {
                console.log("App.js: onAuthStateChanged - User detected (Firebase):", user.uid);
                setIsAuthenticated(true);
            } else {
                console.log("App.js: onAuthStateChanged - User logged out (Firebase).");
                setIsAuthenticated(false);
                console.log("App.js: Removing custom JWT from localStorage due to Firebase logout.");
                localStorage.removeItem('token');
            }
            setLoadingAuth(false);
            console.log(`App.js: Auth loading complete. isAuthenticated: ${!!user}`);
        });

        // --- MERGED-IN STORAGE LISTENER ---
        // This listener ensures that if the 'token' is set in another tab or by the login page,
        // the App component re-evaluates its authentication state.
        const handleStorageChange = (event) => {
            if (event.key === 'token') {
                console.log("App.js: 'token' in localStorage changed. Re-evaluating auth state.");
                const user = auth.currentUser;
                // If a user exists and the token is now present, we are authenticated.
                // If the token was removed, this will correctly set isAuthenticated to false.
                setIsAuthenticated(!!user && !!localStorage.getItem('token'));
            }
        };

        window.addEventListener('storage', handleStorageChange);
        // --- END OF MERGED CODE ---


        return () => {
            console.log("App.js: Cleaning up listeners.");
            unsubscribe();
            window.removeEventListener('storage', handleStorageChange); // Cleanup the new listener
        };
    }, []);

    if (loadingAuth) {
        return (
            <div className="flex h-screen items-center justify-center">
                 <div className="text-center py-8 text-lg font-medium text-gray-600">Loading Session...</div>
            </div>
        );
    }

    return (
        <Router>
            <AppContent isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />
        </Router>
    );
}


// --- Sub-component to hold navigation and routes (has access to hooks) ---
function AppContent({ isAuthenticated, setIsAuthenticated }) {
    return (
        <div className="App flex min-h-screen flex-col bg-gray-100 text-gray-800">
            <Navbar isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />
            <main className="flex-grow">
                <Routes>
                     <Route path="/" element={
                        <div 
                            className="page-container flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-cover bg-center bg-no-repeat px-4 py-10 text-center sm:px-6 lg:px-8"
                            style={{ backgroundImage: `url(${landingPageBackgroundImage})` }}
                        >
                            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
                            <div className="relative z-10 mx-auto max-w-3xl"> 
                                <h1 className="mb-4 text-4xl font-bold text-white drop-shadow-lg sm:text-5xl md:text-6xl">
                                    Welcome to Your Notepad!
                                </h1>
                                <p className="mb-8 text-lg text-gray-200 drop-shadow-md sm:text-xl">
                                    A simple and elegant place to jot down your thoughts, ideas, and reminders.
                                </p>
                                {!isAuthenticated ? (
                                    <div className="mt-10 flex flex-col items-center space-y-4 sm:flex-row sm:justify-center sm:space-y-0 sm:space-x-6">
                                        <Link to="/login" className="inline-flex w-full items-center justify-center rounded-lg bg-indigo-600 px-8 py-3 text-base font-medium text-white shadow-lg ring-2 ring-transparent ring-offset-2 ring-offset-black/20 transition hover:bg-indigo-700 focus:outline-none focus:ring-indigo-400 sm:w-auto">Login</Link>
                                        <Link to="/signup" className="inline-flex w-full items-center justify-center rounded-lg border-2 border-white bg-white/20 px-8 py-3 text-base font-medium text-white shadow-lg backdrop-blur-md ring-2 ring-transparent ring-offset-2 ring-offset-black/20 transition hover:bg-white/30 focus:outline-none focus:ring-white/70 sm:w-auto">Sign Up</Link>
                                    </div>
                                ) : (
                                     <div className="mt-10">
                                         <Link to="/home" className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-8 py-3 text-base font-medium text-white shadow-lg ring-2 ring-transparent ring-offset-2 ring-offset-black/20 transition hover:bg-indigo-700 focus:outline-none focus:ring-indigo-400">Go to My Notes</Link>
                                     </div>
                                )}
                            </div>
                        </div>
                    }/>
                    <Route path="/signup" element={isAuthenticated ? <Navigate to="/home" replace /> : <SignupPage />} />
                    <Route path="/login" element={isAuthenticated ? <Navigate to="/home" replace /> : <LoginPage setIsAuthenticated={setIsAuthenticated} />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/home" element={<ProtectedRoute isAuthenticated={isAuthenticated}><HomePage /></ProtectedRoute>} />
                    <Route path="/dashboard" element={<ProtectedRoute isAuthenticated={isAuthenticated}><DashboardPage setIsAuthenticated={setIsAuthenticated} /></ProtectedRoute>} />
                    <Route path="*" element={
                        <div className="page-container mx-auto max-w-3xl px-4 py-10 text-center sm:px-6 lg:px-8">
                            <h1 className="text-6xl font-bold text-indigo-600 mb-4">404</h1>
                            <h2 className="mb-4 text-2xl font-semibold text-gray-800 sm:text-3xl">Oops! Page Not Found.</h2>
                            <p className="mb-8 text-md text-gray-600 sm:text-lg">
                                The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                            </p>
                            <Link to={isAuthenticated ? "/home" : "/"} className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">Go Back Home</Link>
                        </div>
                    }/>
                </Routes>
            </main>
        </div>
    );
}

export default App;