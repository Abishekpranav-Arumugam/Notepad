//D:\Monotonous\jwt-mern-auth\frontend\src\components\ProtectedRoute.js
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

function ProtectedRoute({ isAuthenticated, children }) {
  if (!isAuthenticated) {
    // Redirect to login page if not authenticated
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the child routes or components
  return children ? children : <Outlet />;
}

export default ProtectedRoute;