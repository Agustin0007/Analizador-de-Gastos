import { Link } from 'react-router-dom';
import { FiHome, FiDollarSign, FiPieChart, FiSettings } from 'react-icons/fi';
import '../styles/navigation.css';

export default function Navigation() {
  return (
    <nav className="navigation">
      <Link to="/dashboard" className="nav-link">
        <FiHome /> Dashboard
      </Link>
      <Link to="/gastos" className="nav-link">
        <FiDollarSign /> Gastos
      </Link>
      <Link to="/estadisticas" className="nav-link">
        <FiPieChart /> Estadísticas
      </Link>
      <Link to="/settings" className="nav-link">
        <FiSettings /> Configuración
      </Link>
    </nav>
  );
}