import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import getCurrentUser from "../utils/getCurrentUser";

// Protected route for authenticated users only
export const RequireAuth = ({ children }) => {
  const user = getCurrentUser();
  const location = useLocation();

  if (!user) {
    // Redirect to login page with the return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// Protected route for sellers/freelancers only
export const RequireSeller = ({ children }) => {
  const user = getCurrentUser();
  const location = useLocation();

  if (!user) {
    // Redirect to login page with the return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!user.isSeller) {
    // If user is not a seller, redirect to home
    return <Navigate to="/" replace />;
  }

  return children;
};

// Protected route for clients only
export const RequireClient = ({ children }) => {
  const user = getCurrentUser();
  const location = useLocation();

  if (!user) {
    // Redirect to login page with the return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.isSeller) {
    // If user is a seller, redirect to home
    return <Navigate to="/" replace />;
  }

  return children;
};

// Redirect authenticated users away from auth pages
export const RedirectIfAuth = ({ children }) => {
  const user = getCurrentUser();
  
  if (user) {
    // If already authenticated, redirect to home
    return <Navigate to="/" replace />;
  }

  return children;
};