
export enum VoucherType {
    CONTRA = 'Contra',
    PAYMENT = 'Payment',
    RECEIPT = 'Receipt',
    JOURNAL = 'Journal',
    SALES = 'Sales',
    PURCHASE = 'Purchase'
}

export enum AccountGroupType {
    ASSET = 'Asset',
    LIABILITY = 'Liability',
    INCOME = 'Income',
    EXPENSE = 'Expense'
}

export interface AccountGroup {
    id: string;
    name: string;
    parentGroupId?: string;
    type: AccountGroupType;
}

export interface TaxDetails {
    gstin?: string;
    hsnCode?: string;
    taxRate?: number; // Percentage
    taxType?: 'GST' | 'TDS' | 'None';
    pan?: string;
}

export interface BankDetails {
    accountNumber?: string;
    ifsc?: string;
    bankName?: string;
}

export interface Ledger {
    id: string;
    name: string;
    groupId: string;
    openingBalance: number;
    openingBalanceType: 'Dr' | 'Cr';
    taxDetails?: TaxDetails;
    bankDetails?: BankDetails;
    currency?: string; // For multi-currency
    interestRate?: number; // For interest calculation
}

export interface Godown {
    id: string;
    name: string;
    location?: string;
}

export interface BatchInfo {
    batchName: string;
    expiryDate?: string;
    manufacturingDate?: string;
}

export interface StockItem {
    id: string;
    name: string;
    unit: string;
    openingQuantity: number;
    openingRate: number;
    category?: string;
    godownId?: string; // Default Godown
    reorderLevel?: number;
    maintainBatches?: boolean;
    taxDetails?: TaxDetails;
}

export interface Employee {
    id: string;
    name: string;
    designation: string;
    department: string;
    dateOfJoining: string;
    basicSalary: number;
    email?: string;
}

export interface VoucherEntry {
    id: string;
    ledgerId: string;
    amount: number; 
    type: 'Dr' | 'Cr';
    forexAmount?: number; // Foreign currency amount
    forexRate?: number;   // Exchange rate used
}

export interface Voucher {
    id: string;
    number: number;
    date: string;
    type: VoucherType;
    entries: VoucherEntry[];
    narration: string;
    currencySymbol?: string; // Default base currency is usually empty/system default
}

export interface AppState {
    groups: AccountGroup[];
    ledgers: Ledger[];
    stockItems: StockItem[];
    godowns: Godown[];
    employees: Employee[];
    vouchers: Voucher[];
    financialYearStart: string;
}

export const DEFAULT_GROUPS: AccountGroup[] = [
    { id: 'g1', name: 'Capital Account', type: AccountGroupType.LIABILITY },
    { id: 'g2', name: 'Current Assets', type: AccountGroupType.ASSET },
    { id: 'g3', name: 'Bank Accounts', parentGroupId: 'g2', type: AccountGroupType.ASSET },
    { id: 'g4', name: 'Cash-in-hand', parentGroupId: 'g2', type: AccountGroupType.ASSET },
    { id: 'g5', name: 'Sales Accounts', type: AccountGroupType.INCOME },
    { id: 'g6', name: 'Purchase Accounts', type: AccountGroupType.EXPENSE },
    { id: 'g7', name: 'Direct Expenses', type: AccountGroupType.EXPENSE },
    { id: 'g8', name: 'Indirect Expenses', type: AccountGroupType.EXPENSE },
    { id: 'g9', name: 'Sundry Debtors', parentGroupId: 'g2', type: AccountGroupType.ASSET },
    { id: 'g10', name: 'Sundry Creditors', type: AccountGroupType.LIABILITY },
    { id: 'g11', name: 'Duties & Taxes', type: AccountGroupType.LIABILITY },
];

export const DEFAULT_GODOWNS: Godown[] = [
    { id: 'gd1', name: 'Main Location', location: 'Head Office' },
];

export const DEFAULT_LEDGERS: Ledger[] = [
    { id: 'l1', name: 'Cash', groupId: 'g4', openingBalance: 0, openingBalanceType: 'Dr' },
    { id: 'l2', name: 'Profit & Loss A/c', groupId: 'g1', openingBalance: 0, openingBalanceType: 'Cr' },
];
