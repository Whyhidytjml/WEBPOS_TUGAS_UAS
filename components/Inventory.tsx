
import React, { useState, useMemo } from 'react';
import { PackagePlus, Edit2, ArrowUpDown, Filter, Trash2, Search, Plus, Check, ChevronDown, SortAsc, SortDesc, X, AlertTriangle, ImageIcon, ScanLine } from 'lucide-react';
import { Product, UnitType } from '../types';
import { formatCurrency, generateId } from '../utils';

interface InventoryProps {
  products: Product[];
  onAddStock: (id: string, amount: number) => void;
  onUpdateProduct: (product: Product) => void;
  onAddProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
}

type SortOrder = 'asc' | 'desc' | 'none';

const Inventory: React.FC<InventoryProps> = ({ products, onAddStock, onUpdateProduct, onAddProduct, onDeleteProduct }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [quickEditingStockId, setQuickEditingStockId] = useState<string | null>(null);
  const [stockAmount, setStockAmount] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [sortOrder, setSortOrder] = useState<SortOrder>('none');
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProductId, setCurrentProductId] = useState<string | null>(null);
  const [productToDelete, setProductToDelete] = useState<{id: string, name: string} | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    barcode: '',
    price: '',
    category: '',
    stock: '',
    minStock: '',
    unit: UnitType.PCS,
    imageUrl: ''
  });

  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map(p => p.category)));
    return ['Semua', ...cats];
  }, [products]);

  const processedProducts = useMemo(() => {
    let result = products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || (p.barcode && p.barcode.includes(searchTerm));
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

  const handleQuickStockUpdate = (id: string) => {
    const amt = Number(stockAmount);
    if (!isNaN(amt) && amt !== 0) {
      onAddStock(id, amt);
      setQuickEditingStockId(null);
      setStockAmount('');
    }
  };

  const openAddModal = () => {
    setIsEditing(false);
    setCurrentProductId(null);
    setFormData({
      name: '',
      barcode: '',
      price: '',
      category: '',
      stock: '',
      minStock: '',
      unit: UnitType.PCS,
      imageUrl: ''
    });
    setShowFormModal(true);
  };

  const openEditModal = (product: Product) => {
    setIsEditing(true);
    setCurrentProductId(product.id);
    setFormData({
      name: product.name,
      barcode: product.barcode || '',
      price: product.price.toString(),
      category: product.category,
      stock: product.stock.toString(),
      minStock: product.minStock.toString(),
      unit: product.unit,
      imageUrl: product.imageUrl || ''
    });
    setShowFormModal(true);
  };

  const confirmDelete = () => {
    if (productToDelete) {
      onDeleteProduct(productToDelete.id);
      setProductToDelete(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.category) {
      alert("Mohon lengkapi data produk!");
      return;
    }

    const productData: Product = {
      id: isEditing && currentProductId ? currentProductId : generateId(),
      barcode: formData.barcode,
      name: formData.name,
      price: Number(formData.price),
      category: formData.category,
      stock: Number(formData.stock) || 0,
      minStock: Number(formData.minStock) || 0,
      unit: formData.unit as UnitType,
      imageUrl: formData.imageUrl
    };

    if (isEditing) {
      onUpdateProduct(productData);
    } else {
      onAddProduct(productData);
    }

    setShowFormModal(false);
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
          <h2 className="text-2xl font-black text-gray-800">Manajemen Stok</h2>
          <p className="text-gray-500 font-medium">Kelola inventori dan ketersediaan barang.</p>
        </div>
        <div className="flex gap-2">
           <button 
             onClick={openAddModal}
             className="flex items-center gap-2 px-6 py-3 bg-pink-600 text-white rounded-2xl font-black shadow-lg shadow-pink-100 hover:bg-pink-700 transition-all active:scale-95"
           >
             <PackagePlus size={20} />
             Tambah Produk Baru
           </button>
        </div>
      </header>

      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-50/30">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari nama atau barcode..."
              className="w-full pl-11 pr-4 py-3 bg-white border border-transparent rounded-xl shadow-sm focus:ring-2 focus:ring-pink-100 focus:outline-none transition-all text-gray-900 font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 relative w-full md:w-auto">
            <button 
              onClick={() => setShowCategoryMenu(!showCategoryMenu)}
              className={`flex-1 md:flex-none flex items-center justify-between gap-3 px-5 py-3 rounded-xl transition-all border ${
                selectedCategory !== 'Semua' 
                  ? 'bg-pink-600 border-pink-600 text-white font-bold' 
                  : 'bg-white border-gray-100 text-gray-500 hover:border-pink-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <Filter size={18} />
                <span className="text-sm uppercase tracking-wider">{selectedCategory}</span>
              </div>
              <ChevronDown size={14} className={`transition-transform duration-200 ${showCategoryMenu ? 'rotate-180' : ''}`} />
            </button>
            
            {showCategoryMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowCategoryMenu(false)}></div>
                <div className="absolute right-0 mt-14 w-56 bg-white border border-gray-100 rounded-2xl shadow-2xl z-20 py-2 animate-in fade-in zoom-in-95 duration-200">
                  <p className="px-4 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 mb-1">Pilih Kategori</p>
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => {
                        setSelectedCategory(cat);
                        setShowCategoryMenu(false);
                      }}
                      className="w-full flex items-center justify-between px-4 py-3 text-sm font-bold text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors"
                    >
                      {cat}
                      {selectedCategory === cat && <Check size={16} />}
                    </button>
                  ))}
                </div>
              </>
            )}

            <button 
              onClick={toggleSort}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl transition-all border bg-white border-gray-100 text-gray-500 hover:border-pink-200 font-bold`}
            >
              {sortOrder === 'desc' ? <SortDesc size={18} /> : (sortOrder === 'asc' ? <SortAsc size={18} /> : <ArrowUpDown size={18} />)}
              <span className="text-sm uppercase tracking-wider">Sort</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <th className="px-8 py-5 border-b border-gray-100">Info Produk</th>
                <th className="px-8 py-5 border-b border-gray-100">Barcode</th>
                <th className="px-8 py-5 border-b border-gray-100">Harga Jual</th>
                <th className="px-8 py-5 border-b border-gray-100">Stok</th>
                <th className="px-8 py-5 border-b border-gray-100">Status</th>
                <th className="px-8 py-5 border-b border-gray-100 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {processedProducts.length > 0 ? (
                processedProducts.map(product => (
                  <tr key={product.id} className="hover:bg-pink-50/20 transition-colors group animate-in slide-in-from-left-2 duration-300">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden shadow-sm flex-shrink-0">
                          {product.imageUrl ? (
                            <img src={product.imageUrl} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <ImageIcon size={24} />
                            </div>
                          )}
                        </div>
                        <div>
                          <span className="font-black text-gray-800 block leading-tight">{product.name}</span>
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{product.category}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-2 text-gray-500">
                          <ScanLine size={14} className="text-pink-500" />
                          <span className="font-mono text-xs font-bold">{product.barcode || '-'}</span>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="font-black text-gray-900">{formatCurrency(product.price)}</span>
                    </td>
                    <td className="px-8 py-6">
                      {quickEditingStockId === product.id ? (
                        <div className="flex items-center gap-2">
                          <input 
                             type="number"
                             className="w-20 p-2 border-2 border-pink-100 rounded-xl focus:outline-none focus:border-pink-500 text-gray-900 font-black text-center"
                             placeholder="+/-"
                             value={stockAmount}
                             onChange={(e) => setStockAmount(e.target.value)}
                             autoFocus
                          />
                          <button 
                            onClick={() => handleQuickStockUpdate(product.id)}
                            className="w-9 h-9 flex items-center justify-center bg-pink-600 text-white rounded-xl hover:bg-pink-700 transition-colors shadow-lg shadow-pink-100"
                          >
                            <Check size={18} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className={`font-black text-lg ${product.stock <= product.minStock ? 'text-red-600' : 'text-black'}`}>
                            {product.stock}
                          </span>
                          <span className="text-[10px] font-bold text-gray-400 uppercase">{product.unit}</span>
                          <button 
                             onClick={() => setQuickEditingStockId(product.id)}
                             className="opacity-0 group-hover:opacity-100 w-8 h-8 flex items-center justify-center text-pink-500 bg-pink-50 rounded-lg transition-all active:scale-90"
                             title="Update Stok"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-8 py-6">
                      {product.stock <= product.minStock ? (
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-red-100 w-fit">
                          <AlertTriangle size={12} />
                          Low Stock
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-100 w-fit">
                          <Check size={12} />
                          Aman
                        </div>
                      )}
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-center gap-3">
                        <button 
                          onClick={() => openEditModal(product)}
                          className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-pink-600 hover:bg-pink-50 rounded-xl transition-all active:scale-90 border border-transparent hover:border-pink-100"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => setProductToDelete({id: product.id, name: product.name})}
                          className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all active:scale-90 border border-transparent hover:border-pink-100"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-8 py-32 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-300">
                      <Search size={64} className="mb-4 opacity-10" />
                      <p className="font-bold text-lg">Produk tidak ditemukan</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showFormModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-2xl font-black text-gray-800 tracking-tight">
                {isEditing ? 'Detail Produk' : 'Produk Baru'}
              </h3>
              <button onClick={() => setShowFormModal(false)} className="w-10 h-10 flex items-center justify-center bg-white rounded-full text-gray-400 hover:text-gray-600 transition-all shadow-sm">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-10 space-y-8 overflow-y-auto custom-scrollbar">
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2 ml-1">Nama Produk</label>
                  <input 
                    type="text"
                    required
                    placeholder="Contoh: Beras Premium 5kg"
                    className="w-full p-4 bg-gray-50 border-2 border-gray-50 rounded-2xl focus:outline-none focus:border-pink-500 focus:bg-white font-bold text-gray-900 transition-all shadow-inner"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2 ml-1">Barcode (Opsional)</label>
                  <div className="relative">
                    <ScanLine className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                    <input 
                      type="text"
                      placeholder="899123456XXX"
                      className="w-full p-4 pl-12 bg-gray-50 border-2 border-gray-50 rounded-2xl focus:outline-none focus:border-pink-500 focus:bg-white font-mono text-gray-900 transition-all shadow-inner"
                      value={formData.barcode}
                      onChange={(e) => setFormData({...formData, barcode: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2 ml-1">URL Foto Produk</label>
                  <div className="relative">
                    <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                    <input 
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      className="w-full p-4 pl-12 bg-gray-50 border-2 border-gray-50 rounded-2xl focus:outline-none focus:border-pink-500 focus:bg-white font-medium text-gray-900 transition-all shadow-inner text-sm"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2 ml-1">Kategori</label>
                    <input 
                      type="text"
                      required
                      placeholder="Sembako"
                      className="w-full p-4 bg-gray-50 border-2 border-gray-50 rounded-2xl focus:outline-none focus:border-pink-500 focus:bg-white font-bold text-gray-900 transition-all shadow-inner"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2 ml-1">Satuan</label>
                    <select 
                      className="w-full p-4 bg-gray-50 border-2 border-gray-50 rounded-2xl focus:outline-none focus:border-pink-500 focus:bg-white font-bold text-gray-900 transition-all shadow-inner appearance-none cursor-pointer"
                      value={formData.unit}
                      onChange={(e) => setFormData({...formData, unit: e.target.value as UnitType})}
                    >
                      {Object.values(UnitType).map(u => (
                        <option key={u} value={u}>{u.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2 ml-1">Harga Jual</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-gray-300">Rp</span>
                    <input 
                      type="number"
                      required
                      placeholder="0"
                      className="w-full p-4 pl-12 bg-gray-50 border-2 border-gray-50 rounded-2xl focus:outline-none focus:border-pink-500 focus:bg-white font-black text-gray-900 transition-all shadow-inner text-xl"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2 ml-1">Stok Awal</label>
                    <input 
                      type="number"
                      required
                      placeholder="0"
                      className="w-full p-4 bg-gray-50 border-2 border-gray-50 rounded-2xl focus:outline-none focus:border-pink-500 focus:bg-white font-black text-gray-900 transition-all shadow-inner"
                      value={formData.stock}
                      onChange={(e) => setFormData({...formData, stock: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2 ml-1">Min. Stok</label>
                    <input 
                      type="number"
                      required
                      placeholder="5"
                      className="w-full p-4 bg-gray-50 border-2 border-gray-50 rounded-2xl focus:outline-none focus:border-pink-500 focus:bg-white font-black text-gray-900 transition-all shadow-inner"
                      value={formData.minStock}
                      onChange={(e) => setFormData({...formData, minStock: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowFormModal(false)} className="flex-1 py-5 text-gray-400 font-black hover:bg-gray-100 rounded-[2rem] transition-all uppercase tracking-widest text-sm">Batal</button>
                <button type="submit" className="flex-1 py-5 bg-pink-600 text-white font-black rounded-[2rem] shadow-2xl shadow-pink-100 hover:bg-pink-700 transition-all active:scale-95 uppercase tracking-widest text-sm">
                  {isEditing ? 'SIMPAN PERUBAHAN' : 'TAMBAHKAN PRODUK'}
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
