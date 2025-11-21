
import React, { useEffect } from 'react';
import { BookOpen, Calculator, TrendingUp, Package, Users, Landmark, FileText } from 'lucide-react';

interface GatewayProps {
    onSelect: (view: string) => void;
    stats: { ledgers: number, vouchers: number, items: number, employees: number };
}

export const Gateway: React.FC<GatewayProps> = ({ onSelect, stats }) => {
    
    const MenuSection = ({ title, items }: { title: string, items: { label: string, action: string, hotkey: string }[] }) => (
        <div className="mb-6">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{title}</h3>
            <div className="grid gap-2">
                {items.map((item) => (
                    <button 
                        key={item.action}
                        onClick={() => onSelect(item.action)}
                        className="flex items-center justify-between p-3 bg-white/60 hover:bg-white shadow-sm hover:shadow-md border border-transparent hover:border-blue-200 rounded-xl text-left transition-all group"
                    >
                        <span className="font-medium text-gray-700 group-hover:text-blue-700">
                            <span className="text-blue-600 font-bold mr-1">{item.hotkey}</span>
                            {item.label.substring(1)}
                        </span>
                        <div className="h-5 w-5 rounded-full bg-gray-100 group-hover:bg-blue-50 flex items-center justify-center">
                            <span className="text-xs text-gray-400 group-hover:text-blue-500">→</span>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );

    // Key listener
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement) return;
            const key = e.key.toUpperCase();
            if (key === 'C') onSelect('masters_ledger');
            if (key === 'I') onSelect('masters_item');
            if (key === 'E') onSelect('masters_employee');
            if (key === 'V') onSelect('voucher');
            if (key === 'B') onSelect('balance_sheet');
            if (key === 'P') onSelect('pnl');
            if (key === 'D') onSelect('daybook');
            if (key === 'S') onSelect('stock');
            if (key === 'G') onSelect('gst_report');
            if (key === 'Y') onSelect('payroll_report');
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [onSelect]);

    return (
        <div className="h-full flex flex-col md:flex-row gap-6">
            <div className="flex-1 overflow-y-auto no-scrollbar">
                <div className="bg-white/40 backdrop-blur-md border border-white/40 rounded-2xl p-8 shadow-xl min-h-full">
                    <h2 className="text-2xl font-bold text-gray-800 mb-8 flex items-center gap-3">
                        <div className="p-2 bg-blue-600 rounded-lg text-white"><Calculator size={24} /></div>
                        Gateway of NeoTally
                    </h2>
                    
                    <div className="grid md:grid-cols-2 gap-x-8 gap-y-2">
                        <MenuSection 
                            title="Masters" 
                            items={[
                                { label: 'Create Ledger', action: 'masters_ledger', hotkey: 'C' },
                                { label: 'Inventory Items', action: 'masters_item', hotkey: 'I' },
                                { label: 'Employees', action: 'masters_employee', hotkey: 'E' }
                            ]} 
                        />
                        
                        <MenuSection 
                            title="Transactions" 
                            items={[
                                { label: 'Vouchers', action: 'voucher', hotkey: 'V' },
                                { label: 'Day Book', action: 'daybook', hotkey: 'D' }
                            ]} 
                        />

                        <MenuSection 
                            title="Reports" 
                            items={[
                                { label: 'Balance Sheet', action: 'balance_sheet', hotkey: 'B' },
                                { label: 'Profit & Loss', action: 'pnl', hotkey: 'P' },
                                { label: 'Stock Summary', action: 'stock', hotkey: 'S' }
                            ]} 
                        />

                        <MenuSection 
                            title="Compliance & Payroll" 
                            items={[
                                { label: 'GST Returns', action: 'gst_report', hotkey: 'G' },
                                { label: 'Payroll Sheet', action: 'payroll_report', hotkey: 'Y' },
                            ]} 
                        />
                    </div>
                </div>
            </div>
            
            <div className="w-full md:w-72 space-y-6">
                 <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xl">
                    <div className="flex items-center gap-3 mb-4 opacity-90">
                        <TrendingUp size={20} />
                        <span className="font-medium">Snapshot</span>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between items-end border-b border-white/20 pb-2">
                            <span className="text-xs text-blue-100">Ledgers</span>
                            <span className="text-xl font-bold">{stats.ledgers}</span>
                        </div>
                         <div className="flex justify-between items-end border-b border-white/20 pb-2">
                            <span className="text-xs text-blue-100">Vouchers</span>
                            <span className="text-xl font-bold">{stats.vouchers}</span>
                        </div>
                         <div className="flex justify-between items-end border-b border-white/20 pb-2">
                            <span className="text-xs text-blue-100">Items</span>
                            <span className="text-xl font-bold">{stats.items}</span>
                        </div>
                        <div className="flex justify-between items-end">
                            <span className="text-xs text-blue-100">Staff</span>
                            <span className="text-xl font-bold">{stats.employees}</span>
                        </div>
                    </div>
                 </div>

                 <div className="bg-white/60 backdrop-blur p-6 rounded-2xl border border-white/40 shadow-lg">
                    <div className="flex items-center gap-2 mb-3 text-gray-800 font-bold">
                        <Landmark size={16}/> 
                        <span>Bank & Compliance</span>
                    </div>
                    <div className="text-xs space-y-2 text-gray-600">
                        <div className="flex justify-between">
                            <span>GST Filing</span>
                            <span className="text-green-600 font-bold">Active</span>
                        </div>
                        <div className="flex justify-between">
                            <span>E-Way Bill</span>
                            <span className="text-orange-600 font-bold">Pending</span>
                        </div>
                        <div className="flex justify-between">
                            <span>TDS/TCS</span>
                            <span className="text-gray-400">No Data</span>
                        </div>
                    </div>
                 </div>
            </div>
        </div>
    );
};
