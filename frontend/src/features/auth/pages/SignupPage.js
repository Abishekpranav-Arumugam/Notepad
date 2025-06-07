// src/features/auth/pages/SignupPage.js
import React, { useState } from 'react';
import api from '../../../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { auth, googleProvider } from '../../../services/firebase';
import { signInWithPopup, getIdToken } from "firebase/auth";
import { FcGoogle } from 'react-icons/fc';
import { FaSpinner, FaUserPlus } from 'react-icons/fa';
import authIllustrationImage from '../../../assets/images/auth11.jpg';

function SignupPage({ setIsAuthenticated }) { // Prop is passed but we no longer use it
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSignup = async (providedUsername, providedEmail, providedPassword) => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await api.post('/auth/signup', { username: providedUsername, email: providedEmail, password: providedPassword });
            if (res.data.token) {
                localStorage.setItem('token', res.data.token);
                // The "storage" event listener in App.js will now handle the state change.
                setTimeout(() => navigate('/home'), 50);
            } else {
                setError("Signup successful, but failed to initialize session. Please try logging in.");
            }
        } catch (err) {
            setError(err.response?.data?.msg || 'Signup failed. Please check your input and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;
            const idToken = await getIdToken(user);
            const res = await api.post('/auth/google', { token: idToken });

            if (res.data.token) {
                localStorage.setItem('token', res.data.token);
                // The "storage" event listener in App.js will now handle the state change.
                setTimeout(() => navigate('/home'), 50);
            } else {
                setError('Google Sign-In/Up successful but no application token received from backend.');
            }
        } catch (err) {
             if (err.code === 'auth/popup-closed-by-user') { /* Silent */ }
             else if (err.response?.data) { setError(err.response.data.msg || 'Backend validation failed after Google Sign-In.'); }
             else { setError('Google Sign-In/Up failed. Please try again.'); }
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!username || !email || !password) {
            setError("All fields are required for standard signup.");
            return;
        }
        if (password.length < 6) {
             setError("Password must be at least 6 characters long.");
             return;
        }
        handleSignup(username, email, password);
    };


    return (
        <div className="flex flex-col lg:flex-row min-h-screen items-stretch bg-gradient-to-br from-purple-100 via-indigo-100 to-purple-500">
            <div className="relative hidden lg:flex lg:w-1/2">
                <img className="absolute inset-0 h-full w-full object-cover" src={authIllustrationImage} alt="Scenic background for authentication page" />
            </div>

            <div className="flex flex-1 flex-col justify-center items-center w-full lg:w-1/2 px-4 py-8 sm:py-12 sm:px-6 lg:px-20 xl:px-24">
                <div className="mx-auto w-full max-w-sm">
                    <div className="w-full rounded-xl bg-white/80 shadow-2xl backdrop-blur-md overflow-hidden">
                        <div className="block lg:hidden w-full h-40 sm:h-48">
                            <img className="h-full w-full object-cover" src={authIllustrationImage} alt="MyNotepad branding illustration" />
                        </div>
                        <div className="p-6 sm:p-8">
                            <div><h2 className="text-center text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Create Account</h2></div>
                            <form onSubmit={handleSubmit} className="mt-6 sm:mt-8 space-y-6">
                                {error && (<div className="rounded-md border border-red-300 bg-red-100 p-3 text-red-700"><p className="text-sm font-medium">{error}</p></div>)}
                                <div>
                                    <label htmlFor="username-signup" className="sr-only">Username</label>
                                    <input id="username-signup" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required autoComplete="username" className="block w-full appearance-none rounded-md border border-gray-300 bg-white px-3 py-3 text-gray-900 placeholder-gray-500 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm" placeholder="Username" disabled={isLoading} />
                                </div>
                                <div>
                                    <label htmlFor="email-signup" className="sr-only">Email address</label>
                                    <input id="email-signup" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" className="block w-full appearance-none rounded-md border border-gray-300 bg-white px-3 py-3 text-gray-900 placeholder-gray-500 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm" placeholder="Email address" disabled={isLoading} />
                                </div>
                                <div>
                                    <label htmlFor="password-signup" className="sr-only">Password</label>
                                    <input id="password-signup" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} autoComplete="new-password" className="block w-full appearance-none rounded-md border border-gray-300 bg-white px-3 py-3 text-gray-900 placeholder-gray-500 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm" placeholder="Password" disabled={isLoading} aria-describedby="password-hint-signup" />
                                    <p id="password-hint-signup" className="mt-2 text-xs text-gray-500">Must be at least 6 characters.</p>
                                </div>
                                <div>
                                    <button type="submit" disabled={isLoading} className={`group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-3 text-sm font-medium text-white shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${isLoading ? 'cursor-not-allowed opacity-50' : ''}`}>
                                        {isLoading ? (<FaSpinner className="mr-3 h-5 w-5 animate-spin" />) : (<FaUserPlus className="mr-2 -ml-1 h-5 w-5" />)}
                                        {isLoading ? 'Creating account...' : 'Sign Up'}
                                    </button>
                                </div>
                                <div className="relative my-6">
                                    <div className="absolute inset-0 flex items-center" aria-hidden="true"><div className="w-full border-t border-gray-300" /></div>
                                    <div className="relative flex justify-center text-sm"><span className="bg-white/80 px-2 text-gray-500 backdrop-blur-[2px] rounded-sm">OR</span></div>
                                </div>
                                <div>
                                    <button onClick={handleGoogleSignIn} type="button" disabled={isLoading} className={`group relative flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${isLoading ? 'cursor-not-allowed opacity-50' : ''}`}>
                                        <FcGoogle className="mr-3 -ml-1 h-5 w-5" aria-hidden="true" />
                                        <span>Sign up with Google</span>
                                    </button>
                                </div>
                            </form>
                            <p className="mt-8 text-center text-sm text-gray-600">
                                Already have an account?{' '}
                                <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 hover:underline">Sign In</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default SignupPage;