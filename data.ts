
import { Product, UnitType } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  { 
    id: '1', 
    barcode: '899123456001',
    name: 'Beras Pandan Wangi 5kg', 
    price: 75000, 
    stock: 20, 
    unit: UnitType.PCS, 
    category: 'Sembako Pokok', 
    minStock: 5,
    imageUrl: 'https://cdn.ab-rust.xyz/file/1767889764828.png'
  },
  { 
    id: '14', 
    barcode: '899123456014',
    name: 'Gas Elpiji 3kg (Isi)', 
    price: 22000, 
    stock: 15, 
    unit: UnitType.PCS, 
    category: 'Gas & Energi', 
    minStock: 5,
    imageUrl: 'https://cdn.ab-rust.xyz/file/1767889803373.png' 
  },
  { 
    id: '2', 
    barcode: '899123456002',
    name: 'Minyak Goreng Bimoli 2L', 
    price: 38000, 
    stock: 15, 
    unit: UnitType.PCS, 
    category: 'Minyak & Lemak', 
    minStock: 4,
    imageUrl: 'https://cdn.ab-rust.xyz/file/1767889867448.png'
  },
  { 
    id: '3', 
    barcode: '899123456003',
    name: 'Gula Pasir Gulaku 1kg', 
    price: 17500, 
    stock: 50, 
    unit: UnitType.KG, 
    category: 'Sembako Pokok', 
    minStock: 10,
    imageUrl: 'https://cdn.ab-rust.xyz/file/1767889910089.png'
  },
  { 
    id: '4', 
    barcode: '899123456004',
    name: 'Telur Ayam (1kg)', 
    price: 28000, 
    stock: 12, 
    unit: UnitType.KG, 
    category: 'Sembako Pokok', 
    minStock: 3,
    imageUrl: 'https://cdn.ab-rust.xyz/file/1767889957357.png'
  },
  { 
    id: '5', 
    barcode: '899123456005',
    name: 'Indomie Goreng Special', 
    price: 3100, 
    stock: 120, 
    unit: UnitType.PCS, 
    category: 'Mie Instan', 
    minStock: 40,
    imageUrl: 'https://cdn.ab-rust.xyz/file/1767889995304.png'
  },
  { 
    id: '13', 
    barcode: '899123456013',
    name: 'Aqua Galon 19L (Isi)', 
    price: 20000, 
    stock: 10, 
    unit: UnitType.PCS, 
    category: 'Minuman & Galon', 
    minStock: 5,
    imageUrl: 'https://cdn.ab-rust.xyz/file/1767890024257.png'
  },
  { 
    id: '15', 
    barcode: '899123456015',
    name: 'Chiki Balls Keju', 
    price: 6500, 
    stock: 30, 
    unit: UnitType.PCS, 
    category: 'Snack & Jajanan', 
    minStock: 10,
    imageUrl: 'https://cdn.ab-rust.xyz/file/1767890051655.png'
  },
  { 
    id: '8', 
    barcode: '899123456008',
    name: 'Garam Dapur 250g', 
    price: 2500, 
    stock: 40, 
    unit: UnitType.PCS, 
    category: 'Bumbu Dapur', 
    minStock: 10,
    imageUrl: 'https://cdn.ab-rust.xyz/file/1767890077339.png'
  },
  { 
    id: '9', 
    barcode: '899123456009',
    name: 'Sabun Mama Lemon 780ml', 
    price: 15500, 
    stock: 18, 
    unit: UnitType.PCS, 
    category: 'Sabun & Cuci', 
    minStock: 5,
    imageUrl: 'https://cdn.ab-rust.xyz/file/1767890108672.png'
  },
  { 
    id: '17', 
    barcode: '899123456017',
    name: 'Panadol Extra (Strip)', 
    price: 12500, 
    stock: 20, 
    unit: UnitType.PCS, 
    category: 'Kesehatan', 
    minStock: 5,
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=400&auto=format&fit=crop'
  },
  { 
    id: '12', 
    barcode: '899123456012',
    name: 'Teh Sariwangi 25s', 
    price: 7500, 
    stock: 45, 
    unit: UnitType.PCS, 
    category: 'Minuman & Galon', 
    minStock: 10,
    imageUrl: 'https://cdn.ab-rust.xyz/file/1767888881913.png'
  },
];
