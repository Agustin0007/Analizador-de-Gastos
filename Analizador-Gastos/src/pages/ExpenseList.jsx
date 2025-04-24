import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { FiTrash2, FiEdit, FiPlusCircle, FiX } from 'react-icons/fi';
import ExpenseForm from '../components/ExpenseForm';
import '../styles/expense-list.css';

export default function ExpenseList() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchExpenses();
  }, [user]);

  const fetchExpenses = async () => {
    try {
      const q = query(
        collection(db, 'expenses'),
        where('userId', '==', user.uid)
      );
      const querySnapshot = await getDocs(q);
      const expensesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setExpenses(expensesData.sort((a, b) => new Date(b.date) - new Date(a.date)));
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este gasto?')) {
      try {
        await deleteDoc(doc(db, 'expenses', id));
        setExpenses(expenses.filter(expense => expense.id !== id));
      } catch (error) {
        console.error('Error deleting expense:', error);
      }
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setShowForm(true);
  };

  const handleExpenseAdded = () => {
    fetchExpenses();
    setShowForm(false);
    setEditingExpense(null);
  };

  if (loading) return <div>Cargando...</div>;

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
        {expenses.map(expense => (
          <div key={expense.id} className="expense-row">
            <div>{new Date(expense.date).toLocaleDateString()}</div>
            <div>{expense.category}</div>
            <div>{expense.description || '-'}</div>
            <div className="amount">${expense.amount.toFixed(2)}</div>
            <div className="actions">
              <button 
                className="edit-btn"
                onClick={() => handleEdit(expense)}
              >
                <FiEdit />
              </button>
              <button 
                className="delete-btn"
                onClick={() => handleDelete(expense.id)}
              >
                <FiTrash2 />
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {showForm && (
        <div className="form-overlay" onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowForm(false);
            setEditingExpense(null);
          }
        }}>
          <div className="form-container">
            <button 
              className="close-form-btn"
              onClick={() => {
                setShowForm(false);
                setEditingExpense(null);
              }}
            >
              <FiX />
            </button>
            <ExpenseForm 
              expense={editingExpense}
              onExpenseAdded={handleExpenseAdded}
              onCancel={() => {
                setShowForm(false);
                setEditingExpense(null);
              }}
            />
          </div>
        </div>
      )}
      <button className="add-expense-btn" onClick={() => setShowForm(true)}>
        <FiPlusCircle /> Registrar Gasto
      </button>
    </div>
  );
}