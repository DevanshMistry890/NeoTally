import React, { useEffect } from 'react';
import { LayoutDashboard, FileText, Box, PieChart, Settings, Menu, X, Upload, Download, Save } from 'lucide-react';

interface LayoutProps {
    children: React.ReactNode;
    activeView: string;
    onChangeView: (view: string) => void;
    onExport: () => void;
    onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeView, onChangeView, onExport, onImport }) => {
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

    const navItems = [
        { id: 'gateway', label: 'Gateway', icon: LayoutDashboard, hotkey: 'G' },
        { id: 'voucher', label: 'Vouchers', icon: FileText, hotkey: 'V' },
        { id: 'daybook', label: 'Day Book', icon: FileText, hotkey: 'D' },
        { id: 'stock', label: 'Stock Summary', icon: Box, hotkey: 'S' },
        { id: 'balance_sheet', label: 'Balance Sheet', icon: PieChart, hotkey: 'B' },
        { id: 'pnl', label: 'Profit & Loss', icon: PieChart, hotkey: 'P' },
    ];

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Only trigger navigation if no input is focused
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) return;

            const key = e.key.toUpperCase();
            const item = navItems.find(n => n.hotkey === key);
            if (item) {
                e.preventDefault();
                onChangeView(item.id);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onChangeView, navItems]);

    return (
        <div className="flex h-screen w-full text-gray-800 overflow-hidden" 
             style={{ backgroundImage: 'linear-gradient(to top, #d5d4d0 0%, #d5d4d0 1%, #eeeeec 31%, #efeeec 75%, #e9e9e7 100%)' }}>
            
            {/* Sidebar */}
            <div className={`${isSidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 bg-white/80 backdrop-blur-xl border-r border-white/20 shadow-2xl flex flex-col z-20 relative`}>
                <div className="p-6 border-b border-gray-200/50 flex justify-between items-center">
                    <h1 className="font-bold text-xl tracking-tight text-gray-900">NeoTally</h1>
                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden"><X size={20}/></button>
                </div>

                <div className="flex-1 overflow-y-auto py-4">
                    <nav className="px-2 space-y-1">
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => onChangeView(item.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all ${
                                    activeView === item.id 
                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
                                    : 'text-gray-600 hover:bg-gray-100/50 hover:text-gray-900'
                                }`}
                            >
                                <item.icon size={18} />
                                <span className="flex-1 text-left">
                                    <span className="underline decoration-2 underline-offset-2 decoration-current">{item.label.charAt(0)}</span>
                                    {item.label.slice(1)}
                                </span>
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="p-4 border-t border-gray-200/50 bg-gray-50/50 space-y-2">
                    <div className="text-xs font-semibold text-gray-400 mb-2 uppercase">Data Management</div>
                    <button onClick={onExport} className="flex items-center gap-2 text-xs text-gray-600 hover:text-blue-600 w-full px-2 py-2 rounded hover:bg-white">
                        <Download size={14} /> Backup Data
                    </button>
                    <label className="flex items-center gap-2 text-xs text-gray-600 hover:text-blue-600 w-full px-2 py-2 rounded hover:bg-white cursor-pointer">
                        <Upload size={14} /> Restore Data
                        <input type="file" className="hidden" onChange={onImport} accept=".json" />
                    </label>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                <header className="h-14 bg-white/40 backdrop-blur-sm border-b border-white/20 flex items-center px-4 justify-between shrink-0">
                   <div className="flex items-center gap-4">
                        {!isSidebarOpen && (
                            <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-gray-200/50 rounded-lg">
                                <Menu size={20} />
                            </button>
                        )}
                        <span className="font-medium text-gray-700">Current Period: Apr 2023 - Mar 2024</span>
                   </div>
                   <div className="flex items-center gap-2">
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full border border-green-200">Local Mode Active</span>
                   </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    <div className="max-w-6xl mx-auto h-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};
