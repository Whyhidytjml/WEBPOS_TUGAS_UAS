
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

export type UserRole = 'admin' | 'kasir';

export interface User {
  username: string;
  role: UserRole;
  name: string;
}

export interface Product {
  id: string;
  barcode?: string;
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
  paymentProvider?: string;
  amountPaid: number;
  change: number;
  cashierName?: string;
}

export type AppView = 'dashboard' | 'cashier' | 'inventory' | 'history';
