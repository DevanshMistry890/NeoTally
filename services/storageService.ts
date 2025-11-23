
import { Company, CompanyData, DEFAULT_GROUPS, DEFAULT_LEDGERS, DEFAULT_GODOWNS } from '../types';

const STORAGE_KEY = 'neotally_erp_v1';

export interface GlobalState {
    companies: Company[];
    activeCompanyId: string | null;
}

const createEmptyCompanyData = (fyStart: string): CompanyData => ({
    groups: DEFAULT_GROUPS,
    ledgers: DEFAULT_LEDGERS,
    stockGroups: [],
    stockItems: [],
    units: [{ id: 'u1', name: 'Nos', formalName: 'Numbers' }],
    godowns: DEFAULT_GODOWNS,
    batches: [],
    employees: [],
    vouchers: [],
    financialYearStart: fyStart
});

export const getGlobalState = (): GlobalState => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        try {
            const parsed = JSON.parse(stored);
            // Basic migration check
            if (Array.isArray(parsed)) {
                // Old format migration (if any)
                return { companies: [], activeCompanyId: null };
            }
            return parsed;
        } catch (e) {
            console.error("Failed to parse local storage", e);
        }
    }
    
    return {
        companies: [],
        activeCompanyId: null
    };
};

export const saveGlobalState = (state: GlobalState) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const createNewCompany = (name: string, fyStart: string, address: string): Company => {
    return {
        id: Math.random().toString(36).substr(2, 9),
        name,
        financialYearStart: fyStart,
        address,
        data: createEmptyCompanyData(fyStart)
    };
};

export const exportCompanyData = (company: Company) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(company));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `neotally_${company.name.replace(/\s+/g, '_')}_backup.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
};
