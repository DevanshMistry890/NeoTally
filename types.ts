
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
    taxRate?: number;
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
    currency?: string;
    interestRate?: number;
}

export interface Godown {
    id: string;
    name: string;
    location?: string;
}

export interface StockGroup {
    id: string;
    name: string;
    parentId?: string;
}

export interface Unit {
    id: string;
    name: string; // e.g. "Nos", "Kgs"
    formalName: string; // e.g. "Numbers"
}

export interface StockItem {
    id: string;
    name: string;
    stockGroupId?: string;
    unit: string;
    openingQuantity: number;
    openingRate: number;
    godownId?: string;
    reorderLevel?: number;
    maintainBatches?: boolean;
    taxDetails?: TaxDetails;
}

export interface Batch {
    id: string;
    itemId: string;
    name: string;
    manufacturingDate?: string;
    expiryDate?: string;
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

// Inventory Allocation for a Ledger Entry (e.g., Sales Ledger -> Item A -> Godown 1)
export interface InventoryAllocation {
    itemId: string;
    godownId: string;
    batchId?: string;
    quantity: number;
    rate: number;
    amount: number;
}

export interface VoucherEntry {
    id: string;
    ledgerId: string;
    amount: number; 
    type: 'Dr' | 'Cr';
    forexAmount?: number;
    forexRate?: number;
    inventoryAllocations?: InventoryAllocation[]; 
}

export interface Voucher {
    id: string;
    number: number;
    date: string;
    type: VoucherType;
    entries: VoucherEntry[];
    narration: string;
    currencySymbol?: string;
}

// Represents the data of a SINGLE Company
export interface CompanyData {
    groups: AccountGroup[];
    ledgers: Ledger[];
    stockGroups: StockGroup[];
    stockItems: StockItem[];
    units: Unit[];
    godowns: Godown[];
    batches: Batch[];
    employees: Employee[];
    vouchers: Voucher[];
    financialYearStart: string;
}

export interface Company {
    id: string;
    name: string;
    email?: string;
    address?: string;
    financialYearStart: string;
    data: CompanyData;
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
