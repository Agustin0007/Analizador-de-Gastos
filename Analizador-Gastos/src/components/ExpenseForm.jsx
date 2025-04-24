import { useState, useEffect } from 'react';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { FiDollarSign, FiCalendar, FiTag, FiFileText } from 'react-icons/fi';

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

export default function ExpenseForm({ expense, onExpenseAdded }) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (expense) {
      setAmount(expense.amount.toString());
      setDescription(expense.description || '');
      setCategory(expense.category);
      setDate(expense.date);
    }
  }, [expense]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || !category || !date) return;

    setLoading(true);
    try {
      if (expense) {
        // Actualizar gasto existente
        await updateDoc(doc(db, 'expenses', expense.id), {
          amount: parseFloat(amount),
          description,
          category,
          date,
          updatedAt: new Date().toISOString()
        });
      } else {
        // Crear nuevo gasto
        await addDoc(collection(db, 'expenses'), {
          userId: user.uid,
          amount: parseFloat(amount),
          description,
          category,
          date,
          createdAt: new Date().toISOString()
        });
      }

      onExpenseAdded();
    } catch (error) {
      console.error('Error saving expense:', error);
      alert('Error al guardar el gasto');
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
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
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
              value={category}
              onChange={(e) => setCategory(e.target.value)}
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
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </label>
        </div>

        <div className="form-group">
          <label>
            <FiFileText />
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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