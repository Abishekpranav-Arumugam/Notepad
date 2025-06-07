// src/features/auth/pages/LoginPage.js
import React, { useState } from 'react';
import api from '../../../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from '../../../services/firebase';
import { signInWithEmailAndPassword, getIdToken } from "firebase/auth";
import { FaSpinner, FaSignInAlt } from 'react-icons/fa';
import authIllustrationImage from '../../../assets/images/auth11.jpg';

function LoginPage({ setIsAuthenticated }) { // The prop can remain for now, but we won't use it
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (providedEmail, providedPassword) => {
        setError(null);
        setIsLoading(true);
        try {
            const userCredential = await signInWithEmailAndPassword(auth, providedEmail, providedPassword);
            const user = userCredential.user;
            const idToken = await getIdToken(user);
            const res = await api.post('/auth/token-signin', { token: idToken });

            if (res.data.token) {
                 localStorage.setItem('token', res.data.token);
                 // setIsAuthenticated(true); // <-- THIS LINE IS REMOVED. THIS IS THE FIX.
                 navigate('/home');
             } else { setError('Login succeeded but failed to get application session.'); }
        } catch (err) {
             if (err.code?.startsWith('auth/')) { setError('Invalid email or password.'); }
             else if (err.response) { setError(err.response.data?.msg || `Login failed`);}
             else {setError('Login failed. An unexpected error occurred.'); }
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!email || !password) {
            setError("Email and password are required.");
            return;
        }
        handleLogin(email, password);
    };

    return (
        <div className="flex flex-col lg:flex-row min-h-screen items-stretch bg-gradient-to-br from-purple-100 via-indigo-100 to-purple-500">
            {/* Left Side: Full-height Image Column (Desktop Only) */}
            <div className="relative hidden lg:flex lg:w-1/2">
                <img
                    className="absolute inset-0 h-full w-full object-cover"
                    src={authIllustrationImage}
                    alt="Scenic background for authentication page"
                />
            </div>

            {/* Right Side: Form Column (Full width on mobile, half on desktop) */}
            <div className="flex flex-1 flex-col justify-center items-center w-full lg:w-1/2 px-4 py-8 sm:py-12 sm:px-6 lg:px-20 xl:px-24">
                <div className="mx-auto w-full max-w-sm">
                    <div className="w-full rounded-xl bg-white/80 shadow-2xl backdrop-blur-md overflow-hidden">
                        <div className="block lg:hidden w-full h-40 sm:h-48">
                            <img
                                className="h-full w-full object-cover"
                                src={authIllustrationImage}
                                alt="MyNotepad branding illustration"
                            />
                        </div>

                        <div className="p-6 sm:p-8">
                            <div>
                                <h2 className="text-center text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                                    Sign In
                                </h2>
                            </div>
                            <form onSubmit={handleSubmit} className="mt-6 sm:mt-8 space-y-6">
                                {error && (
                                    <div className="rounded-md border border-red-300 bg-red-100 p-3 text-red-700">
                                        <p className="text-sm font-medium">{error}</p>
                                    </div>
                                )}

                                <div>
                                    <label htmlFor="email-login" className="sr-only">Email address</label>
                                    <input
                                        id="email-login"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        className="block w-full appearance-none rounded-md border border-gray-300 bg-white px-3 py-3 text-gray-900 placeholder-gray-500 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                                        placeholder="Email address"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={isLoading}
                                    />
                                </div>
                                
                                <div>
                                    <label htmlFor="password-login" className="sr-only">Password</label>
                                    <input
                                        id="password-login"
                                        name="password"
                                        type="password"
                                        autoComplete="current-password"
                                        required
                                        className="block w-full appearance-none rounded-md border border-gray-300 bg-white px-3 py-3 text-gray-900 placeholder-gray-500 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        disabled={isLoading}
                                    />
                                </div>

                                <div>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className={`group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-3 text-sm font-medium text-white shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${isLoading ? 'cursor-not-allowed opacity-50' : ''}`}
                                    >
                                        {isLoading ? (
                                            <FaSpinner className="mr-3 h-5 w-5 animate-spin" />
                                        ) : (
                                            <FaSignInAlt className="mr-2 -ml-1 h-5 w-5" />
                                        )}
                                        {isLoading ? 'Signing in...' : 'Sign in'}
                                    </button>
                                </div>
                            </form>
                            <p className="mt-8 text-center text-sm text-gray-600">
                                Don't have an account?{' '}
                                <Link to="/signup" className="font-medium text-indigo-600 hover:text-indigo-500 hover:underline">
                                    Sign Up
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default LoginPage;