import { Link, useNavigate } from 'react-router-dom';
import { FiHome, FiDollarSign, FiPieChart, FiLogOut } from 'react-icons/fi';
import { memo } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/navigation.css';

const NAV_ITEMS = [
  { path: '/dashboard', icon: FiHome, label: 'Dashboard' },
  { path: '/gastos', icon: FiDollarSign, label: 'Gastos' },
  { path: '/estadisticas', icon: FiPieChart, label: 'Estadísticas' }
];

const Navigation = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <nav className="navigation">
      {NAV_ITEMS.map(({ path, icon: Icon, label }) => (
        <Link key={path} to={path} className="nav-link">
          <Icon />
          <span>{label}</span>
        </Link>
      ))}
      <Link onClick={handleLogout} className="nav-link logout-link">
        <FiLogOut />
        <span>Cerrar Sesión</span>
      </Link>
    </nav>
  );
};

export default memo(Navigation);