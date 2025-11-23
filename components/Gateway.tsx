
import React, { useEffect } from 'react';

interface GatewayProps {
    onSelect: (view: string) => void;
}

export const Gateway: React.FC<GatewayProps> = ({ onSelect }) => {
    
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement) return;
            const key = e.key.toUpperCase();
            // Hotkeys
            if (key === 'A') onSelect('masters_ledger');
            if (key === 'I') onSelect('masters_item');
            if (key === 'V') onSelect('voucher_payment'); // Default to payment, user changes inside
            if (key === 'B') onSelect('balance_sheet');
            if (key === 'P') onSelect('pnl');
            if (key === 'S') onSelect('stock_summary');
            if (key === 'D') onSelect('daybook');
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [onSelect]);

    const MenuItem = ({ label, hotkey, action }: { label: string, hotkey: string, action: string }) => (
        <button 
            onClick={() => onSelect(action)}
            className="w-full text-left px-4 py-1 hover:bg-yellow-100 hover:text-blue-900 transition-colors flex gap-1 items-center group"
        >
            <span className="text-red-600 font-bold">{hotkey}</span>
            <span className="text-gray-800 font-medium group-hover:font-bold">{label.substring(1)}</span>
        </button>
    );

    return (
        <div className="flex h-full items-center justify-center">
            <div className="flex w-full max-w-4xl h-[500px] shadow-2xl rounded-none overflow-hidden border border-gray-400">
                {/* Left Panel: Branding/Info */}
                <div className="w-1/2 bg-white/90 p-8 flex flex-col justify-between border-r border-gray-300">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Current Status</h2>
                        <div className="mt-4 space-y-2 text-sm text-gray-600">
                            <div className="flex justify-between border-b border-dashed border-gray-300 pb-1">
                                <span>Date of Last Entry</span>
                                <span className="font-bold">1-Apr-2024</span>
                            </div>
                            <div className="flex justify-between border-b border-dashed border-gray-300 pb-1">
                                <span>Current Period</span>
                                <span className="font-bold">Apr 23 - Mar 24</span>
                            </div>
                        </div>
                    </div>
                    <div className="text-center text-gray-400 text-xs">
                        NeoTally Solutions Pvt Ltd.
                    </div>
                </div>

                {/* Right Panel: The Menu */}
                <div className="w-1/2 bg-gray-100 flex flex-col relative">
                    <div className="bg-blue-800 text-white p-2 text-center font-bold uppercase tracking-wider text-sm shadow">
                        Gateway of Tally
                    </div>
                    
                    <div className="flex-1 overflow-y-auto py-4 px-8 space-y-6">
                        
                        <div>
                            <h3 className="text-xs text-gray-500 uppercase font-bold mb-1 pl-4">Masters</h3>
                            <MenuItem label="Accounts Info" hotkey="A" action="masters_ledger" />
                            <MenuItem label="Inventory Info" hotkey="I" action="masters_item" />
                            <MenuItem label="Payroll Info" hotkey="L" action="masters_employee" />
                        </div>

                        <div>
                            <h3 className="text-xs text-gray-500 uppercase font-bold mb-1 pl-4">Transactions</h3>
                            <MenuItem label="Accounting Vouchers" hotkey="V" action="voucher_payment" />
                            <MenuItem label="Inventory Vouchers" hotkey="T" action="voucher_sales" />
                            <MenuItem label="Payroll Vouchers" hotkey="Y" action="voucher_payroll" />
                        </div>

                        <div>
                            <h3 className="text-xs text-gray-500 uppercase font-bold mb-1 pl-4">Reports</h3>
                            <MenuItem label="Balance Sheet" hotkey="B" action="balance_sheet" />
                            <MenuItem label="Profit & Loss A/c" hotkey="P" action="pnl" />
                            <MenuItem label="Stock Summary" hotkey="S" action="stock_summary" />
                            <MenuItem label="Ratio Analysis" hotkey="R" action="ratio" />
                        </div>

                        <div>
                            <h3 className="text-xs text-gray-500 uppercase font-bold mb-1 pl-4">Display</h3>
                            <MenuItem label="Day Book" hotkey="D" action="daybook" />
                            <MenuItem label="GST Reports" hotkey="O" action="gst_report" />
                        </div>

                        <div className="pt-4 border-t border-gray-300">
                            <MenuItem label="Quit" hotkey="Q" action="quit" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
