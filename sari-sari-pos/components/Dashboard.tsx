import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { InventoryItem, Sale } from '../types';

type DashboardProps = {
  sales: Sale[];
  inventory: InventoryItem[];
  expenses: number;
  setExpenses: (expenses: number) => void;
};

type FilterPeriod = 'daily' | 'weekly' | 'monthly';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-700 p-2 border border-slate-600 rounded shadow-lg text-white">
        <p className="label">{`${label}`}</p>
        {payload.map((pld: any, index: number) => (
            <p key={index} style={{ color: pld.color }}>{`${pld.name}: ₱${pld.value.toFixed(2)}`}</p>
        ))}
      </div>
    );
  }
  return null;
};


export const Dashboard: React.FC<DashboardProps> = ({ sales, inventory, expenses, setExpenses }) => {
  const [period, setPeriod] = useState<FilterPeriod>('monthly');

  const filteredSales = useMemo(() => {
    const now = new Date();
    return sales.filter(sale => {
      const saleDate = new Date(sale.date);
      if (period === 'daily') {
        return saleDate.toDateString() === now.toDateString();
      }
      if (period === 'weekly') {
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
        weekStart.setHours(0, 0, 0, 0);
        return saleDate >= weekStart;
      }
      if (period === 'monthly') {
        return saleDate.getMonth() === now.getMonth() && saleDate.getFullYear() === now.getFullYear();
      }
      return true;
    });
  }, [sales, period]);

  const grossSales = useMemo(() => filteredSales.reduce((sum, sale) => sum + sale.totalAmount, 0), [filteredSales]);
  
  const totalCostOfGoodsSold = useMemo(() => {
    return filteredSales.flatMap(s => s.items).reduce((sum, item) => {
      const inventoryItem = inventory.find(i => i.id === item.itemId);
      return sum + (inventoryItem ? inventoryItem.costPrice * item.quantity : 0);
    }, 0);
  }, [filteredSales, inventory]);

  const totalProfit = grossSales - totalCostOfGoodsSold - expenses;

  const profitPerItemData = useMemo(() => {
    const itemProfits: { [key: string]: { profit: number; quantity: number } } = {};
    filteredSales.flatMap(s => s.items).forEach(item => {
      const inventoryItem = inventory.find(i => i.id === item.itemId);
      if (inventoryItem) {
        if (!itemProfits[item.name]) {
          itemProfits[item.name] = { profit: 0, quantity: 0 };
        }
        itemProfits[item.name].profit += (item.price - inventoryItem.costPrice) * item.quantity;
        itemProfits[item.name].quantity += item.quantity;
      }
    });
    return Object.entries(itemProfits).map(([name, data]) => ({ name, profit: data.profit })).sort((a,b) => b.profit - a.profit).slice(0, 10);
  }, [filteredSales, inventory]);
  
  const salesOverTimeData = useMemo(() => {
        const data: { [key: string]: number } = {};
        filteredSales.forEach(sale => {
            const dateKey = new Date(sale.date).toLocaleDateString();
            if (!data[dateKey]) {
                data[dateKey] = 0;
            }
            data[dateKey] += sale.totalAmount;
        });
        return Object.entries(data).map(([date, sales]) => ({ date, sales })).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [filteredSales]);


  const renderFilterButtons = () => (
    <div className="flex space-x-2 bg-slate-800 p-1 rounded-lg">
      {(['daily', 'weekly', 'monthly'] as FilterPeriod[]).map(p => (
        <button
          key={p}
          onClick={() => setPeriod(p)}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            period === p ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-700'
          }`}
        >
          {p.charAt(0).toUpperCase() + p.slice(1)}
        </button>
      ))}
    </div>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 text-slate-200">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        {renderFilterButtons()}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
          <h3 className="text-slate-400 text-sm font-medium">Gross Sales</h3>
          <p className="text-3xl font-semibold text-white mt-1">₱{grossSales.toFixed(2)}</p>
        </div>
        <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
          <h3 className="text-slate-400 text-sm font-medium">Total Profit</h3>
          <p className={`text-3xl font-semibold mt-1 ${totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            ₱{totalProfit.toFixed(2)}
          </p>
        </div>
        <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
          <h3 className="text-slate-400 text-sm font-medium">Expenses</h3>
          <div className="flex items-center mt-1">
             <span className="text-3xl font-semibold text-white mr-2">₱</span>
             <input type="number" value={expenses} onChange={e => setExpenses(Number(e.target.value))} className="bg-slate-700 text-3xl font-semibold text-white w-full p-0 border-none focus:ring-0" />
          </div>
        </div>
        <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
          <h3 className="text-slate-400 text-sm font-medium">Total Sales</h3>
          <p className="text-3xl font-semibold text-white mt-1">{filteredSales.length}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 p-6 rounded-lg shadow-lg h-96">
            <h3 className="text-xl font-semibold text-white mb-4">Profit Per Item</h3>
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={profitPerItemData} layout="vertical" margin={{ top: 5, right: 20, left: 50, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                    <XAxis type="number" stroke="#94a3b8" tickFormatter={(tick) => `₱${tick}`} />
                    <YAxis dataKey="name" type="category" stroke="#94a3b8" width={100} tick={{fontSize: 12}} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(71, 85, 105, 0.5)' }}/>
                    <Legend />
                    <Bar dataKey="profit" fill="#4f46e5" name="Profit" />
                </BarChart>
            </ResponsiveContainer>
        </div>
        <div className="bg-slate-800 p-6 rounded-lg shadow-lg h-96">
            <h3 className="text-xl font-semibold text-white mb-4">Sales Over Time</h3>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesOverTimeData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                    <XAxis dataKey="date" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" tickFormatter={(tick) => `₱${tick}`}/>
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#4f46e5', strokeWidth: 1 }}/>
                    <Legend />
                    <Line type="monotone" dataKey="sales" stroke="#818cf8" strokeWidth={2} name="Sales" activeDot={{ r: 8 }} />
                </LineChart>
            </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};