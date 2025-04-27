import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiLock } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import '../../styles/auth.css';

const INITIAL_FORM_STATE = {
  name: '',
  email: '',
  password: ''
};

const ERROR_MESSAGES = {
  'auth/email-already-in-use': 'Este correo ya está registrado',
  'auth/invalid-email': 'Correo electrónico inválido',
  'auth/weak-password': 'La contraseña es muy débil'
};

const Register = () => {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signup } = useAuth();

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const validateForm = () => {
    const { name, email, password } = formData;
    if (!name.trim()) {
      toast.error('El nombre es requerido');
      return false;
    }
    if (!email.trim()) {
      toast.error('El correo es requerido');
      return false;
    }
    if (password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      const { name, email, password } = formData;
      await signup(email, password, name);
      toast.success('¡Registro exitoso!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(ERROR_MESSAGES[error.code] || 'Error al crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Crear Cuenta</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <FiUser />
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nombre completo"
              required
              disabled={loading}
              autoComplete="name"
            />
          </div>
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
              minLength={6}
              autoComplete="new-password"
            />
          </div>
          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>
        <div className="auth-link">
          ¿Ya tienes una cuenta?{' '}
          <Link to="/login">Inicia sesión</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;