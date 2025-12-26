
import React from 'react';
import { Transaction } from '../types';
import { formatCurrency, formatDate } from '../utils';

interface ReceiptProps {
  transaction: Transaction;
}

const Receipt: React.FC<ReceiptProps> = ({ transaction }) => {
  return (
    <div className="bg-white p-4 max-w-[300px] mx-auto text-xs font-mono text-black leading-tight border border-dashed border-gray-300">
      <div className="text-center mb-4">
        <h2 className="text-sm font-bold uppercase">TOKO SEMBAKO JAYA</h2>
        <p>Jl. Raya Pasar No. 45</p>
        <p>Telp: 0812-3456-7890</p>
        <p className="mt-2 border-b border-dashed pb-2">--------------------------------</p>
      </div>

      <div className="space-y-1 mb-4">
        <p>No: {transaction.id}</p>
        <p>Tgl: {formatDate(transaction.date)}</p>
        <p className="border-b border-dashed pb-1">--------------------------------</p>
      </div>

      <div className="space-y-2 mb-4">
        {transaction.items.map((item, idx) => (
          <div key={idx} className="flex flex-col">
            <div className="flex justify-between">
              <span>{item.name}</span>
            </div>
            <div className="flex justify-between pl-2">
              <span>{item.quantity} {item.unit} x {formatCurrency(item.price).replace('Rp', '')}</span>
              <span>{formatCurrency(item.price * item.quantity).replace('Rp', '')}</span>
            </div>
          </div>
        ))}
        <p className="border-t border-dashed pt-1">--------------------------------</p>
      </div>

      <div className="space-y-1 mb-6">
        <div className="flex justify-between font-bold">
          <span>TOTAL</span>
          <span>{formatCurrency(transaction.total)}</span>
        </div>
        <div className="flex justify-between">
          <span>Bayar ({transaction.paymentMethod})</span>
          <span>{formatCurrency(transaction.amountPaid)}</span>
        </div>
        <div className="flex justify-between">
          <span>Kembali</span>
          <span>{formatCurrency(transaction.change)}</span>
        </div>
      </div>

      <div className="text-center">
        <p>TERIMA KASIH</p>
        <p>BARANG YANG SUDAH DIBELI</p>
        <p>TIDAK DAPAT DITUKAR/DIKEMBALIKAN</p>
        <p className="mt-4">Layanan Digital POS</p>
      </div>
    </div>
  );
};

export default Receipt;
