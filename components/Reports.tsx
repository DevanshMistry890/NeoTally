
import React, { useState } from 'react';
import { CompanyData, AccountGroupType, Ledger } from '../types';
import { ArrowLeft } from 'lucide-react';

interface ReportsProps {
    type: string; // 'BS', 'PNL', etc.
    data: CompanyData;
    onBack: () => void;
}

const ReportLine: React.FC<{ label: string, amount: number, onClick?: () => void, bold?: boolean }> = ({ label, amount, onClick, bold }) => (
    <div onClick={onClick} className={`flex justify-between py-1 px-2 cursor-pointer hover:bg-yellow-200 ${bold ? 'font-bold' : ''} border-b border-gray-100`}>
        <span className={`${onClick ? 'text-blue-900' : 'text-gray-800'}`}>{label}</span>
        <span className="font-mono">{Math.abs(amount).toFixed(2)} {amount >= 0 ? 'Dr' : 'Cr'}</span>
    </div>
);

export const Reports: React.FC<ReportsProps> = ({ type, data, onBack }) => {
    // Basic Drill Down State
    // View Stack: 'MAIN' -> 'GROUP:id' -> 'LEDGER:id'
    const [viewStack, setViewStack] = useState<string[]>(['MAIN']);
    
    const currentView = viewStack[viewStack.length - 1];

    const pushView = (view: string) => setViewStack([...viewStack, view]);
    const popView = () => {
        if (viewStack.length > 1) {
            setViewStack(viewStack.slice(0, -1));
        } else {
            onBack();
        }
    };

    const getLedgerBalance = (ledger: Ledger) => {
        let bal = ledger.openingBalance * (ledger.openingBalanceType === 'Dr' ? 1 : -1);
        data.vouchers.forEach(v => {
            v.entries.forEach(e => {
                if (e.ledgerId === ledger.id) {
                    bal += e.amount * (e.type === 'Dr' ? 1 : -1);
                }
            });
        });
        return bal;
    };

    const GroupSummary = ({ groupId }: { groupId: string }) => {
        const group = data.groups.find(g => g.id === groupId);
        const ledgers = data.ledgers.filter(l => l.groupId === groupId);
        const subGroups = data.groups.filter(g => g.parentGroupId === groupId);

        return (
             <div className="p-4 bg-white min-h-full">
                <h2 className="text-xl font-bold text-center border-b pb-2 mb-4">{group?.name} Summary</h2>
                {subGroups.map(g => {
                     // Recurse calculation (simple 1 level for demo)
                     const subGroupTotal = data.ledgers.filter(l => l.groupId === g.id).reduce((s, l) => s + getLedgerBalance(l), 0);
                     return <ReportLine key={g.id} label={g.name} amount={subGroupTotal} onClick={() => pushView(`GROUP:${g.id}`)} bold />;
                })}
                {ledgers.map(l => (
                    <ReportLine key={l.id} label={l.name} amount={getLedgerBalance(l)} onClick={() => pushView(`LEDGER:${l.id}`)} />
                ))}
             </div>
        );
    };

    const LedgerVouchers = ({ ledgerId }: { ledgerId: string }) => {
        const ledger = data.ledgers.find(l => l.id === ledgerId);
        const vouchers = data.vouchers.filter(v => v.entries.some(e => e.ledgerId === ledgerId));

        return (
            <div className="p-4 bg-white min-h-full">
                <h2 className="text-xl font-bold text-center border-b pb-2 mb-4">Ledger: {ledger?.name}</h2>
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-400">
                            <th className="text-left p-2">Date</th>
                            <th className="text-left p-2">Vch Type</th>
                            <th className="text-right p-2">Debit</th>
                            <th className="text-right p-2">Credit</th>
                        </tr>
                    </thead>
                    <tbody>
                        {vouchers.map(v => {
                            const entry = v.entries.find(e => e.ledgerId === ledgerId);
                            const amt = entry?.amount || 0;
                            const isDr = entry?.type === 'Dr';
                            return (
                                <tr key={v.id} className="hover:bg-gray-100 border-b border-gray-100">
                                    <td className="p-2">{v.date}</td>
                                    <td className="p-2">{v.type}</td>
                                    <td className="p-2 text-right">{isDr ? amt.toFixed(2) : ''}</td>
                                    <td className="p-2 text-right">{!isDr ? amt.toFixed(2) : ''}</td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        )
    };

    const BalanceSheet = () => {
        // Top level groups
        const liabilities = data.groups.filter(g => g.type === AccountGroupType.LIABILITY && !g.parentGroupId);
        const assets = data.groups.filter(g => g.type === AccountGroupType.ASSET && !g.parentGroupId);
        
        return (
            <div className="grid grid-cols-2 divide-x divide-gray-400 h-full bg-white">
                <div className="p-4">
                    <div className="font-bold text-center border-b border-gray-400 mb-2">Liabilities</div>
                    {liabilities.map(g => {
                         // This assumes flat-ish structure for demo, real recursion needed for perfect total
                         const ledgers = data.ledgers.filter(l => l.groupId === g.id); // Direct
                         const total = ledgers.reduce((s, l) => s + getLedgerBalance(l), 0);
                         return <ReportLine key={g.id} label={g.name} amount={total} onClick={() => pushView(`GROUP:${g.id}`)} />;
                    })}
                </div>
                <div className="p-4">
                    <div className="font-bold text-center border-b border-gray-400 mb-2">Assets</div>
                    {assets.map(g => {
                         const ledgers = data.ledgers.filter(l => l.groupId === g.id);
                         const total = ledgers.reduce((s, l) => s + getLedgerBalance(l), 0);
                         return <ReportLine key={g.id} label={g.name} amount={total} onClick={() => pushView(`GROUP:${g.id}`)} />;
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="h-full flex flex-col bg-white shadow-xl">
            <div className="p-2 bg-gray-100 border-b flex items-center">
                <button onClick={popView} className="flex items-center gap-1 text-sm font-bold text-blue-600">
                    <ArrowLeft size={16}/> Back
                </button>
            </div>
            <div className="flex-1 overflow-auto">
                {currentView === 'MAIN' && type === 'BS' && <BalanceSheet />}
                {currentView.startsWith('GROUP:') && <GroupSummary groupId={currentView.split(':')[1]} />}
                {currentView.startsWith('LEDGER:') && <LedgerVouchers ledgerId={currentView.split(':')[1]} />}
                
                {/* Fallback simple views for other reports */}
                {type === 'stock_summary' && currentView === 'MAIN' && (
                     <div className="p-4">
                        <h2 className="font-bold text-xl mb-4">Stock Summary</h2>
                        {data.stockItems.map(item => (
                            <div key={item.id} className="flex justify-between py-2 border-b">
                                <span>{item.name}</span>
                                <span className="font-mono">{item.openingQuantity} {item.unit}</span>
                            </div>
                        ))}
                     </div>
                )}
            </div>
        </div>
    );
};
