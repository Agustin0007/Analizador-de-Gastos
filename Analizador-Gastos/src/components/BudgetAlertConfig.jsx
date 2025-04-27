import { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import './BudgetAlertConfig.css';

export default function BudgetAlertConfig({ categories, onChange, userId }) {
  const [budgets, setBudgets] = useState([]);
  const expenseCategories = categories.filter(cat => cat.type === 'expense');
  const [newBudget, setNewBudget] = useState({
    categoryId: '',
    amount: '',
    period: 'monthly',
    alertThreshold: 80,
  });

  useEffect(() => {
    loadBudgets();
  }, [userId]);

  const loadBudgets = async () => {
    if (!userId) return;
    const currentBudgets = await checkAllBudgets();
    setBudgets(currentBudgets);
  };

  const checkBudgetStatus = async (categoryId) => {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const expensesRef = collection(db, 'expenses');
      const q = query(
        expensesRef,
        where('userId', '==', userId),
        where('categoryId', '==', categoryId),
        where('date', '>=', startOfMonth)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.reduce((total, doc) => total + doc.data().amount, 0);
    } catch (error) {
      console.error('Error checking budget status:', error);
      return 0;
    }
  };

  const checkAllBudgets = async () => {
    const updatedBudgets = await Promise.all(
      budgets.map(async (budget) => {
        const spent = await checkBudgetStatus(budget.categoryId);
        const percentage = (spent / parseFloat(budget.amount)) * 100;
        return { ...budget, currentSpent: spent, percentage };
      })
    );
    return updatedBudgets;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newBudget.categoryId || !newBudget.amount) {
      toast.error('Por favor complete todos los campos requeridos');
      return;
    }

    const currentSpent = await checkBudgetStatus(newBudget.categoryId);
    const percentage = (currentSpent / parseFloat(newBudget.amount)) * 100;

    const newBudgetItem = {
      ...newBudget,
      id: Date.now().toString(),
      currentSpent,
      percentage
    };
    
    const updatedBudgetsList = [...budgets, newBudgetItem];
    setBudgets(updatedBudgetsList);
    onChange({ budgets: updatedBudgetsList });
    
    setNewBudget({
      categoryId: '',
      amount: '',
      period: 'monthly',
      alertThreshold: 80,
    });
  };

  const handleDelete = (budgetId) => {
    const updatedBudgets = budgets.filter(budget => budget.id !== budgetId);
    setBudgets(updatedBudgets);
    onChange({ budgets: updatedBudgets });
  };

  return (
    <div className="budget-alert-config">
      <div className="budget-form-container">
        <h3>Agregar Nuevo Presupuesto</h3>
        <form onSubmit={handleSubmit} className="budget-form">
          {/* Form fields remain the same */}
        </form>
      </div>

      <div className="budgets-list">
        <h3>Presupuestos Configurados</h3>
        {budgets.length === 0 ? (
          <div className="no-budgets">
            <p>No hay presupuestos configurados</p>
          </div>
        ) : (
          budgets.map(budget => {
            const category = categories.find(c => c.id === budget.categoryId);
            const percentage = ((budget.currentSpent || 0) / parseFloat(budget.amount)) * 100;
            const isOverBudget = percentage >= budget.alertThreshold;

            return (
              <div key={budget.id} className={`budget-card ${isOverBudget ? 'over-budget' : ''}`}>
                {/* Budget card content remains the same */}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}