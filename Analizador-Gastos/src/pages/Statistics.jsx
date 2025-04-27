import { useState, useEffect, useCallback, useMemo } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Filler, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title } from 'chart.js';
import { Pie, Line, Bar } from 'react-chartjs-2';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FiDownload, FiFilePlus } from 'react-icons/fi';
import '../styles/statistics.css';
// Remove or comment out this line as we're creating the Statistics component here
// import { Statistics } from '../components/Statistics';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler  // Añadir Filler aquí
);

const INITIAL_FILTERS = {
  dateFrom: '',
  dateTo: '',
  minAmount: '',
  maxAmount: '',
  categories: []
};

const CHART_COLORS = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'];

// Rename the component to avoid conflicts
const StatisticsPage = () => {
  // Add this with other state declarations at the top
  const [tags, setTags] = useState([]);
  
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [period, setPeriod] = useState('monthly');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [compareMode, setCompareMode] = useState(false);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [savingsGoal, setSavingsGoal] = useState(0);
  const [budget, setBudget] = useState(0);

  const fetchExpenses = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const q = query(collection(db, 'expenses'), where('userId', '==', user.uid));
      const snapshot = await getDocs(q);
      const expensesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setExpenses(expensesData);
    } catch (error) {
      console.error('Error loading expenses:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return (
        (!filters.dateFrom || expenseDate >= new Date(filters.dateFrom)) &&
        (!filters.dateTo || expenseDate <= new Date(filters.dateTo)) &&
        (!filters.minAmount || expense.amount >= Number(filters.minAmount)) &&
        (!filters.maxAmount || expense.amount <= Number(filters.maxAmount))
      );
    });
  }, [expenses, filters]);

  const expensesByCategory = useMemo(() => {
    return filteredExpenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {});
  }, [filteredExpenses]);

  const expensesByPeriod = useMemo(() => {
    return filteredExpenses.reduce((acc, expense) => {
      const date = new Date(expense.date);
      const key = date.toLocaleDateString('es-ES', 
        period === 'weekly' ? { weekday: 'short' } :
        period === 'yearly' ? { year: 'numeric' } :
        { month: 'short' }
      );
      acc[key] = (acc[key] || 0) + expense.amount;
      return acc;
    }, {});
  }, [filteredExpenses, period]);

  const comparativeData = useMemo(() => {
    const currentDate = new Date();
    return filteredExpenses.reduce((acc, expense) => {
      const expenseDate = new Date(expense.date);
      const isCurrentPeriod = expenseDate.getMonth() === currentDate.getMonth();
      const key = isCurrentPeriod ? 'current' : 'previous';
      acc[key][expense.category] = (acc[key][expense.category] || 0) + expense.amount;
      return acc;
    }, { current: {}, previous: {} });
  }, [filteredExpenses]);

  const predictedExpenses = useMemo(() => {
    if (filteredExpenses.length < 2) return null;
    const monthlyTotals = filteredExpenses.reduce((acc, expense) => {
      const month = new Date(expense.date).getMonth();
      acc[month] = (acc[month] || 0) + expense.amount;
      return acc;
    }, {});
    return Math.round(Object.values(monthlyTotals).reduce((a, b) => a + b, 0) / Object.values(monthlyTotals).length);
  }, [filteredExpenses]);

  const getFilteredExpenses = useCallback(() => {
    return expenses.filter(expense => {
      if (searchTerm && !expense.description?.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      if (filters.dateFrom && new Date(expense.date) < new Date(filters.dateFrom)) {
        return false;
      }
      if (filters.dateTo && new Date(expense.date) > new Date(filters.dateTo)) {
        return false;
      }
      if (filters.minAmount && expense.amount < Number(filters.minAmount)) {
        return false;
      }
      if (filters.maxAmount && expense.amount > Number(filters.maxAmount)) {
        return false;
      }
      if (tags.length > 0 && !tags.some(tag => expense.tags?.includes(tag))) {
        return false;
      }
      return true;
    });
  }, [expenses, searchTerm, filters, tags]);

  // Cálculos y funciones auxiliares
  const calculatePredictedExpenses = () => {
    if (expenses.length < 2) return null;
    const monthlyTotals = {};
    expenses.forEach(expense => {
      const month = new Date(expense.date).getMonth();
      monthlyTotals[month] = (monthlyTotals[month] || 0) + expense.amount;
    });
    const average = Object.values(monthlyTotals).reduce((a, b) => a + b, 0) / Object.values(monthlyTotals).length;
    return Math.round(average);
  };

  const calculateSavingsProgress = () => {
    const currentMonth = new Date().getMonth();
    const currentMonthExpenses = expenses.filter(expense => 
      new Date(expense.date).getMonth() === currentMonth
    ).reduce((total, expense) => total + expense.amount, 0);
    return {
      current: currentMonthExpenses,
      remaining: savingsGoal - currentMonthExpenses,
      percentage: Math.round((currentMonthExpenses / savingsGoal) * 100)
    };
  };

  // Variables calculadas
  const savingsProgress = calculateSavingsProgress();
  const predictedAmount = calculatePredictedExpenses();

  const getExpensesByCategory = () => {
    const totals = {};
    getFilteredExpenses().forEach(expense => {
      totals[expense.category] = (totals[expense.category] || 0) + expense.amount;
    });
    return totals;
  };

  const getExpensesByPeriod = () => {
    const periodData = {};
    getFilteredExpenses().forEach(expense => {
      const date = new Date(expense.date);
      let periodKey;
      
      switch (period) {
        case 'weekly':
          periodKey = date.toLocaleDateString('es-ES', { weekday: 'short' });
          break;
        case 'monthly':
          periodKey = date.toLocaleDateString('es-ES', { month: 'short' });
          break;
        case 'yearly':
          periodKey = date.toLocaleDateString('es-ES', { year: 'numeric' });
          break;
        default:
          periodKey = date.toLocaleDateString('es-ES', { month: 'short' });
      }
      
      periodData[periodKey] = (periodData[periodKey] || 0) + expense.amount;
    });
    return periodData;
  };

  const getComparativeData = () => {
    const currentPeriodData = {};
    const previousPeriodData = {};
    const currentDate = new Date();
    
    getFilteredExpenses().forEach(expense => {
      const expenseDate = new Date(expense.date);
      const isCurrentPeriod = expenseDate.getMonth() === currentDate.getMonth();
      const isPreviousPeriod = expenseDate.getMonth() === currentDate.getMonth() - 1;
  
      if (isCurrentPeriod) {
        currentPeriodData[expense.category] = (currentPeriodData[expense.category] || 0) + expense.amount;
      } else if (isPreviousPeriod) {
        previousPeriodData[expense.category] = (previousPeriodData[expense.category] || 0) + expense.amount;
      }
    });
  
    return { currentPeriodData, previousPeriodData };
  };

  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new();
    const data = getFilteredExpenses().map(expense => ({
      Fecha: new Date(expense.date).toLocaleDateString(),
      Categoría: expense.category,
      Monto: expense.amount,
      Descripción: expense.description || ''
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Gastos");
    XLSX.writeFile(workbook, "gastos.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Reporte de Gastos', 20, 20);

    const tableData = getFilteredExpenses().map(expense => [
      new Date(expense.date).toLocaleDateString(),
      expense.category,
      `$${expense.amount}`
    ]);

    autoTable(doc, {
      head: [['Fecha', 'Categoría', 'Monto']],
      body: tableData,
      startY: 30,
    });

    doc.save('gastos.pdf');
  };

  const chartData = {
    category: {
      labels: Object.keys(getExpensesByCategory()),
      datasets: [{
        label: 'Gastos por Categoría',
        data: Object.values(getExpensesByCategory()),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
      }]
    },
    period: {
      labels: Object.keys(getExpensesByPeriod()),
      datasets: [{
        label: 'Gastos por Período',
        data: Object.values(getExpensesByPeriod()),
        fill: false,
        borderColor: '#36A2EB',
        tension: 0.1
      }]
    },
    comparative: {
      labels: Object.keys(getComparativeData().currentPeriodData),
      datasets: [
        {
          label: 'Período Actual',
          data: Object.values(getComparativeData().currentPeriodData),
          backgroundColor: '#36A2EB',
        },
        {
          label: 'Período Anterior',
          data: Object.values(getComparativeData().previousPeriodData),
          backgroundColor: '#FF6384',
        }
      ]
    }
  };

  if (loading) {
    return <div className="loading">Cargando estadísticas...</div>;
  }

  if (!expenses.length) {
    return <div className="no-data">No hay gastos registrados</div>;
  }

  // Eliminar las funciones duplicadas que están después del primer return
  // Mantener solo las primeras declaraciones de:
  // - getExpensesByCategory
  // - getExpensesByPeriod
  // - getComparativeData
  // - exportToExcel
  // - exportToPDF
  // - chartData

  return (
    <div className="statistics-container">
      <div className="header">
        <h2>Estadísticas de Gastos</h2>
        <div className="export-buttons">
          <button onClick={exportToExcel} className="export-btn excel">
            <FiDownload /> Excel
          </button>
          <button onClick={exportToPDF} className="export-btn pdf">
            <FiFilePlus /> PDF
          </button>
        </div>
      </div>

      <div className="financial-goals">
        <div className="goals-inputs">
          <div className="input-group">
            <label>Meta de Ahorro Mensual</label>
            <input
              type="number"
              value={savingsGoal}
              onChange={(e) => setSavingsGoal(Number(e.target.value))}
              placeholder="Ingrese su meta"
            />
          </div>
          <div className="input-group">
            <label>Presupuesto Mensual</label>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              placeholder="Ingrese su presupuesto"
            />
          </div>
        </div>

        {savingsGoal > 0 && (
          <div className="savings-progress">
            <h3>Progreso de Ahorro</h3>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${Math.min(savingsProgress.percentage, 100)}%` }}
              ></div>
            </div>
            <p>Has gastado ${savingsProgress.current} de ${savingsGoal}</p>
            {savingsProgress.remaining > 0 ? (
              <p className="remaining-positive">Te quedan ${savingsProgress.remaining} para alcanzar tu meta</p>
            ) : (
              <p className="remaining-negative">Has superado tu meta por ${Math.abs(savingsProgress.remaining)}</p>
            )}
          </div>
        )}

        {predictedAmount && (
          <div className="prediction-section">
            <h3>Análisis Predictivo</h3>
            <p>Basado en tus gastos anteriores, se estima que gastarás aproximadamente:</p>
            <strong>${predictedAmount}</strong>
            {budget > 0 && (
              <div className="budget-alert">
                {predictedAmount > budget ? (
                  <p>⚠️ Este monto supera tu presupuesto por ${predictedAmount - budget}</p>
                ) : (
                  <p>✅ Este monto está dentro de tu presupuesto</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="controls">
        <div className="period-selector">
          <select value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option value="weekly">Semanal</option>
            <option value="monthly">Mensual</option>
            <option value="yearly">Anual</option>
          </select>
          <button 
            className={`compare-btn ${compareMode ? 'active' : ''}`}
            onClick={() => setCompareMode(!compareMode)}
          >
            {compareMode ? 'Desactivar Comparación' : 'Comparar Períodos'}
          </button>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-container">
          <h3>Gastos por Categoría</h3>
          <Pie data={chartData.category} />
        </div>

        <div className="chart-container">
          <h3>Tendencia de Gastos</h3>
          <Line 
            data={chartData.period}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
                title: {
                  display: true,
                  text: 'Tendencia de Gastos por Período'
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: 'Monto ($)'
                  }
                }
              }
            }}
          />
        </div>

        {compareMode && (
          <div className="chart-container">
            <h3>Comparativa de Períodos</h3>
            <Bar 
              data={chartData.comparative}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  title: {
                    display: true,
                    text: 'Comparación entre Períodos'
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Monto ($)'
                    }
                  }
                }
              }}
            />
          </div>
        )}
      </div>
      <div className="summary-section">
        <h3>Resumen de Gastos</h3>
        <div className="summary-grid">
          <div className="summary-card">
            <h4>Total Gastado</h4>
            <p>${getFilteredExpenses().reduce((sum, exp) => sum + exp.amount, 0).toFixed(2)}</p>
          </div>
          <div className="summary-card">
            <h4>Promedio por Transacción</h4>
            <p>${(getFilteredExpenses().reduce((sum, exp) => sum + exp.amount, 0) / 
                 (getFilteredExpenses().length || 1)).toFixed(2)}</p>
          </div>
          <div className="summary-card">
            <h4>Mayor Gasto</h4>
            <p>${Math.max(...getFilteredExpenses().map(exp => exp.amount), 0).toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Change the export to match the new name
export default StatisticsPage;

