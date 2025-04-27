import { Link, Outlet } from 'react-router-dom';
import './Layout.css';

export default function Layout() {
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
        </div>
        <div className="nav-actions">
        </div>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
}