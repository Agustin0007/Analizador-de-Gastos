import { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import ExpenseList from './pages/ExpenseList';
import Statistics from './pages/Statistics';
import AlertConfig from './pages/AlertConfig';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ConfigProvider } from './context/ConfigContext';
import Config from './pages/Config';
import { NotificationProvider } from './context/NotificationContext';

export default function App() {
  return (
    <AuthProvider>
      <ConfigProvider>
        <NotificationProvider>
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/registro" element={<Register />} />
              <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/gastos" element={<ExpenseList />} />
                <Route path="/estadisticas" element={<Statistics />} />
                <Route path="/alertas" element={<AlertConfig />} />
                <Route path="/configuracion" element={<Config />} />
              </Route>
            </Routes>
            <ToastContainer />
          </Suspense>
        </NotificationProvider>
      </ConfigProvider>
    </AuthProvider>
  );
}