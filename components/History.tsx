
import React, { useState } from 'react';
import { Search, Calendar, Download, Eye, FileSpreadsheet, X, Printer, FileText } from 'lucide-react';
import { Transaction } from '../types';
import { formatCurrency, formatDate, exportToCSV } from '../utils';
import Receipt from './Receipt';

interface HistoryProps { transactions: Transaction[]; }

const History: React.FC<HistoryProps> = ({ transactions }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = filterDate ? t.date.startsWith(filterDate) : true;
    return matchesSearch && matchesDate;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleExport = () => {
    const dataToExport = filteredTransactions.map(t => ({
      ID: t.id,
      Tanggal: formatDate(t.date),
      Total: t.total,
      Metode: t.paymentMethod,
      Produk: t.items.map(i => `${i.name} (${i.quantity})`).join('; ')
    }));
    exportToCSV(dataToExport, `Laporan-Penjualan-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const openPreview = (trx: Transaction) => {
    setSelectedTransaction(trx);
    setShowPreview(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilterDate('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-2xl font-black text-gray-800">Riwayat Transaksi</h2>
          <p className="text-gray-500 font-medium">Lihat dan unduh laporan penjualan toko.</p>
        </div>
        <div className="flex gap-2">
          {(searchTerm || filterDate) && (
            <button 
              onClick={resetFilters}
              className="flex items-center gap-2 px-4 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-all"
            >
              <X size={18} />
              Reset
            </button>
          )}
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-black shadow-lg shadow-green-100 hover:bg-green-700 transition-all active:scale-95"
          >
            <FileSpreadsheet size={20} />
            Ekspor CSV
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 no-print">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Cari ID Transaksi..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 text-gray-900 font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative">
          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="date" 
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 text-gray-900 font-medium"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden no-print">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <th className="px-8 py-5">ID Transaksi</th>
                <th className="px-8 py-5">Tanggal & Waktu</th>
                <th className="px-8 py-5">Total Penjualan</th>
                <th className="px-8 py-5">Metode Bayar</th>
                <th className="px-8 py-5 text-center">Struk / PDF</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map(trx => (
                  <tr key={trx.id} className="hover:bg-pink-50/20 transition-colors group">
                    <td className="px-8 py-5">
                      <span className="font-mono font-black text-gray-800">{trx.id}</span>
                    </td>
                    <td className="px-8 py-5 text-gray-500 font-medium text-sm">
                      {formatDate(trx.date)}
                    </td>
                    <td className="px-8 py-5">
                      <span className="font-black text-pink-600">{formatCurrency(trx.total)}</span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="px-3 py-1 bg-pink-50 text-pink-600 rounded-full text-[9px] font-black uppercase tracking-widest w-fit border border-pink-100">
                          {trx.paymentMethod}
                        </span>
                        {trx.paymentProvider && trx.paymentProvider !== 'Tunai' && (
                          <span className="text-[9px] text-gray-400 mt-1 ml-1 font-bold uppercase">{trx.paymentProvider}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex justify-center items-center gap-2">
                        <button 
                          onClick={() => openPreview(trx)}
                          title="Lihat & Cetak PDF"
                          className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-pink-600 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-pink-100"
                        >
                          <FileText size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-8 py-32 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-300">
                      <Search size={64} className="mb-4 opacity-10" />
                      <p className="font-black text-lg">Tidak ada transaksi ditemukan</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showPreview && selectedTransaction && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[300] flex items-center justify-center p-4 no-print animate-in fade-in duration-300">
          <div className="bg-gray-800 p-2 rounded-[2rem] shadow-2xl relative max-h-[90vh] flex flex-col w-full max-w-lg">
            <div className="flex justify-between items-center p-4 text-white">
              <h4 className="font-black uppercase tracking-widest text-xs">Detail Struk</h4>
              <button onClick={() => setShowPreview(false)} className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full">
                <X size={20} />
              </button>
            </div>
            
            <div className="overflow-y-auto flex-1 p-8 custom-scrollbar flex flex-col items-center bg-gray-900/50">
               <div className="bg-white p-1 shadow-2xl">
                  <Receipt transaction={selectedTransaction} />
               </div>
            </div>

            <div className="p-6 border-t border-white/10 flex gap-4">
               <button 
                  onClick={handlePrint}
                  className="flex-1 py-4 bg-white text-black rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-gray-100 transition-all active:scale-95 shadow-xl"
               >
                  <Printer size={20} /> CETAK / PDF
               </button>
               <button 
                  onClick={() => setShowPreview(false)}
                  className="flex-1 py-4 bg-pink-600 text-white rounded-2xl font-black hover:bg-pink-700 transition-all active:scale-95 shadow-xl"
               >
                  TUTUP
               </button>
            </div>
          </div>
        </div>
      )}

      {selectedTransaction && (
        <div className="print-only">
          <Receipt transaction={selectedTransaction} />
        </div>
      )}

      <style>{`
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

export default History;
