import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import '../styles/settings.css';

export default function Settings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    profile: {
      displayName: '',
      email: '',
      currency: 'USD'
    },
    categories: [],
    budgets: {},
    notifications: {
      email: true,
      budgetAlerts: true,
      weeklyReport: false
    }
  });
  const [newCategory, setNewCategory] = useState('');

  useEffect(() => {
    loadUserSettings();
  }, [user]);

  const loadUserSettings = async () => {
    if (!user) return;
    try {
      const settingsDoc = await getDoc(doc(db, 'userSettings', user.uid));
      if (settingsDoc.exists()) {
        setSettings(settingsDoc.data());
      } else {
        // Crear configuración inicial
        await setDoc(doc(db, 'userSettings', user.uid), settings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'userSettings', user.uid), settings);
      alert('Configuración guardada exitosamente');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error al guardar la configuración');
    }
  };

  const addCategory = () => {
    if (newCategory.trim() && !settings.categories.includes(newCategory.trim())) {
      setSettings({
        ...settings,
        categories: [...settings.categories, newCategory.trim()],
        budgets: {
          ...settings.budgets,
          [newCategory.trim()]: 0
        }
      });
      setNewCategory('');
    }
  };

  const removeCategory = (category) => {
    const { [category]: _, ...remainingBudgets } = settings.budgets;
    setSettings({
      ...settings,
      categories: settings.categories.filter(c => c !== category),
      budgets: remainingBudgets
    });
  };

  const updateBudget = (category, amount) => {
    setSettings({
      ...settings,
      budgets: {
        ...settings.budgets,
        [category]: Number(amount)
      }
    });
  };

  if (loading) return <div className="loading">Cargando configuración...</div>;

  return (
    <div className="settings-container">
      <h2>Configuración</h2>

      <section className="settings-section">
        <h3>Perfil de Usuario</h3>
        <div className="form-group">
          <label>Nombre</label>
          <input
            type="text"
            value={settings.profile.displayName}
            onChange={(e) => setSettings({
              ...settings,
              profile: { ...settings.profile, displayName: e.target.value }
            })}
          />
        </div>
        <div className="form-group">
          <label>Moneda</label>
          <select
            value={settings.profile.currency}
            onChange={(e) => setSettings({
              ...settings,
              profile: { ...settings.profile, currency: e.target.value }
            })}
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="ARS">ARS ($)</option>
          </select>
        </div>
      </section>

      <section className="settings-section">
        <h3>Categorías de Gastos</h3>
        <div className="category-input">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Nueva categoría..."
          />
          <button onClick={addCategory}>Agregar</button>
        </div>
        <div className="categories-list">
          {settings.categories.map(category => (
            <div key={category} className="category-item">
              <span>{category}</span>
              <div className="category-controls">
                <input
                  type="number"
                  placeholder="Presupuesto"
                  value={settings.budgets[category]}
                  onChange={(e) => updateBudget(category, e.target.value)}
                />
                <button onClick={() => removeCategory(category)}>Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="settings-section">
        <h3>Notificaciones</h3>
        <div className="notifications-settings">
          <label>
            <input
              type="checkbox"
              checked={settings.notifications.email}
              onChange={(e) => setSettings({
                ...settings,
                notifications: { ...settings.notifications, email: e.target.checked }
              })}
            />
            Recibir notificaciones por email
          </label>
          <label>
            <input
              type="checkbox"
              checked={settings.notifications.budgetAlerts}
              onChange={(e) => setSettings({
                ...settings,
                notifications: { ...settings.notifications, budgetAlerts: e.target.checked }
              })}
            />
            Alertas de presupuesto
          </label>
          <label>
            <input
              type="checkbox"
              checked={settings.notifications.weeklyReport}
              onChange={(e) => setSettings({
                ...settings,
                notifications: { ...settings.notifications, weeklyReport: e.target.checked }
              })}
            />
            Reporte semanal
          </label>
        </div>
      </section>

      <div className="settings-actions">
        <button className="save-button" onClick={saveSettings}>
          Guardar Cambios
        </button>
      </div>
    </div>
  );
}