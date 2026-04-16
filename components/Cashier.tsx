
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, Plus, Minus, Trash2, Banknote, CreditCard, Send, Printer, CheckCircle2, X, ShoppingCart, QrCode, Building2, Wallet, ImageIcon, ScanLine, Camera, Flashlight, List, Loader2, RefreshCw, AlertCircle, Smartphone, FileText, Eye } from 'lucide-react';
import { Product, CartItem, PaymentMethod, Transaction, User } from '../types';
import { formatCurrency, generateId } from '../utils';
import Receipt from './Receipt';

declare const Html5Qrcode: any;

interface CashierProps {
  products: Product[];
  user?: User | null;
  onCompleteTransaction: (transaction: Transaction) => void;
}

const Cashier: React.FC<CashierProps> = ({ products, user, onCompleteTransaction }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [paymentProvider, setPaymentProvider] = useState<string>('');
  const [amountPaid, setAmountPaid] = useState<string>('');
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null);
  const [showReceiptPreview, setShowReceiptPreview] = useState(false);
  const [scanResult, setScanResult] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [isCameraInitializing, setIsCameraInitializing] = useState(false);
  
  const scannerRef = useRef<any>(null);
  const lastScannedCode = useRef<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const bankOptions = ['BCA', 'BRI', 'Mandiri', 'SeaBank'];
  const ewalletOptions = ['DANA', 'GoPay', 'OVO', 'ShopeePay'];

  // Fungsi untuk membunyikan suara "tit" kasir
  const playBeep = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const ctx = audioContextRef.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, ctx.currentTime); // Nada A5 (tinggi/jernih)
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.01);
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1);

      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.1);
    } catch (e) {
      console.warn("Audio feedback failed:", e);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.barcode && p.barcode.includes(searchTerm))
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

  const startScanner = async () => {
    // Memulai AudioContext pada interaksi user untuk melewati kebijakan autoplay browser
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    setShowScanner(true);
    setIsCameraInitializing(true);
    setTimeout(async () => {
      try {
        const html5QrCode = new Html5Qrcode("reader");
        scannerRef.current = html5QrCode;
        await html5QrCode.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 150 }, aspectRatio: 1.0 },
          (decodedText: string) => {
            if (lastScannedCode.current === decodedText) return;
            lastScannedCode.current = decodedText;
            const found = products.find(p => p.barcode === decodedText);
            if (found) {
              playBeep(); // Bunyikan suara TIT
              addToCart(found);
              setScanResult({ message: `Ditemukan: ${found.name}`, type: 'success' });
            } else {
              setScanResult({ message: `Barcode tidak dikenal: ${decodedText}`, type: 'error' });
            }
            setTimeout(() => { lastScannedCode.current = null; setScanResult(null); }, 2000);
          },
          () => {}
        );
        setIsCameraInitializing(false);
      } catch (err) {
        alert("Gagal mengakses kamera.");
        setShowScanner(false);
      }
    }, 300);
  };

  const stopScanner = async () => {
    if (scannerRef.current) await scannerRef.current.stop().catch(() => {});
    setShowScanner(false);
    setIsCameraInitializing(false);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) return { ...item, quantity: Math.max(0, item.quantity + delta) };
      return item;
    }).filter(item => item.quantity > 0));
  };

  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const change = Number(amountPaid) - cartTotal;
  const quickDenominations = [2000, 5000, 10000, 20000, 50000, 100000];

  const handleCheckout = () => {
    if (cart.length === 0) return;
    const transaction: Transaction = {
      id: `BON${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString(),
      items: [...cart],
      total: cartTotal,
      paymentMethod,
      paymentProvider: paymentMethod !== PaymentMethod.CASH ? paymentProvider : 'Tunai',
      amountPaid: paymentMethod === PaymentMethod.CASH ? Number(amountPaid) : cartTotal,
      change: paymentMethod === PaymentMethod.CASH ? Math.max(0, change) : 0,
      cashierName: user?.name || 'Kasir'
    };
    onCompleteTransaction(transaction);
    setLastTransaction(transaction);
    setCart([]);
    setAmountPaid('');
    setPaymentProvider('');
    setShowCheckoutModal(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-120px)] animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex-1 flex flex-col gap-6 no-print">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Cari produk..."
              className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all text-gray-900 font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button onClick={startScanner} className="px-6 bg-pink-600 text-white rounded-2xl shadow-lg flex items-center gap-2 font-black hover:bg-pink-700 transition-all active:scale-95">
            <Camera size={24} />
            <span className="hidden sm:inline">Scan HP</span>
          </button>
        </div>

        {scanResult && (
          <div className={`p-4 rounded-2xl font-bold text-center animate-in fade-in slide-in-from-top-2 duration-300 ${scanResult.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {scanResult.message}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pb-4 pr-2 custom-scrollbar">
          {filteredProducts.map(product => (
            <button key={product.id} onClick={() => addToCart(product)} className="flex flex-col bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all text-left overflow-hidden group active:scale-95">
              <div className="relative h-32 overflow-hidden bg-gray-50">
                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute top-2 right-2 px-2 py-1 bg-white/90 rounded-lg text-[9px] font-black text-black">STOK: {product.stock}</div>
              </div>
              <div className="p-3">
                <span className="text-[9px] font-bold text-pink-500 uppercase tracking-widest">{product.category}</span>
                <h4 className="font-bold text-gray-800 text-xs line-clamp-2">{product.name}</h4>
                <p className="text-pink-600 font-black text-sm">{formatCurrency(product.price)}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="w-full lg:w-[400px] bg-white rounded-3xl border border-gray-100 shadow-xl flex flex-col no-print">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="text-pink-600" size={24} />
            <h3 className="text-xl font-bold text-gray-800 tracking-tight">Keranjang</h3>
          </div>
          <span className="px-4 py-1.5 bg-pink-600 text-white rounded-full text-xs font-black shadow-lg shadow-pink-100">{cart.length} Item</span>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-300 opacity-60">
              <QrCode className="w-16 h-16 mb-4 animate-pulse" />
              <p className="text-sm font-bold text-center px-8">Belum ada barang dipilih</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-transparent hover:border-pink-100 transition-all">
                <div className="w-10 h-10 rounded-xl bg-white overflow-hidden shadow-sm border border-gray-100 flex-shrink-0">
                  <img src={item.imageUrl} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-800 text-xs truncate leading-tight">{item.name}</p>
                  <p className="text-pink-600 text-[10px] font-black">{formatCurrency(item.price)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQuantity(item.id, -1)} className="w-7 h-7 flex items-center justify-center bg-white text-gray-400 rounded-lg shadow-sm border border-gray-100 active:scale-90"><Minus size={14} /></button>
                  <span className="w-5 text-center font-black text-gray-800 text-xs">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)} className="w-7 h-7 flex items-center justify-center bg-white text-pink-600 rounded-lg shadow-sm border border-gray-100 active:scale-90"><Plus size={14} /></button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-6 bg-gray-100 border-t border-gray-200 space-y-4">
          <div className="flex justify-between items-center">
            <span className="font-bold text-gray-500 uppercase tracking-widest text-[10px]">Total Belanja</span>
            <span className="text-3xl font-black text-pink-600">{formatCurrency(cartTotal)}</span>
          </div>
          <button 
            onClick={() => { setShowCheckoutModal(true); setPaymentMethod(PaymentMethod.CASH); }} 
            disabled={cart.length === 0} 
            className="w-full py-5 bg-pink-600 text-white rounded-2xl font-black text-xl shadow-xl shadow-pink-200 hover:bg-pink-700 transition-all active:scale-95 disabled:opacity-50 uppercase tracking-widest"
          >
            Lanjut Bayar
          </button>
        </div>
      </div>

      {showScanner && (
        <div className="fixed inset-0 bg-black z-[2000] flex flex-col items-center justify-center p-4">
          <button onClick={stopScanner} className="absolute top-8 right-8 w-12 h-12 flex items-center justify-center bg-white/20 text-white rounded-full hover:bg-white/30 z-[2010]">
            <X size={28} />
          </button>
          <div className="relative w-full max-w-lg aspect-square rounded-[3rem] overflow-hidden border-4 border-white/20 shadow-2xl bg-gray-900">
            <div id="reader" className="w-full h-full"></div>
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center z-10">
              <div className="w-72 h-48 border-4 border-pink-500 rounded-3xl relative shadow-[0_0_40px_rgba(236,72,153,0.4)]">
                <div className="absolute top-0 left-0 w-full h-1 bg-pink-400 shadow-[0_0_15px_#ec4899] animate-[scan_2s_infinite]"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCheckoutModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-8 flex justify-between items-center border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-2xl font-black text-gray-800 tracking-tight">Metode Pembayaran</h3>
              <button onClick={() => setShowCheckoutModal(false)} className="w-10 h-10 flex items-center justify-center bg-white rounded-full text-gray-400 shadow-sm border border-gray-100"><X size={20} /></button>
            </div>
            <div className="p-8 space-y-6">
              <div className="text-center bg-pink-600 py-8 rounded-[2rem] shadow-xl shadow-pink-100">
                <p className="text-pink-100 font-bold uppercase tracking-widest text-[10px] mb-1">Total Tagihan</p>
                <p className="text-5xl font-black text-white">{formatCurrency(cartTotal)}</p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {Object.values(PaymentMethod).map(method => (
                  <button 
                    key={method} 
                    onClick={() => { setPaymentMethod(method); setPaymentProvider(''); setAmountPaid(''); }}
                    className={`py-4 rounded-xl font-black text-[10px] uppercase tracking-wider border-2 transition-all ${paymentMethod === method ? 'bg-pink-600 border-pink-600 text-white shadow-lg' : 'bg-white border-gray-100 text-gray-400'}`}
                  >
                    {method}
                  </button>
                ))}
              </div>

              {paymentMethod === PaymentMethod.CASH && (
                <div className="space-y-4 animate-in slide-in-from-top-4">
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-gray-400 text-2xl">Rp</span>
                    <input 
                      type="number" 
                      placeholder="0" 
                      className="w-full p-6 pl-16 bg-gray-50 border-2 border-gray-100 rounded-[2rem] font-black text-4xl text-right text-black focus:border-pink-500 focus:bg-white focus:outline-none transition-all"
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {quickDenominations.map(d => (
                      <button key={d} onClick={() => setAmountPaid(d.toString())} className="py-3 bg-gray-50 rounded-xl text-[10px] font-black text-black hover:bg-pink-50 hover:text-pink-600 transition-all">+{d/1000}rb</button>
                    ))}
                  </div>
                </div>
              )}

              {paymentMethod === PaymentMethod.QRIS && (
                <div className="flex flex-col items-center gap-4 py-4 animate-in zoom-in-95">
                  <div className="bg-white p-4 rounded-3xl shadow-lg border-2 border-pink-50">
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=WHY-SEMBAKO-${generateId()}`} alt="QRIS" className="w-44 h-44" />
                  </div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Silahkan Scan QRIS Diatas</p>
                </div>
              )}

              {paymentMethod === PaymentMethod.TRANSFER && (
                <div className="space-y-4 animate-in slide-in-from-top-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-[9px] font-bold text-pink-600 uppercase tracking-widest">Pilih Bank</p>
                      <div className="grid grid-cols-2 gap-2">
                        {bankOptions.map(bank => (
                          <button key={bank} onClick={() => setPaymentProvider(bank)} className={`p-3 rounded-xl text-[10px] font-black border transition-all ${paymentProvider === bank ? 'bg-pink-50 border-pink-500 text-pink-700' : 'bg-white border-gray-100 text-gray-500'}`}>{bank}</button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[9px] font-bold text-pink-600 uppercase tracking-widest">E-Wallet</p>
                      <div className="grid grid-cols-2 gap-2">
                        {ewalletOptions.map(ew => (
                          <button key={ew} onClick={() => setPaymentProvider(ew)} className={`p-3 rounded-xl text-[10px] font-black border transition-all ${paymentProvider === ew ? 'bg-pink-50 border-pink-500 text-pink-700' : 'bg-white border-gray-100 text-gray-500'}`}>{ew}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <button 
                onClick={handleCheckout} 
                disabled={(paymentMethod === PaymentMethod.CASH && (!amountPaid || Number(amountPaid) < cartTotal)) || (paymentMethod === PaymentMethod.TRANSFER && !paymentProvider)}
                className="w-full py-6 bg-pink-600 text-white rounded-[2rem] font-black text-2xl shadow-2xl shadow-pink-100 hover:bg-pink-700 transition-all active:scale-95 disabled:opacity-50"
              >
                KONFIRMASI PEMBAYARAN
              </button>
            </div>
          </div>
        </div>
      )}

      {lastTransaction && !showReceiptPreview && (
        <div className="fixed inset-0 bg-white z-[200] flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in-110">
          <div className="no-print flex flex-col items-center">
            <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 animate-bounce">
              <CheckCircle2 size={48} />
            </div>
            <h2 className="text-4xl font-black text-gray-800 mb-2">Transaksi Berhasil!</h2>
            <div className="bg-gray-50 px-8 py-4 rounded-2xl mb-8">
              <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Kembalian</p>
              <p className="text-3xl font-black text-green-600">{formatCurrency(lastTransaction.change)}</p>
            </div>
            <div className="flex flex-col gap-3 w-full max-md">
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowReceiptPreview(true)} 
                  className="flex-1 py-5 border-4 border-pink-600 text-pink-600 rounded-[2rem] font-black text-lg hover:bg-pink-50 flex items-center justify-center gap-3 transition-all active:scale-95"
                >
                  <Eye size={24} /> Lihat Struk
                </button>
                <button 
                  onClick={() => setShowReceiptPreview(true)} 
                  className="flex-1 py-5 border-4 border-pink-600 text-pink-600 rounded-[2rem] font-black text-lg hover:bg-pink-50 flex items-center justify-center gap-3 transition-all active:scale-95"
                >
                  <FileText size={24} /> PDF
                </button>
              </div>
              <button onClick={() => setLastTransaction(null)} className="w-full py-5 bg-pink-600 text-white rounded-[2rem] font-black text-lg shadow-xl hover:bg-pink-700 transition-all">
                Selesai / Transaksi Baru
              </button>
            </div>
          </div>
          <div className="print-only mt-8">
            <Receipt transaction={lastTransaction} />
          </div>
        </div>
      )}

      {showReceiptPreview && lastTransaction && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[300] flex items-center justify-center p-4 md:p-8 no-print animate-in fade-in duration-300">
          <div className="bg-gray-800 p-2 rounded-[2rem] shadow-2xl relative max-h-full flex flex-col">
            <div className="flex justify-between items-center p-4 text-white">
              <h4 className="font-black uppercase tracking-widest text-xs">Preview Struk Belanja</h4>
              <button 
                onClick={() => setShowReceiptPreview(false)}
                className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-all"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="overflow-y-auto flex-1 p-6 md:p-12 custom-scrollbar flex flex-col items-center">
               <div className="bg-white shadow-[0_0_50px_rgba(0,0,0,0.3)] rounded-sm rotate-1 transform transition-transform hover:rotate-0 duration-500">
                  <Receipt transaction={lastTransaction} />
               </div>
            </div>

            <div className="p-6 border-t border-white/10 flex gap-4">
               <button 
                  onClick={handlePrint}
                  className="flex-1 py-4 bg-white text-black rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-gray-100 transition-all active:scale-95 shadow-xl"
               >
                  <Printer size={20} /> CETAK / SIMPAN PDF
               </button>
               <button 
                  onClick={() => {
                    setShowReceiptPreview(false);
                    setLastTransaction(null);
                  }}
                  className="flex-1 py-4 bg-pink-600 text-white rounded-2xl font-black hover:bg-pink-700 transition-all active:scale-95 shadow-xl"
               >
                  TRANSAKSI BARU
               </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes scan {
          0% { transform: translateY(0); }
          50% { transform: translateY(184px); }
          100% { transform: translateY(0); }
        }
        @media print {
          body * { visibility: hidden; }
          .print-only, .print-only * { visibility: visible; }
          .print-only { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100%; 
            display: flex !important;
            justify-content: center;
          }
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default Cashier;
