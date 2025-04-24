import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale
} from 'chart.js';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale
);

const ExpenseChart = ({ data }) => {
  const chartData = {
    labels: ['Alimentación', 'Transporte', 'Ocio', 'Servicios', 'Otros'],
    datasets: [
      {
        data: [300, 150, 200, 400, 100],
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF'
        ],
        borderColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF'
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        text: 'Distribución de Gastos',
        font: {
          size: 16
        }
      }
    }
  };

  return (
    <div className="chart-wrapper">
      <Pie data={chartData} options={options} />
    </div>
  );
};

export default ExpenseChart;