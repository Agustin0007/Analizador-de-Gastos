import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiHome, FiDollarSign, FiPieChart, FiSettings, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import '../styles/layout.css';

export default function Layout({ children }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Gastos App</h2>
        </div>
        <nav className="sidebar-nav">
          <Link to="/dashboard" className="nav-item">
            <FiHome /> <span>Dashboard</span>
          </Link>
          <Link to="/gastos" className="nav-item">
            <FiDollarSign /> <span>Gastos</span>
          </Link>
          <Link to="/estadisticas" className="nav-item">
            <FiPieChart /> <span>Estadísticas</span>
          </Link>
          <Link to="/configuracion" className="nav-item">
            <FiSettings /> <span>Configuración</span>
          </Link>
        </nav>
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            <FiLogOut /> <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}