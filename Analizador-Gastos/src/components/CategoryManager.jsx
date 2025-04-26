import { useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import './CategoryManager.css';

export default function CategoryManager({ categories, onChange }) {
  const [newCategory, setNewCategory] = useState({ name: '', color: '#000000', subcategories: [] });
  const [editingIndex, setEditingIndex] = useState(null);

  const handleAddCategory = () => {
    if (!newCategory.name) return;
    onChange([...categories, newCategory]);
    setNewCategory({ name: '', color: '#000000', subcategories: [] });
  };

  const handleAddSubcategory = (categoryIndex, subcategory) => {
    const updatedCategories = [...categories];
    updatedCategories[categoryIndex].subcategories.push(subcategory);
    onChange(updatedCategories);
  };

  const handleDeleteCategory = (index) => {
    const updatedCategories = categories.filter((_, i) => i !== index);
    onChange(updatedCategories);
  };

  return (
    <div className="category-manager">
      <div className="category-form">
        <input
          type="text"
          placeholder="Nombre de categoría"
          value={newCategory.name}
          onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
        />
        <input
          type="color"
          value={newCategory.color}
          onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
        />
        <button onClick={handleAddCategory}>
          <FiPlus /> Agregar Categoría
        </button>
      </div>

      <div className="categories-list">
        {categories.map((category, index) => (
          <div key={index} className="category-item" style={{ borderLeft: `4px solid ${category.color}` }}>
            <div className="category-header">
              <h3>{category.name}</h3>
              <div className="category-actions">
                <button onClick={() => setEditingIndex(index)}>
                  <FiEdit2 />
                </button>
                <button onClick={() => handleDeleteCategory(index)}>
                  <FiTrash2 />
                </button>
              </div>
            </div>
            <div className="subcategories">
              {category.subcategories.map((sub, subIndex) => (
                <span key={subIndex} className="subcategory-tag">
                  {sub}
                </span>
              ))}
              <button 
                className="add-subcategory"
                onClick={() => {
                  const subcategory = prompt('Nueva subcategoría:');
                  if (subcategory) handleAddSubcategory(index, subcategory);
                }}
              >
                <FiPlus /> Subcategoría
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}