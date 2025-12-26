
import React, { useState, useMemo } from 'react';
import { PackagePlus, Edit2, ArrowUpDown, Filter, Trash2, Search, Plus, Check, ChevronDown, SortAsc, SortDesc, X } from 'lucide-react';
import { Product, UnitType } from '../types';
import { formatCurrency, generateId } from '../utils';

interface InventoryProps {
  products: Product[];
  onAddStock: (id: string, amount: number) => void;
  onUpdateProduct: (product: Product) => void;
  onAddProduct: (product: Product) => void;
}

type SortOrder = 'asc' | 'desc' | 'none';

const Inventory: React.FC<InventoryProps> = ({ products, onAddStock, onUpdateProduct, onAddProduct }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [stockAmount, setStockAmount] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [sortOrder, setSortOrder] = useState<SortOrder>('none');
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state for new product
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    category: '',
    stock: '',
    minStock: '',
    unit: UnitType.PCS
  });

  // Extract unique categories for filter
  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map(p => p.category)));
    return ['Semua', ...cats];
  }, [products]);

  // Combined logic for Search, Filter, and Sort
  const processedProducts = useMemo(() => {
    let result = products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'Semua' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    if (sortOrder === 'asc') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOrder === 'desc') {
      result.sort((a, b) => b.name.localeCompare(a.name));
    }

    return result;
  }, [products, searchTerm, selectedCategory, sortOrder]);

  const handleUpdateStock = (id: string) => {
    const amt = Number(stockAmount);
    if (!isNaN(amt) && amt !== 0) {
      onAddStock(id, amt);
      setEditingId(null);
      setStockAmount('');
    }
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price || !newProduct.category) {
      alert("Mohon lengkapi data produk!");
      return;
    }

    const product: Product = {
      id: generateId(),
      name: newProduct.name,
      price: Number(newProduct.price),
      category: newProduct.category,
      stock: Number(newProduct.stock) || 0,
      minStock: Number(newProduct.minStock) || 0,
      unit: newProduct.unit as UnitType
    };

    onAddProduct(product);
    setShowAddModal(false);
    setNewProduct({
      name: '',
      price: '',
      category: '',
      stock: '',
      minStock: '',
      unit: UnitType.PCS
    });
  };

  const toggleSort = () => {
    setSortOrder(prev => {
      if (prev === 'none') return 'asc';
      if (prev === 'asc') return 'desc';
      return 'none';
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Manajemen Stok</h2>
          <p className="text-gray-500">Kelola ketersediaan barang di gudang.</p>
        </div>
        <div className="flex gap-2">
           <button 
             onClick={() => setShowAddModal(true)}
             className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
           >
             <PackagePlus size={18} />
             Tambah Produk Baru
           </button>
        </div>
      </header>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari di inventori..."
              className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-transparent rounded-xl focus:border-blue-500 focus:outline-none transition-all text-gray-900"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 relative w-full md:w-auto">
            {/* Category Filter Dropdown */}
            <div className="relative flex-1 md:flex-none">
              <button 
                onClick={() => setShowCategoryMenu(!showCategoryMenu)}
                className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl transition-all border ${
                  selectedCategory !== 'Semua' 
                    ? 'bg-blue-50 border-blue-200 text-blue-600 font-bold' 
                    : 'bg-gray-50 border-transparent text-gray-500 hover:bg-gray-100 hover:border-gray-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Filter size={18} />
                  <span>{selectedCategory}</span>
                </div>
                <ChevronDown size={14} className={`transition-transform duration-200 ${showCategoryMenu ? 'rotate-180' : ''}`} />
              </button>
              
              {showCategoryMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowCategoryMenu(false)}></div>
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl z-20 py-2 animate-in fade-in zoom-in-95 duration-200">
                    <p className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pilih Kategori</p>
                    {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => {
                          setSelectedCategory(cat);
                          setShowCategoryMenu(false);
                        }}
                        className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      >
                        {cat}
                        {selectedCategory === cat && <Check size={14} />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Sort Toggle */}
            <button 
              onClick={toggleSort}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl transition-all border ${
                sortOrder !== 'none'
                  ? 'bg-blue-50 border-blue-200 text-blue-600 font-bold'
                  : 'bg-gray-50 border-transparent text-gray-500 hover:bg-gray-100 hover:border-gray-200'
              }`}
            >
              {sortOrder === 'desc' ? <SortDesc size={18} /> : (sortOrder === 'asc' ? <SortAsc size={18} /> : <ArrowUpDown size={18} />)}
              <span>{sortOrder === 'none' ? 'Abjad' : (sortOrder === 'asc' ? 'A-Z' : 'Z-A')}</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Produk</th>
                <th className="px-6 py-4">Kategori</th>
                <th className="px-6 py-4">Harga</th>
                <th className="px-6 py-4">Stok Saat Ini</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {processedProducts.length > 0 ? (
                processedProducts.map(product => (
                  <tr key={product.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 font-bold">
                          {product.name.charAt(0)}
                        </div>
                        <span className="font-semibold text-gray-800">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-lg uppercase">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="font-bold text-gray-900">{formatCurrency(product.price)}</span>
                    </td>
                    <td className="px-6 py-5">
                      {editingId === product.id ? (
                        <div className="flex items-center gap-2">
                          <input 
                             type="number"
                             className="w-20 p-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-bold"
                             placeholder="+/-"
                             value={stockAmount}
                             onChange={(e) => setStockAmount(e.target.value)}
                             autoFocus
                          />
                          <button 
                            onClick={() => handleUpdateStock(product.id)}
                            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <Check size={16} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${product.stock <= product.minStock ? 'text-red-600' : 'text-gray-700'}`}>
                            {product.stock} {product.unit}
                          </span>
                          <button 
                             onClick={() => setEditingId(product.id)}
                             className="opacity-0 group-hover:opacity-100 p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                             title="Update Stok Cepat"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      {product.stock <= product.minStock ? (
                        <span className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 w-fit border border-red-100">
                          Low Stock
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 w-fit border border-green-100">
                          Tersedia
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-center gap-2">
                        <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                          <Edit2 size={18} />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400 italic">
                      <PackagePlus size={48} className="mb-4 opacity-20" />
                      <p>Tidak ada produk yang sesuai kriteria.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800">Tambah Produk Baru</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSaveProduct} className="p-8 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1">Nama Produk</label>
                  <input 
                    type="text"
                    required
                    placeholder="Contoh: Beras Premium 5kg"
                    className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-900"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-bold text-gray-700 block mb-1">Kategori</label>
                    <input 
                      type="text"
                      required
                      placeholder="Sembako"
                      className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-900"
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-gray-700 block mb-1">Satuan</label>
                    <select 
                      className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-900 appearance-none"
                      value={newProduct.unit}
                      onChange={(e) => setNewProduct({...newProduct, unit: e.target.value as UnitType})}
                    >
                      {Object.values(UnitType).map(u => (
                        <option key={u} value={u}>{u.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1">Harga Jual</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">Rp</span>
                    <input 
                      type="number"
                      required
                      placeholder="0"
                      className="w-full p-3 pl-12 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-gray-900"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-bold text-gray-700 block mb-1">Stok Awal</label>
                    <input 
                      type="number"
                      required
                      placeholder="0"
                      className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-gray-900"
                      value={newProduct.stock}
                      onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-gray-700 block mb-1">Min. Stok (Peringatan)</label>
                    <input 
                      type="number"
                      required
                      placeholder="5"
                      className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-gray-900"
                      value={newProduct.minStock}
                      onChange={(e) => setNewProduct({...newProduct, minStock: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition-all"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
                >
                  Simpan Produk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
