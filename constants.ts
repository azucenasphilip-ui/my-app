
import { InventoryItem, Category } from './types';

export const INITIAL_INVENTORY: InventoryItem[] = [
  { id: 'item-1', name: 'Potato Chips', category: Category.SNACKS, stock: 150, costPrice: 0.75, sellingPrice: 1.50 },
  { id: 'item-2', name: 'Cola', category: Category.DRINKS, stock: 200, costPrice: 0.50, sellingPrice: 1.25 },
  { id: 'item-3', name: 'Toothpaste', category: Category.TOILETRIES, stock: 80, costPrice: 1.50, sellingPrice: 3.00 },
  { id: 'item-4', name: 'Milk (1L)', category: Category.DAIRY, stock: 50, costPrice: 1.20, sellingPrice: 2.50 },
  { id: 'item-5', name: 'Apples (per kg)', category: Category.PRODUCE, stock: 100, costPrice: 1.00, sellingPrice: 2.20 },
  { id: 'item-6', name: 'Sourdough Bread', category: Category.BAKERY, stock: 40, costPrice: 2.00, sellingPrice: 4.50 },
  { id: 'item-7', name: 'Bottled Water', category: Category.DRINKS, stock: 300, costPrice: 0.30, sellingPrice: 1.00 },
  { id: 'item-8', name: 'Chocolate Bar', category: Category.SNACKS, stock: 120, costPrice: 0.80, sellingPrice: 1.75 },
  { id: 'item-9', name: 'Shampoo', category: Category.TOILETRIES, stock: 65, costPrice: 2.50, sellingPrice: 5.00 },
  { id: 'item-10', name: 'Yogurt', category: Category.DAIRY, stock: 75, costPrice: 0.60, sellingPrice: 1.40 },
];
