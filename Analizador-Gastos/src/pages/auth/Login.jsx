import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import '../../styles/auth.css';

const INITIAL_FORM_STATE = {
  email: '',
  password: ''
};

const Login = () => {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = formData;

    if (!email || !password) {
      toast.error('Por favor complete todos los campos');
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      toast.success('¡Inicio de sesión exitoso!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      toast.error(
        error.code === 'auth/wrong-password' ? 'Credenciales incorrectas' :
        error.code === 'auth/user-not-found' ? 'Usuario no encontrado' :
        'Error al iniciar sesión'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="particles">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`
            }}
          />
        ))}
      </div>
      <div className="auth-card">
        <h2 className="auth-title">Iniciar Sesión</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <FiMail />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Correo electrónico"
              required
              disabled={loading}
              autoComplete="email"
            />
          </div>
          <div className="input-group">
            <FiLock />
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Contraseña"
              required
              disabled={loading}
              autoComplete="current-password"
            />
          </div>
          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
        <div className="auth-link">
          ¿No tienes una cuenta?{' '}
          <Link to="/registro">Regístrate</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;