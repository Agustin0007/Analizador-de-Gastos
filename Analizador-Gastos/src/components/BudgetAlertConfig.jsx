import { useState } from 'react';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import './BudgetAlertConfig.css';

export default function BudgetAlertConfig({ config, categories, onChange }) {
  const [newBudget, setNewBudget] = useState({
    category: '',
    limit: '',
    email: '',
    frequency: 'monthly'
  });

  const handleAddBudget = () => {
    if (!newBudget.category || !newBudget.limit) return;
    
    const updatedBudgets = {
      ...config.budgets,
      [newBudget.category]: {
        limit: parseFloat(newBudget.limit),
        email: newBudget.email,
        frequency: newBudget.frequency
      }
    };

    onChange({
      ...config,
      budgets: updatedBudgets
    });

    setNewBudget({
      category: '',
      limit: '',
      email: '',
      frequency: 'monthly'
    });
  };

  return (
    <div className="budget-alert-config">
      <div className="budget-form">
        <select
          value={newBudget.category}
          onChange={(e) => setNewBudget({...newBudget, category: e.target.value})}
        >
          <option value="">Seleccionar categoría</option>
          {categories.map((cat, index) => (
            <option key={index} value={cat.name}>{cat.name}</option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Límite de presupuesto"
          value={newBudget.limit}
          onChange={(e) => setNewBudget({...newBudget, limit: e.target.value})}
        />

        <input
          type="email"
          placeholder="Email para alertas"
          value={newBudget.email}
          onChange={(e) => setNewBudget({...newBudget, email: e.target.value})}
        />

        <select
          value={newBudget.frequency}
          onChange={(e) => setNewBudget({...newBudget, frequency: e.target.value})}
        >
          <option value="daily">Diario</option>
          <option value="weekly">Semanal</option>
          <option value="monthly">Mensual</option>
        </select>

        <button onClick={handleAddBudget} className="add-budget-btn">
          <FiPlus /> Agregar Presupuesto
        </button>
      </div>

      <div className="budgets-list">
        {Object.entries(config.budgets).map(([category, budget]) => (
          <div key={category} className="budget-item">
            <div className="budget-info">
              <h4>{category}</h4>
              <p>Límite: ${budget.limit}</p>
              <p>Frecuencia: {budget.frequency}</p>
              <p>Email: {budget.email}</p>
            </div>
            <button 
              onClick={() => {
                const { [category]: _, ...rest } = config.budgets;
                onChange({ ...config, budgets: rest });
              }}
              className="delete-budget-btn"
            >
              <FiTrash2 />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}