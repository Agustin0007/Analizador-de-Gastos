import { useState, useCallback } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import '../styles/expenses-form.css';

const Gastos = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: ''
  });
  const { user } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.description || !formData.amount) {
      toast.error('Por favor complete todos los campos requeridos');
      return;
    }

    try {
      setLoading(true);
      await handleAddExpense({
        description: formData.description,
        amount: parseFloat(formData.amount),
        category: formData.category
      });
      setFormData({ description: '', amount: '', category: '' });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleAddExpense = useCallback(async (expenseData) => {
    if (!user) {
      toast.error('Usuario no autenticado');
      return;
    }

    try {
      const expenseRef = await addDoc(collection(db, 'expenses'), {
        ...expenseData,
        userId: user.uid,
        date: new Date().toISOString(),
        timestamp: serverTimestamp(),
        createdAt: new Date().toISOString()
      });

      toast.success('Gasto agregado exitosamente');
      return expenseRef.id;
    } catch (error) {
      console.error('Error adding expense:', error);
      toast.error('Error al agregar el gasto');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user]);

  return (
    <div className="expenses-form-container glass-card">
      <h2 className="form-title">Agregar Nuevo Gasto</h2>
      <form onSubmit={handleSubmit} className="expense-form">
        <div className="form-group">
          <label>Descripción</label>
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Descripción del gasto"
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label>Monto</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            placeholder="0.00"
            step="0.01"
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label>Categoría</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="form-input"
          >
            <option value="">Seleccionar categoría</option>
            <option value="alimentacion">Alimentación</option>
            <option value="transporte">Transporte</option>
            <option value="entretenimiento">Entretenimiento</option>
            <option value="servicios">Servicios</option>
            <option value="otros">Otros</option>
          </select>
        </div>
        <button 
          type="submit" 
          className="submit-button"
          disabled={loading}
        >
          {loading ? 'Agregando...' : 'Agregar Gasto'}
        </button>
      </form>
    </div>
  );
};

export default Gastos;

