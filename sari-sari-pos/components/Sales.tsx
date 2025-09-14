import React, { useState, useMemo } from 'react';
import { Sale } from '../types';

type SalesProps = {
  sales: Sale[];
};

type FilterPeriod = 'all' | 'daily' | 'weekly' | 'monthly' | 'custom';

export const Sales: React.FC<SalesProps> = ({ sales }) => {
  const [period, setPeriod] = useState<FilterPeriod>('all');
  const [customRange, setCustomRange] = useState({ start: '', end: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSaleId, setExpandedSaleId] = useState<string | null>(null);

  const filteredSales = useMemo(() => {
    const now = new Date();
    let salesToShow = sales;

    // Period filtering
    if (period !== 'all') {
      salesToShow = sales.filter(sale => {
        const saleDate = new Date(sale.date);
        if (period === 'daily') {
          return saleDate.toDateString() === now.toDateString();
        }
        if (period === 'weekly') {
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - now.getDay());
          weekStart.setHours(0, 0, 0, 0);
          return saleDate >= weekStart;
        }
        if (period === 'monthly') {
          return saleDate.getMonth() === now.getMonth() && saleDate.getFullYear() === now.getFullYear();
        }
        if (period === 'custom' && customRange.start && customRange.end) {
            const startDate = new Date(customRange.start);
            const endDate = new Date(customRange.end);
            endDate.setHours(23, 59, 59, 999);
            return saleDate >= startDate && saleDate <= endDate;
        }
        return true;
      });
    }

    // Search filtering
    if (searchTerm) {
      salesToShow = salesToShow.filter(sale =>
        sale.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    return salesToShow.sort((a,b) => b.date.getTime() - a.date.getTime());
  }, [sales, period, customRange, searchTerm]);

  const toggleSaleDetails = (saleId: string) => {
    setExpandedSaleId(expandedSaleId === saleId ? null : saleId);
  };
  
  const groupSaleItems = (items: Sale['items']) => {
    return items.reduce((acc, item) => {
        const key = `${item.itemId}-${item.price}-${item.paymentMethod}`;
        if(!acc[key]) {
            acc[key] = {...item, quantity: 0};
        }
        acc[key].quantity += item.quantity;
        return acc;
    }, {} as Record<string, Sale['items'][0]>);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 text-slate-200">
      <h1 className="text-3xl font-bold text-white mb-6">Sales History</h1>

      <div className="bg-slate-800 p-4 rounded-lg shadow-lg mb-6 flex flex-wrap gap-4 items-center">
        <div className="flex-grow">
          <input type="text" placeholder="Search by Item or Sale ID..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2.5 text-white" />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {(['all', 'daily', 'weekly', 'monthly', 'custom'] as FilterPeriod[]).map(p => (
            <button key={p} onClick={() => setPeriod(p)} className={`px-3 py-2 text-sm font-medium rounded-md ${period === p ? 'bg-indigo-600' : 'bg-slate-700 hover:bg-slate-600'}`}>{p.charAt(0).toUpperCase() + p.slice(1)}</button>
          ))}
        </div>
        {period === 'custom' && (
          <div className="flex gap-2">
            <input type="date" value={customRange.start} onChange={e => setCustomRange({...customRange, start: e.target.value})} className="bg-slate-700 border-slate-600 rounded p-2 text-white" />
            <input type="date" value={customRange.end} onChange={e => setCustomRange({...customRange, end: e.target.value})} className="bg-slate-700 border-slate-600 rounded p-2 text-white" />
          </div>
        )}
      </div>

      <div className="overflow-x-auto relative shadow-md sm:rounded-lg bg-slate-800">
        <table className="w-full text-sm text-left text-slate-300">
          <thead className="text-xs text-slate-400 uppercase bg-slate-700">
            <tr>
              <th scope="col" className="py-3 px-6">Sale ID</th>
              <th scope="col" className="py-3 px-6">Date</th>
              <th scope="col" className="py-3 px-6">Items</th>
              <th scope="col" className="py-3 px-6">Total Amount</th>
              <th scope="col" className="py-3 px-6"></th>
            </tr>
          </thead>
          <tbody>
            {filteredSales.map(sale => {
              const groupedItems = Object.values(groupSaleItems(sale.items));
              return (
              <React.Fragment key={sale.id}>
                <tr className="border-b border-slate-700 hover:bg-slate-600/50 cursor-pointer" onClick={() => toggleSaleDetails(sale.id)}>
                  <td className="py-4 px-6 font-mono text-xs">{sale.id}</td>
                  <td className="py-4 px-6">{sale.date.toLocaleString()}</td>
                  <td className="py-4 px-6">{sale.items.reduce((sum, i) => sum + i.quantity, 0)}</td>
                  <td className="py-4 px-6 font-semibold text-white">₱{sale.totalAmount.toFixed(2)}</td>
                  <td className="py-4 px-6 text-right">
                    <button className="font-medium text-indigo-400 hover:underline">
                      {expandedSaleId === sale.id ? 'Hide' : 'Details'}
                    </button>
                  </td>
                </tr>
                {expandedSaleId === sale.id && (
                  <tr className="bg-slate-900/50">
                    <td colSpan={5} className="p-0">
                      <div className="p-4">
                        <h4 className="font-semibold text-white mb-2">Sale Details:</h4>
                        <table className="w-full text-xs text-left">
                          <thead className="text-slate-400">
                            <tr>
                              <th className="py-2 px-3">Item Name</th>
                              <th className="py-2 px-3">Quantity</th>
                              <th className="py-2 px-3">Price Each</th>
                              <th className="py-2 px-3">Subtotal</th>
                              <th className="py-2 px-3">Payment</th>
                            </tr>
                          </thead>
                          <tbody>
                            {groupedItems.map((item, index) => (
                              <tr key={index} className="border-t border-slate-700">
                                <td className="py-2 px-3">{item.name}</td>
                                <td className="py-2 px-3">{item.quantity}</td>
                                <td className="py-2 px-3">₱{item.price.toFixed(2)}</td>
                                <td className="py-2 px-3">₱{(item.quantity * item.price).toFixed(2)}</td>
                                <td className="py-2 px-3">{item.paymentMethod}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            )})}
          </tbody>
        </table>
        {filteredSales.length === 0 && <p className="text-center text-slate-400 py-8">No sales found for the selected criteria.</p>}
      </div>
    </div>
  );
};