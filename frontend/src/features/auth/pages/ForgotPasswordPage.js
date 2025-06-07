// src/pages/ForgotPasswordPage.js
import React, { useState } from 'react';
import api from '../../../services/api';
// Link component removed as we don't need it here anymore
// import { Link } from 'react-router-dom';

function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setIsLoading(true);

        try {
            // This correctly calls the backend which triggers the Firebase reset flow
            const res = await api.post('/auth/forgot-password', { email });

            // *** IMPORTANT: Update the success message ***
            setMessage(res.data.msg || 'Password reset initiated. Please check your email inbox (and spam folder) for instructions from Firebase or our app to reset your password.');
            setEmail(''); // Clear the form

        } catch (err) {
            console.error('Forgot Password Error:', err.response?.data || err.message);
             // Use backend message first, otherwise provide helpful feedback
             // Check for specific error types if backend provides them (e.g., invalid email format)
            setError(err.response?.data?.msg || 'Failed to initiate password reset. Please check the email address and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="page-container flex flex-col items-center justify-center min-h-[calc(100vh-150px)]">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Forgot Password</h2>
            <p className="mb-4 text-gray-600 text-center max-w-sm">
                Enter the email address associated with your account. If an account exists, instructions to reset your password will be sent.
            </p>
            <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-sm">
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email-forgot">
                        Email Address:
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="email-forgot"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="you@example.com"
                    />
                </div>

                {/* Display Success/Error Messages */}
                {message && <p className="text-green-600 text-sm mb-4">{message}</p>}
                {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}

                <div className="flex items-center justify-center">
                    <button
                        className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        type="submit"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Sending...' : 'Send Password Reset Email'}
                    </button>
                </div>
            </form>
            {/* Optional: Add link back to login */}
            <p className="mt-4 text-gray-600">
                Remembered your password? <a href="/login" className="text-blue-600 hover:underline">Login</a>
             </p>
        </div>
    );
}

export default ForgotPasswordPage;