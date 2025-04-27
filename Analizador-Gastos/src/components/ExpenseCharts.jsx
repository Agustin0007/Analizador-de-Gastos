import { useState, useEffect, useMemo } from 'react';
import { Line, Pie } from 'react-chartjs-2';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

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

const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const CHART_COLORS = [
  '#FF6384',
  '#36A2EB',
  '#FFCE56',
  '#4BC0C0',
  '#9966FF',
  '#FF9F40',
  '#FF6384',
  '#C9CBCF'
];

export default function ExpenseCharts() {
  const [expenses, setExpenses] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchExpenses = async () => {
      if (!user) return;
      
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
        
        setExpenses(expensesData);
      } catch (error) {
        console.error('Error fetching expenses:', error);
      }
    };

    fetchExpenses();
  }, [user]);

  const { categoryData, monthlyData } = useMemo(() => {
    const categoryTotals = CATEGORIES.map(category => 
      expenses
        .filter(expense => expense.category === category)
        .reduce((sum, expense) => sum + (expense.amount || 0), 0)
    );

    const monthlyTotals = Array(12).fill(0).map((_, month) => 
      expenses
        .filter(expense => new Date(expense.date).getMonth() === month)
        .reduce((sum, expense) => sum + (expense.amount || 0), 0)
    );

    return {
      categoryData: {
        labels: CATEGORIES,
        datasets: [{
          data: categoryTotals,
          backgroundColor: CHART_COLORS
        }]
      },
      monthlyData: {
        labels: MONTHS,
        datasets: [{
          label: 'Gastos por Mes',
          data: monthlyTotals,
          borderColor: '#36A2EB',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderWidth: 2,
          fill: true,
          tension: 0.4
        }]
      }
    };
  }, [expenses]);

  const commonOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          padding: 20,
          font: { size: 12 }
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => `$${context.formattedValue}`
        }
      }
    }
  }), []);

  if (!expenses.length) {
    return <div className="charts-container">No hay datos para mostrar</div>;
  }

  return (
    <div className="charts-container">
      <div className="chart-box">
        <h3>Distribución de Gastos por Categoría</h3>
        <div className="chart-wrapper">
          <Pie data={categoryData} options={commonOptions} />
        </div>
      </div>
      
      <div className="chart-box">
        <h3>Gastos Mensuales</h3>
        <div className="chart-wrapper">
          <Line 
            data={monthlyData} 
            options={{
              ...commonOptions,
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: (value) => `$${value}`
                  }
                },
                x: {
                  grid: { display: false }
                }
              }
            }} 
          />
        </div>
      </div>
    </div>
  );
}