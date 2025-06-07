// src/features/profile/pages/DashboardPage.js
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from '../../../services/firebase'; // Corrected path relative to features/profile/pages
import { FaSpinner, FaUserCircle, FaStickyNote, FaExclamationTriangle, FaSignOutAlt } from 'react-icons/fa';
import homePageBgImage from '../../../assets/images/notepad.jpg'; // Add this import

// The setIsAuthenticated prop might be redundant if Navbar fully handles logout.
// If you want this page's logout button to also update global state directly, keep it.
function DashboardPage({ setIsAuthenticated }) {
    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // This local handleLogout is now OPTIONAL if the main Navbar handles logout globally.
    // If you keep it, it's a secondary way to log out from this specific page.
    const handlePageLogout = useCallback(() => {
        console.log('DashboardPage: Logging out from page button...');
        auth.signOut().then(() => {
            localStorage.removeItem('token');
            if(setIsAuthenticated) setIsAuthenticated(false); // Signal App.js if prop is used
            navigate('/login');
        }).catch(error => {
            console.error("DashboardPage: Error signing out: ", error);
            if(setIsAuthenticated) setIsAuthenticated(false); // Fallback
            localStorage.removeItem('token');
            navigate('/login');
        });
    }, [setIsAuthenticated, navigate]);

    useEffect(() => {
        const fetchUserData = (user) => {
            setUserInfo({
                uid: user.uid,
                email: user.email,
                displayName: user.displayName || "N/A",
                photoURL: user.photoURL
            });
            setLoading(false);
            setError(null); // Clear previous errors on successful fetch
        };

        setLoading(true); // Set loading true at the start of the effect
        const unsubscribe = auth.onAuthStateChanged(user => {
            if (user) {
                console.log("DashboardPage: Auth state changed - user present.");
                fetchUserData(user);
            } else {
                console.log("DashboardPage: Auth state changed - no user. Redirecting.");
                setError("Authentication session ended. Please log in again.");
                setLoading(false);
                // Delay slightly so error message might be seen, then use a shared logout if available or local
                setTimeout(() => navigate('/login'), 1500); // Simpler redirect
            }
        });

        return () => {
            console.log("DashboardPage: Unsubscribing from auth changes.");
            unsubscribe();
        };
    }, [navigate]); // Removed handlePageLogout from dependencies unless it's truly dynamic based on component state


    if (loading) {
        return (
             <div className="flex min-h-[calc(100vh-200px)] flex-col items-center justify-center px-4 py-10 text-center">
                 <FaSpinner className="h-10 w-10 animate-spin text-indigo-600" />
                 <p className="mt-3 text-gray-600">Loading Profile...</p>
            </div>
        );
    }

    if (error && !userInfo) { // Show error if fetching failed and no user info
         return (
             <div className="flex min-h-[calc(100vh-200px)] flex-col items-center justify-center rounded-lg bg-red-50 p-6 text-center shadow-md sm:m-8">
                <FaExclamationTriangle className="mb-4 h-12 w-12 text-red-500" />
                <h3 className="mb-2 text-xl font-semibold text-red-700">An Error Occurred</h3>
                <p className="mb-6 text-red-600">{error}</p>
                <div className="flex flex-col space-y-3 sm:flex-row sm:space-x-0 sm:space-y-3 sm:gap-4"> {/* Ensure stacking on mobile */}
                     <Link 
                        to="/login" 
                        className="inline-flex w-full items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 sm:w-auto">
                        Go to Login
                     </Link>
                     {/* The local logout button here might be redundant if navbar logout is preferred */}
                     <button 
                        onClick={handlePageLogout} 
                        className="inline-flex w-full items-center justify-center rounded-md border border-red-600 px-4 py-2 text-sm font-medium text-red-600 shadow-sm hover:bg-red-50 sm:w-auto">
                         <FaSignOutAlt className="mr-2 h-4 w-4" />
                         Logout
                    </button>
                </div>
            </div>
        );
    }
    
    if (!userInfo && !loading) { // Fallback for unexpected state: not loading, no error, but no userinfo
        return (
            <div className="flex min-h-[calc(100vh-200px)] flex-col items-center justify-center px-4 py-10 text-center">
                <FaUserCircle className="h-16 w-16 text-gray-300 mb-4" />
                <p className="text-gray-500">Could not load user information.</p>
                <p className="text-sm text-gray-400 mb-4">This might be a temporary issue. Please try refreshing or logging in again.</p>
                <Link to="/login" className="mt-4 font-medium text-indigo-600 hover:text-indigo-500">
                    Go to Login
                </Link>
            </div>
        );
    }

    // Successful data fetch state (userInfo exists)
    return (
        // Main container for the page, relative positioning context for the background
        <div className="relative min-h-screen">
            {/* Background Image Layer WITHOUT blur */}
            <div
                className="absolute inset-0 h-full w-full bg-cover bg-center bg-no-repeat brightness-90 z-0 backdrop-blur-lg"
                style={{ backgroundImage: `url(${homePageBgImage})` }}
                aria-hidden="true"
            ></div>
            {/* Content wrapper with higher z-index */}
            <div className="relative z-10">
                <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
                    <div className="mb-6 flex flex-col items-center text-center sm:mb-10 sm:flex-row sm:items-end sm:text-left">
                        {userInfo.photoURL ? (
                            <img src={userInfo.photoURL} alt="Profile" className="mb-4 h-24 w-24 rounded-full object-cover shadow-lg ring-2 ring-indigo-300 sm:mb-0 sm:mr-6 sm:h-28 sm:w-28" />
                        ) : (
                            <FaUserCircle className="mb-4 h-24 w-24 text-gray-300 shadow-md sm:mb-0 sm:mr-6 sm:h-28 sm:w-28" />
                        )}
                       <div>
    <h2 className="text-2xl font-bold text-black sm:text-3xl">
        {userInfo.displayName && userInfo.displayName !== "N/A" ? userInfo.displayName : "Your Profile"}
    </h2>
    {userInfo.displayName && userInfo.displayName !== "N/A" && (
        <p className="text-md text-black">{userInfo.email}</p>
    )}
    {!(userInfo.displayName && userInfo.displayName !== "N/A") && userInfo.email && (
        <p className="text-md text-black">{userInfo.email}</p> /* Show email if display name is N/A */
    )}
</div>
                    </div>

                     <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
                         <div className="px-4 py-5 sm:p-6">
                            <h3 className="mb-4 text-lg font-semibold leading-6 text-indigo-700 sm:text-xl">
                                 Profile
                            </h3>
                            <dl className="divide-y divide-gray-200">
                                {userInfo.displayName && userInfo.displayName !== "N/A" && (
                                    <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5">
                                        <dt className="text-sm font-medium text-gray-500">User name</dt>
                                        <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0 sm:text-base">{userInfo.displayName}</dd>
                                    </div>
                                )}
                                 <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5">
                                    <dt className="text-sm font-medium text-gray-500">Email address</dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0 sm:text-base">{userInfo.email}</dd>
                                 </div>
                                 {/* <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5">
                                     <dt className="text-sm font-medium text-gray-500">Firebase UID</dt>
                                     <dd className="mt-1 break-all font-mono text-xs text-gray-500 sm:col-span-2 sm:mt-0 sm:text-sm">{userInfo.uid}</dd>
                                 </div> */}
                            </dl>
                        </div>
                     </div>

                   
                </div>
            </div>
        </div>
     );
}
export default DashboardPage;