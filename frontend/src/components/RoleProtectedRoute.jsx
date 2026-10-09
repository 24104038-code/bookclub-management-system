import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RoleProtectedRoute({ allowedRoles, children }) {
  const { user, hasRole, loading } = useAuth();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!hasRole(allowedRoles)) {
    return <Navigate to="/dashboard?access_denied=1" replace />;
  }

  return children;
}
