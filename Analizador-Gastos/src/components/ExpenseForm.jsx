import { useState, useEffect, useCallback } from 'react';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { FiDollarSign, FiCalendar, FiTag, FiFileText } from 'react-icons/fi';
import { toast } from 'react-toastify';

const CATEGORIES = [
  'Alimentación',
  'Transporte',
  'Vivienda',
  'Servicios',
  'Entretenimiento',
  'Salud',
  'Educación',
  'Otros'
];

const INITIAL_FORM_STATE = {
  amount: '',
  description: '',
  category: '',
  date: new Date().toISOString().split('T')[0]
};

export default function ExpenseForm({ expense, onExpenseAdded }) {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (expense) {
      setFormData({
        amount: expense.amount.toString(),
        description: expense.description || '',
        category: expense.category,
        date: expense.date
      });
    }
  }, [expense]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const resetForm = useCallback(() => {
    setFormData(INITIAL_FORM_STATE);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { amount, category, date } = formData;
    if (!amount || !category || !date) return;

    setLoading(true);
    try {
      const expenseData = {
        userId: user.uid,
        amount: parseFloat(amount),
        description: formData.description,
        category,
        date,
        createdAt: new Date().toISOString()
      };

      if (expense) {
        await updateDoc(doc(db, 'expenses', expense.id), {
          ...expenseData,
          updatedAt: new Date().toISOString()
        });
        toast.success('Gasto actualizado exitosamente');
      } else {
        await addDoc(collection(db, 'expenses'), expenseData);
        toast.success('Gasto registrado exitosamente');
        resetForm();
      }

      onExpenseAdded();
    } catch (error) {
      console.error('Error saving expense:', error);
      toast.error('Error al guardar el gasto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="expense-form-container">
      <h2>{expense ? 'Editar Gasto' : 'Registrar Nuevo Gasto'}</h2>
      <form onSubmit={handleSubmit} className="expense-form">
        <div className="form-group">
          <label>
            <FiDollarSign />
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="Monto"
              required
              min="0"
              step="0.01"
            />
          </label>
        </div>

        <div className="form-group">
          <label>
            <FiTag />
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">Selecciona una categoría</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="form-group">
          <label>
            <FiCalendar />
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </label>
        </div>

        <div className="form-group">
          <label>
            <FiFileText />
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Descripción (opcional)"
            />
          </label>
        </div>

        <div className="form-buttons">
          <button type="submit" disabled={loading}>
            {loading ? 'Guardando...' : expense ? 'Actualizar' : 'Registrar'}
          </button>
        </div>
      </form>
    </div>
  );
}