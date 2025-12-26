
import React, { useState, useEffect } from 'react';
import { AppView, Product, Transaction } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Cashier from './components/Cashier';
import Inventory from './components/Inventory';
import History from './components/History';
import { INITIAL_PRODUCTS } from './data';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('transactions');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  const handleCompleteTransaction = (transaction: Transaction) => {
    // 1. Add to history
    setTransactions(prev => [transaction, ...prev]);

    // 2. Decrement Stock
    setProducts(prev => prev.map(p => {
      const soldItem = transaction.items.find(i => i.id === p.id);
      if (soldItem) {
        return { ...p, stock: Math.max(0, p.stock - soldItem.quantity) };
      }
      return p;
    }));
  };

  const handleAddStock = (id: string, amount: number) => {
    setProducts(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, stock: p.stock + amount };
      }
      return p;
    }));
  };

  const handleAddProduct = (newProduct: Product) => {
    setProducts(prev => [...prev, newProduct]);
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard products={products} transactions={transactions} />;
      case 'cashier':
        return <Cashier products={products} onCompleteTransaction={handleCompleteTransaction} />;
      case 'inventory':
        return (
          <Inventory 
            products={products} 
            onAddStock={handleAddStock} 
            onUpdateProduct={handleUpdateProduct}
            onAddProduct={handleAddProduct}
          />
        );
      case 'history':
        return <History transactions={transactions} />;
      default:
        return <Dashboard products={products} transactions={transactions} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      <Sidebar currentView={currentView} setView={setCurrentView} />
      
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto no-print">
          {renderView()}
        </div>
      </main>

      {/* Styles for consistent custom scrollbar */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #e2e8f0;
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #cbd5e1;
        }
      `}</style>
    </div>
  );
};

export default App;
