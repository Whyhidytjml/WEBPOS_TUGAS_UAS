
import React, { useState, useEffect, useCallback } from 'react';
import { AppView, Product, Transaction, User } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Cashier from './components/Cashier';
import Inventory from './components/Inventory';
import History from './components/History';
import Login from './components/Login';
import { INITIAL_PRODUCTS } from './data';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('transactions');
    return saved ? JSON.parse(saved) : [];
  });
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const handleLogin = (userData: User) => {
    setUser(userData);
    setCurrentView(userData.role === 'kasir' ? 'cashier' : 'dashboard');
    showNotification(`Selamat datang, ${userData.name}!`, 'success');
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    window.location.href = window.location.origin;
  };

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
  };

  const handleCompleteTransaction = (transaction: Transaction) => {
    setTransactions(prev => [transaction, ...prev]);
    setProducts(prev => prev.map(p => {
      const soldItem = transaction.items.find(i => i.id === p.id);
      if (soldItem) {
        return { ...p, stock: Math.max(0, p.stock - soldItem.quantity) };
      }
      return p;
    }));
    showNotification('Transaksi Berhasil Disimpan!');
  };

  const handleAddStock = (id: string, amount: number) => {
    setProducts(prev => prev.map(p => {
      if (p.id === id) return { ...p, stock: p.stock + amount };
      return p;
    }));
    showNotification('Stok Berhasil Diperbarui');
  };

  const handleAddProduct = (newProduct: Product) => {
    setProducts(prev => [...prev, newProduct]);
    showNotification('Produk Baru Ditambahkan');
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    showNotification('Data Produk Diperbarui');
  };

  const handleDeleteProduct = (id: string) => {
    const productToDelete = products.find(p => p.id === id);
    setProducts(prev => prev.filter(p => p.id !== id));
    showNotification(`Produk "${productToDelete?.name}" Berhasil Dihapus`, 'success');
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard products={products} transactions={transactions} />;
      case 'cashier':
        return <Cashier products={products} user={user} onCompleteTransaction={handleCompleteTransaction} />;
      case 'inventory':
        return <Inventory products={products} onAddStock={handleAddStock} onUpdateProduct={handleUpdateProduct} onAddProduct={handleAddProduct} onDeleteProduct={handleDeleteProduct} />;
      case 'history':
        return <History transactions={transactions} />;
      default:
        return <Dashboard products={products} transactions={transactions} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      <Sidebar currentView={currentView} setView={setCurrentView} user={user} onLogout={handleLogout} />
      <main className="flex-1 ml-64 flex flex-col min-h-screen relative">
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto no-print pb-20">
            {renderView()}
          </div>
        </div>
        <footer className="py-6 px-8 border-t border-gray-100 bg-white no-print mt-auto">
          <div className="max-w-7xl mx-auto flex flex-col items-center justify-center text-gray-400 text-sm space-y-1">
            <p className="font-medium italic">copyright@WHY_Sembako</p>
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-60">Smart Retail System</p>
          </div>
        </footer>
      </main>

      {notification && (
        <div className="fixed bottom-8 right-8 z-[100] animate-in slide-in-from-right-10 fade-in duration-300">
          <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border ${
            notification.type === 'success' 
              ? 'bg-white border-pink-100 text-pink-700' 
              : 'bg-white border-red-100 text-red-700'
          }`}>
            {notification.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <span className="font-bold text-sm">{notification.message}</span>
            <button onClick={() => setNotification(null)} className="ml-2 opacity-50 hover:opacity-100 transition-opacity">
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #fce7f3; border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #fbcfe8; }
      `}</style>
    </div>
  );
};

export default App;
