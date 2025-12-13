import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { TransactionItem } from '@/components/TransactionItem';
import { Icons } from '@/components/Icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ACCOUNTS } from '@/lib/constants';

export function HistoryTab() {
  const {
    transactions,
    students,
    deleteTransaction,
    setEditingTransaction,
    setActiveTab,
    historyAccountFilter,
    setHistoryAccountFilter
  } = useApp();
  
  const [dateFilter, setDateFilter] = useState({ start: '', end: '' });
  const [studentFilter, setStudentFilter] = useState('all');
  const [accountFilter, setAccountFilter] = useState(historyAccountFilter);
  
  // Sync with global account filter from dashboard
  useEffect(() => {
    setAccountFilter(historyAccountFilter);
  }, [historyAccountFilter]);
  
  // Update global filter when local changes
  const handleAccountFilterChange = (value: string) => {
    setAccountFilter(value);
    setHistoryAccountFilter(value);
  };
  
  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];
    
    // Date filter
    if (dateFilter.start || dateFilter.end) {
      filtered = filtered.filter(t => {
        const tDate = new Date(t.date);
        const start = dateFilter.start ? new Date(dateFilter.start) : new Date('2000-01-01');
        const end = dateFilter.end ? new Date(dateFilter.end) : new Date('2099-12-31');
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        return tDate >= start && tDate <= end;
      });
    }
    
    // Student filter
    if (studentFilter !== 'all') {
      filtered = filtered.filter(t => t.studentName === studentFilter);
    }
    
    // Account filter
    if (accountFilter !== 'all') {
      if (accountFilter === 'cash') {
        filtered = filtered.filter(t => 
          t.paymentMethod.toLowerCase() === 'cash' || 
          t.transferTo?.toLowerCase() === 'cash'
        );
      } else if (accountFilter === 'bank') {
        filtered = filtered.filter(t => 
          t.paymentMethod.toLowerCase().includes('bank') || 
          t.transferTo?.toLowerCase().includes('bank')
        );
      } else if (accountFilter === 'credit') {
        filtered = filtered.filter(t => 
          t.paymentMethod.toLowerCase().includes('credit') || 
          t.transferTo?.toLowerCase().includes('credit')
        );
      } else {
        // Specific account name
        filtered = filtered.filter(t => 
          t.paymentMethod === accountFilter || 
          t.transferTo === accountFilter
        );
      }
    }
    
    return filtered;
  }, [transactions, dateFilter, studentFilter, accountFilter]);
  
  // Summary for filtered transactions
  const summary = useMemo(() => {
    const income = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expense = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return { income, expense, net: income - expense };
  }, [filteredTransactions]);
  
  // Unique student names
  const uniqueStudents = useMemo(() => {
    const names = transactions
      .map(t => t.studentName)
      .filter((name): name is string => !!name);
    return [...new Set(names)];
  }, [transactions]);
  
  const handleEdit = (t: typeof transactions[0]) => {
    setEditingTransaction(t);
    setActiveTab('add');
  };
  
  const handleDelete = (id: string) => {
    if (confirm('Delete this transaction?')) {
      deleteTransaction(id);
    }
  };
  
  const handleExport = () => {
    let csvContent = "Date,Description,Type,Category,Amount,Account,Student Name,Fee Month\n";
    
    filteredTransactions.forEach(t => {
      const row = [
        t.date,
        `"${t.description.replace(/"/g, '""')}"`,
        t.type,
        t.category,
        t.amount,
        t.paymentMethod,
        t.studentName || '-',
        t.feeMonth || '-'
      ].join(',');
      csvContent += row + '\n';
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };
  
  const clearFilters = () => {
    setDateFilter({ start: '', end: '' });
    setStudentFilter('all');
    handleAccountFilterChange('all');
  };
  
  const hasFilters = dateFilter.start || dateFilter.end || studentFilter !== 'all' || accountFilter !== 'all';
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Filters */}
      <div className="bg-card p-4 rounded-2xl border border-border shadow-card">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-4 flex-wrap w-full md:w-auto">
            <div className="flex items-center gap-2">
              <Icons.Calendar className="w-4 h-4 text-muted-foreground" />
              <Input
                type="date"
                value={dateFilter.start}
                onChange={(e) => setDateFilter({ ...dateFilter, start: e.target.value })}
                className="w-36"
              />
              <span className="text-muted-foreground text-sm">to</span>
              <Input
                type="date"
                value={dateFilter.end}
                onChange={(e) => setDateFilter({ ...dateFilter, end: e.target.value })}
                className="w-36"
              />
            </div>
            
            <Select value={studentFilter} onValueChange={setStudentFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Students" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Students</SelectItem>
                {uniqueStudents.map(name => (
                  <SelectItem key={name} value={name}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={accountFilter} onValueChange={handleAccountFilterChange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Accounts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Accounts</SelectItem>
                <SelectItem value="cash">💵 Cash Only</SelectItem>
                <SelectItem value="bank">🏦 Banks Only</SelectItem>
                <SelectItem value="credit">💳 Credit Cards Only</SelectItem>
                {ACCOUNTS.map(acc => (
                  <SelectItem key={acc} value={acc}>{acc}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <Icons.X className="w-4 h-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="bg-income/10 text-income border-income/20 hover:bg-income/20"
          >
            <Icons.Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card p-4 rounded-2xl border border-border text-center">
          <p className="text-xs font-bold text-income uppercase mb-1">Income</p>
          <p className="text-xl font-bold text-income">
            ₹{summary.income.toLocaleString('en-IN')}
          </p>
        </div>
        
        <div className="bg-card p-4 rounded-2xl border border-border text-center">
          <p className="text-xs font-bold text-expense uppercase mb-1">Expense</p>
          <p className="text-xl font-bold text-expense">
            ₹{summary.expense.toLocaleString('en-IN')}
          </p>
        </div>
        
        <div className="bg-card p-4 rounded-2xl border border-border text-center">
          <p className="text-xs font-bold text-primary uppercase mb-1">Net</p>
          <p className="text-xl font-bold text-primary">
            ₹{summary.net.toLocaleString('en-IN')}
          </p>
        </div>
      </div>
      
      {/* Transaction List */}
      <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
        <div className="p-4 border-b border-border flex justify-between items-center">
          <h3 className="font-bold text-foreground flex items-center gap-2">
            <Icons.History className="w-5 h-5 text-primary" />
            Transaction History
          </h3>
          <span className="text-sm text-muted-foreground">
            {filteredTransactions.length} entries
          </span>
        </div>
        
        <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
          {filteredTransactions.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <Icons.FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No transactions found</p>
              <p className="text-sm">Try adjusting your filters</p>
            </div>
          ) : (
            filteredTransactions.map(t => (
              <div key={t.id} className="px-4">
                <TransactionItem
                  transaction={t}
                  onEdit={() => handleEdit(t)}
                  onDelete={() => handleDelete(t.id)}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}