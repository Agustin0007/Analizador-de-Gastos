import { useState, useEffect, useMemo, useCallback } from 'react';
import { FiDollarSign, FiTrendingUp, FiTrendingDown, FiCalendar } from 'react-icons/fi';
import ExpenseCharts from '../components/ExpenseCharts';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import '../styles/dashboard.css';

const INITIAL_SUMMARY = {
  totalGastos: 0,
  gastosMensuales: 0,
  mayorGasto: 0,
  ultimoGasto: 0
};

const Dashboard = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
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
      
      setExpenses(expensesData);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const summary = useMemo(() => {
    if (!expenses.length) return INITIAL_SUMMARY;

    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const currentMonth = new Date().getMonth();
    const monthlyExpenses = expenses
      .filter(expense => new Date(expense.date).getMonth() === currentMonth)
      .reduce((sum, expense) => sum + expense.amount, 0);
    
    const maxExpense = Math.max(...expenses.map(expense => expense.amount));
    const sortedExpenses = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));
    const lastExpense = sortedExpenses[0]?.amount || 0;

    return {
      totalGastos: total,
      gastosMensuales: monthlyExpenses,
      mayorGasto: maxExpense,
      ultimoGasto: lastExpense
    };
  }, [expenses]);

  if (loading) {
    return <div className="dashboard-loading glass-card">Cargando...</div>;
  }

  return (
    <div className="dashboard">
      <div className="summary-cards">
        {[
          { icon: FiDollarSign, title: 'Total Gastos', value: summary.totalGastos },
          { icon: FiCalendar, title: 'Gastos Mensuales', value: summary.gastosMensuales },
          { icon: FiTrendingUp, title: 'Mayor Gasto', value: summary.mayorGasto },
          { icon: FiTrendingDown, title: 'Último Gasto', value: summary.ultimoGasto }
        ].map(({ icon: Icon, title, value }) => (
          <div key={title} className="card glass-card">
            <div className="card-icon">
              <Icon />
            </div>
            <div className="card-info">
              <h3>{title}</h3>
              <p className="amount">$ {value.toFixed(2)}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card">
        <ExpenseCharts expenses={expenses} />
      </div>
    </div>
  );
};

export default Dashboard;