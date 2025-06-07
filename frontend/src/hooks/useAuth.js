// frontend/src/hooks/useAuth.js
import { useContext } from 'react';
// Assuming you might create an AuthContext like this:
// import { AuthContext } from '../features/auth/contexts/AuthContext'; // or a global context

export const useAuth = () => {
    // const context = useContext(AuthContext);
    // if (!context) {
    //   throw new Error('useAuth must be used within an AuthProvider');
    // }
    // return context;

    // For now, a simplified version until you set up a full AuthContext:
    const getTokenPayload = () => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));
                return JSON.parse(jsonPayload);
            }
        } catch (e) { console.error("Error decoding token for useAuth", e); }
        return null;
    };

    const payload = getTokenPayload();

    return {
        // Adjust key if your JWT payload key for user ID is different (e.g., id, sub)
        currentUserId: payload ? payload.userId : null,
        isAuthenticated: !!payload,
        // You can add other user details from the token if available
        username: payload ? payload.username : null,
    };
};