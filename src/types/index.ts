export interface Student {
  id: string;
  name: string;
  parentName: string;
  phone: string;
  school: string;
  std: string;
  medium: string;
  board: string;
  monthlyFee: number;
  joinDate: string;
  leaveDate?: string | null;
  active: boolean;
}

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  studentName?: string | null;
  feeMonth?: string | null;
  type: 'income' | 'expense' | 'transfer';
  category: string;
  paymentMethod: string;
  transferTo?: string | null;
  date: string;
  dateStr: string;
  createdAt: string;
  loanId?: string | null;
}

export interface Loan {
  id: string;
  name: string;
  total: number;
  emi: number;
  paid: number;
}

export interface ExpenseCategory {
  name: string;
  icon: string;
}

export interface StudentFinancials {
  paid: number;
  pending: number;
  advance?: number;
  missingMonths: string[];
  status: 'Paid' | 'Due' | 'Overdue' | 'Advance' | 'New' | 'Left (Paid)' | 'Invalid Date' | 'Error';
}

export type TabType = 'dashboard' | 'students' | 'history' | 'add' | 'settings';
