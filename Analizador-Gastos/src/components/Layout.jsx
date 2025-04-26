import { Link, Outlet } from 'react-router-dom';
import NotificationBell from './NotificationBell';
import './Layout.css';
import { useNotifications } from '../hooks/useNotifications';

export default function Layout() {
  const notifications = useNotifications();

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="nav-brand">
          <h1>Analizador de Gastos</h1>
        </div>
        <div className="nav-links">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/gastos">Gastos</Link>
          <Link to="/estadisticas">Estadísticas</Link>
          <Link to="/configuracion">Configuración</Link>
        </div>
        <div className="nav-actions">
          <NotificationBell notifications={notifications} />
        </div>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
}