import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { Line, Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FiDownload, FiFilePlus } from 'react-icons/fi';
import '../styles/statistics.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function Statistics() {
  const [expenses, setExpenses] = useState([]);
  const [period, setPeriod] = useState('monthly');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchExpenses();
    }
  }, [user]);

  const fetchExpenses = async () => {
    try {
      const expensesRef = collection(db, 'expenses');
      const q = query(expensesRef, where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      
      const expensesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setExpenses(expensesData);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const getExpensesByCategory = () => {
    const categoryTotals = {};
    expenses.forEach(expense => {
      categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
    });
    return categoryTotals;
  };

  const getExpensesByPeriod = () => {
    const periodData = {};
    expenses.forEach(expense => {
      const date = new Date(expense.date);
      let periodKey;
      
      switch (period) {
        case 'weekly':
          periodKey = date.toLocaleDateString('es-ES', { weekday: 'short' });
          break;
        case 'monthly':
          periodKey = date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
          break;
        case 'yearly':
          periodKey = date.toLocaleDateString('es-ES', { month: 'short' });
          break;
        default:
          periodKey = date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
      }
      
      periodData[periodKey] = (periodData[periodKey] || 0) + expense.amount;
    });
    return periodData;
  };

  const chartData = {
    category: {
      labels: Object.keys(getExpensesByCategory()),
      datasets: [{
        label: 'Gastos por Categoría',
        data: Object.values(getExpensesByCategory()),
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56',
          '#4BC0C0', '#9966FF', '#FF9F40'
        ]
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
    monthly: {
      labels: Object.keys(getExpensesByPeriod()),
      datasets: [{
        label: 'Distribución Mensual',
        data: Object.values(getExpensesByPeriod()),
        backgroundColor: '#4BC0C0',
        borderColor: '#4BC0C0',
      }]
    }
  };

  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new();
    const data = expenses.map(expense => ({
      Fecha: expense.date,
      Categoría: expense.category,
      Monto: expense.amount,
      Descripción: expense.description || ''
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Gastos");
    XLSX.writeFile(workbook, "gastos.xlsx");
  };

  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      
      doc.text('Reporte de Gastos', 20, 20);

      const tableData = expenses.map(expense => [
        new Date(expense.date).toLocaleDateString(),
        expense.category,
        `$${expense.amount}`
      ]);

      autoTable(doc, {
        head: [['Fecha', 'Categoría', 'Monto']],
        body: tableData,
        startY: 30,
        theme: 'striped',
        styles: { fontSize: 10 },
        headStyles: { fillColor: [33, 115, 70] }
      });

      doc.save('gastos.pdf');
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Error al generar el PDF');
    }
  };

  if (loading) {
    return <div className="loading">Cargando estadísticas...</div>;
  }

  if (!expenses.length) {
    return <div className="no-data">No hay gastos registrados</div>;
  }

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

      <div className="controls">
        <div className="period-selector">
          <select value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option value="weekly">Semanal</option>
            <option value="monthly">Mensual</option>
            <option value="yearly">Anual</option>
          </select>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-container">
          <h3>Gastos por Categoría</h3>
          <Pie data={chartData.category} />
        </div>

        <div className="chart-container">
          <h3>Tendencia de Gastos</h3>
          <Line data={chartData.period} />
        </div>

        <div className="chart-container">
          <h3>Distribución Mensual</h3>
          <Bar data={chartData.monthly} />
        </div>
      </div>
    </div>
  );
}