
export enum Category {
  SNACKS = 'Snacks',
  DRINKS = 'Drinks',
  TOILETRIES = 'Toiletries',
  DAIRY = 'Dairy',
  PRODUCE = 'Produce',
  BAKERY = 'Bakery',
  MISC = 'Miscellaneous',
}

export enum PaymentMethod {
  CASH = 'Cash',
  GCASH = 'GCash',
  CARD = 'Card',
}

export interface InventoryItem {
  id: string;
  name: string;
  category: Category;
  stock: number;
  costPrice: number;
  sellingPrice: number;
}

export interface CartItem {
  cartId: string;
  itemId: string;
  name: string;
  quantity: number;
  price: number;
  paymentMethod: PaymentMethod;
}

export interface Sale {
  id: string;
  date: Date;
  items: Omit<CartItem, 'cartId'>[];
  totalAmount: number;
}

export type Page = 'pos' | 'sales' | 'inventory' | 'dashboard';
