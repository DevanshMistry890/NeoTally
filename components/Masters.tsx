
import React, { useState } from 'react';
import { CompanyData, Ledger, StockItem, Employee, DEFAULT_GROUPS, Godown, StockGroup, Unit, Batch } from '../types';

interface MastersProps {
    type: 'ledger' | 'item' | 'employee';
    data: CompanyData;
    onSave: (data: any, dataType: string) => void;
    onCancel: () => void;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

const SectionHeader = ({ title }: { title: string }) => (
    <div className="text-blue-800 font-bold border-b border-blue-200 pb-1 mb-3 text-sm uppercase mt-4">
        {title}
    </div>
);

const Field = ({ label, children }: { label: string, children?: React.ReactNode }) => (
    <div className="flex items-center mb-2">
        <label className="w-1/3 text-sm text-gray-700 font-medium">{label}</label>
        <div className="w-2/3">{children}</div>
    </div>
);

export const Masters: React.FC<MastersProps> = ({ type, data, onSave, onCancel }) => {
    // Ledger Form State
    const [lName, setLName] = useState('');
    const [lGroup, setLGroup] = useState(DEFAULT_GROUPS[0].id);
    const [lOpBal, setLOpBal] = useState('0');
    const [lOpBalType, setLOpBalType] = useState<'Dr' | 'Cr'>('Dr');
    const [lGstin, setLGstin] = useState('');
    
    // Item Form State
    const [iName, setIName] = useState('');
    const [iGroup, setIGroup] = useState('');
    const [iUnit, setIUnit] = useState(data.units[0]?.id || '');
    const [iGodown, setIGodown] = useState(data.godowns[0]?.id || '');
    const [iBatch, setIBatch] = useState(false);
    
    // Employee Form State
    const [eName, setEName] = useState('');
    const [eDesig, setEDesig] = useState('');
    const [eSalary, setESalary] = useState('0');

    const handleSave = () => {
        if (type === 'ledger') {
            const newItem: Ledger = {
                id: generateId(),
                name: lName,
                groupId: lGroup,
                openingBalance: parseFloat(lOpBal) || 0,
                openingBalanceType: lOpBalType,
                taxDetails: { gstin: lGstin }
            };
            onSave(newItem, 'ledger');
        } else if (type === 'item') {
            const newItem: StockItem = {
                id: generateId(),
                name: iName,
                stockGroupId: iGroup,
                unit: iUnit,
                openingQuantity: 0,
                openingRate: 0,
                godownId: iGodown,
                maintainBatches: iBatch
            };
            onSave(newItem, 'item');
        } else {
             const newItem: Employee = {
                id: generateId(),
                name: eName,
                designation: eDesig,
                department: 'General',
                basicSalary: parseFloat(eSalary),
                dateOfJoining: new Date().toISOString()
            };
            onSave(newItem, 'employee');
        }
    };

    return (
        <div className="h-full flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-white shadow-xl border border-gray-300">
                {/* Header */}
                <div className="bg-blue-600 text-white p-2 font-bold flex justify-between">
                    <span>{type === 'ledger' ? 'Ledger Creation' : type === 'item' ? 'Stock Item Creation' : 'Employee Creation'}</span>
                    <button onClick={onCancel}><span className="text-xs">✕</span></button>
                </div>

                {/* Body */}
                <div className="p-8 bg-yellow-50/50 min-h-[400px]">
                    {type === 'ledger' && (
                        <>
                            <Field label="Name">
                                <input className="w-full bg-white border border-gray-300 p-1 text-sm focus:bg-yellow-100 outline-none" 
                                    value={lName} onChange={e => setLName(e.target.value)} autoFocus />
                            </Field>
                            <Field label="Under">
                                <select className="w-full bg-white border border-gray-300 p-1 text-sm outline-none"
                                    value={lGroup} onChange={e => setLGroup(e.target.value)}>
                                    {data.groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                                </select>
                            </Field>
                            
                            <SectionHeader title="Statutory Information" />
                            <Field label="GSTIN/UIN">
                                <input className="w-full bg-white border border-gray-300 p-1 text-sm focus:bg-yellow-100 outline-none uppercase" 
                                    value={lGstin} onChange={e => setLGstin(e.target.value)} />
                            </Field>

                            <SectionHeader title="Opening Balance" />
                            <div className="flex gap-2">
                                <input className="flex-1 bg-white border border-gray-300 p-1 text-sm text-right focus:bg-yellow-100 outline-none" 
                                    type="number" value={lOpBal} onChange={e => setLOpBal(e.target.value)} />
                                <select className="w-20 bg-white border border-gray-300 p-1 text-sm outline-none"
                                    value={lOpBalType} onChange={e => setLOpBalType(e.target.value as any)}>
                                    <option value="Dr">Dr</option>
                                    <option value="Cr">Cr</option>
                                </select>
                            </div>
                        </>
                    )}

                    {type === 'item' && (
                        <>
                            <Field label="Name">
                                <input className="w-full bg-white border border-gray-300 p-1 text-sm focus:bg-yellow-100 outline-none" 
                                    value={iName} onChange={e => setIName(e.target.value)} autoFocus />
                            </Field>
                            <Field label="Under (Group)">
                                <select className="w-full bg-white border border-gray-300 p-1 text-sm outline-none"
                                    value={iGroup} onChange={e => setIGroup(e.target.value)}>
                                    <option value="">Primary</option>
                                    {data.stockGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                                </select>
                            </Field>
                            <Field label="Units">
                                <select className="w-full bg-white border border-gray-300 p-1 text-sm outline-none"
                                    value={iUnit} onChange={e => setIUnit(e.target.value)}>
                                    {data.units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                </select>
                            </Field>
                            
                            <SectionHeader title="Additional Details" />
                            <Field label="Maintain Batches?">
                                <select className="w-20 bg-white border border-gray-300 p-1 text-sm outline-none"
                                    value={iBatch ? 'Yes' : 'No'} onChange={e => setIBatch(e.target.value === 'Yes')}>
                                    <option value="No">No</option>
                                    <option value="Yes">Yes</option>
                                </select>
                            </Field>
                             <Field label="Default Godown">
                                <select className="w-full bg-white border border-gray-300 p-1 text-sm outline-none"
                                    value={iGodown} onChange={e => setIGodown(e.target.value)}>
                                    {data.godowns.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                                </select>
                            </Field>
                        </>
                    )}

                    {type === 'employee' && (
                         <>
                             <Field label="Name">
                                <input className="w-full bg-white border border-gray-300 p-1 text-sm focus:bg-yellow-100 outline-none" 
                                    value={eName} onChange={e => setEName(e.target.value)} autoFocus />
                             </Field>
                             <Field label="Designation">
                                <input className="w-full bg-white border border-gray-300 p-1 text-sm focus:bg-yellow-100 outline-none" 
                                    value={eDesig} onChange={e => setEDesig(e.target.value)} />
                             </Field>
                             <Field label="Basic Salary">
                                <input className="w-full bg-white border border-gray-300 p-1 text-sm focus:bg-yellow-100 outline-none" 
                                    type="number" value={eSalary} onChange={e => setESalary(e.target.value)} />
                             </Field>
                         </>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="bg-gray-100 p-3 flex justify-end gap-3 border-t border-gray-300">
                    <button onClick={handleSave} className="px-6 py-1 bg-green-600 text-white text-sm font-bold shadow hover:bg-green-700">
                        Accept (Enter)
                    </button>
                </div>
            </div>
        </div>
    );
};
