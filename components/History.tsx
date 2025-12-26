
import React, { useState } from 'react';
import { Search, Calendar, Download, Eye, FileSpreadsheet, X } from 'lucide-react';
import { Transaction } from '../types';
import { formatCurrency, formatDate, exportToCSV } from '../utils';

interface HistoryProps {
  transactions: Transaction[];
}

const History: React.FC<HistoryProps> = ({ transactions }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const filteredTransactions = transactions.filter(t => {
    // Pencarian berdasarkan ID (case insensitive)
    const matchesSearch = t.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter berdasarkan tanggal (ISO string t.date dimulai dengan YYYY-MM-DD dari filterDate)
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

  const resetFilters = () => {
    setSearchTerm('');
    setFilterDate('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Riwayat Transaksi</h2>
          <p className="text-gray-500">Lihat dan unduh laporan penjualan toko.</p>
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
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-bold shadow-lg shadow-green-100 hover:bg-green-700 transition-all"
          >
            <FileSpreadsheet size={20} />
            Ekspor CSV
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Cari ID Transaksi..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative">
          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="date" 
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">ID Transaksi</th>
                <th className="px-6 py-4">Tanggal & Waktu</th>
                <th className="px-6 py-4">Total Penjualan</th>
                <th className="px-6 py-4">Metode Bayar</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map(trx => (
                  <tr key={trx.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-5">
                      <span className="font-mono font-bold text-gray-800">{trx.id}</span>
                    </td>
                    <td className="px-6 py-5 text-gray-600 text-sm">
                      {formatDate(trx.date)}
                    </td>
                    <td className="px-6 py-5">
                      <span className="font-black text-blue-600">{formatCurrency(trx.total)}</span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-wider w-fit">
                          {trx.paymentMethod}
                        </span>
                        {trx.paymentProvider && trx.paymentProvider !== 'Tunai' && (
                          <span className="text-[10px] text-gray-400 mt-1 ml-1 font-bold">{trx.paymentProvider}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-center items-center gap-2">
                        <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                          <Eye size={18} />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all">
                          <Download size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400 italic">
                      <Search size={48} className="mb-4 opacity-20" />
                      <p>Tidak ada transaksi yang ditemukan.</p>
                      {(searchTerm || filterDate) && (
                        <button 
                          onClick={resetFilters}
                          className="mt-4 text-blue-600 font-bold not-italic hover:underline"
                        >
                          Hapus semua filter
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default History;
