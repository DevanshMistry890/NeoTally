
import React, { useState, useMemo } from 'react';
import { CompanyData, Voucher, VoucherEntry, VoucherType, InventoryAllocation } from '../types';
import { Trash2, Plus, ArrowRight } from 'lucide-react';

interface VoucherEntryFormProps {
    data: CompanyData;
    initialType: VoucherType;
    onSave: (v: Voucher) => void;
    onCancel: () => void;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export const VoucherEntryForm: React.FC<VoucherEntryFormProps> = ({ data, initialType, onSave, onCancel }) => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [narration, setNarration] = useState('');
    const [entries, setEntries] = useState<VoucherEntry[]>([
        { id: generateId(), type: 'Dr', ledgerId: '', amount: 0 },
        { id: generateId(), type: 'Cr', ledgerId: '', amount: 0 }
    ]);
    
    // Inventory Allocation Modal State
    const [allocatingEntryId, setAllocatingEntryId] = useState<string | null>(null);
    const [allocations, setAllocations] = useState<InventoryAllocation[]>([]);
    
    // Derived state
    const totalDr = entries.filter(e => e.type === 'Dr').reduce((s, e) => s + (e.amount || 0), 0);
    const totalCr = entries.filter(e => e.type === 'Cr').reduce((s, e) => s + (e.amount || 0), 0);
    const diff = totalDr - totalCr;

    const handleOpenAllocation = (entryId: string) => {
        const entry = entries.find(e => e.id === entryId);
        if (!entry) return;
        setAllocations(entry.inventoryAllocations || []);
        setAllocatingEntryId(entryId);
    };

    const saveAllocation = () => {
        if (!allocatingEntryId) return;
        const totalAllocated = allocations.reduce((sum, a) => sum + a.amount, 0);
        
        setEntries(prev => prev.map(e => e.id === allocatingEntryId ? { 
            ...e, 
            inventoryAllocations: allocations,
            amount: totalAllocated > 0 ? totalAllocated : e.amount 
        } : e));
        setAllocatingEntryId(null);
    };

    const handleSaveVoucher = () => {
        if (Math.abs(diff) > 0.1) return alert("Differences in Dr/Cr");
        const voucher: Voucher = {
            id: generateId(),
            number: data.vouchers.length + 1,
            date,
            type: initialType,
            narration,
            entries
        };
        onSave(voucher);
    };

