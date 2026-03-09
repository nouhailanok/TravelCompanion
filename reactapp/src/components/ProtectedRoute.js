import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
  const { isAuthenticated, loadingAuth } = useAuth();
  const location = useLocation(); // To redirect back after login

  if (loadingAuth) {
    // Show a loading indicator while checking authentication status
    // This prevents a flicker or premature redirect if auth state is still being determined
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    // User not authenticated, redirect to login page
    // Pass the current location in state so we can redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // User is authenticated, render the child components (the actual protected page)
  return <Outlet />;
};

export default ProtectedRoute;