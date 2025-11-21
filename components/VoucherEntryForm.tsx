
import React, { useState, useMemo } from 'react';
import { AppState, Voucher, VoucherEntry, VoucherType } from '../types';
import { Trash2, Plus, AlertCircle, Coins } from 'lucide-react';

interface VoucherEntryFormProps {
    state: AppState;
    initialType: VoucherType;
    onSave: (v: Voucher) => void;
    onCancel: () => void;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export const VoucherEntryForm: React.FC<VoucherEntryFormProps> = ({ state, initialType, onSave, onCancel }) => {
    const [type, setType] = useState<VoucherType>(initialType);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [narration, setNarration] = useState('');
    const [isMultiCurrency, setIsMultiCurrency] = useState(false);
    
    const [entries, setEntries] = useState<VoucherEntry[]>([
        { id: generateId(), type: 'Dr', ledgerId: '', amount: 0 },
        { id: generateId(), type: 'Cr', ledgerId: '', amount: 0 }
    ]);

    const totalDr = useMemo(() => entries.filter(e => e.type === 'Dr').reduce((sum, e) => sum + (e.amount || 0), 0), [entries]);
    const totalCr = useMemo(() => entries.filter(e => e.type === 'Cr').reduce((sum, e) => sum + (e.amount || 0), 0), [entries]);
    const difference = totalDr - totalCr;
    const isBalanced = Math.abs(difference) < 0.01;

    const updateEntry = (id: string, field: keyof VoucherEntry, value: any) => {
        setEntries(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e));
    };

    const removeEntry = (id: string) => {
        if (entries.length > 2) {
            setEntries(prev => prev.filter(e => e.id !== id));
        }
    };

    const addEntry = () => {
        const lastType = entries[entries.length - 1]?.type || 'Dr';
        setEntries([...entries, { id: generateId(), type: lastType === 'Dr' ? 'Cr' : 'Dr', ledgerId: '', amount: 0 }]);
    };

    const handleSave = () => {
        if (!isBalanced) return alert('Voucher is not balanced.');
        if (entries.some(e => !e.ledgerId || e.amount <= 0)) return alert('Invalid entries detected.');

        const voucher: Voucher = {
            id: generateId(),
            date,
            type,
            entries,
            narration,
            number: state.vouchers.length + 1
        };
        onSave(voucher);
    };

    const getLedgerBalance = (ledgerId: string) => {
        if (!ledgerId) return 0;
        const ledger = state.ledgers.find(l => l.id === ledgerId);
        if (!ledger) return 0;
        let bal = ledger.openingBalance * (ledger.openingBalanceType === 'Dr' ? 1 : -1);
        state.vouchers.forEach(v => {
            v.entries.forEach(e => {
                if (e.ledgerId === ledgerId) {
                    bal += e.amount * (e.type === 'Dr' ? 1 : -1);
                }
            });
        });
        // Include current voucher draft calculation
        entries.forEach(e => {
            if (e.ledgerId === ledgerId) {
                bal += e.amount * (e.type === 'Dr' ? 1 : -1);
            }
        });
        return bal; 
    };

