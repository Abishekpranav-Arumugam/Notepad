// src/pages/ResetPasswordPage.js
import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';

function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState(true); // Assume valid initially, backend can confirm later if needed

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token'); // Get token from query parameter ?token=...

  // Optional: Basic check if token exists in URL on load
  useEffect(() => {
    if (!token) {
      setError('Invalid or missing password reset token.');
      setIsValidToken(false);
    }
    // You could add an API call here to verify the token is still valid on page load,
    // but often verification happens only on submit for simplicity.
  }, [token]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!token) {
      setError('Invalid or missing password reset token.');
      return;
    }
    if (password.length < 6) { // Example: Add minimum length validation
       setError('Password must be at least 6 characters long.');
       return;
    }


    setIsLoading(true);

    try {
      // *** Backend Step 6 ***
      // Assumes backend endpoint /auth/reset-password
      // Takes { token, password } (backend should verify token validity)
      const res = await api.post('/auth/reset-password', { token, password }); // Send token and *new* password
      setMessage(res.data.msg || 'Password has been successfully reset!');

      // Redirect to login after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 3000); // Redirect after 3 seconds

    } catch (err) {
      console.error('Reset Password Error:', err.response?.data || err.message);
      setError(err.response?.data?.msg || 'Failed to reset password. The link may be invalid or expired.');
      // If the token is invalid/expired, the backend should return an appropriate error
      if (err.response?.status === 400 || err.response?.status === 404) {
          setIsValidToken(false); // Mark token as invalid based on backend response
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-container flex flex-col items-center justify-center min-h-[calc(100vh-150px)]">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Reset Your Password</h2>

      {!isValidToken && !message ? ( // Show only error if token is invalid and no success message yet
         <p className="text-red-500 mb-4">{error || 'This password reset link is invalid or has expired.'}</p>
         ) : (
          <form onSubmit={handleSubmit} className={`bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-sm ${message ? 'hidden' : ''}`}> {/* Hide form on success */}
          <p className="mb-4 text-gray-600 text-sm">
              Enter your new password below.
          </p>
          <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password-reset">
              New Password:
              </label>
              <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="password-reset"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              />
          </div>
          <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirm-password-reset">
              Confirm New Password:
              </label>
              <input
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline ${error && password !== confirmPassword ? 'border-red-500' : ''}`}
              id="confirm-password-reset"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              />
          </div>

          {/* Display Error Messages */}
          {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}


          <div className="flex items-center justify-center">
              <button
              className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              type="submit"
              disabled={isLoading || !isValidToken} // Disable if loading or token known to be invalid
              >
              {isLoading ? 'Resetting...' : 'Reset Password'}
              </button>
          </div>
          </form>
      )}

       {/* Display Success Message Separately */}
       {message && <p className="text-green-600 text-lg mb-4">{message}</p>}
       {message && (
            <p className="mt-4 text-gray-600">
                Redirecting to <Link to="/login" className="text-blue-600 hover:underline">Login</Link>...
             </p>
       )}
        {!message && !isValidToken && ( // Link to login if token was invalid
            <p className="mt-4 text-gray-600">
                Go back to <Link to="/login" className="text-blue-600 hover:underline">Login</Link>
             </p>
        )}

    </div>
  );
}

export default ResetPasswordPage;