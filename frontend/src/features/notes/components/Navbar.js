// src/components/layout/Navbar.js
import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom'; // Added useLocation
import {
    FaBars, FaTimes, FaUserCircle, FaSignOutAlt,
    FaStickyNote, FaHome, FaEdit, FaThLarge // FaThLarge for "Welcome/Dashboard" on bottom
} from 'react-icons/fa';
import { auth } from '../../../services/firebase';

function Navbar({ isAuthenticated, setIsAuthenticated }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation(); // To determine active state for bottom nav

    const handleLogout = () => {
        auth.signOut().then(() => {
            if (setIsAuthenticated) setIsAuthenticated(false);
            localStorage.removeItem('token');
            setIsMobileMenuOpen(false);
            navigate('/login');
        }).catch(error => {
            console.error("Navbar: Error signing out: ", error);
        });
    };

    // --- Desktop Link Styles ---
    const commonDesktopLinkClasses = "px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ease-in-out";
    const activeDesktopLinkClasses = "bg-indigo-700 text-white shadow-md";
    const inactiveDesktopLinkClasses = "text-gray-300 hover:bg-indigo-500 hover:text-white";

    // --- Mobile Top Menu (Hamburger Dropdown) Link Styles ---
    const mobileTopMenuLinkClasses = "block px-3 py-3 rounded-md text-base font-medium transition-colors duration-150 ease-in-out";
    const activeMobileTopMenuLinkClasses = "bg-indigo-100 text-indigo-700 font-semibold";
    const inactiveMobileTopMenuLinkClasses = "text-gray-700 hover:bg-gray-100 hover:text-gray-900";

    // --- Mobile Bottom Navigation Styles ---
    const commonBottomNavClasses = "flex flex-col items-center justify-center flex-1 py-2 px-1 text-xs";
    const activeBottomNavClasses = "text-indigo-500 scale-110"; // Active item: different color, slightly larger
    const inactiveBottomNavClasses = "text-gray-500";

    const bottomNavItems = [
        { to: "/", label: "Welcome", icon: FaHome, exact: true }, // 'exact' helps with matching only "/"
        { to: "/home", label: "Notes", icon: FaStickyNote },
        { to: "/dashboard", label: "Profile", icon: FaUserCircle },
    ];


    return (
        <>
            {/* --- TOP NAVIGATION BAR (Visible on all screen sizes) --- */}
            <nav className="bg-indigo-600 shadow-lg sticky top-0 z-40"> {/* z-40, bottom nav will be z-50 */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* App Brand/Logo */}
                        <div className="flex items-center">
                            <NavLink to={isAuthenticated ? "/home" : "/"} className="flex-shrink-0 flex items-center text-white text-xl font-bold hover:opacity-80 transition-opacity">
                                <FaEdit className="h-6 w-6 mr-2" />
                                MyNotepad
                            </NavLink>
                        </div>

                        {/* Desktop Menu Links */}
                        <div className="hidden md:flex md:items-center md:space-x-3 lg:space-x-4">
                            {bottomNavItems.map(item => ( // Reuse bottomNavItems for desktop if desired, or define separately
                                isAuthenticated && // Only show these if authenticated for desktop as well
                                <NavLink
                                    key={item.label + "-desktop"}
                                    to={item.to}
                                    end={item.exact} // For react-router-dom v6 'end' prop for exact matching
                                    className={({ isActive }) => `${commonDesktopLinkClasses} ${isActive ? activeDesktopLinkClasses : inactiveDesktopLinkClasses}`}
                                >
                                    <item.icon className="inline-block mr-1.5 mb-0.5 h-4 w-4" /> {item.label}
                                </NavLink>
                            ))}
                            {!isAuthenticated && (
                                <>
                                    <NavLink to="/login" className={({ isActive }) => `${commonDesktopLinkClasses} ${isActive ? activeDesktopLinkClasses : inactiveDesktopLinkClasses}`}>Login</NavLink>
                                    <NavLink to="/signup" className={`${commonDesktopLinkClasses} ${inactiveDesktopLinkClasses} bg-green-500 hover:bg-green-600 text-white`}>Sign Up</NavLink>
                                </>
                            )}
                             {/* Logout Button for Desktop */}
                             {isAuthenticated && (
                                <button
                                    onClick={handleLogout}
                                    className={`${commonDesktopLinkClasses} ${inactiveDesktopLinkClasses} bg-red-500 hover:bg-red-600 text-white focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-indigo-600 ml-3`}
                                >
                                    <FaSignOutAlt className="inline-block mr-1 mb-0.5" /> Logout
                                </button>
                             )}
                        </div>

                        {/* Mobile: Hamburger for top menu dropdown & possibly just logout if not in bottom nav */}
                        <div className="flex items-center md:hidden">
                             {/* Logout Button (always visible in top bar on mobile if authenticated) */}
                             {isAuthenticated && (
                                <button
                                    onClick={handleLogout}
                                    className="p-2 rounded-md text-indigo-200 hover:text-white hover:bg-indigo-500 hover:bg-opacity-75 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white mr-2"
                                    title="Logout"
                                >
                                    <FaSignOutAlt className="h-5 w-5" />
                                </button>
                             )}
                            {/* Hamburger Menu Button for OTHER links if any */}
                            {isAuthenticated && ( // Or show hamburger always if non-auth users also have mobile menu items
                                <button
                                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                    type="button"
                                    className="inline-flex items-center justify-center p-2 rounded-md text-indigo-200 hover:text-white hover:bg-indigo-500 hover:bg-opacity-75 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                                    aria-controls="mobile-top-menu"
                                    aria-expanded={isMobileMenuOpen}
                                >
                                    <span className="sr-only">Open main menu</span>
                                    {isMobileMenuOpen ? <FaTimes className="block h-6 w-6" /> : <FaBars className="block h-6 w-6" />}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Mobile Top Menu Dropdown (for any links NOT in bottom nav) */}
                {isAuthenticated && (
                    <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:hidden border-t border-indigo-700`} id="mobile-top-menu">
                        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white shadow-lg">
                            {/* Example: if you had other links, add them here */}
                            {/* <NavLink to="/settings" className={({ isActive }) => `${mobileTopMenuLinkClasses} ${isActive ? activeMobileTopMenuLinkClasses : inactiveMobileTopMenuLinkClasses}`} onClick={() => setIsMobileMenuOpen(false)}>Settings</NavLink> */}
                            {!bottomNavItems.find(item => item.to === "/") && // If welcome not in bottom nav, show here
                                <NavLink to="/" className={({ isActive }) => `${mobileTopMenuLinkClasses} ${isActive ? activeMobileTopMenuLinkClasses : inactiveMobileTopMenuLinkClasses}`} onClick={() => setIsMobileMenuOpen(false)}>
                                <FaHome className="inline-block mr-3 text-gray-500" /> Welcome</NavLink>
                            }
                            <p className="px-3 py-2 text-xs text-gray-400">More options here</p>
                        </div>
                    </div>
                )}
            </nav>

            {/* --- BOTTOM NAVIGATION BAR (Mobile Only) --- */}
            {isAuthenticated && ( // Only show bottom nav if authenticated
                <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-top-md md:hidden"> {/* shadow-top-md is custom if you need it */}
                    <div className="flex items-center justify-around max-w-md mx-auto h-14"> {/* max-w-md for smaller bottom nav on tablets in portrait */}
                        {bottomNavItems.map((item) => (
                            <NavLink
                                key={item.label + "-bottom"}
                                to={item.to}
                                end={item.exact} // For react-router-dom v6 'end' prop for exact matching
                                className={({ isActive }) =>
                                    `${commonBottomNavClasses} ${isActive ? activeBottomNavClasses : inactiveBottomNavClasses}`
                                }
                                onClick={() => isMobileMenuOpen && setIsMobileMenuOpen(false)} // Close top mobile menu if open
                            >
                                <item.icon className="h-5 w-5 mb-0.5" />
                                <span className="truncate">{item.label}</span>
                            </NavLink>
                        ))}
                    </div>
                </nav>
            )}
        </>
    );
}

export default Navbar;