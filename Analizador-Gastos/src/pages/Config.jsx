import { useState } from 'react';
import { useConfig } from '../context/ConfigContext';
import { toast } from 'react-toastify';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import './Config.css';
import CategoryManager from '../components/CategoryManager';
import VisualizationConfig from '../components/VisualizationConfig';
import BudgetAlertConfig from '../components/BudgetAlertConfig';

export default function Config() {
  const { config, saveConfig } = useConfig();
  const [currentConfig, setCurrentConfig] = useState(config);

  const handleGeneralChange = (field, value) => {
    setCurrentConfig({
      ...currentConfig,
      general: {
        ...currentConfig.general,
        [field]: value
      }
    });
  };

  const handleCategoryChange = (categories) => {
    setCurrentConfig({
      ...currentConfig,
      categories
    });
  };

  const handleSave = async () => {
    const success = await saveConfig(currentConfig);
    if (success) {
      toast.success('Configuración guardada exitosamente');
    } else {
      toast.error('Error al guardar la configuración');
    }
  };

  const handleVisualizationChange = (visualConfig) => {
    setCurrentConfig({
      ...currentConfig,
      visualization: visualConfig
    });
  };

  const handleBudgetChange = (budgetConfig) => {
    setCurrentConfig({
      ...currentConfig,
      budgets: budgetConfig.budgets
    });
  };

  return (
    <div className="config-container">
      <h1>Configuración</h1>
      
      <Tabs>
        <TabList>
          <Tab>🔧 General</Tab>
          <Tab>💸 Categorías</Tab>
          <Tab>📊 Visualización</Tab>
          <Tab>📅 Presupuestos y Alertas</Tab>
        </TabList>

        <TabPanel>
          <div className="config-section">
            <h2>Configuraciones Generales</h2>
            <select
              value={currentConfig.general.currency}
              onChange={(e) => handleGeneralChange('currency', e.target.value)}
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="PYG">PYG</option>
            </select>

            <select
              value={currentConfig.general.language}
              onChange={(e) => handleGeneralChange('language', e.target.value)}
            >
              <option value="es">Español</option>
              <option value="en">English</option>
            </select>

            <select
              value={currentConfig.general.analysisFrequency}
              onChange={(e) => handleGeneralChange('analysisFrequency', e.target.value)}
            >
              <option value="daily">Diario</option>
              <option value="weekly">Semanal</option>
              <option value="monthly">Mensual</option>
            </select>

            <div className="theme-toggle">
              <label>
                <input
                  type="checkbox"
                  checked={currentConfig.general.theme === 'dark'}
                  onChange={(e) => handleGeneralChange('theme', e.target.checked ? 'dark' : 'light')}
                />
                Modo Oscuro
              </label>
            </div>
          </div>
        </TabPanel>

        <TabPanel>
          <div className="config-section">
            <h2>Gestión de Categorías</h2>
            <CategoryManager 
              categories={currentConfig.categories}
              onChange={(categories) => handleCategoryChange(categories)}
            />
          </div>
        </TabPanel>

        <TabPanel>
          <div className="config-section">
            <h2>Configuración de Visualización</h2>
            <VisualizationConfig 
              config={currentConfig.visualization}
              onChange={handleVisualizationChange}
            />
          </div>
        </TabPanel>
        
        <TabPanel>
          <div className="config-section">
            <h2>Presupuestos y Alertas</h2>
            <BudgetAlertConfig 
              config={currentConfig}
              categories={currentConfig.categories}
              onChange={handleBudgetChange}
            />
          </div>
        </TabPanel>
      </Tabs>

      <button className="save-button" onClick={handleSave}>
        Guardar Cambios
      </button>
    </div>
  );
}