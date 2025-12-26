
import React, { useState, useMemo, useRef } from 'react';
import { Search, Plus, Minus, Trash2, Banknote, CreditCard, Send, Printer, CheckCircle2, X, ShoppingCart, QrCode, Building2, Wallet } from 'lucide-react';
import { Product, CartItem, PaymentMethod, Transaction } from '../types';
import { formatCurrency, generateId } from '../utils';
import Receipt from './Receipt';

interface CashierProps {
  products: Product[];
  onCompleteTransaction: (transaction: Transaction) => void;
}

const Cashier: React.FC<CashierProps> = ({ products, onCompleteTransaction }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [amountPaid, setAmountPaid] = useState<string>('');
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null);
  
  const receiptRef = useRef<HTMLDivElement>(null);

  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const change = Number(amountPaid) - cartTotal;

  const quickDenominations = [2000, 5000, 10000, 20000, 50000, 100000];
  
  const banks = ['BCA', 'BRI', 'Mandiri', 'BNI'];
  const ewallets = ['DANA', 'GoPay', 'OVO', 'ShopeePay'];

  const handleCheckout = () => {
    if (cart.length === 0) return;
    
    // Validation
    if (paymentMethod === PaymentMethod.CASH && Number(amountPaid) < cartTotal) {
        alert("Pembayaran kurang!");
        return;
    }
    if (paymentMethod === PaymentMethod.TRANSFER && !selectedProvider) {
        alert("Pilih Bank atau E-Wallet!");
        return;
    }

    const transaction: Transaction = {
      id: `TRX-${generateId()}`,
      date: new Date().toISOString(),
      items: [...cart],
      total: cartTotal,
      paymentMethod,
      paymentProvider: paymentMethod === PaymentMethod.CASH ? 'Tunai' : (paymentMethod === PaymentMethod.QRIS ? 'QRIS' : selectedProvider),
      amountPaid: paymentMethod === PaymentMethod.CASH ? Number(amountPaid) : cartTotal,
      change: paymentMethod === PaymentMethod.CASH ? Math.max(0, change) : 0,
    };

    setLastTransaction(transaction);
    onCompleteTransaction(transaction);
    setCart([]);
    setAmountPaid('');
    setPaymentMethod(PaymentMethod.CASH);
    setSelectedProvider('');
    setShowCheckoutModal(false);
  };

  const printReceipt = () => {
      window.print();
  };

  const addDenomination = (val: number) => {
    const current = Number(amountPaid) || 0;
    setAmountPaid((current + val).toString());
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-120px)] animate-in slide-in-from-bottom-4 duration-500">
      {/* Product Selection Area */}
      <div className="flex-1 flex flex-col gap-6 no-print">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Cari produk atau kategori..."
            className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-900"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pb-4 pr-2 custom-scrollbar">
          {filteredProducts.map(product => (
            <button
              key={product.id}
              onClick={() => addToCart(product)}
              disabled={product.stock <= 0}
              className={`flex flex-col p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all active:scale-95 text-left group ${product.stock <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="mb-3 h-24 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 font-bold group-hover:bg-blue-50 transition-colors">
                {product.name.substring(0, 2)}
              </div>
              <h4 className="font-bold text-gray-800 text-sm line-clamp-2 mb-1">{product.name}</h4>
              <p className="text-blue-600 font-bold text-lg mb-2">{formatCurrency(product.price)}</p>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">{product.category}</span>
                <span className={`px-2 py-0.5 rounded-full ${product.stock <= product.minStock ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                  {product.stock} {product.unit}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Cart Area */}
      <div className="w-full lg:w-[400px] bg-white rounded-3xl border border-gray-100 shadow-xl flex flex-col no-print">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-800">Keranjang</h3>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-60">
              <ShoppingCart className="w-16 h-16 mb-4" />
              <p className="text-sm font-medium">Keranjang kosong</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-2xl border border-transparent hover:border-blue-100 transition-all">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-800 text-sm truncate">{item.name}</p>
                  <p className="text-blue-600 text-xs font-semibold">{formatCurrency(item.price)} / {item.unit}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => updateQuantity(item.id, -1)}
                    className="p-1 text-gray-500 hover:bg-white rounded-md shadow-sm border border-transparent hover:border-gray-200"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-6 text-center font-bold text-gray-800 text-sm">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.id, 1)}
                    className="p-1 text-blue-600 hover:bg-white rounded-md shadow-sm border border-transparent hover:border-blue-200"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <button 
                   onClick={() => updateQuantity(item.id, -item.quantity)}
                   className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-100 rounded-b-3xl space-y-4">
          <div className="flex justify-between items-center text-gray-500 text-sm">
            <span>Subtotal</span>
            <span>{formatCurrency(cartTotal)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-gray-800">Total</span>
            <span className="text-2xl font-bold text-blue-600">{formatCurrency(cartTotal)}</span>
          </div>
          <button
            onClick={() => setShowCheckoutModal(true)}
            disabled={cart.length === 0}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 disabled:shadow-none"
          >
            Bayar Sekarang
          </button>
        </div>
      </div>

      {/* Checkout Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="p-6 flex justify-between items-center border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-800">Selesaikan Pembayaran</h3>
              <button onClick={() => setShowCheckoutModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
              <div className="text-center">
                <p className="text-gray-500 mb-1">Total Tagihan</p>
                <p className="text-4xl font-black text-blue-600">{formatCurrency(cartTotal)}</p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: PaymentMethod.CASH, label: 'Tunai', icon: Banknote },
                  { id: PaymentMethod.QRIS, label: 'QRIS', icon: QrCode },
                  { id: PaymentMethod.TRANSFER, label: 'Digital/Transfer', icon: Send },
                ].map(method => (
                  <button
                    key={method.id}
                    onClick={() => {
                      setPaymentMethod(method.id as PaymentMethod);
                      setSelectedProvider('');
                    }}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                      paymentMethod === method.id 
                        ? 'border-blue-600 bg-blue-50 text-blue-600' 
                        : 'border-gray-100 text-gray-400 hover:border-blue-200'
                    }`}
                  >
                    <method.icon size={24} />
                    <span className="text-xs font-bold">{method.label}</span>
                  </button>
                ))}
              </div>

              {/* CASH SECTION */}
              {paymentMethod === PaymentMethod.CASH && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                  <div className="grid grid-cols-3 gap-2">
                    {quickDenominations.map(val => (
                      <button 
                        key={val}
                        onClick={() => addDenomination(val)}
                        className="py-2 bg-gray-50 hover:bg-blue-100 text-gray-700 font-bold rounded-xl border border-gray-100 text-sm transition-all"
                      >
                        +{val/1000}rb
                      </button>
                    ))}
                    <button 
                      onClick={() => setAmountPaid(cartTotal.toString())}
                      className="py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold rounded-xl border border-blue-100 text-sm col-span-3 transition-all"
                    >
                      Uang Pas ({formatCurrency(cartTotal)})
                    </button>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Nominal Tunai</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">Rp</span>
                      <input
                        type="number"
                        autoFocus
                        placeholder="0"
                        className="w-full p-4 pl-12 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-xl text-right text-gray-900"
                        value={amountPaid}
                        onChange={(e) => setAmountPaid(e.target.value)}
                      />
                    </div>
                    {Number(amountPaid) >= cartTotal && (
                      <div className="flex justify-between items-center px-2 bg-green-50 p-3 rounded-xl border border-green-100">
                        <span className="text-sm text-green-700 font-medium">Kembalian:</span>
                        <span className="font-bold text-green-700 text-lg">{formatCurrency(change)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* QRIS SECTION */}
              {paymentMethod === PaymentMethod.QRIS && (
                <div className="flex flex-col items-center gap-6 animate-in fade-in slide-in-from-top-2">
                  <div className="p-4 bg-white border-4 border-gray-100 rounded-3xl shadow-inner relative overflow-hidden group">
                    {/* Simulated QR Code */}
                    <div className="w-48 h-48 bg-gray-50 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl">
                       <QrCode size={120} className="text-gray-300" />
                       <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-40 h-40 bg-[url('https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=SembakoPOS-Trx')] bg-center bg-no-repeat opacity-90"></div>
                       </div>
                    </div>
                    <div className="absolute top-2 left-2 right-2 flex justify-between px-2">
                       <span className="text-[8px] font-bold text-gray-400">QRIS STANDAR</span>
                       <span className="text-[8px] font-bold text-gray-400">INDONESIA</span>
                    </div>
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-sm font-bold text-gray-700 uppercase tracking-widest">Pindai Untuk Membayar</p>
                    <p className="text-xs text-gray-400">Silahkan arahkan kamera aplikasi ke kode di atas</p>
                  </div>
                </div>
              )}

              {/* TRANSFER SECTION */}
              {paymentMethod === PaymentMethod.TRANSFER && (
                <div className="space-y-6 animate-in fade-in slide-in-from-top-2">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-gray-500 text-sm font-bold">
                      <Building2 size={16} />
                      BANK TRANSFER
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {banks.map(bank => (
                        <button
                          key={bank}
                          onClick={() => setSelectedProvider(bank)}
                          className={`p-3 rounded-xl border-2 font-bold text-sm transition-all ${
                            selectedProvider === bank ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-50 text-gray-500 hover:border-gray-200'
                          }`}
                        >
                          {bank}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-gray-500 text-sm font-bold">
                      <Wallet size={16} />
                      DOMPET DIGITAL
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {ewallets.map(wallet => (
                        <button
                          key={wallet}
                          onClick={() => setSelectedProvider(wallet)}
                          className={`p-3 rounded-xl border-2 font-bold text-sm transition-all ${
                            selectedProvider === wallet ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-50 text-gray-500 hover:border-gray-200'
                          }`}
                        >
                          {wallet}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50">
              <button
                onClick={handleCheckout}
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-xl shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
              >
                Konfirmasi Pembayaran
                <CheckCircle2 size={24} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success View / Last Transaction for Printing */}
      {lastTransaction && !showCheckoutModal && (
        <div className="fixed inset-0 bg-white z-[60] flex flex-col items-center justify-center p-6 no-print">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle2 size={48} />
            </div>
            <h2 className="text-3xl font-bold text-gray-800">Pembayaran Berhasil!</h2>
            <p className="text-gray-500 mt-2">Nomor Transaksi: {lastTransaction.id}</p>
            <div className="mt-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold inline-block">
               {lastTransaction.paymentMethod} {lastTransaction.paymentProvider !== 'Tunai' ? `(${lastTransaction.paymentProvider})` : ''}
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 w-full max-w-sm mb-8">
             <div className="flex justify-between mb-2">
                <span className="text-gray-500">Total</span>
                <span className="font-bold text-gray-900">{formatCurrency(lastTransaction.total)}</span>
             </div>
             <div className="flex justify-between mb-2">
                <span className="text-gray-500">Bayar</span>
                <span className="font-bold text-gray-900">{formatCurrency(lastTransaction.amountPaid)}</span>
             </div>
             <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="text-gray-500">Kembali</span>
                <span className="font-bold text-green-600">{formatCurrency(lastTransaction.change)}</span>
             </div>
          </div>

          <div className="flex gap-4 w-full max-w-sm">
            <button
              onClick={printReceipt}
              className="flex-1 flex items-center justify-center gap-2 py-4 border-2 border-blue-600 text-blue-600 rounded-2xl font-bold hover:bg-blue-50 transition-all"
            >
              <Printer size={20} />
              Cetak Struk
            </button>
            <button
              onClick={() => setLastTransaction(null)}
              className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all"
            >
              Transaksi Baru
            </button>
          </div>
        </div>
      )}

      {/* Hidden area for print receipt */}
      {lastTransaction && (
        <div className="print-only fixed top-0 left-0 bg-white w-full h-full z-[100]">
          <Receipt transaction={lastTransaction} />
        </div>
      )}
    </div>
  );
};

export default Cashier;
