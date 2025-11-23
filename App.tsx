
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { CompanySelect } from './components/CompanySelect';
import { GlobalState, getGlobalState, saveGlobalState, createNewCompany } from './services/storageService';
import { Company, VoucherType } from './types';
import { Gateway } from './components/Gateway';
import { Masters } from './components/Masters';
import { VoucherEntryForm } from './components/VoucherEntryForm';
import { DayBook } from './components/DayBook';
import { Reports } from './components/Reports';

function App() {
    const [globalState, setGlobalState] = useState<GlobalState>(getGlobalState());
    const [activeCompany, setActiveCompany] = useState<Company | null>(null);
    const [view, setView] = useState('company_select'); // Default start
    const [voucherType, setVoucherType] = useState<VoucherType>(VoucherType.PAYMENT);

    // Sync Active Company with Global State whenever it changes
    useEffect(() => {
        if (activeCompany) {
            const updatedCompanies = globalState.companies.map(c => c.id === activeCompany.id ? activeCompany : c);
            const newState = { ...globalState, companies: updatedCompanies, activeCompanyId: activeCompany.id };
            saveGlobalState(newState);
            setGlobalState(newState);
        }
    }, [activeCompany]); // Be careful with dependency loop here, actually we should only save on explicit actions

    // Helper to update active company data safely
    const updateCompanyData = (updateFn: (c: Company) => Company) => {
        if (!activeCompany) return;
        const updated = updateFn(activeCompany);
        setActiveCompany(updated);
        // Force save immediately
        const updatedCompanies = globalState.companies.map(c => c.id === updated.id ? updated : c);
        const newState = { ...globalState, companies: updatedCompanies };
        setGlobalState(newState);
        saveGlobalState(newState);
    };

    const handleSelectCompany = (id: string) => {
        const company = globalState.companies.find(c => c.id === id);
        if (company) {
            setActiveCompany(company);
            setView('gateway');
        }
    };

    const handleCreateCompany = (name: string, fy: string, addr: string) => {
        const newCo = createNewCompany(name, fy, addr);
        const newState = { ...globalState, companies: [...globalState.companies, newCo], activeCompanyId: newCo.id };
        setGlobalState(newState);
        saveGlobalState(newState);
        setActiveCompany(newCo);
        setView('gateway');
    };

    if (view === 'company_select' || !activeCompany) {
        return <CompanySelect 
            companies={globalState.companies} 
            onSelect={handleSelectCompany} 
            onCreate={handleCreateCompany} 
        />;
    }

    const renderContent = () => {
        if (view.startsWith('masters_')) {
            const type = view.split('_')[1] as 'ledger' | 'item' | 'employee';
            return <Masters 
                type={type} 
                data={activeCompany.data} 
                onSave={(item, dataType) => {
                    updateCompanyData(c => ({
                        ...c,
                        data: {
                            ...c.data,
                            ledgers: dataType === 'ledger' ? [...c.data.ledgers, item] : c.data.ledgers,
                            stockItems: dataType === 'item' ? [...c.data.stockItems, item] : c.data.stockItems,
                            employees: dataType === 'employee' ? [...c.data.employees, item] : c.data.employees
                        }
                    }));
                    setView('gateway');
                }} 
                onCancel={() => setView('gateway')} 
            />;
        }

        if (view.startsWith('voucher_')) {
            const typeStr = view.split('_')[1].toUpperCase();
            // Map string to VoucherType enum roughly
            let type = VoucherType.PAYMENT;
            if (typeStr === 'SALES') type = VoucherType.SALES;
            if (typeStr === 'RECEIPT') type = VoucherType.RECEIPT;
            if (typeStr === 'CONTRA') type = VoucherType.CONTRA;
            if (typeStr === 'JOURNAL') type = VoucherType.JOURNAL;
            if (typeStr === 'PURCHASE') type = VoucherType.PURCHASE;

            return <VoucherEntryForm 
                data={activeCompany.data} 
                initialType={type} 
                onSave={(v) => {
                    updateCompanyData(c => ({
                        ...c,
                        data: { ...c.data, vouchers: [...c.data.vouchers, v] }
                    }));
                    setView('gateway'); // Or stay? Tally usually stays or asks. We go to Gateway for safety.
                }} 
                onCancel={() => setView('gateway')} 
            />;
        }

        switch (view) {
            case 'gateway':
                return <Gateway onSelect={setView} />;
            case 'daybook':
                return <DayBook 
                    state={activeCompany.data as any} // Temporary cast for compatibility if types differ slightly
                    onDelete={(id) => {
                         updateCompanyData(c => ({
                            ...c,
                            data: { ...c.data, vouchers: c.data.vouchers.filter(v => v.id !== id) }
                        }));
                    }} 
                    onBack={() => setView('gateway')} 
                />;
            case 'balance_sheet':
            case 'pnl':
            case 'stock_summary':
                return <Reports type={view} data={activeCompany.data} onBack={() => setView('gateway')} />;
            default:
                return <Gateway onSelect={setView} />;
        }
    };

    return (
        <Layout 
            companyName={activeCompany.name} 
            financialPeriod={`Apr ${activeCompany.financialYearStart.split('-')[0]} - Mar`}
            currentView={view}
            onChangeView={setView}
            onBack={() => setView('gateway')}
        >
            {renderContent()}
        </Layout>
    );
}

export default App;
