
import React, { useEffect } from 'react';
import { X, Settings, Calendar, Calculator, HelpCircle } from 'lucide-react';

interface LayoutProps {
    children: React.ReactNode;
    companyName: string;
    financialPeriod: string;
    currentView: string;
    onChangeView: (view: string) => void;
    onBack: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, companyName, financialPeriod, currentView, onChangeView, onBack }) => {
    
    // Global ESC handler
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                onBack();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onBack]);

    return (
        <div className="flex h-screen w-full text-gray-800 overflow-hidden font-sans" 
             style={{ backgroundImage: 'linear-gradient(to top, #d5d4d0 0%, #d5d4d0 1%, #eeeeec 31%, #efeeec 75%, #e9e9e7 100%)' }}>
            
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top Info Bar (Tally Style) */}
                <header className="h-12 bg-blue-700 text-white flex items-center justify-between px-4 shadow-md shrink-0 z-10">
                   <div className="flex items-center gap-6">
                        <div className="font-bold text-lg tracking-tight">NeoTally <span className="text-blue-300 font-normal text-xs">ERP</span></div>
                        <div className="h-6 w-px bg-blue-500"></div>
                        <div className="flex flex-col leading-none">
                            <span className="text-[10px] text-blue-200 uppercase">Selected Company</span>
                            <span className="font-bold text-sm">{companyName}</span>
                        </div>
                        <div className="flex flex-col leading-none">
                            <span className="text-[10px] text-blue-200 uppercase">Current Period</span>
                            <span className="font-bold text-sm">{financialPeriod}</span>
                        </div>
                   </div>
                   <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1 cursor-pointer hover:text-blue-200">
                            <HelpCircle size={14}/> Help
                        </div>
                        <div className="flex items-center gap-1 cursor-pointer hover:text-blue-200">
                            <Settings size={14}/> Config
                        </div>
                   </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 overflow-hidden flex relative">
                    {/* Center Canvas */}
                    <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
                        <div className="max-w-7xl mx-auto h-full flex flex-col">
                            {children}
                        </div>
                    </div>

                    {/* Right Button Bar (Tally Style) */}
                    <div className="w-16 md:w-20 bg-emerald-700 text-white flex flex-col border-l border-emerald-800 shadow-2xl shrink-0 z-20">
                        <div className="flex-1 flex flex-col">
                            <ActionButton label="F1" sub="Select Cmp" onClick={() => onChangeView('company_select')} />
                            <ActionButton label="F2" sub="Date" />
                            <ActionButton label="F3" sub="Company" />
                            <div className="h-px bg-emerald-600 my-1"></div>
                            <ActionButton label="F4" sub="Contra" onClick={() => onChangeView('voucher_contra')} />
                            <ActionButton label="F5" sub="Payment" onClick={() => onChangeView('voucher_payment')} />
                            <ActionButton label="F6" sub="Receipt" onClick={() => onChangeView('voucher_receipt')} />
                            <ActionButton label="F7" sub="Journal" onClick={() => onChangeView('voucher_journal')} />
                            <ActionButton label="F8" sub="Sales" onClick={() => onChangeView('voucher_sales')} />
                            <ActionButton label="F9" sub="Purchase" onClick={() => onChangeView('voucher_purchase')} />
                        </div>
                        <div className="bg-emerald-900 p-2 text-center text-[10px] text-emerald-300 font-mono">
                            <Calculator size={16} className="mx-auto mb-1 opacity-50"/>
                            Ctrl+N
                        </div>
                    </div>
                </main>

                {/* Bottom Status Bar */}
                <footer className="h-6 bg-gray-200 border-t border-gray-300 flex items-center justify-between px-2 text-[10px] text-gray-600 font-mono">
                    <div>NeoTally Local Server</div>
                    <div>Gateway &gt; {currentView.replace(/_/g, ' ').toUpperCase()}</div>
                    <div>© 2024</div>
                </footer>
            </div>
        </div>
    );
};

const ActionButton = ({ label, sub, onClick }: { label: string, sub: string, onClick?: () => void }) => (
    <button onClick={onClick} className="h-14 w-full border-b border-emerald-600 hover:bg-emerald-600 transition-colors flex flex-col items-center justify-center group relative">
        <span className="text-xs font-bold text-emerald-100">{label}</span>
        <span className="text-[10px] font-medium text-white leading-tight text-center px-1">{sub}</span>
        {/* Hotkey underline indicator often seen in Tally */}
        <div className="absolute bottom-1 w-4 h-0.5 bg-emerald-400/30 hidden group-hover:block"></div>
    </button>
);
