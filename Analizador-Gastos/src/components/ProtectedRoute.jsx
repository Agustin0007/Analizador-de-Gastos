import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { memo } from 'react';

export const ProtectedRoute = memo(({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading-container">Cargando...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
});