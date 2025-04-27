import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { memo } from 'react';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Cargando...</div>;
  }
  
  return user ? children : <Navigate to="/login" replace />;
};

export default memo(PrivateRoute);