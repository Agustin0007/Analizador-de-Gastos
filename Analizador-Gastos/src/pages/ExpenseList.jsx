import { useState, useEffect, useCallback, useMemo } from 'react';
import { collection, query, where, getDocs, deleteDoc, doc, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { budgetService } from '../services/budgetService';
import { FiTrash2, FiEdit, FiPlusCircle, FiX } from 'react-icons/fi';
import ExpenseForm from '../components/ExpenseForm';
import { toast } from 'react-toastify';
import '../styles/expense-list.css';


export default function ExpenseList() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const { user } = useAuth();

  const fetchExpenses = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const q = query(
        collection(db, 'expenses'),
        where('userId', '==', user.uid)
      );
      const snapshot = await getDocs(q);
      const expensesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setExpenses(expensesData.sort((a, b) => new Date(b.date) - new Date(a.date)));
    } catch (error) {
      console.error('Error fetching expenses:', error);
      toast.error('Error al cargar los gastos');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este gasto?')) return;

    try {
      await deleteDoc(doc(db, 'expenses', id));
      setExpenses(prev => prev.filter(expense => expense.id !== id));
      toast.success('Gasto eliminado exitosamente');
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast.error('Error al eliminar el gasto');
    }
  }, []);

  const handleEdit = useCallback((expense) => {
    setEditingExpense(expense);
    setShowForm(true);
  }, []);

  const handleExpenseAdded = useCallback(() => {
    fetchExpenses();
    setShowForm(false);
    setEditingExpense(null);
  }, [fetchExpenses]);

  const handleAddExpense = useCallback(async (expense) => {
    try {
      const docRef = await addDoc(collection(db, 'expenses'), {
        ...expense,
        userId: user.uid,
        timestamp: new Date().toISOString()
      });

      await budgetService.checkBudgetLimits(user.uid, expense);
      setExpenses(prev => [...prev, { ...expense, id: docRef.id }]);
      toast.success('Gasto agregado exitosamente');
    } catch (error) {
      console.error('Error adding expense:', error);
      toast.error('Error al agregar el gasto');
    }
  }, [user]);

  const closeForm = useCallback(() => {
    setShowForm(false);
    setEditingExpense(null);
  }, []);

  const sortedExpenses = useMemo(() => {
    return [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [expenses]);

  if (loading) {
    return <div className="loading-container">Cargando...</div>;
  }

  return (
    <div className="expense-list-container">
      <h2>Lista de Gastos</h2>
      <div className="expense-table">
        <div className="expense-header">
          <div>Fecha</div>
          <div>Categoría</div>
          <div>Descripción</div>
          <div>Monto</div>
          <div>Acciones</div>
        </div>
        {sortedExpenses.map(expense => (
          <div key={expense.id} className="expense-row">
            <div>{new Date(expense.date).toLocaleDateString()}</div>
            <div>{expense.category}</div>
            <div>{expense.description || '-'}</div>
            <div className="amount">${expense.amount.toFixed(2)}</div>
            <div className="actions">
              <button 
                className="edit-btn"
                onClick={() => handleEdit(expense)}
                aria-label="Editar gasto"
              >
                <FiEdit />
              </button>
              <button 
                className="delete-btn"
                onClick={() => handleDelete(expense.id)}
                aria-label="Eliminar gasto"
              >
                <FiTrash2 />
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {showForm && (
        <div className="form-overlay" onClick={closeForm}>
          <div className="form-container" onClick={e => e.stopPropagation()}>
            <button 
              className="close-form-btn"
              onClick={closeForm}
              aria-label="Cerrar formulario"
            >
              <FiX />
            </button>
            <ExpenseForm 
              expense={editingExpense}
              onExpenseAdded={handleExpenseAdded}
              onCancel={closeForm}
            />
          </div>
        </div>
      )}
      <button 
        className="add-expense-btn" 
        onClick={() => setShowForm(true)}
        aria-label="Agregar nuevo gasto"
      >
        <FiPlusCircle /> Registrar Gasto
      </button>
    </div>
  );
}