import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { Student, Transaction, Loan, CreditCard, ExpenseCategory, TabType } from '@/types';
import { DEFAULT_CATEGORIES, DEFAULT_REMINDER_MSG, ACCOUNTS } from '@/lib/constants';

interface AppState {
  // Data
  transactions: Transaction[];
  students: Student[];
  loans: Loan[];
  creditCards: CreditCard[];
  openingBalances: Record<string, number>;
  expenseCategories: ExpenseCategory[];
  reminderMsg: string;
  
  // UI State
  activeTab: TabType;
  loading: boolean;
  viewingStudent: Student | null;
  editingStudent: Student | null;
  editingTransaction: Transaction | null;
  historyAccountFilter: string;
  
  // Message Modal
  messageModal: {
    open: boolean;
    text: string;
    phone: string;
  };
}

interface AppContextType extends AppState {
  // Data Actions
  setTransactions: (transactions: Transaction[] | ((prev: Transaction[]) => Transaction[])) => void;
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  
  setStudents: (students: Student[] | ((prev: Student[]) => Student[])) => void;
  addStudent: (student: Student) => void;
  updateStudent: (id: string, updates: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  
  setLoans: (loans: Loan[] | ((prev: Loan[]) => Loan[])) => void;
  addLoan: (loan: Loan) => void;
  updateLoan: (id: string, updates: Partial<Loan>) => void;
  deleteLoan: (id: string) => void;
  
  setCreditCards: (cards: CreditCard[] | ((prev: CreditCard[]) => CreditCard[])) => void;
  addCreditCard: (card: CreditCard) => void;
  updateCreditCard: (id: string, updates: Partial<CreditCard>) => void;
  deleteCreditCard: (id: string) => void;
  
  setOpeningBalances: (balances: Record<string, number>) => void;
  updateOpeningBalance: (account: string, amount: number) => void;
  
  setExpenseCategories: (categories: ExpenseCategory[]) => void;
  addExpenseCategory: (category: ExpenseCategory) => void;
  removeExpenseCategory: (name: string) => void;
  
  setReminderMsg: (msg: string) => void;
  
  // UI Actions
  setActiveTab: (tab: TabType) => void;
  setLoading: (loading: boolean) => void;
  setViewingStudent: (student: Student | null) => void;
  setEditingStudent: (student: Student | null) => void;
  setEditingTransaction: (transaction: Transaction | null) => void;
  setHistoryAccountFilter: (account: string) => void;
  
  // Message Modal
  openMessageModal: (text: string, phone: string) => void;
  closeMessageModal: () => void;
  
  // Computed values
  summary: {
    income: number;
    expense: number;
    balance: number;
    balances: Record<string, number>;
    incomeByCategory: Record<string, number>;
    expenseByCategory: Record<string, number>;
  };
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Initialize state from localStorage
  const [transactions, setTransactionsState] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem('nurani_transactions');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  
  const [students, setStudentsState] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem('nurani_students');
      const parsed = saved ? JSON.parse(saved) : [];
      return parsed.filter((s: Student) => s && s.name);
    } catch { return []; }
  });
  
  const [loans, setLoansState] = useState<Loan[]>(() => {
    try {
      const saved = localStorage.getItem('nurani_loans');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  
  const [creditCards, setCreditCardsState] = useState<CreditCard[]>(() => {
    try {
      const saved = localStorage.getItem('nurani_credit_cards');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  
  const [openingBalances, setOpeningBalancesState] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('nurani_opening_balances');
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });
  
  const [expenseCategories, setExpenseCategoriesState] = useState<ExpenseCategory[]>(() => {
    try {
      const saved = localStorage.getItem('nurani_categories');
      return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
    } catch { return DEFAULT_CATEGORIES; }
  });
  
  const [reminderMsg, setReminderMsgState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('nurani_reminder_msg');
      return saved || DEFAULT_REMINDER_MSG;
    } catch { return DEFAULT_REMINDER_MSG; }
  });
  
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [loading, setLoading] = useState(false);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [messageModal, setMessageModal] = useState({ open: false, text: '', phone: '' });
  const [historyAccountFilter, setHistoryAccountFilter] = useState<string>('all');
  
  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('nurani_transactions', JSON.stringify(transactions));
  }, [transactions]);
  
  useEffect(() => {
    localStorage.setItem('nurani_students', JSON.stringify(students));
  }, [students]);
  
  useEffect(() => {
    localStorage.setItem('nurani_loans', JSON.stringify(loans));
  }, [loans]);
  
  useEffect(() => {
    localStorage.setItem('nurani_credit_cards', JSON.stringify(creditCards));
  }, [creditCards]);
  
  useEffect(() => {
    localStorage.setItem('nurani_opening_balances', JSON.stringify(openingBalances));
  }, [openingBalances]);
  
  useEffect(() => {
    localStorage.setItem('nurani_categories', JSON.stringify(expenseCategories));
  }, [expenseCategories]);
  
  useEffect(() => {
    localStorage.setItem('nurani_reminder_msg', reminderMsg);
  }, [reminderMsg]);
  
  // Transactions
  const setTransactions = useCallback((value: Transaction[] | ((prev: Transaction[]) => Transaction[])) => {
    setTransactionsState(value);
  }, []);
  
  const addTransaction = useCallback((transaction: Transaction) => {
    setTransactionsState(prev => [transaction, ...prev].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    ));
  }, []);
  
  const updateTransaction = useCallback((id: string, updates: Partial<Transaction>) => {
    setTransactionsState(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  }, []);
  
  const deleteTransaction = useCallback((id: string) => {
    setTransactionsState(prev => prev.filter(t => t.id !== id));
  }, []);
  
  // Students
  const setStudents = useCallback((value: Student[] | ((prev: Student[]) => Student[])) => {
    setStudentsState(value);
  }, []);
  
  const addStudent = useCallback((student: Student) => {
    setStudentsState(prev => [...prev, student]);
  }, []);
  
  const updateStudent = useCallback((id: string, updates: Partial<Student>) => {
    setStudentsState(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  }, []);
  
  const deleteStudent = useCallback((id: string) => {
    setStudentsState(prev => prev.filter(s => s.id !== id));
    if (viewingStudent?.id === id) setViewingStudent(null);
    if (editingStudent?.id === id) setEditingStudent(null);
  }, [viewingStudent, editingStudent]);
  
  // Loans
  const setLoans = useCallback((value: Loan[] | ((prev: Loan[]) => Loan[])) => {
    setLoansState(value);
  }, []);
  
  const addLoan = useCallback((loan: Loan) => {
    setLoansState(prev => [...prev, loan]);
  }, []);
  
  const updateLoan = useCallback((id: string, updates: Partial<Loan>) => {
    setLoansState(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
  }, []);
  
  const deleteLoan = useCallback((id: string) => {
    setLoansState(prev => prev.filter(l => l.id !== id));
  }, []);
  
  // Credit Cards
  const setCreditCards = useCallback((value: CreditCard[] | ((prev: CreditCard[]) => CreditCard[])) => {
    setCreditCardsState(value);
  }, []);
  
  const addCreditCard = useCallback((card: CreditCard) => {
    setCreditCardsState(prev => [...prev, card]);
  }, []);
  
  const updateCreditCard = useCallback((id: string, updates: Partial<CreditCard>) => {
    setCreditCardsState(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  }, []);
  
  const deleteCreditCard = useCallback((id: string) => {
    setCreditCardsState(prev => prev.filter(c => c.id !== id));
  }, []);
  
  // Opening Balances
  const setOpeningBalances = useCallback((balances: Record<string, number>) => {
    setOpeningBalancesState(balances);
  }, []);
  
  const updateOpeningBalance = useCallback((account: string, amount: number) => {
    setOpeningBalancesState(prev => ({ ...prev, [account]: amount }));
  }, []);
  
  // Expense Categories
  const setExpenseCategories = useCallback((categories: ExpenseCategory[]) => {
    setExpenseCategoriesState(categories);
  }, []);
  
  const addExpenseCategory = useCallback((category: ExpenseCategory) => {
    setExpenseCategoriesState(prev => [...prev, category]);
  }, []);
  
  const removeExpenseCategory = useCallback((name: string) => {
    setExpenseCategoriesState(prev => prev.filter(c => c.name !== name));
  }, []);
  
  // Reminder Message
  const setReminderMsg = useCallback((msg: string) => {
    setReminderMsgState(msg);
  }, []);
  
  // Message Modal
  const openMessageModal = useCallback((text: string, phone: string) => {
    setMessageModal({ open: true, text, phone });
  }, []);
  
  const closeMessageModal = useCallback(() => {
    setMessageModal({ open: false, text: '', phone: '' });
  }, []);
  
  // Computed summary
  const summary = useMemo(() => {
    let income = 0;
    let expense = 0;
    const balances: Record<string, number> = {};
    const incomeByCategory: Record<string, number> = {};
    const expenseByCategory: Record<string, number> = {};
    
    ACCOUNTS.forEach(acc => {
      balances[acc] = openingBalances[acc] || 0;
    });
    
    transactions.forEach(t => {
      const amt = t.amount || 0;
      
      if (t.type === 'income') {
        income += amt;
        if (balances[t.paymentMethod] !== undefined) {
          balances[t.paymentMethod] += amt;
        }
        incomeByCategory[t.category] = (incomeByCategory[t.category] || 0) + amt;
      } else if (t.type === 'expense') {
        expense += amt;
        if (balances[t.paymentMethod] !== undefined) {
          balances[t.paymentMethod] -= amt;
        }
        expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + amt;
      } else if (t.type === 'transfer') {
        if (balances[t.paymentMethod] !== undefined) {
          balances[t.paymentMethod] -= amt;
        }
        if (t.transferTo && balances[t.transferTo] !== undefined) {
          balances[t.transferTo] += amt;
        }
      }
    });
    
    const balance = Object.values(balances).reduce((sum, val) => sum + val, 0);
    
    return { income, expense, balance, balances, incomeByCategory, expenseByCategory };
  }, [transactions, openingBalances]);
  
  const value: AppContextType = {
    transactions,
    students,
    loans,
    creditCards,
    openingBalances,
    expenseCategories,
    reminderMsg,
    activeTab,
    loading,
    viewingStudent,
    editingStudent,
    editingTransaction,
    messageModal,
    historyAccountFilter,
    
    setTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    
    setStudents,
    addStudent,
    updateStudent,
    deleteStudent,
    
    setLoans,
    addLoan,
    updateLoan,
    deleteLoan,
    
    setCreditCards,
    addCreditCard,
    updateCreditCard,
    deleteCreditCard,
    
    setOpeningBalances,
    updateOpeningBalance,
    
    setExpenseCategories,
    addExpenseCategory,
    removeExpenseCategory,
    
    setReminderMsg,
    
    setActiveTab,
    setLoading,
    setViewingStudent,
    setEditingStudent,
    setEditingTransaction,
    setHistoryAccountFilter,
    
    openMessageModal,
    closeMessageModal,
    
    summary
  };
  
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}