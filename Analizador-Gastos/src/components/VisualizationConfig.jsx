import { FiPieChart, FiBarChart2, FiTrendingUp } from 'react-icons/fi';
import './VisualizationConfig.css';

export default function VisualizationConfig({ config, onChange }) {
  const handleChange = (field, value) => {
    onChange({
      ...config,
      [field]: value
    });
  };

  return (
    <div className="visualization-config">
      <div className="chart-selector">
        <h3>Gráfico Predeterminado</h3>
        <div className="chart-options">
          <button 
            className={`chart-option ${config.defaultChart === 'pie' ? 'active' : ''}`}
            onClick={() => handleChange('defaultChart', 'pie')}
          >
            <FiPieChart /> Circular
          </button>
          <button 
            className={`chart-option ${config.defaultChart === 'bar' ? 'active' : ''}`}
            onClick={() => handleChange('defaultChart', 'bar')}
          >
            <FiBarChart2 /> Barras
          </button>
          <button 
            className={`chart-option ${config.defaultChart === 'line' ? 'active' : ''}`}
            onClick={() => handleChange('defaultChart', 'line')}
          >
            <FiTrendingUp /> Líneas
          </button>
        </div>
      </div>

      <div className="comparison-settings">
        <h3>Comparación de Períodos</h3>
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={config.comparePeriods}
            onChange={(e) => handleChange('comparePeriods', e.target.checked)}
          />
          <span className="toggle-slider"></span>
          Mostrar comparación con período anterior
        </label>
      </div>

      <div className="threshold-settings">
        <h3>Límites Visuales</h3>
        <div className="threshold-input">
          <input
            type="number"
            placeholder="Límite de advertencia"
            value={config.thresholds.warning || ''}
            onChange={(e) => handleChange('thresholds', {
              ...config.thresholds,
              warning: parseFloat(e.target.value)
            })}
          />
          <div className="threshold-color" style={{backgroundColor: '#ffd700'}}></div>
        </div>
        <div className="threshold-input">
          <input
            type="number"
            placeholder="Límite crítico"
            value={config.thresholds.critical || ''}
            onChange={(e) => handleChange('thresholds', {
              ...config.thresholds,
              critical: parseFloat(e.target.value)
            })}
          />
          <div className="threshold-color" style={{backgroundColor: '#ff4444'}}></div>
        </div>
      </div>
    </div>
  );
}