
import { AppState, DEFAULT_GROUPS, DEFAULT_LEDGERS, DEFAULT_GODOWNS } from '../types';

const STORAGE_KEY = 'neo_tally_data_v2';

export const getInitialState = (): AppState => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        try {
            const parsed = JSON.parse(stored);
            // Migration strategy: ensure new fields exist if loading old data
            return {
                ...parsed,
                godowns: parsed.godowns || DEFAULT_GODOWNS,
                employees: parsed.employees || []
            };
        } catch (e) {
            console.error("Failed to parse local storage", e);
        }
    }
    
    return {
        groups: DEFAULT_GROUPS,
        ledgers: DEFAULT_LEDGERS,
        stockItems: [],
        godowns: DEFAULT_GODOWNS,
        employees: [],
        vouchers: [],
        financialYearStart: new Date().getFullYear() + '-04-01'
    };
};

export const saveState = (state: AppState) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const exportData = (state: AppState) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "neotally_backup_" + new Date().toISOString().split('T')[0] + ".json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
};
