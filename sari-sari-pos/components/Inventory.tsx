import React, { useState, useEffect } from 'react';
import { InventoryItem, Category } from '../types';
import { PlusCircleIcon, PencilIcon, TrashIcon, ExclamationTriangleIcon } from './icons';

type InventoryProps = {
  inventory: InventoryItem[];
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
};

type InventoryTab = 'current' | 'add';

const emptyNewItem: Omit<InventoryItem, 'id' | 'stock'> = {
  name: '',
  category: Category.MISC,
  costPrice: 0,
  sellingPrice: 0,
};

const EditItemModal = ({ item, onSave, onCancel }: { item: InventoryItem; onSave: (item: InventoryItem) => void; onCancel: () => void; }) => {
  const [formData, setFormData] = useState(item);

  useEffect(() => {
    setFormData(item);
  }, [item]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const isNumeric = name === 'costPrice' || name === 'sellingPrice';
    setFormData(prev => ({ ...prev, [name]: isNumeric ? parseFloat(value) || 0 : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4" aria-modal="true" role="dialog">
      <div className="bg-slate-800 p-6 sm:p-8 rounded-lg shadow-2xl w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-6">Edit Item</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-400 mb-1">Item Name</label>
            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2.5 text-white" required />
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-slate-400 mb-1">Category</label>
            <select id="category" name="category" value={formData.category} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2.5 text-white">
              {Object.values(Category).map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="costPrice" className="block text-sm font-medium text-slate-400 mb-1">Cost</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">₱</span>
                <input type="number" id="costPrice" name="costPrice" value={formData.costPrice} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2.5 text-white pl-7" required min="0" step="0.01" />
              </div>
            </div>
            <div>
              <label htmlFor="sellingPrice" className="block text-sm font-medium text-slate-400 mb-1">Sell Price</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">₱</span>
                <input type="number" id="sellingPrice" name="sellingPrice" value={formData.sellingPrice} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2.5 text-white pl-7" required min="0" step="0.01" />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onCancel} className="px-4 py-2 rounded-md text-slate-300 bg-slate-700 hover:bg-slate-600">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-md text-white bg-indigo-600 hover:bg-indigo-700">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
};


export const Inventory: React.FC<InventoryProps> = ({ inventory, setInventory }) => {
  const [activeTab, setActiveTab] = useState<InventoryTab>('current');
  const [filterCategory, setFilterCategory] = useState<Category | 'all'>('all');
  const [newItem, setNewItem] = useState(emptyNewItem);
  const [addQuantity, setAddQuantity] = useState(1);
  const [selectedExistingItem, setSelectedExistingItem] = useState<string>('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  
  const LOW_STOCK_THRESHOLD = 20;

  const handleAddStock = () => {
    if (isAddingNew) {
      if (!newItem.name || newItem.costPrice <= 0 || newItem.sellingPrice <= 0) {
        alert('Please fill all fields for the new item.');
        return;
      }
      const newInventoryItem: InventoryItem = {
        ...newItem,
        id: `item-${Date.now()}`,
        stock: addQuantity,
      };
      setInventory([...inventory, newInventoryItem]);
      setNewItem(emptyNewItem);
    } else {
      if (!selectedExistingItem) {
        alert('Please select an item to add stock to.');
        return;
      }
      setInventory(
        inventory.map(item =>
          item.id === selectedExistingItem ? { ...item, stock: item.stock + addQuantity } : item
        )
      );
    }
    setAddQuantity(1);
    setSelectedExistingItem('');
    setIsAddingNew(false);
  };
  
  const handleDeleteItem = (itemId: string) => {
    if (window.confirm('Are you sure you want to delete this item? This action is permanent.')) {
        setInventory(prev => prev.filter(item => item.id !== itemId));
    }
  };

  const handleSaveItem = (updatedItem: InventoryItem) => {
    setInventory(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
    setEditingItem(null);
  };
  
  const filteredInventory = inventory.filter(
    item => filterCategory === 'all' || item.category === filterCategory
  );

  const renderCurrentStock = () => (
    <div>
      <div className="mb-4">
        <select
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value as Category | 'all')}
          className="bg-slate-700 border border-slate-600 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full md:w-1/4 p-2.5"
        >
          <option value="all">All Categories</option>
          {Object.values(Category).map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>
      <div className="overflow-x-auto relative shadow-md sm:rounded-lg bg-slate-800">
        <table className="w-full text-sm text-left text-slate-300">
          <thead className="text-xs text-slate-400 uppercase bg-slate-700">
            <tr>
              <th scope="col" className="py-3 px-6">Item Name</th>
              <th scope="col" className="py-3 px-6">Category</th>
              <th scope="col" className="py-3 px-6">Stock</th>
              <th scope="col" className="py-3 px-6">Cost</th>
              <th scope="col" className="py-3 px-6">Sell</th>
              <th scope="col" className="py-3 px-6 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInventory.map(item => {
              const isLowStock = item.stock <= LOW_STOCK_THRESHOLD;
              return (
              <tr key={item.id} className="border-b border-slate-700 hover:bg-slate-600/50">
                <td className="py-4 px-6 font-medium text-white whitespace-nowrap">{item.name}</td>
                <td className="py-4 px-6">{item.category}</td>
                <td className="py-4 px-6">
                  <div 
                      className={`flex items-center gap-2 ${isLowStock ? 'text-yellow-400 font-semibold cursor-pointer' : ''}`}
                      onClick={isLowStock ? () => setEditingItem(item) : undefined}
                      title={isLowStock ? 'Low stock! Click to manage.' : ''}
                      >
                      {isLowStock && <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0" />}
                      <span>{item.stock}</span>
                  </div>
                </td>
                <td className="py-4 px-6">₱{item.costPrice.toFixed(2)}</td>
                <td className="py-4 px-6">₱{item.sellingPrice.toFixed(2)}</td>
                <td className="py-4 px-6 text-center">
                  <div className="flex items-center justify-center gap-4">
                    <button onClick={() => setEditingItem(item)} className="text-indigo-400 hover:text-indigo-300" aria-label={`Edit ${item.name}`}><PencilIcon className="w-5 h-5" /></button>
                    <button onClick={() => handleDeleteItem(item.id)} className="text-red-400 hover:text-red-300" aria-label={`Delete ${item.name}`}><TrashIcon className="w-5 h-5" /></button>
                  </div>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderAddStock = () => (
    <div className="bg-slate-800 p-6 rounded-lg shadow-lg max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-6">Add Stock / New Item</h2>
      <div className="flex items-center mb-4">
        <input type="checkbox" id="addNew" checked={isAddingNew} onChange={() => setIsAddingNew(!isAddingNew)} className="w-4 h-4 text-indigo-600 bg-gray-700 border-gray-600 rounded focus:ring-indigo-600 ring-offset-gray-800 focus:ring-2" />
        <label htmlFor="addNew" className="ml-2 text-sm font-medium text-slate-300">Add a new item</label>
      </div>
      
      {isAddingNew ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" placeholder="Item Name" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} className="bg-slate-700 border border-slate-600 rounded p-2.5 text-white w-full" />
          <select value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value as Category})} className="bg-slate-700 border border-slate-600 rounded p-2.5 text-white w-full">
            {Object.values(Category).map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <input type="number" placeholder="Cost Price" value={newItem.costPrice || ''} onChange={e => setNewItem({...newItem, costPrice: parseFloat(e.target.value)})} className="bg-slate-700 border border-slate-600 rounded p-2.5 text-white w-full" />
          <input type="number" placeholder="Selling Price" value={newItem.sellingPrice || ''} onChange={e => setNewItem({...newItem, sellingPrice: parseFloat(e.target.value)})} className="bg-slate-700 border border-slate-600 rounded p-2.5 text-white w-full" />
        </div>
      ) : (
        <select value={selectedExistingItem} onChange={e => setSelectedExistingItem(e.target.value)} className="bg-slate-700 border border-slate-600 rounded p-2.5 text-white w-full mb-4">
          <option value="">Select Existing Item</option>
          {inventory.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
      )}

      <div className="mt-4">
        <label className="block text-slate-400 mb-2">Quantity to Add</label>
        <input type="number" min="1" value={addQuantity} onChange={e => setAddQuantity(parseInt(e.target.value))} className="bg-slate-700 border border-slate-600 rounded p-2.5 text-white w-full md:w-1/2" />
      </div>

      <button onClick={handleAddStock} className="mt-6 w-full inline-flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-indigo-500">
        <PlusCircleIcon className="w-5 h-5 mr-2" />
        Add to Inventory
      </button>
    </div>
  );

  return (
    <>
      <div className="p-4 sm:p-6 lg:p-8 text-slate-200">
        <h1 className="text-3xl font-bold text-white mb-6">Inventory Management</h1>
        <div className="border-b border-slate-700 mb-6">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button onClick={() => setActiveTab('current')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'current' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-500'}`}>
              Current Stock
            </button>
            <button onClick={() => setActiveTab('add')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'add' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-500'}`}>
              Add Stock
            </button>
          </nav>
        </div>
        {activeTab === 'current' ? renderCurrentStock() : renderAddStock()}
      </div>
      {editingItem && (
        <EditItemModal 
          item={editingItem} 
          onSave={handleSaveItem} 
          onCancel={() => setEditingItem(null)} 
        />
      )}
    </>
  );
};