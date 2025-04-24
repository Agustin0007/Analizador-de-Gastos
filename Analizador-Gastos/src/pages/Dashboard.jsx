import { useState, useEffect } from 'react';
import { FiDollarSign, FiTrendingUp, FiTrendingDown, FiCalendar } from 'react-icons/fi';
import ExpenseCharts from '../components/ExpenseCharts';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import '../styles/dashboard.css';

const Dashboard = () => {
  const [summary, setSummary] = useState({
    totalGastos: 0,
    gastosMensuales: 0,
    mayorGasto: 0,
    ultimoGasto: 0
  });
  const { user } = useAuth();

  useEffect(() => {
    const fetchSummary = async () => {
      const q = query(
        collection(db, 'expenses'),
        where('userId', '==', user.uid)
      );
      
      const querySnapshot = await getDocs(q);
      const expenses = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
      const currentMonth = new Date().getMonth();
      const monthlyExpenses = expenses
        .filter(expense => new Date(expense.date).getMonth() === currentMonth)
        .reduce((sum, expense) => sum + expense.amount, 0);
      
      const maxExpense = Math.max(...expenses.map(expense => expense.amount));
      const lastExpense = expenses.length > 0 ? 
        expenses.sort((a, b) => new Date(b.date) - new Date(a.date))[0].amount : 0;

      setSummary({
        totalGastos: total,
        gastosMensuales: monthlyExpenses,
        mayorGasto: maxExpense,
        ultimoGasto: lastExpense
      });
    };

    fetchSummary();
  }, [user]);

  return (
    <div className="dashboard">
      <div className="summary-cards">
        <div className="card">
          <div className="card-icon">
            <FiDollarSign />
          </div>
          <div className="card-info">
            <h3>Total Gastos</h3>
            <p className="amount">$ {summary.totalGastos.toFixed(2)}</p>
          </div>
        </div>

        <div className="card">
          <div className="card-icon">
            <FiCalendar />
          </div>
          <div className="card-info">
            <h3>Gastos Mensuales</h3>
            <p className="amount">$ {summary.gastosMensuales.toFixed(2)}</p>
          </div>
        </div>

        <div className="card">
          <div className="card-icon">
            <FiTrendingUp />
          </div>
          <div className="card-info">
            <h3>Mayor Gasto</h3>
            <p className="amount">$ {summary.mayorGasto.toFixed(2)}</p>
          </div>
        </div>

        <div className="card">
          <div className="card-icon">
            <FiTrendingDown />
          </div>
          <div className="card-info">
            <h3>Último Gasto</h3>
            <p className="amount">$ {summary.ultimoGasto.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <ExpenseCharts />
    </div>
  );
};

export default Dashboard;