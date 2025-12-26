
import { Product, UnitType } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  { id: '1', name: 'Beras Pandan Wangi 5kg', price: 75000, stock: 20, unit: UnitType.PCS, category: 'Beras', minStock: 5 },
  { id: '2', name: 'Minyak Goreng Bimoli 2L', price: 38000, stock: 15, unit: UnitType.PCS, category: 'Minyak', minStock: 4 },
  { id: '3', name: 'Gula Pasir Gulaku 1kg', price: 17500, stock: 50, unit: UnitType.KG, category: 'Gula', minStock: 10 },
  { id: '4', name: 'Telur Ayam (1kg)', price: 28000, stock: 12, unit: UnitType.KG, category: 'Telur', minStock: 3 },
  { id: '5', name: 'Indomie Goreng', price: 3100, stock: 120, unit: UnitType.PCS, category: 'Mie Instan', minStock: 40 },
  { id: '6', name: 'Kopi Kapal Api 165g', price: 14500, stock: 8, unit: UnitType.PCS, category: 'Kopi', minStock: 10 },
  { id: '7', name: 'Susu Kental Manis Frisian Flag', price: 12500, stock: 24, unit: UnitType.PCS, category: 'Susu', minStock: 6 },
  { id: '8', name: 'Garam Dapur 250g', price: 2500, stock: 40, unit: UnitType.PCS, category: 'Bumbu', minStock: 10 },
];
