
import React, { useState } from 'react';
import { AppState, Ledger, StockItem, Employee, DEFAULT_GROUPS, DEFAULT_GODOWNS } from '../types';
import { Input, Select } from './Input';

interface MastersProps {
    type: 'ledger' | 'item' | 'employee';
    state: AppState;
    onSave: (data: Ledger | StockItem | Employee) => void;
    onCancel: () => void;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export const Masters: React.FC<MastersProps> = ({ type, state, onSave, onCancel }) => {
    const [activeTab, setActiveTab] = useState('general');
    
    // Ledger State
    const [lName, setLName] = useState('');
    const [lGroup, setLGroup] = useState(DEFAULT_GROUPS[0].id);
    const [lOpBal, setLOpBal] = useState('0');
    const [lOpBalType, setLOpBalType] = useState<'Dr' | 'Cr'>('Dr');
    const [lTaxReg, setLTaxReg] = useState('');
    const [lGstin, setLGstin] = useState('');
    const [lBankAcc, setLBankAcc] = useState('');
    const [lIfsc, setLIfsc] = useState('');
    const [lInterest, setLInterest] = useState('0');

    // Item State
    const [iName, setIName] = useState('');
    const [iUnit, setIUnit] = useState('Nos');
    const [iOpQty, setIOpQty] = useState('0');
    const [iOpRate, setIOpRate] = useState('0');
    const [iGodown, setIGodown] = useState(DEFAULT_GODOWNS[0]?.id || '');
    const [iReorder, setIReorder] = useState('0');
    const [iBatch, setIBatch] = useState(false);
    const [iHsn, setIHsn] = useState('');
    const [iTaxRate, setITaxRate] = useState('0');

    // Employee State
    const [eName, setEName] = useState('');
    const [eDesig, setEDesig] = useState('');
    const [eDept, setEDept] = useState('');
    const [eSalary, setESalary] = useState('0');
    const [eDoj, setEDoj] = useState(new Date().toISOString().split('T')[0]);

    const handleSave = () => {
        if (type === 'ledger') {
            if (!lName) return alert('Name is required');
            const ledger: Ledger = {
                id: generateId(),
                name: lName,
                groupId: lGroup,
                openingBalance: parseFloat(lOpBal) || 0,
                openingBalanceType: lOpBalType,
                taxDetails: { gstin: lGstin, taxType: lGstin ? 'GST' : 'None' },
                bankDetails: { accountNumber: lBankAcc, ifsc: lIfsc },
                interestRate: parseFloat(lInterest)
            };
            onSave(ledger);
        } else if (type === 'item') {
            if (!iName) return alert('Name is required');
            const item: StockItem = {
                id: generateId(),
                name: iName,
                unit: iUnit,
                openingQuantity: parseFloat(iOpQty) || 0,
                openingRate: parseFloat(iOpRate) || 0,
                godownId: iGodown,
                reorderLevel: parseFloat(iReorder),
                maintainBatches: iBatch,
                taxDetails: { hsnCode: iHsn, taxRate: parseFloat(iTaxRate) }
            };
            onSave(item);
        } else {
            if (!eName) return alert('Name is required');
            const emp: Employee = {
                id: generateId(),
                name: eName,
                designation: eDesig,
                department: eDept,
                basicSalary: parseFloat(eSalary) || 0,
                dateOfJoining: eDoj
            };
            onSave(emp);
        }
    };

    const TabButton = ({ id, label }: { id: string, label: string }) => (
        <button 
            onClick={() => setActiveTab(id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === id 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
        >
            {label}
        </button>
    );

    return (
        <div className="max-w-3xl mx-auto bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-white/50">
            <div className="bg-gray-50 border-b border-gray-200 p-6 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">
                    {type === 'ledger' ? 'Ledger Master' : type === 'item' ? 'Stock Item Master' : 'Employee Master'}
                </h2>
                <div className="flex gap-2">
                    <TabButton id="general" label="General" />
                    {type === 'ledger' && <TabButton id="statutory" label="Statutory & Bank" />}
                    {type === 'item' && <TabButton id="inventory" label="Advanced Inventory" />}
                    {type === 'item' && <TabButton id="compliance" label="GST & Compliance" />}
                    {type === 'employee' && <TabButton id="payroll" label="Payroll Details" />}
                </div>
            </div>
            
            <div className="p-8 min-h-[400px]">
                {/* LEDGER FORM */}
                {type === 'ledger' && activeTab === 'general' && (
                    <div className="space-y-4">
                        <Input label="Ledger Name" value={lName} onChange={e => setLName(e.target.value)} autoFocus />
                        <Select label="Under Group" value={lGroup} onChange={e => setLGroup(e.target.value)}>
                            {state.groups.map(g => <option key={g.id} value={g.id}>{g.name} ({g.type})</option>)}
                        </Select>
                        <div className="flex gap-4">
                            <Input className="flex-1" label="Opening Balance" type="number" value={lOpBal} onChange={e => setLOpBal(e.target.value)} />
                            <Select className="w-32" label="Dr/Cr" value={lOpBalType} onChange={e => setLOpBalType(e.target.value as any)}>
                                <option value="Dr">Dr</option>
                                <option value="Cr">Cr</option>
                            </Select>
                        </div>
                        <Input label="Interest Rate (%)" type="number" value={lInterest} onChange={e => setLInterest(e.target.value)} placeholder="0.00" />
                    </div>
                )}
                {type === 'ledger' && activeTab === 'statutory' && (
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-gray-400 uppercase border-b pb-1">GST Details</h3>
                        <Input label="GSTIN / UIN" value={lGstin} onChange={e => setLGstin(e.target.value)} placeholder="22AAAAA0000A1Z5" />
                        <Select label="Registration Type" value={lTaxReg} onChange={e => setLTaxReg(e.target.value)}>
                            <option value="regular">Regular</option>
                            <option value="composite">Composition</option>
                            <option value="unregistered">Unregistered</option>
                        </Select>
                        <h3 className="text-sm font-bold text-gray-400 uppercase border-b pb-1 mt-6">Bank Details</h3>
                        <div className="grid grid-cols-2 gap-4">
                             <Input label="Bank Account Number" value={lBankAcc} onChange={e => setLBankAcc(e.target.value)} />
                             <Input label="IFSC Code" value={lIfsc} onChange={e => setLIfsc(e.target.value)} />
                        </div>
                    </div>
                )}

                {/* ITEM FORM */}
                {type === 'item' && activeTab === 'general' && (
                    <div className="space-y-4">
                        <Input label="Item Name" value={iName} onChange={e => setIName(e.target.value)} autoFocus />
                        <div className="grid grid-cols-2 gap-4">
                             <Input label="Unit (e.g., Nos, Kg)" value={iUnit} onChange={e => setIUnit(e.target.value)} />
                             <Select label="Default Godown" value={iGodown} onChange={e => setIGodown(e.target.value)}>
                                {state.godowns.map(g => <option key={g.id} value={g.id}>{g.name} ({g.location})</option>)}
                             </Select>
                        </div>
                        <div className="flex gap-4">
                            <Input className="flex-1" label="Op Qty" type="number" value={iOpQty} onChange={e => setIOpQty(e.target.value)} />
                            <Input className="flex-1" label="Rate" type="number" value={iOpRate} onChange={e => setIOpRate(e.target.value)} />
                        </div>
                    </div>
                )}
                {type === 'item' && activeTab === 'inventory' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                            <div>
                                <div className="font-medium text-gray-900">Maintain Batches</div>
                                <div className="text-xs text-gray-500">Track expiry and manufacturing dates</div>
                            </div>
                            <input type="checkbox" checked={iBatch} onChange={e => setIBatch(e.target.checked)} className="h-5 w-5 text-blue-600" />
                        </div>
                        <Input label="Reorder Level" type="number" value={iReorder} onChange={e => setIReorder(e.target.value)} placeholder="Min quantity alert" />
                    </div>
                )}
                {type === 'item' && activeTab === 'compliance' && (
                    <div className="space-y-4">
                        <Input label="HSN/SAC Code" value={iHsn} onChange={e => setIHsn(e.target.value)} />
                        <Input label="Tax Rate (%)" type="number" value={iTaxRate} onChange={e => setITaxRate(e.target.value)} />
                        <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded">
                            Configuring tax here will auto-calculate IGST/CGST/SGST during voucher entry based on party location.
                        </div>
                    </div>
                )}

                {/* EMPLOYEE FORM */}
                {type === 'employee' && activeTab === 'general' && (
                    <div className="space-y-4">
                        <Input label="Employee Name" value={eName} onChange={e => setEName(e.target.value)} autoFocus />
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Designation" value={eDesig} onChange={e => setEDesig(e.target.value)} />
                            <Input label="Department" value={eDept} onChange={e => setEDept(e.target.value)} />
                        </div>
                         <Input label="Date of Joining" type="date" value={eDoj} onChange={e => setEDoj(e.target.value)} />
                    </div>
                )}
                {type === 'employee' && activeTab === 'payroll' && (
                    <div className="space-y-4">
                         <Input label="Basic Salary (Monthly)" type="number" value={eSalary} onChange={e => setESalary(e.target.value)} />
                         <div className="p-4 bg-yellow-50 text-yellow-800 text-sm rounded border border-yellow-200">
                             Note: PF and ESI calculations will be automated in the Pay Sheet report based on this Basic Salary.
                         </div>
                    </div>
                )}
            </div>

            <div className="bg-gray-50 p-6 flex justify-end gap-3 border-t border-gray-200">
                <button onClick={onCancel} className="px-4 py-2 rounded text-gray-600 hover:bg-gray-200 font-medium">Cancel</button>
                <button onClick={handleSave} className="px-6 py-2 rounded bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-blue-700 font-medium">Save Master</button>
            </div>
        </div>
    );
};