    return (
        <div className="h-full flex flex-col bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-white/50">
            <div className="bg-gray-800 text-white p-4 flex justify-between items-center shadow-lg">
                <div className="flex items-center gap-4">
                    <span className="font-bold text-lg">Voucher Entry</span>
                    <div className="flex bg-gray-700 rounded p-1">
                        {Object.values(VoucherType).map(t => (
                            <button 
                                key={t} 
                                onClick={() => setType(t)}
                                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${type === t ? 'bg-blue-500 text-white' : 'text-gray-300 hover:bg-gray-600'}`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex items-center gap-4">
                     <button 
                        onClick={() => setIsMultiCurrency(!isMultiCurrency)}
                        className={`flex items-center gap-2 px-3 py-1 rounded text-xs font-bold border ${isMultiCurrency ? 'bg-yellow-500 text-black border-yellow-500' : 'border-gray-500 text-gray-400'}`}
                    >
                        <Coins size={14} /> Forex
                    </button>
                    <div className="flex gap-2 text-sm">
                        <span className="opacity-70">No.</span>
                        <span className="font-mono font-bold">{state.vouchers.length + 1}</span>
                    </div>
                </div>
            </div>

            <div className="p-4 bg-gray-50 border-b border-gray-200 flex gap-4 items-end">
                 <div className="w-40">
                    <label className="text-xs font-bold text-gray-500 uppercase">Date</label>
                    <input 
                        type="date" 
                        value={date} 
                        onChange={e => setDate(e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-sm"
                    />
                 </div>
                 <div className="text-sm text-gray-500 italic flex-1 text-right">
                    Auto-calculates Interest & GST based on Ledger masters
                 </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                <table className="w-full">
                    <thead className="text-xs text-gray-500 uppercase border-b border-gray-300">
                        <tr>
                            <th className="w-16 text-left py-2 px-2">Dr/Cr</th>
                            <th className="text-left py-2 px-2">Particulars (Ledger)</th>
                            <th className="w-32 text-right py-2 px-2">Cur Bal</th>
                            {isMultiCurrency && <th className="w-24 text-right py-2 px-2">Forex ($)</th>}
                            <th className="w-32 text-right py-2 px-2">Amount (₹)</th>
                            <th className="w-10"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {entries.map((entry, index) => {
                            const curBal = getLedgerBalance(entry.ledgerId);
                            const ledger = state.ledgers.find(l => l.id === entry.ledgerId);
                            return (
                                <tr key={entry.id} className="group hover:bg-blue-50/50 transition-colors">
                                    <td className="p-2 align-top">
                                        <select 
                                            value={entry.type} 
                                            onChange={e => updateEntry(entry.id, 'type', e.target.value)}
                                            className={`font-bold ${entry.type === 'Dr' ? 'text-blue-600' : 'text-red-600'} bg-transparent focus:outline-none cursor-pointer`}
                                        >
                                            <option value="Dr">Dr</option>
                                            <option value="Cr">Cr</option>
                                        </select>
                                    </td>
                                    <td className="p-2 align-top">
                                        <select 
                                            value={entry.ledgerId} 
                                            onChange={e => updateEntry(entry.id, 'ledgerId', e.target.value)}
                                            className="w-full bg-transparent border-b border-transparent focus:border-blue-500 focus:outline-none pb-1"
                                            autoFocus={index === 0 && !entry.ledgerId}
                                        >
                                            <option value="">Select Ledger</option>
                                            {state.ledgers.map(l => (
                                                <option key={l.id} value={l.id}>{l.name}</option>
                                            ))}
                                        </select>
                                        {ledger?.taxDetails?.gstin && (
                                            <div className="text-[10px] text-blue-500">GST: {ledger.taxDetails.gstin}</div>
                                        )}
                                    </td>
                                    <td className="p-2 text-right text-xs text-gray-500 font-mono pt-3">
                                        {entry.ledgerId ? `${Math.abs(curBal).toFixed(2)} ${curBal >= 0 ? 'Dr' : 'Cr'}` : '-'}
                                    </td>
                                    {isMultiCurrency && (
                                         <td className="p-2 align-top">
                                            <input 
                                                type="number" 
                                                value={entry.forexAmount || ''} 
                                                onChange={e => updateEntry(entry.id, 'forexAmount', parseFloat(e.target.value))}
                                                className="w-full text-right bg-yellow-50/50 border-b border-transparent focus:border-yellow-500 focus:outline-none pb-1 font-mono text-xs"
                                                placeholder="$ 0.00"
                                            />
                                        </td>
                                    )}
                                    <td className="p-2 align-top">
                                        <input 
                                            type="number" 
                                            value={entry.amount || ''} 
                                            onChange={e => updateEntry(entry.id, 'amount', parseFloat(e.target.value))}
                                            className="w-full text-right bg-transparent border-b border-transparent focus:border-blue-500 focus:outline-none pb-1 font-mono"
                                            placeholder="0.00"
                                        />
                                    </td>
                                    <td className="p-2 text-center">
                                        <button tabIndex={-1} onClick={() => removeEntry(entry.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                <button onClick={addEntry} className="mt-4 flex items-center gap-2 text-blue-600 text-sm font-medium hover:bg-blue-50 px-3 py-2 rounded">
                    <Plus size={16} /> Add Line
                </button>
            </div>

            <div className="bg-gray-50 border-t border-gray-200 p-4">
                <div className="flex items-start gap-4 mb-4">
                    <div className="flex-1">
                        <label className="text-xs font-bold text-gray-500 uppercase">Narration</label>
                        <textarea 
                            value={narration}
                            onChange={e => setNarration(e.target.value)}
                            className="w-full mt-1 border border-gray-300 rounded p-2 text-sm h-16 resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder="Enter transaction details..."
                        ></textarea>
                    </div>
                    <div className="w-64 bg-white border border-gray-200 rounded p-3 shadow-sm">
                        <div className="flex justify-between text-sm mb-1">
                            <span>Total Debit:</span>
                            <span className="font-mono font-bold">{totalDr.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm mb-2">
                            <span>Total Credit:</span>
                            <span className="font-mono font-bold">{totalCr.toFixed(2)}</span>
                        </div>
                        {!isBalanced && (
                            <div className="text-xs text-red-600 font-bold flex items-center gap-1 border-t border-red-100 pt-2">
                                <AlertCircle size={12} /> Diff: {difference.toFixed(2)} {difference > 0 ? 'Dr' : 'Cr'}
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex justify-end gap-3">
                    <button onClick={onCancel} className="px-6 py-2 rounded text-gray-600 hover:bg-gray-200 font-medium">Discard</button>
                    <button 
                        disabled={!isBalanced} 
                        onClick={handleSave} 
                        className={`px-8 py-2 rounded font-bold shadow-lg transition-all ${isBalanced ? 'bg-green-600 text-white hover:bg-green-700 shadow-green-200' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                    >
                        Accept
                    </button>
                </div>
            </div>
        </div>
    );
};
