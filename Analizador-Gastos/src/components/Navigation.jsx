import { Link } from 'react-router-dom';

export default function Navigation() {
  return (
    <nav>
      <Link to="/dashboard">Dashboard</Link>
      <Link to="/gastos">Gastos</Link>
      <Link to="/estadisticas">Estadísticas</Link>
    </nav>
  );
}