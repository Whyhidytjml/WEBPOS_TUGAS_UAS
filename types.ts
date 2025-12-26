
export enum UnitType {
  KG = 'kg',
  GRAM = 'gr',
  PCS = 'pcs',
  DUS = 'dus',
  LITER = 'liter'
}

export enum PaymentMethod {
  CASH = 'Tunai',
  QRIS = 'QRIS',
  TRANSFER = 'Transfer/Digital'
}

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  unit: UnitType;
  category: string;
  minStock: number;
  imageUrl?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Transaction {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
  paymentMethod: PaymentMethod;
  paymentProvider?: string; // e.g., 'BCA', 'DANA', 'QRIS'
  amountPaid: number;
  change: number;
}

export type AppView = 'dashboard' | 'cashier' | 'inventory' | 'history';
