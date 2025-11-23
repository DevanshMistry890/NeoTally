
import React from 'react';
import { CompanyData } from '../types';
import { ArrowLeft, Trash2 } from 'lucide-react';

interface DayBookProps {
    state: CompanyData;
    onDelete: (id: string) => void;
    onBack: () => void;
}

export const DayBook: React.FC<DayBookProps> = ({ state, onDelete, onBack }) => {
    // Sort vouchers by date desc
    const vouchers = [...state.vouchers].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const getVoucherAmount = (v: any) => {
        return v.entries.filter((e: any) => e.type === 'Dr').reduce((sum: number, e: any) => sum + e.amount, 0);
    };

    const getPrimaryLedgerName = (v: any) => {
        // Usually the first debit ledger, or just the first entry ledger
        const l = state.ledgers.find(l => l.id === v.entries[0].ledgerId);
        return l?.name || 'Unknown Ledger';
    };

    return (
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-white/50 h-full flex flex-col">
             <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-gray-200 rounded-full"><ArrowLeft size={20}/></button>
                    <h2 className="text-xl font-bold text-gray-800">Day Book</h2>
                </div>
                <div className="text-sm text-gray-500">Total Transactions: {vouchers.length}</div>
            </div>

            <div className="flex-1 overflow-auto p-0">
                {vouchers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                        <p>No vouchers entered yet.</p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-gray-50 sticky top-0 shadow-sm">
                            <tr className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3">Type</th>
                                <th className="px-6 py-3">Vch No.</th>
                                <th className="px-6 py-3">Particulars</th>
                                <th className="px-6 py-3 text-right">Debit Amount</th>
                                <th className="px-6 py-3 text-right">Credit Amount</th>
                                <th className="px-6 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {vouchers.map(v => (
                                <tr key={v.id} className="hover:bg-blue-50/50 group">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{v.date}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{v.type}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{v.number}</td>
                                    <td className="px-6 py-4 text-sm text-gray-800">
                                        <div className="font-medium">{getPrimaryLedgerName(v)}</div>
                                        <div className="text-xs text-gray-400 truncate max-w-xs">{v.narration}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-mono font-medium">{getVoucherAmount(v).toFixed(2)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-mono font-medium">{getVoucherAmount(v).toFixed(2)}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button 
                                            onClick={() => { if(confirm('Delete voucher?')) onDelete(v.id); }}
                                            className="text-gray-300 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};
