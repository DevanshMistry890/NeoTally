
import React, { useState, useReducer } from 'react';
import { Layout } from './components/Layout';
import { AppState, Ledger, StockItem, Voucher, VoucherType, Employee } from './types';
import { getInitialState, saveState, exportData } from './services/storageService';
import { Gateway } from './components/Gateway';
import { Masters } from './components/Masters';
import { VoucherEntryForm } from './components/VoucherEntryForm';
import { DayBook } from './components/DayBook';
import { Reports } from './components/Reports';

type Action = 
    | { type: 'LOAD_STATE', payload: AppState }
    | { type: 'ADD_LEDGER', payload: Ledger }
    | { type: 'ADD_ITEM', payload: StockItem }
    | { type: 'ADD_EMPLOYEE', payload: Employee }
    | { type: 'ADD_VOUCHER', payload: Voucher }
    | { type: 'DELETE_VOUCHER', payload: string };

const reducer = (state: AppState, action: Action): AppState => {
    let newState = state;
    switch (action.type) {
        case 'LOAD_STATE':
            newState = action.payload;
            break;
        case 'ADD_LEDGER':
            newState = { ...state, ledgers: [...state.ledgers, action.payload] };
            break;
        case 'ADD_ITEM':
            newState = { ...state, stockItems: [...state.stockItems, action.payload] };
            break;
        case 'ADD_EMPLOYEE':
            newState = { ...state, employees: [...state.employees, action.payload] };
            break;
        case 'ADD_VOUCHER':
            newState = { ...state, vouchers: [...state.vouchers, action.payload] };
            break;
        case 'DELETE_VOUCHER':
            newState = { ...state, vouchers: state.vouchers.filter(v => v.id !== action.payload) };
            break;
        default:
            return state;
    }
    saveState(newState);
    return newState;
};

function App() {
    const [state, dispatch] = useReducer(reducer, getInitialState());
    const [view, setView] = useState('gateway'); 
    const [currentVoucherType, setCurrentVoucherType] = useState<VoucherType>(VoucherType.PAYMENT);

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target?.result as string);
                dispatch({ type: 'LOAD_STATE', payload: json });
                alert("Data loaded successfully!");
            } catch (error) {
                alert("Invalid backup file.");
            }
        };
        reader.readAsText(file);
    };

    const renderContent = () => {
        switch (view) {
            case 'gateway':
                return <Gateway 
                    onSelect={(v) => setView(v)} 
                    stats={{ 
                        ledgers: state.ledgers.length, 
                        vouchers: state.vouchers.length,
                        items: state.stockItems.length,
                        employees: state.employees.length
                    }} 
                />;
            case 'masters_ledger':
                return <Masters type="ledger" state={state} onSave={(l) => { dispatch({type: 'ADD_LEDGER', payload: l as Ledger}); setView('gateway'); }} onCancel={() => setView('gateway')} />;
            case 'masters_item':
                return <Masters type="item" state={state} onSave={(i) => { dispatch({type: 'ADD_ITEM', payload: i as StockItem}); setView('gateway'); }} onCancel={() => setView('gateway')} />;
            case 'masters_employee':
                return <Masters type="employee" state={state} onSave={(e) => { dispatch({type: 'ADD_EMPLOYEE', payload: e as Employee}); setView('gateway'); }} onCancel={() => setView('gateway')} />;
            case 'voucher':
                return <VoucherEntryForm 
                    state={state} 
                    initialType={currentVoucherType}
                    onSave={(v) => { dispatch({type: 'ADD_VOUCHER', payload: v}); setView('daybook'); }}
                    onCancel={() => setView('gateway')}
                />;
            case 'daybook':
                return <DayBook state={state} onDelete={(id) => dispatch({type: 'DELETE_VOUCHER', payload: id})} onBack={() => setView('gateway')} />;
            case 'balance_sheet':
                return <Reports type="BS" state={state} onBack={() => setView('gateway')} />;
            case 'pnl':
                return <Reports type="PNL" state={state} onBack={() => setView('gateway')} />;
            case 'stock':
                return <Reports type="STOCK" state={state} onBack={() => setView('gateway')} />;
            case 'gst_report':
                return <Reports type="GST" state={state} onBack={() => setView('gateway')} />;
            case 'payroll_report':
                return <Reports type="PAYROLL" state={state} onBack={() => setView('gateway')} />;
            default:
                return <Gateway onSelect={(v) => setView(v)} stats={{ ledgers: state.ledgers.length, vouchers: state.vouchers.length, items: state.stockItems.length, employees: state.employees.length }} />;
        }
    };

    return (
        <Layout 
            activeView={view} 
            onChangeView={setView}
            onExport={() => exportData(state)}
            onImport={handleImport}
        >
            {renderContent()}
        </Layout>
    );
}

export default App;
