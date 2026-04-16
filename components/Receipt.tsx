
import React from 'react';
import { Transaction } from '../types';

interface ReceiptProps {
  transaction: Transaction;
}

const Receipt: React.FC<ReceiptProps> = ({ transaction }) => {
  // Helper to format numbers like 50.000 instead of Rp 50.000
  const fNum = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const formatDateLabel = (dateStr: string) => {
    const d = new Date(dateStr);
    const date = d.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).replace(/\//g, '.');
    const time = d.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).replace(/:/g, ':');
    return `${date}-${time}`;
  };

  return (
    <div className="bg-white p-6 w-[340px] mx-auto text-[12px] font-mono text-black leading-tight print:p-0 print:w-full">
      {/* Header Section */}
      <div className="text-center mb-4 uppercase">
        <h1 className="text-xl font-bold tracking-tight">WHY Sembako</h1>
        <p className="text-sm font-bold">GROSIR SEMBAKO DAN BERAS</p>
        <p className="text-[10px] normal-case mt-1">Jl. Rorojonggrang Raya B1 No.13 Kel. Melong – Cimahi</p>
      </div>

      <div className="text-center py-1 overflow-hidden whitespace-nowrap">
        ------------------------------------------
      </div>

      {/* Metadata Section */}
      <div className="flex justify-between mb-4 font-medium uppercase">
        <span>No. Struk : {transaction.id.replace('BON', '')}</span>
        <span>{formatDateLabel(transaction.date)}</span>
      </div>

      {/* Items List */}
      <div className="space-y-3 mb-4">
        {transaction.items.map((item, idx) => (
          <div key={idx} className="flex flex-col">
            <span className="font-medium">{item.name}</span>
            <div className="flex justify-between items-end">
              <span className="pl-0">
                {fNum(item.quantity)} {item.unit.charAt(0).toUpperCase() + item.unit.slice(1).toLowerCase()} X {fNum(item.price)}
              </span>
              <div className="flex justify-between w-[120px]">
                <span>Rp.</span>
                <span className="text-right">{fNum(item.price * item.quantity)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center py-1 overflow-hidden whitespace-nowrap">
        ------------------------------------------
      </div>

      {/* Summary Totals Section */}
      <div className="space-y-2 uppercase font-bold">
        <div className="flex justify-end items-center gap-4">
          <span className="w-24 text-right">Subtotal</span>
          <div className="flex justify-between w-[120px]">
            <span>Rp.</span>
            <span className="text-right">{fNum(transaction.total)}</span>
          </div>
        </div>
        
        <div className="flex justify-end items-center gap-4">
          <span className="w-24 text-right">Bayar</span>
          <div className="flex justify-between w-[120px]">
            <span>Rp.</span>
            <span className="text-right">{fNum(transaction.amountPaid)}</span>
          </div>
        </div>

        <div className="flex justify-end items-center gap-4 mt-1 border-t border-dotted border-gray-400 pt-1">
          <span className="w-24 text-right">Kembali</span>
          <div className="flex justify-between w-[120px]">
            <span>Rp.</span>
            <span className="text-right">{fNum(transaction.change)}</span>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <div className="mt-10 text-center uppercase font-medium space-y-1">
        <p>TERIMA KASIH</p>
        <p>ATAS KUNJUNGAN ANDA</p>
      </div>

      <div className="mt-4 border-b border-dotted border-gray-200 w-full no-print"></div>
    </div>
  );
};

export default Receipt;
