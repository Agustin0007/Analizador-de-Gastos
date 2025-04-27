import { useState, useEffect } from 'react';
import emailjs from '@emailjs/browser';
import { db } from '../firebase/config';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import './BudgetAlertConfig.css';

export default function BudgetAlertConfig({ config, categories, onChange, userId, onAlert }) {
  const [budgets, setBudgets] = useState([]);
  const expenseCategories = categories.filter(cat => cat.type === 'expense');

  useEffect(() => {
    if (!userId) return;

    // Escuchar cambios en gastos en tiempo real
    const expensesRef = collection(db, 'expenses');
    const unsubscribe = onSnapshot(
      query(expensesRef, where('userId', '==', userId)),
      async () => {
        // Actualizar todos los presupuestos cuando hay cambios en gastos
        await checkAllBudgets();
      }
    );

    return () => unsubscribe();
  }, [userId]);

  const checkAllBudgets = async () => {
    const updatedBudgets = await Promise.all(
      budgets.map(async (budget) => {
        const spent = await checkBudgetStatus(budget.categoryId);
        const percentage = (spent / parseFloat(budget.amount)) * 100;
        
        // Si supera el umbral, enviar alerta
        if (percentage >= budget.alertThreshold) {
          sendAlert(budget, spent, percentage);
        }

        return { ...budget, currentSpent: spent, percentage };
      })
    );

    setBudgets(updatedBudgets);
    onChange({ ...config, budgets: updatedBudgets });
  };

  const sendAlert = async (budget, spent, percentage) => {
    const category = categories.find(c => c.id === budget.categoryId);
    
    // Enviar notificación interna
    onAlert({
      type: 'budget_exceeded',
      message: `¡Alerta! Has superado el ${budget.alertThreshold}% del presupuesto en ${category?.name}`,
      category: category?.name,
      budget: budget.amount,
      spent,
      percentage
    });

    // Enviar email
    try {
      await emailjs.send(
        'service_t3tk3ug',
        'template_5ql5teb',
        {
          to_email: config?.general?.email,
          category_name: category?.name,
          budget_amount: new Intl.NumberFormat('es-PY', { style: 'currency', currency: 'PYG' }).format(budget.amount),
          current_spent: new Intl.NumberFormat('es-PY', { style: 'currency', currency: 'PYG' }).format(spent),
          percentage: percentage.toFixed(2),
          alert_threshold: budget.alertThreshold
        },
        'S3gNeo7kvU7LlC_Wl'
      );
    } catch (error) {
      console.error('Error sending email alert:', error);
    }
  };

  const [emailConfig, setEmailConfig] = useState({
    email: config?.general?.email || '',
    notifications: config?.general?.emailNotifications || false
  });

  useEffect(() => {
    if (config && Array.isArray(config.budgets)) {
      // Asegurarse de que los presupuestos coincidan con las categorías existentes
      const validBudgets = config.budgets.filter(budget => 
        expenseCategories.some(cat => cat.id === budget.categoryId)
      );
      setBudgets(validBudgets);
    }
  }, [config, categories]); // Agregar categories como dependencia

  const [newBudget, setNewBudget] = useState({
    categoryId: '',
    amount: '',
    period: 'monthly',
    alertThreshold: 80,
  });

  const handleEmailConfigChange = (changes) => {
    const updatedEmailConfig = { ...emailConfig, ...changes };
    setEmailConfig(updatedEmailConfig);
  };

  const saveEmailConfig = async () => {
    onChange({
      ...config,
      general: {
        ...config.general,
        email: emailConfig.email,
        emailNotifications: emailConfig.notifications
      }
    });
    toast.success('Configuración de email actualizada exitosamente');
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
      let totalAmount = 0;
      querySnapshot.forEach((doc) => {
        totalAmount += doc.data().amount;
      });

      return totalAmount;
    } catch (error) {
      console.error('Error checking budget status:', error);
      return 0;
    }
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
    
    if (emailConfig.notifications && emailConfig.email) {
      try {
        const category = categories.find(c => c.id === newBudget.categoryId);
        await emailjs.send(
          'service_t3tk3ug',
          'template_5ql5teb',
          {
            to_email: emailConfig.email,
            category_name: category?.name,
            budget_amount: new Intl.NumberFormat('es-PY', {
              style: 'currency',
              currency: 'PYG'
            }).format(newBudget.amount),
            current_spent: new Intl.NumberFormat('es-PY', {
              style: 'currency',
              currency: 'PYG'
            }).format(currentSpent),
            percentage: percentage.toFixed(2),
            alert_threshold: newBudget.alertThreshold,
            period: newBudget.period
          },
          'S3gNeo7kvU7LlC_Wl'
        );
      } catch (error) {
        console.error('Error sending email:', error);
        toast.error('Error al enviar el email de confirmación');
      }
    }

    setNewBudget({
      categoryId: '',
      amount: '',
      period: 'monthly',
      alertThreshold: 80,
    });
  };

  const saveBudgets = () => {
    onChange({ budgets: budgets });
    toast.success('Presupuestos actualizados exitosamente');
  };

  // En el render, actualizar la visualización de los presupuestos
  return (
    <div className="budget-alert-config">
      <div className="budget-form-container">
        <h3>Configuración de Alertas por Email</h3>
        <div className="email-config-section">
          <div className="form-group">
            <label>Email para Alertas</label>
            <input
              type="email"
              value={emailConfig.email}
              onChange={(e) => handleEmailConfigChange({ email: e.target.value })}
              placeholder="tu@email.com"
              className="email-input"
            />
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={emailConfig.notifications}
                onChange={(e) => handleEmailConfigChange({ notifications: e.target.checked })}
                className="checkbox-input"
              />
              <span>Activar notificaciones por email</span>
            </label>
          </div>
          <button onClick={saveEmailConfig} className="save-changes-button">
            Guardar Cambios de Email
          </button>
        </div>

        <h3>Agregar Nuevo Presupuesto</h3>
        <form onSubmit={handleSubmit} className="budget-form">
          <div className="form-group">
            <label>Categoría de Gasto *</label>
            <select
              value={newBudget.categoryId}
              onChange={(e) => setNewBudget({ ...newBudget, categoryId: e.target.value })}
              required
            >
              <option value="">Seleccione una categoría</option>
              {expenseCategories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Monto Límite *</label>
            <input
              type="number"
              value={newBudget.amount}
              onChange={(e) => setNewBudget({ ...newBudget, amount: e.target.value })}
              placeholder="Ingrese el monto límite"
              required
              min="1"
            />
          </div>

          <div className="form-group">
            <label>Período</label>
            <select
              value={newBudget.period}
              onChange={(e) => setNewBudget({ ...newBudget, period: e.target.value })}
            >
              <option value="daily">Diario</option>
              <option value="weekly">Semanal</option>
              <option value="monthly">Mensual</option>
              <option value="yearly">Anual</option>
            </select>
          </div>

          <div className="form-group">
            <label>Umbral de Alerta: {newBudget.alertThreshold}%</label>
            <input
              type="range"
              min="1"
              max="100"
              value={newBudget.alertThreshold}
              onChange={(e) => setNewBudget({ 
                ...newBudget, 
                alertThreshold: parseInt(e.target.value) 
              })}
            />
          </div>

          <button type="submit" className="add-budget-button">
            Agregar Presupuesto
          </button>
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
                <div className="budget-info">
                  <div className="budget-category">
                    <span className="category-icon">{category?.icon}</span>
                    <span className="category-name">{category?.name}</span>
                  </div>
                  <div className="budget-details">
                    <span className="budget-amount">
                      Límite: {new Intl.NumberFormat('es-PY', {
                        style: 'currency',
                        currency: 'PYG'
                      }).format(budget.amount)}
                    </span>
                    <span className="budget-spent">
                      Gastado: {new Intl.NumberFormat('es-PY', {
                        style: 'currency',
                        currency: 'PYG'
                      }).format(budget.currentSpent || 0)}
                    </span>
                    <div className="progress-bar">
                      <div 
                        className="progress" 
                        style={{ 
                          width: `${Math.min(percentage, 100)}%`,
                          backgroundColor: isOverBudget ? '#ff4444' : '#4CAF50'
                        }}
                      />
                    </div>
                    <span className="percentage">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <button
                  className="delete-budget-button"
                  onClick={() => handleDelete(budget.id)}
                >
                  🗑️
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}