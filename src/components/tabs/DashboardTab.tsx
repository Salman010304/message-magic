import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { getStudentFinancials } from '@/hooks/useStudentFinancials';
import { BalanceCard } from '@/components/BalanceCard';
import { DonutChart } from '@/components/DonutChart';
import { CategoryBarChart } from '@/components/CategoryBarChart';
import { TransactionItem } from '@/components/TransactionItem';
import { Icons } from '@/components/Icons';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ACCOUNTS } from '@/lib/constants';

export function DashboardTab() {
  const { 
    summary, 
    transactions, 
    students,
    loans,
    setActiveTab,
    setEditingTransaction,
    deleteTransaction
  } = useApp();
  
  const [chartView, setChartView] = useState<'overview' | 'income' | 'expense'>('overview');
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [showLoanDetails, setShowLoanDetails] = useState(false);
  
  // Calculate totals
  const totalLoanPending = useMemo(() => {
    return loans.reduce((sum, l) => sum + (l.total - l.paid), 0);
  }, [loans]);
  
  const studentStats = useMemo(() => {
    let totalReceived = 0;
    let totalPending = 0;
    
    students.forEach(student => {
      const fin = getStudentFinancials(student, transactions);
      totalReceived += fin.paid;
      totalPending += fin.pending;
    });
    
    return {
      totalStudents: students.length,
      totalReceived,
      totalPending
    };
  }, [students, transactions]);
  
  // Account balances
  const accountGroups = useMemo(() => {
    const cash: { name: string; amount: number }[] = [];
    const bank: { name: string; amount: number }[] = [];
    const credit: { name: string; amount: number }[] = [];
    
    Object.entries(summary.balances).forEach(([name, amount]) => {
      if (name.toLowerCase().includes('credit')) {
        credit.push({ name, amount });
      } else if (name.toLowerCase().includes('bank')) {
        bank.push({ name, amount });
      } else {
        cash.push({ name, amount });
      }
    });
    
    return { cash, bank, credit };
  }, [summary.balances]);
  
  // Chart data
  const incomeData = useMemo(() => 
    Object.entries(summary.incomeByCategory)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value),
    [summary.incomeByCategory]
  );
  
  const expenseData = useMemo(() => 
    Object.entries(summary.expenseByCategory)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value),
    [summary.expenseByCategory]
  );
  
  const displayedTransactions = showAllTransactions 
    ? transactions 
    : transactions.slice(0, 5);
  
  const handleEdit = (t: typeof transactions[0]) => {
    setEditingTransaction(t);
    setActiveTab('add');
  };
  
  const handleDelete = (id: string) => {
    if (confirm('Delete this transaction?')) {
      deleteTransaction(id);
    }
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Loan Liability Card */}
      {totalLoanPending > 0 && (
        <div 
          onClick={() => setShowLoanDetails(!showLoanDetails)}
          className="cursor-pointer"
        >
          <div className="bg-warning/10 border border-warning/20 p-5 rounded-2xl flex justify-between items-center hover:bg-warning/15 transition-colors">
            <div>
              <p className="text-warning text-xs font-bold uppercase tracking-wider mb-1">
                Active Loan Liability
              </p>
              <p className="text-3xl font-bold text-warning">
                ₹{totalLoanPending.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="bg-warning/20 p-3 rounded-full text-warning">
              {showLoanDetails ? (
                <Icons.ChevronUp className="w-6 h-6" />
              ) : (
                <Icons.ChevronDown className="w-6 h-6" />
              )}
            </div>
          </div>
          
          {showLoanDetails && (
            <div className="mt-2 bg-card p-4 rounded-xl border border-border animate-fade-in">
              {loans.map(loan => (
                <div 
                  key={loan.id}
                  className="flex justify-between items-center py-3 border-b border-border last:border-0"
                >
                  <div>
                    <p className="font-bold text-foreground">{loan.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Total: ₹{loan.total.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-warning">
                      Pending: ₹{(loan.total - loan.paid).toLocaleString('en-IN')}
                    </p>
                    <p className="text-xs text-income">
                      Paid: ₹{loan.paid.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accountGroups.cash.map(acc => (
          <BalanceCard
            key={acc.name}
            title="Liquid Cash"
            amount={acc.amount}
            icon={<Icons.Banknote className="w-6 h-6 text-white" />}
            variant="success"
          />
        ))}
        
        {accountGroups.bank.map(acc => (
          <BalanceCard
            key={acc.name}
            title={acc.name}
            amount={acc.amount}
            icon={<Icons.Building2 className="w-6 h-6 text-primary" />}
            variant="default"
          />
        ))}
        
        {accountGroups.credit.map(acc => (
          <div
            key={acc.name}
            className="bg-foreground text-background p-5 rounded-2xl shadow-card"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider opacity-60 mb-1">
                  {acc.name}
                </p>
                <p className={cn(
                  'text-2xl font-bold',
                  acc.amount < 0 ? 'text-red-400' : 'text-background'
                )}>
                  ₹{acc.amount.toLocaleString('en-IN')}
                </p>
              </div>
              <div className="bg-background/10 p-3 rounded-full">
                <Icons.CreditCard className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Analytics Chart */}
      <div className="bg-card p-6 rounded-2xl border border-border shadow-card">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-foreground flex items-center gap-2">
            <Icons.PieChart className="w-5 h-5 text-primary" />
            Analytics
          </h3>
          {chartView !== 'overview' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setChartView('overview')}
            >
              Back
            </Button>
          )}
        </div>
        
        {chartView === 'overview' && (
          <div className="flex flex-col md:flex-row items-center justify-around gap-8">
            <DonutChart
              income={summary.income}
              expense={summary.expense}
              onSliceClick={(type) => setChartView(type)}
            />
            
            <div className="flex flex-col gap-4 w-full md:w-1/3">
              <button
                onClick={() => setChartView('income')}
                className="flex items-center gap-3 p-4 rounded-xl bg-income/5 hover:bg-income/10 transition-colors border border-income/20"
              >
                <div className="w-4 h-4 rounded-full bg-income" />
                <div className="text-left">
                  <p className="text-xs font-bold text-income uppercase">Income</p>
                  <p className="text-lg font-bold text-foreground">
                    ₹{summary.income.toLocaleString('en-IN')}
                  </p>
                </div>
              </button>
              
              <button
                onClick={() => setChartView('expense')}
                className="flex items-center gap-3 p-4 rounded-xl bg-expense/5 hover:bg-expense/10 transition-colors border border-expense/20"
              >
                <div className="w-4 h-4 rounded-full bg-expense" />
                <div className="text-left">
                  <p className="text-xs font-bold text-expense uppercase">Expense</p>
                  <p className="text-lg font-bold text-foreground">
                    ₹{summary.expense.toLocaleString('en-IN')}
                  </p>
                </div>
              </button>
            </div>
          </div>
        )}
        
        {chartView === 'income' && (
          <CategoryBarChart data={incomeData} variant="income" />
        )}
        
        {chartView === 'expense' && (
          <CategoryBarChart data={expenseData} variant="expense" />
        )}
      </div>
      
      {/* Recent Transactions */}
      <div className="bg-card p-6 rounded-2xl border border-border shadow-card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-foreground flex items-center gap-2">
            <Icons.History className="w-5 h-5 text-primary" />
            Recent Transactions
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAllTransactions(!showAllTransactions)}
          >
            {showAllTransactions ? 'Show Less' : 'View All'}
          </Button>
        </div>
        
        <div className="space-y-1">
          {displayedTransactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No transactions yet. Add your first entry!
            </p>
          ) : (
            displayedTransactions.map((t) => (
              <TransactionItem
                key={t.id}
                transaction={t}
                onEdit={() => handleEdit(t)}
                onDelete={() => handleDelete(t.id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
