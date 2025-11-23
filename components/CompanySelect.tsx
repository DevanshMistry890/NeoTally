
import React, { useState } from 'react';
import { Company } from '../types';
import { Plus, FolderOpen, ArrowRight } from 'lucide-react';

interface CompanySelectProps {
    companies: Company[];
    onSelect: (id: string) => void;
    onCreate: (name: string, fyStart: string, address: string) => void;
}

export const CompanySelect: React.FC<CompanySelectProps> = ({ companies, onSelect, onCreate }) => {
    const [view, setView] = useState<'list' | 'create'>('list');
    const [newName, setNewName] = useState('');
    const [newFy, setNewFy] = useState(new Date().getFullYear() + '-04-01');
    const [newAddress, setNewAddress] = useState('');

    const handleCreate = () => {
        if (!newName) return alert("Company Name is required");
        onCreate(newName, newFy, newAddress);
    };

    return (
        <div className="flex h-screen w-full items-center justify-center bg-gray-100"
            style={{ backgroundImage: 'linear-gradient(to top, #d5d4d0 0%, #d5d4d0 1%, #eeeeec 31%, #efeeec 75%, #e9e9e7 100%)' }}>
            
            <div className="w-full max-w-4xl h-[600px] flex bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-white/50">
                {/* Left Panel: Info */}
                <div className="w-1/3 bg-blue-600 text-white p-8 flex flex-col justify-between">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">NeoTally</h1>
                        <p className="text-blue-100 text-sm">Enterprise Resource Planning</p>
                    </div>
                    <div className="space-y-4">
                        <p className="text-sm opacity-80">
                            "Simplicity is the ultimate sophistication." <br/>
                            - Local-only <br/>
                            - Secure <br/>
                            - Fast
                        </p>
                    </div>
                    <div className="text-xs text-blue-200">Version 2.0</div>
                </div>

                {/* Right Panel: Content */}
                <div className="flex-1 p-8 flex flex-col">
                    {view === 'list' ? (
                        <>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-800">Select Company</h2>
                                <button onClick={() => setView('create')} className="flex items-center gap-2 text-sm text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors font-medium">
                                    <Plus size={16}/> Create Company
                                </button>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto">
                                {companies.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                        <FolderOpen size={48} className="mb-4 opacity-50"/>
                                        <p>No companies found.</p>
                                        <button onClick={() => setView('create')} className="mt-4 text-blue-600 underline">Create your first company</button>
                                    </div>
                                ) : (
                                    <div className="grid gap-3">
                                        {companies.map(c => (
                                            <button 
                                                key={c.id} 
                                                onClick={() => onSelect(c.id)}
                                                className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md hover:border-blue-300 transition-all text-left group"
                                            >
                                                <div>
                                                    <div className="font-bold text-gray-800 group-hover:text-blue-700">{c.name}</div>
                                                    <div className="text-xs text-gray-500">FY: {c.financialYearStart}</div>
                                                </div>
                                                <ArrowRight size={16} className="text-gray-300 group-hover:text-blue-500"/>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col h-full">
                            <h2 className="text-xl font-bold text-gray-800 mb-6">Create Company</h2>
                            <div className="space-y-4 flex-1">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Company Name</label>
                                    <input value={newName} onChange={e => setNewName(e.target.value)} className="w-full border p-2 rounded bg-gray-50 focus:bg-white focus:ring-2 ring-blue-500 outline-none" autoFocus />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Financial Year From</label>
                                    <input type="date" value={newFy} onChange={e => setNewFy(e.target.value)} className="w-full border p-2 rounded bg-gray-50 focus:bg-white focus:ring-2 ring-blue-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Address / Mailing Details</label>
                                    <textarea value={newAddress} onChange={e => setNewAddress(e.target.value)} className="w-full border p-2 rounded bg-gray-50 focus:bg-white focus:ring-2 ring-blue-500 outline-none h-24 resize-none" />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-4">
                                <button onClick={() => setView('list')} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                                <button onClick={handleCreate} className="px-6 py-2 bg-blue-600 text-white rounded shadow-lg shadow-blue-200 hover:bg-blue-700">Create</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
