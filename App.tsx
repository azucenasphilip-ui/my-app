
import React, { useState, useCallback } from 'react';
import { InventoryItem, Sale, Page } from './types';
import { INITIAL_INVENTORY } from './constants';
import { POS } from './components/POS';
import { Sales } from './components/Sales';
import { Inventory } from './components/Inventory';
import { Dashboard } from './components/Dashboard';
import { ShoppingCartIcon, ChartBarIcon, ArchiveBoxIcon, ClipboardDocumentListIcon } from './components/icons';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('pos');
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<number>(500); // Default monthly expenses

  const addSale = useCallback((newSale: Sale) => {
    setSales(prevSales => [...prevSales, newSale]);
  }, []);

  const updateInventory = useCallback((updates: { id: string, newStock: number }[]) => {
    setInventory(prevInventory => {
      const newInventory = [...prevInventory];
      updates.forEach(update => {
        const itemIndex = newInventory.findIndex(item => item.id === update.id);
        if (itemIndex !== -1) {
          newInventory[itemIndex].stock = update.newStock;
        }
      });
      return newInventory;
    });
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'pos':
        return <POS inventory={inventory} addSale={addSale} updateInventory={updateInventory} />;
      case 'sales':
        return <Sales sales={sales} />;
      case 'inventory':
        return <Inventory inventory={inventory} setInventory={setInventory} />;
      case 'dashboard':
        return <Dashboard sales={sales} inventory={inventory} expenses={expenses} setExpenses={setExpenses} />;
      default:
        return <POS inventory={inventory} addSale={addSale} updateInventory={updateInventory} />;
    }
  };

  const NavItem = ({ page, label, icon }: { page: Page, label: string, icon: React.ReactNode }) => (
    <li>
      <button
        onClick={() => setCurrentPage(page)}
        className={`flex items-center p-2 text-base font-normal rounded-lg transition-all duration-200 w-full text-left ${
          currentPage === page
            ? 'bg-indigo-600 text-white shadow-lg'
            : 'text-slate-300 hover:bg-slate-700'
        }`}
      >
        {icon}
        <span className="ml-3">{label}</span>
      </button>
    </li>
  );

  return (
    <div className="min-h-screen flex bg-slate-900 text-white">
      <aside className="w-64 bg-slate-800 p-4 flex flex-col shadow-2xl">
        <div className="text-2xl font-bold text-center mb-10 text-white">Zenith POS</div>
        <ul className="space-y-2">
          <NavItem page="pos" label="POS" icon={<ShoppingCartIcon className="w-6 h-6" />} />
          <NavItem page="sales" label="Sales" icon={<ClipboardDocumentListIcon className="w-6 h-6" />} />
          <NavItem page="inventory" label="Inventory" icon={<ArchiveBoxIcon className="w-6 h-6" />} />
          <NavItem page="dashboard" label="Dashboard" icon={<ChartBarIcon className="w-6 h-6" />} />
        </ul>
      </aside>
      <main className="flex-1 overflow-y-auto">
        {renderPage()}
      </main>
    </div>
  );
};

export default App;
