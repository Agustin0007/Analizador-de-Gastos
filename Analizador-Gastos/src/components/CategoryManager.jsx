import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import './CategoryManager.css';

const CATEGORY_ICONS = ['💰', '🏠', '🚗', '🍔', '🎮', '💊', '🎓', '✈️', '🛒', '💡', '📱', '🎭'];

export default function CategoryManager({ categories = [], onChange }) {
  const [newCategory, setNewCategory] = useState({
    name: '',
    type: 'expense',
    color: '#3498db',
    icon: '💰',
    budget: 0
  });
  const [editingId, setEditingId] = useState(null);
  const [localCategories, setLocalCategories] = useState(categories);

  useEffect(() => {
    setLocalCategories(categories);
  }, [categories]);

  const handleSaveCategories = () => {
    onChange(localCategories);
    toast.success('Cambios guardados exitosamente');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newCategory.name.trim()) {
      toast.error('El nombre de la categoría es requerido');
      return;
    }

    if (editingId) {
      const updatedCategories = localCategories.map(cat =>
        cat.id === editingId ? { ...newCategory, id: editingId } : cat
      );
      setLocalCategories(updatedCategories);
      onChange(updatedCategories);
    } else {
      const newId = Date.now().toString();
      const categoryToAdd = { ...newCategory, id: newId };
      const updatedCategories = [...localCategories, categoryToAdd];
      setLocalCategories(updatedCategories);
      onChange(updatedCategories);
    }

    setNewCategory({
      name: '',
      type: 'expense',
      color: '#3498db',
      icon: '💰',
      budget: 0
    });
    setEditingId(null);
    
    toast.success(editingId ? 'Categoría actualizada exitosamente' : 'Categoría agregada exitosamente');
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta categoría?')) {
      setLocalCategories(localCategories.filter(cat => cat.id !== id));
    }
  };

  const handleEdit = (category) => {
    setNewCategory(category);
    setEditingId(category.id);
  };

  return (
    <div className="category-manager">
      <form onSubmit={handleSubmit} className="category-form">
        <div className="form-row">
          <div className="form-group">
            <label>Nombre</label>
            <input
              type="text"
              value={newCategory.name}
              onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              placeholder="Nombre de la categoría"
            />
          </div>

          <div className="form-group">
            <label>Tipo</label>
            <select
              value={newCategory.type}
              onChange={(e) => setNewCategory({ ...newCategory, type: e.target.value })}
            >
              <option value="expense">Gasto</option>
              <option value="income">Ingreso</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Color</label>
            <input
              type="color"
              value={newCategory.color}
              onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Ícono</label>
            <div className="icon-selector">
              {CATEGORY_ICONS.map(icon => (
                <button
                  key={icon}
                  type="button"
                  className={`icon-button ${newCategory.icon === icon ? 'selected' : ''}`}
                  onClick={() => setNewCategory({ ...newCategory, icon: icon })}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button type="submit" className="submit-button">
          {editingId ? 'Actualizar Categoría' : 'Agregar Categoría'}
        </button>
      </form>

      <div className="categories-list">
        {localCategories.map(category => (
          <div key={category.id} className="category-card">
            <div className="category-info">
              <span className="category-icon">{category.icon}</span>
              <div className="category-details">
                <h3>{category.name}</h3>
                <span className="category-type">
                  {category.type === 'expense' ? 'Gasto' : 'Ingreso'}
                </span>
              </div>
            </div>
            <div className="category-actions">
              <button
                onClick={() => handleEdit(category)}
                className="edit-button"
              >
                ✏️
              </button>
              <button
                onClick={() => handleDelete(category.id)}
                className="delete-button"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <button onClick={handleSaveCategories} className="save-changes-button">
        Guardar Cambios de Categorías
      </button>
    </div>
  );
}