import { Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import ExpenseList from './pages/ExpenseList';
import Statistics from './pages/Statistics';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function App() {
  const location = useLocation();

  return (
    <AuthProvider>
      <Suspense fallback={<div>Loading...</div>}>
        <TransitionGroup>
          <CSSTransition
            key={location.key}
            timeout={500}
            classNames="page-transition"
            unmountOnExit
          >
            <Routes location={location}>
              <Route path="/login" element={<Login />} />
              <Route path="/registro" element={<Register />} />
              <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/gastos" element={<ExpenseList />} />
                <Route path="/estadisticas" element={<Statistics />} />
              </Route>
            </Routes>
          </CSSTransition>
        </TransitionGroup>
        <ToastContainer />
      </Suspense>
    </AuthProvider>
  );
}