    const InventoryModal = () => {
        if (!allocatingEntryId) return null;
        const entry = entries.find(e => e.id === allocatingEntryId);
        const ledger = data.ledgers.find(l => l.id === entry?.ledgerId);

        const addAllocLine = () => {
            setAllocations([...allocations, { itemId: '', godownId: data.godowns[0]?.id || '', quantity: 0, rate: 0, amount: 0 }]);
        };

        const updateAlloc = (idx: number, field: keyof InventoryAllocation, val: any) => {
            const newAllocs = [...allocations];
            newAllocs[idx] = { ...newAllocs[idx], [field]: val };
            if (field === 'quantity' || field === 'rate') {
                newAllocs[idx].amount = newAllocs[idx].quantity * newAllocs[idx].rate;
            }
            setAllocations(newAllocs);
        };

        return (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white w-[800px] shadow-2xl border-2 border-blue-600">
                    <div className="bg-blue-600 text-white px-4 py-2 font-bold flex justify-between">
                        <span>Inventory Allocations for: {ledger?.name}</span>
                        <div className="text-sm">Up to: ₹ {entry?.amount}</div>
                    </div>
                    <div className="p-4 bg-yellow-50 min-h-[300px]">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-400">
                                    <th className="text-left p-1">Name of Item</th>
                                    <th className="text-left p-1">Godown</th>
                                    <th className="text-right p-1">Qty</th>
                                    <th className="text-right p-1">Rate</th>
                                    <th className="text-right p-1">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allocations.map((alloc, idx) => (
                                    <tr key={idx}>
                                        <td className="p-1">
                                            <select className="w-full bg-transparent border-b border-transparent focus:border-blue-500 outline-none"
                                                value={alloc.itemId} onChange={e => updateAlloc(idx, 'itemId', e.target.value)}>
                                                <option value="">Select Item</option>
                                                {data.stockItems.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                                            </select>
                                        </td>
                                        <td className="p-1">
                                            <select className="w-full bg-transparent outline-none"
                                                value={alloc.godownId} onChange={e => updateAlloc(idx, 'godownId', e.target.value)}>
                                                {data.godowns.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                                            </select>
                                        </td>
                                        <td className="p-1"><input type="number" className="w-full text-right bg-transparent outline-none" value={alloc.quantity} onChange={e => updateAlloc(idx, 'quantity', parseFloat(e.target.value))} /></td>
                                        <td className="p-1"><input type="number" className="w-full text-right bg-transparent outline-none" value={alloc.rate} onChange={e => updateAlloc(idx, 'rate', parseFloat(e.target.value))} /></td>
                                        <td className="p-1 text-right font-bold">{alloc.amount.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <button onClick={addAllocLine} className="mt-2 text-blue-600 text-xs font-bold hover:underline">+ Add Item</button>
                    </div>
                    <div className="p-2 bg-gray-100 flex justify-end">
                        <button onClick={saveAllocation} className="px-4 py-1 bg-blue-600 text-white text-sm">Done</button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="h-full bg-white shadow-xl flex flex-col relative">
            {InventoryModal()}

            {/* Voucher Header */}
            <div className="bg-yellow-100 p-2 border-b border-gray-300 flex justify-between items-center text-sm">
                 <div className="flex gap-4">
                     <span className="font-bold uppercase text-gray-700 w-24">Accounting Voucher Creation</span>
                     <div className="bg-white px-2 border border-gray-400 font-bold text-blue-800">{initialType}</div>
                 </div>
                 <div className="flex gap-4">
                     <div className="flex items-center gap-2">
                         <span className="text-gray-600">No.</span>
                         <span className="font-bold text-gray-900">{data.vouchers.length + 1}</span>
                     </div>
                     <input type="date" value={date} onChange={e => setDate(e.target.value)} className="bg-transparent font-bold text-gray-900 outline-none" />
                 </div>
            </div>

            {/* Body */}
            <div className="flex-1 bg-yellow-50/30 p-4 overflow-y-auto">
                <table className="w-full text-sm font-medium">
                    <thead className="text-xs uppercase text-gray-500 border-b border-gray-300">
                        <tr>
                            <th className="w-10 text-left p-2"></th>
                            <th className="text-left p-2">Particulars</th>
                            <th className="w-32 text-right p-2">Debit</th>
                            <th className="w-32 text-right p-2">Credit</th>
                        </tr>
                    </thead>
                    <tbody>
                        {entries.map((entry, index) => (
                            <tr key={entry.id} className="hover:bg-blue-50/50">
                                <td className="p-2 font-bold text-gray-700">
                                    {index === 0 ? (entry.type === 'Dr' ? 'Dr' : 'Cr') : (
                                        <select value={entry.type} onChange={e => {
                                            const newEntries = [...entries];
                                            newEntries[index].type = e.target.value as 'Dr' | 'Cr';
                                            setEntries(newEntries);
                                        }} className="bg-transparent outline-none appearance-none font-bold">
                                            <option value="Dr">Dr</option>
                                            <option value="Cr">Cr</option>
                                        </select>
                                    )}
                                </td>
                                <td className="p-2 relative group">
                                    <select 
                                        value={entry.ledgerId} 
                                        onChange={e => {
                                            const newEntries = [...entries];
                                            newEntries[index].ledgerId = e.target.value;
                                            setEntries(newEntries);
                                            // Auto-trigger inventory if sales/purchase
                                            if (initialType === VoucherType.SALES || initialType === VoucherType.PURCHASE) {
                                                if (e.target.value) handleOpenAllocation(entry.id);
                                            }
                                        }}
                                        className="w-full bg-transparent outline-none border-b border-transparent focus:border-blue-500"
                                    >
                                        <option value="">Select Ledger</option>
                                        {data.ledgers.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                    </select>
                                    {entry.inventoryAllocations && entry.inventoryAllocations.length > 0 && (
                                        <div className="text-xs text-blue-600 italic pl-2">
                                            (Inv: {entry.inventoryAllocations.length} items) 
                                            <button onClick={() => handleOpenAllocation(entry.id)} className="ml-2 hover:underline">Edit</button>
                                        </div>
                                    )}
                                </td>
                                <td className="p-2 text-right">
                                    {entry.type === 'Dr' && (
                                        <input type="number" value={entry.amount || ''} 
                                            onChange={e => {
                                                const newEntries = [...entries];
                                                newEntries[index].amount = parseFloat(e.target.value);
                                                setEntries(newEntries);
                                            }}
                                            className="w-full text-right bg-transparent outline-none" placeholder="0.00"
                                        />
                                    )}
                                </td>
                                <td className="p-2 text-right">
                                    {entry.type === 'Cr' && (
                                        <input type="number" value={entry.amount || ''} 
                                            onChange={e => {
                                                const newEntries = [...entries];
                                                newEntries[index].amount = parseFloat(e.target.value);
                                                setEntries(newEntries);
                                            }}
                                            className="w-full text-right bg-transparent outline-none" placeholder="0.00"
                                        />
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <button onClick={() => setEntries([...entries, { id: generateId(), type: 'Dr', ledgerId: '', amount: 0 }])} className="mt-2 text-xs font-bold text-gray-500 hover:text-blue-600">+ Add Line</button>
            </div>

            {/* Footer */}
            <div className="bg-yellow-100 p-2 border-t border-gray-300">
                <div className="flex gap-4">
                    <div className="flex-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Narration</label>
                        <input value={narration} onChange={e => setNarration(e.target.value)} className="w-full bg-transparent border-b border-gray-400 italic text-sm outline-none" />
                    </div>
                    <div className="flex gap-8 text-sm font-bold text-gray-800">
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] text-gray-500">Total Dr</span>
                            <span>{totalDr.toFixed(2)}</span>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] text-gray-500">Total Cr</span>
                            <span>{totalCr.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end gap-2 mt-2">
                     <button onClick={onCancel} className="px-3 py-1 text-xs font-bold text-gray-600">Quit (Esc)</button>
                     <button onClick={handleSaveVoucher} className="px-3 py-1 bg-green-600 text-white text-xs font-bold shadow">Accept</button>
                </div>
            </div>
        </div>
    );
};
