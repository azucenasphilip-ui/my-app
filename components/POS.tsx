import React, { useState, useMemo, useEffect } from 'react';
import { InventoryItem, CartItem, PaymentMethod, Category, Sale } from '../types';
import { ShoppingCartIcon, PlusCircleIcon, TrashIcon } from './icons';

type POSProps = {
  inventory: InventoryItem[];
  addSale: (sale: Sale) => void;
  updateInventory: (updates: { id: string; newStock: number }[]) => void;
};

const initialFormState = {
  itemId: '',
  quantity: 1,
  price: 0,
  paymentMethod: PaymentMethod.CASH,
};

export const POS: React.FC<POSProps> = ({ inventory, addSale, updateInventory }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [formState, setFormState] = useState(initialFormState);
  
  const selectedInventoryItem = useMemo(() => {
    return inventory.find(item => item.id === formState.itemId);
  }, [formState.itemId, inventory]);
  
  useEffect(() => {
    if (selectedInventoryItem) {
      setFormState(prev => ({ ...prev, price: selectedInventoryItem.sellingPrice }));
    } else {
      setFormState(prev => ({...prev, price: 0}));
    }
  }, [selectedInventoryItem]);

  const handleAddToCart = () => {
    if (!formState.itemId || formState.quantity <= 0) {
      alert('Please select an item and enter a valid quantity.');
      return;
    }

    const existingCartItemIndex = cart.findIndex(item => item.itemId === formState.itemId && item.paymentMethod === formState.paymentMethod);

    if (existingCartItemIndex !== -1) {
      const updatedCart = [...cart];
      updatedCart[existingCartItemIndex].quantity += formState.quantity;
      updatedCart[existingCartItemIndex].price = formState.price; // Update price in case it was overridden
      setCart(updatedCart);
    } else {
      if(selectedInventoryItem) {
        const newCartItem: CartItem = {
            cartId: `${Date.now()}-${formState.itemId}`,
            itemId: formState.itemId,
            name: selectedInventoryItem.name,
            quantity: formState.quantity,
            price: formState.price,
            paymentMethod: formState.paymentMethod,
        };
        setCart([...cart, newCartItem]);
      }
    }

    setFormState(initialFormState);
  };
  
  const handleRemoveFromCart = (cartId: string) => {
    setCart(cart.filter(item => item.cartId !== cartId));
  };
  
  const handleUpdateCartQuantity = (cartId: string, newQuantity: number) => {
    if(newQuantity > 0) {
        setCart(cart.map(item => item.cartId === cartId ? {...item, quantity: newQuantity} : item));
    }
  };

  const handleSubmitSale = () => {
    if (cart.length === 0) {
      alert('Cart is empty.');
      return;
    }
    
    // Check for sufficient stock
    for(const cartItem of cart) {
        const inventoryItem = inventory.find(i => i.id === cartItem.itemId);
        if(!inventoryItem || inventoryItem.stock < cartItem.quantity) {
            alert(`Not enough stock for ${cartItem.name}. Available: ${inventoryItem?.stock || 0}`);
            return;
        }
    }

    const newSale: Sale = {
      id: `SALE-${Date.now().toString().slice(-6)}`,
      date: new Date(),
      items: cart.map(({ cartId, ...item }) => item),
      totalAmount: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    };
    
    addSale(newSale);

    const inventoryUpdates = cart.map(cartItem => {
        const inventoryItem = inventory.find(i => i.id === cartItem.itemId)!;
        return { id: cartItem.itemId, newStock: inventoryItem.stock - cartItem.quantity };
    });
    updateInventory(inventoryUpdates);

    setCart([]);
  };

  const totalPrice = formState.price * formState.quantity;
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const inventoryByCategory = inventory.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<Category, InventoryItem[]>);


  return (
    <div className="p-4 sm:p-6 lg:p-8 text-slate-200 grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Input Form */}
      <div className="lg:col-span-1 bg-slate-800 p-6 rounded-lg shadow-lg h-fit">
        <h2 className="text-2xl font-bold text-white mb-6">Add Sale</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Item</label>
            <select value={formState.itemId} onChange={e => setFormState({...formState, itemId: e.target.value})} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2.5 text-white">
              <option value="">Select an item</option>
              {Object.entries(inventoryByCategory).map(([category, items]) => (
                <optgroup label={category} key={category}>
                  {items.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
                </optgroup>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Quantity</label>
                <input type="number" min="1" value={formState.quantity} onChange={e => setFormState({...formState, quantity: parseInt(e.target.value) || 1})} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2.5 text-white" />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Price</label>
                <input type="number" step="0.01" value={formState.price} onChange={e => setFormState({...formState, price: parseFloat(e.target.value) || 0})} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2.5 text-white" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Total</label>
            <input type="text" readOnly value={`₱${totalPrice.toFixed(2)}`} className="w-full bg-slate-900 border border-slate-700 rounded-md p-2.5 text-white font-semibold" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Payment</label>
            <select value={formState.paymentMethod} onChange={e => setFormState({...formState, paymentMethod: e.target.value as PaymentMethod})} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2.5 text-white">
                {Object.values(PaymentMethod).map(method => <option key={method} value={method}>{method}</option>)}
            </select>
          </div>
        </div>
        <button onClick={handleAddToCart} className="mt-6 w-full inline-flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-indigo-500">
          <PlusCircleIcon className="w-5 h-5 mr-2" />
          Add to Cart
        </button>
      </div>

      {/* Cart Preview */}
      <div className="lg:col-span-2 bg-slate-800 p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">Current Cart</h2>
          <ShoppingCartIcon className="w-8 h-8 text-indigo-400" />
        </div>
        <div className="overflow-x-auto max-h-[50vh] relative">
          <table className="w-full text-sm text-left text-slate-300">
            <thead className="text-xs text-slate-400 uppercase bg-slate-700 sticky top-0">
              <tr>
                <th className="py-3 px-4">Item</th>
                <th className="py-3 px-4">Qty</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {cart.map(item => (
                <tr key={item.cartId} className="border-b border-slate-700">
                  <td className="py-3 px-4 font-medium text-white">{item.name}</td>
                  <td className="py-3 px-4">
                    <input type="number" value={item.quantity} onChange={(e) => handleUpdateCartQuantity(item.cartId, parseInt(e.target.value))} className="w-16 bg-slate-700 text-white p-1 rounded-md border-slate-600" />
                  </td>
                  <td className="py-3 px-4">₱{item.price.toFixed(2)}</td>
                  <td className="py-3 px-4">₱{(item.price * item.quantity).toFixed(2)}</td>
                  <td className="py-3 px-4">{item.paymentMethod}</td>
                  <td className="py-3 px-4">
                    <button onClick={() => handleRemoveFromCart(item.cartId)} className="text-red-400 hover:text-red-300">
                        <TrashIcon className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {cart.length === 0 && <p className="text-center text-slate-400 py-8">Cart is empty</p>}
        </div>
        <div className="mt-6 pt-4 border-t border-slate-700 flex justify-between items-center">
            <h3 className="text-xl font-bold text-white">Total: <span className="text-indigo-400">₱{cartTotal.toFixed(2)}</span></h3>
            <button onClick={handleSubmitSale} disabled={cart.length === 0} className="px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed">
                Submit Sale
            </button>
        </div>
      </div>
    </div>
  );
};