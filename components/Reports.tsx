
import React from 'react';
import { AppState, AccountGroupType, Ledger, VoucherType } from '../types';
import { ArrowLeft, FileCheck, AlertTriangle, Users } from 'lucide-react';

interface ReportsProps {
    type: 'BS' | 'PNL' | 'STOCK' | 'GST' | 'PAYROLL';
    state: AppState;
    onBack: () => void;
}

export const Reports: React.FC<ReportsProps> = ({ type, state, onBack }) => {
    
    const getLedgerBalance = (ledger: Ledger) => {
        let bal = ledger.openingBalance * (ledger.openingBalanceType === 'Dr' ? 1 : -1);
        state.vouchers.forEach(v => {
            v.entries.forEach(e => {
                if (e.ledgerId === ledger.id) {
                    bal += e.amount * (e.type === 'Dr' ? 1 : -1);
                }
            });
        });
        return bal;
    };

    const getGroupTotal = (groupType: AccountGroupType) => {
        const groups = state.groups.filter(g => g.type === groupType);
        const ledgers = state.ledgers.filter(l => groups.some(g => g.id === l.groupId));
        const total = ledgers.reduce((sum, l) => sum + getLedgerBalance(l), 0);
        return Math.abs(total);
    };

    const renderReportRow = (label: string, amount: number, bold = false) => (
        <div className={`flex justify-between py-2 border-b border-gray-100 ${bold ? 'font-bold text-gray-900 bg-gray-50 px-2' : 'text-gray-700'}`}>
            <span>{label}</span>
            <span className="font-mono">{amount.toFixed(2)}</span>
        </div>
    );

    // Existing Reports (Simplified for brevity in this update, keeping core logic)
    const BalanceSheet = () => {
        const liabilities = getGroupTotal(AccountGroupType.LIABILITY);
        const assets = getGroupTotal(AccountGroupType.ASSET);
        const expense = getGroupTotal(AccountGroupType.EXPENSE);
        const income = getGroupTotal(AccountGroupType.INCOME);
        const netProfit = income - expense;
        const totalLiabilities = liabilities + (netProfit > 0 ? netProfit : 0);
        const totalAssets = assets + (netProfit < 0 ? Math.abs(netProfit) : 0);

        return (
            <div className="grid grid-cols-2 divide-x divide-gray-300">
                <div className="p-4">
                    <h3 className="font-bold text-center mb-4 uppercase text-sm text-gray-500 border-b pb-2">Liabilities</h3>
                    {state.groups.filter(g => g.type === AccountGroupType.LIABILITY).map(g => {
                        const total = state.ledgers.filter(l => l.groupId === g.id).reduce((sum, l) => sum + getLedgerBalance(l), 0);
                        if (Math.abs(total) < 0.01) return null;
                        return renderReportRow(g.name, Math.abs(total));
                    })}
                    {netProfit > 0 && renderReportRow("Profit & Loss A/c", netProfit, true)}
                    <div className="mt-8 pt-2 border-t-2 border-gray-800 flex justify-between font-bold text-lg"><span>Total</span><span>{totalLiabilities.toFixed(2)}</span></div>
                </div>
                <div className="p-4">
                    <h3 className="font-bold text-center mb-4 uppercase text-sm text-gray-500 border-b pb-2">Assets</h3>
                    {state.groups.filter(g => g.type === AccountGroupType.ASSET).map(g => {
                        const total = state.ledgers.filter(l => l.groupId === g.id).reduce((sum, l) => sum + getLedgerBalance(l), 0);
                        if (Math.abs(total) < 0.01) return null;
                        return renderReportRow(g.name, Math.abs(total));
                    })}
                    {netProfit < 0 && renderReportRow("Profit & Loss A/c", Math.abs(netProfit), true)}
                    <div className="mt-8 pt-2 border-t-2 border-gray-800 flex justify-between font-bold text-lg"><span>Total</span><span>{totalAssets.toFixed(2)}</span></div>
                </div>
            </div>
        );
    };

    const PnL = () => {
        const expense = getGroupTotal(AccountGroupType.EXPENSE);
        const income = getGroupTotal(AccountGroupType.INCOME);
        const netProfit = income - expense;
        return (
             <div className="grid grid-cols-2 divide-x divide-gray-300">
                <div className="p-4">
                    <h3 className="font-bold text-center mb-4 uppercase text-sm text-gray-500 border-b pb-2">Expenses</h3>
                    {state.groups.filter(g => g.type === AccountGroupType.EXPENSE).map(g => {
                        const total = state.ledgers.filter(l => l.groupId === g.id).reduce((sum, l) => sum + getLedgerBalance(l), 0);
                        if (Math.abs(total) < 0.01) return null;
                        return renderReportRow(g.name, Math.abs(total));
                    })}
                    {netProfit > 0 && renderReportRow("Net Profit", netProfit, true)}
                </div>
                <div className="p-4">
                    <h3 className="font-bold text-center mb-4 uppercase text-sm text-gray-500 border-b pb-2">Incomes</h3>
                    {state.groups.filter(g => g.type === AccountGroupType.INCOME).map(g => {
                        const total = state.ledgers.filter(l => l.groupId === g.id).reduce((sum, l) => sum + getLedgerBalance(l), 0);
                        if (Math.abs(total) < 0.01) return null;
                        return renderReportRow(g.name, Math.abs(total));
                    })}
                    {netProfit < 0 && renderReportRow("Net Loss", Math.abs(netProfit), true)}
                </div>
             </div>
        );
    };

    const StockSummary = () => {
        return (
            <div className="p-4">
                <div className="flex gap-4 mb-4 text-sm">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-100 border border-red-300"></div> Below Reorder Level</div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-100 border border-green-300"></div> Batch Active</div>
                </div>
                <table className="w-full">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="text-left p-3">Item Name</th>
                            <th className="text-left p-3">Godown</th>
                            <th className="text-right p-3">Qty</th>
                            <th className="text-right p-3">Rate</th>
                            <th className="text-right p-3">Value</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {state.stockItems.map(item => {
                            const godown = state.godowns.find(g => g.id === item.godownId);
                            const isLowStock = item.reorderLevel && item.openingQuantity <= item.reorderLevel;
                            return (
                                <tr key={item.id} className={`hover:bg-gray-50 ${isLowStock ? 'bg-red-50' : ''}`}>
                                    <td className="p-3">
                                        {item.name}
                                        {item.maintainBatches && <span className="ml-2 px-1 bg-green-100 text-green-800 text-[10px] border border-green-200 rounded">BATCH</span>}
                                    </td>
                                    <td className="p-3 text-sm text-gray-500">{godown?.name || 'Main'}</td>
                                    <td className="p-3 text-right font-mono">
                                        {item.openingQuantity} {item.unit}
                                        {isLowStock && <AlertTriangle size={12} className="inline ml-1 text-red-500" />}
                                    </td>
                                    <td className="p-3 text-right font-mono">{item.openingRate.toFixed(2)}</td>
                                    <td className="p-3 text-right font-mono font-bold">{(item.openingQuantity * item.openingRate).toFixed(2)}</td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        );
    };

    const GstReport = () => {
        // Mock GSTR-1 View
        const sales = state.vouchers.filter(v => v.type === VoucherType.SALES);
        return (
            <div className="p-4">
                <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-6 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-blue-800 font-bold">
                        <FileCheck size={20}/> GSTR-1 (Sales Register)
                    </div>
                    <div className="text-sm text-blue-600">Return Period: Apr 2023</div>
                </div>
                
                <table className="w-full border border-gray-200">
                    <thead className="bg-gray-100 text-xs uppercase">
                        <tr>
                            <th className="p-2 border">Date</th>
                            <th className="p-2 border">Vch No</th>
                            <th className="p-2 border">Party Name</th>
                            <th className="p-2 border">GSTIN</th>
                            <th className="p-2 border text-right">Taxable Value</th>
                            <th className="p-2 border text-right">Tax Amount (Mock)</th>
                            <th className="p-2 border text-right">Total Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sales.map(v => {
                            const entry = v.entries.find(e => e.type === 'Cr'); // Credit usually sales/party
                            const partyEntry = v.entries.find(e => e.type === 'Dr');
                            const ledger = state.ledgers.find(l => l.id === partyEntry?.ledgerId);
                            const val = entry ? entry.amount : 0;
                            const tax = val * 0.18; // Mock 18% for demo
                            return (
                                <tr key={v.id} className="text-sm">
                                    <td className="p-2 border">{v.date}</td>
                                    <td className="p-2 border">{v.number}</td>
                                    <td className="p-2 border">{ledger?.name}</td>
                                    <td className="p-2 border text-xs">{ledger?.taxDetails?.gstin || 'URP'}</td>
                                    <td className="p-2 border text-right">{val.toFixed(2)}</td>
                                    <td className="p-2 border text-right">{tax.toFixed(2)}</td>
                                    <td className="p-2 border text-right font-bold">{(val + tax).toFixed(2)}</td>
                                </tr>
                            );
                        })}
                        {sales.length === 0 && <tr><td colSpan={7} className="p-4 text-center text-gray-500">No Sales Vouchers Recorded</td></tr>}
                    </tbody>
                </table>
            </div>
        );
    }

    const PayrollSheet = () => {
        return (
             <div className="p-4">
                <div className="bg-green-50 border border-green-200 rounded p-3 mb-6 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-green-800 font-bold">
                        <Users size={20}/> Monthly Pay Sheet
                    </div>
                </div>
                <table className="w-full text-sm">
                    <thead className="bg-gray-800 text-white">
                        <tr>
                            <th className="p-3 text-left">Employee Name</th>
                            <th className="p-3 text-left">Designation</th>
                            <th className="p-3 text-right">Basic Salary</th>
                            <th className="p-3 text-right">HRA (40%)</th>
                            <th className="p-3 text-right">PF (12%)</th>
                            <th className="p-3 text-right font-bold bg-gray-700">Net Pay</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {state.employees.map(emp => {
                            const hra = emp.basicSalary * 0.40;
                            const pf = emp.basicSalary * 0.12;
                            const net = emp.basicSalary + hra - pf;
                            return (
                                <tr key={emp.id}>
                                    <td className="p-3 font-medium">{emp.name}</td>
                                    <td className="p-3 text-gray-500">{emp.designation}</td>
                                    <td className="p-3 text-right">{emp.basicSalary.toFixed(2)}</td>
                                    <td className="p-3 text-right text-gray-600">{hra.toFixed(2)}</td>
                                    <td className="p-3 text-right text-red-600">-{pf.toFixed(2)}</td>
                                    <td className="p-3 text-right font-bold bg-gray-50">{net.toFixed(2)}</td>
                                </tr>
                            )
                        })}
                        {state.employees.length === 0 && <tr><td colSpan={6} className="p-4 text-center text-gray-500">No Employees Added</td></tr>}
                    </tbody>
                </table>
             </div>
        );
    }

    return (
         <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-white/50 h-full flex flex-col">
             <div className="p-6 border-b border-gray-200 flex items-center gap-4">
                <button onClick={onBack} className="p-2 hover:bg-gray-200 rounded-full"><ArrowLeft size={20}/></button>
                <h2 className="text-xl font-bold text-gray-800">
                    {type === 'BS' ? 'Balance Sheet' : 
                     type === 'PNL' ? 'Profit & Loss A/c' : 
                     type === 'STOCK' ? 'Stock Summary' : 
                     type === 'GST' ? 'GST Returns' : 'Payroll'}
                </h2>
            </div>
            <div className="flex-1 overflow-auto">
                {type === 'BS' && <BalanceSheet />}
                {type === 'PNL' && <PnL />}
                {type === 'STOCK' && <StockSummary />}
                {type === 'GST' && <GstReport />}
                {type === 'PAYROLL' && <PayrollSheet />}
            </div>
         </div>
    );
};
