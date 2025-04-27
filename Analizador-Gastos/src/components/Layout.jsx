import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';
import '../styles/layout.css';

const Layout = () => {
  return (
    <div className="layout">
      <Navigation />
      <main className="main-content">
        <div className="content-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;