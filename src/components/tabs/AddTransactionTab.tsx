import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Icons } from '@/components/Icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ACCOUNTS, MONTHS } from '@/lib/constants';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export function AddTransactionTab() {
  const {
    expenseCategories,
    students,
    loans,
    addTransaction,
    updateTransaction,
    editingTransaction,
    setEditingTransaction,
    setActiveTab
  } = useApp();
  
  // Form state
  const [type, setType] = useState<'income' | 'expense' | 'transfer'>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [transferTo, setTransferTo] = useState(ACCOUNTS[1]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [studentName, setStudentName] = useState('');
  const [feeMonth, setFeeMonth] = useState('');
  const [selectedLoanId, setSelectedLoanId] = useState('');
  
  // Populate form when editing
  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setAmount(editingTransaction.amount.toString());
      setDescription(editingTransaction.description);
      setCategory(editingTransaction.category);
      setPaymentMethod(editingTransaction.paymentMethod);
      setTransferTo(editingTransaction.transferTo || ACCOUNTS[1]);
      setDate(editingTransaction.date);
      setStudentName(editingTransaction.studentName || '');
      setFeeMonth(editingTransaction.feeMonth || '');
      setSelectedLoanId(editingTransaction.loanId || '');
    }
  }, [editingTransaction]);
  
  const resetForm = () => {
    setAmount('');
    setDescription('');
    setCategory('');
    setStudentName('');
    setFeeMonth('');
    setSelectedLoanId('');
    setDate(new Date().toISOString().split('T')[0]);
    setEditingTransaction(null);
  };
  
  const handleCategorySelect = (catName: string) => {
    setCategory(catName);
    if (!description) {
      setDescription(catName);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount) {
      toast({
        title: 'Missing Amount',
        description: 'Please enter an amount.',
        variant: 'destructive'
      });
      return;
    }
    
    const isTuition = category === 'Tuition Fees' && type === 'income';
    
    let finalDescription = description;
    if (isTuition) {
      finalDescription = `Tuition: ${studentName} (${feeMonth})`;
    } else if (type === 'transfer') {
      finalDescription = `Transfer: ${paymentMethod} → ${transferTo}`;
    }
    
    const txData = {
      id: editingTransaction?.id || Date.now().toString(),
      amount: parseFloat(amount),
      description: finalDescription,
      studentName: isTuition ? studentName : null,
      feeMonth: isTuition ? feeMonth : null,
      type,
      category: type === 'transfer' ? 'Transfer' : category,
      paymentMethod,
      transferTo: type === 'transfer' ? transferTo : null,
      date,
      dateStr: new Date(date).toLocaleDateString(),
      createdAt: new Date().toISOString(),
      loanId: category === 'Loan/EMI' && selectedLoanId ? selectedLoanId : null
    };
    
    if (editingTransaction) {
      updateTransaction(editingTransaction.id, txData);
      toast({
        title: 'Transaction Updated',
        description: 'Your changes have been saved.'
      });
    } else {
      addTransaction(txData);
      toast({
        title: 'Transaction Added',
        description: `${type === 'income' ? 'Income' : type === 'expense' ? 'Expense' : 'Transfer'} of ₹${parseFloat(amount).toLocaleString('en-IN')} recorded.`
      });
    }
    
    resetForm();
    
    if (!isTuition) {
      setActiveTab('dashboard');
    }
  };
  
  return (
    <div className="flex justify-center animate-fade-in">
      <div className="w-full max-w-lg bg-card p-8 rounded-3xl border border-border shadow-card">
        {editingTransaction && (
          <div className="mb-6 p-4 bg-warning/10 border border-warning/20 rounded-xl flex justify-between items-center">
            <p className="text-sm text-warning font-bold flex items-center gap-2">
              <Icons.Pencil className="w-4 h-4" />
              Editing Transaction
            </p>
            <Button variant="ghost" size="sm" onClick={resetForm}>
              Cancel
            </Button>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Transaction Type */}
          <div className="space-y-3">
            <Label>Transaction Type</Label>
            <RadioGroup
              value={type}
              onValueChange={(v) => setType(v as typeof type)}
              className="grid grid-cols-3 gap-2"
            >
              <div>
                <RadioGroupItem value="expense" id="expense" className="sr-only" />
                <Label
                  htmlFor="expense"
                  className={cn(
                    'flex flex-col items-center justify-center rounded-xl border-2 p-4 cursor-pointer transition-all',
                    type === 'expense'
                      ? 'border-expense bg-expense/10 text-expense'
                      : 'border-border hover:border-expense/50'
                  )}
                >
                  <Icons.TrendingDown className="w-5 h-5 mb-1" />
                  <span className="text-xs font-bold">Expense</span>
                </Label>
              </div>
              
              <div>
                <RadioGroupItem value="income" id="income" className="sr-only" />
                <Label
                  htmlFor="income"
                  className={cn(
                    'flex flex-col items-center justify-center rounded-xl border-2 p-4 cursor-pointer transition-all',
                    type === 'income'
                      ? 'border-income bg-income/10 text-income'
                      : 'border-border hover:border-income/50'
                  )}
                >
                  <Icons.TrendingUp className="w-5 h-5 mb-1" />
                  <span className="text-xs font-bold">Income</span>
                </Label>
              </div>
              
              <div>
                <RadioGroupItem value="transfer" id="transfer" className="sr-only" />
                <Label
                  htmlFor="transfer"
                  className={cn(
                    'flex flex-col items-center justify-center rounded-xl border-2 p-4 cursor-pointer transition-all',
                    type === 'transfer'
                      ? 'border-warning bg-warning/10 text-warning'
                      : 'border-border hover:border-warning/50'
                  )}
                >
                  <Icons.ArrowRight className="w-5 h-5 mb-1" />
                  <span className="text-xs font-bold">Transfer</span>
                </Label>
              </div>
            </RadioGroup>
          </div>
          
          {/* Quick Categories (Expense only) */}
          {type === 'expense' && (
            <div className="space-y-3">
              <Label>Quick Category</Label>
              <div className="grid grid-cols-3 gap-2">
                {expenseCategories.map(cat => (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() => handleCategorySelect(cat.name)}
                    className={cn(
                      'p-3 rounded-xl border-2 transition-all text-center',
                      category === cat.name
                        ? 'border-expense bg-expense text-white'
                        : 'border-border hover:border-expense/50 bg-card'
                    )}
                  >
                    <span className="text-lg">{cat.icon}</span>
                    <p className="text-xs font-medium mt-1">{cat.name}</p>
                  </button>
                ))}
              </div>
              
              {/* Loan Selector */}
              {category === 'Loan/EMI' && (
                <div className="p-4 bg-warning/10 rounded-xl border border-warning/20 animate-fade-in">
                  <Label className="text-warning">Select Loan</Label>
                  <Select value={selectedLoanId} onValueChange={setSelectedLoanId}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select loan to pay" />
                    </SelectTrigger>
                    <SelectContent>
                      {loans.map(loan => (
                        <SelectItem key={loan.id} value={loan.id}>
                          {loan.name} (Bal: ₹{(loan.total - loan.paid).toLocaleString('en-IN')})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}
          
          {/* Income Category */}
          {type === 'income' && (
            <div className="space-y-3">
              <Label>Category</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCategory('Tuition Fees')}
                  className={cn(
                    'p-4 rounded-xl border-2 transition-all',
                    category === 'Tuition Fees'
                      ? 'border-primary bg-primary text-white'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <Icons.GraduationCap className="w-6 h-6 mx-auto" />
                  <p className="text-xs font-bold mt-2">Tuition Fees</p>
                </button>
                
                <button
                  type="button"
                  onClick={() => setCategory('Other Income')}
                  className={cn(
                    'p-4 rounded-xl border-2 transition-all',
                    category === 'Other Income'
                      ? 'border-income bg-income text-white'
                      : 'border-border hover:border-income/50'
                  )}
                >
                  <Icons.IndianRupee className="w-6 h-6 mx-auto" />
                  <p className="text-xs font-bold mt-2">Other Income</p>
                </button>
              </div>
              
              {/* Student & Month Selection */}
              {category === 'Tuition Fees' && (
                <div className="space-y-4 p-4 bg-primary/5 rounded-xl border border-primary/20 animate-fade-in">
                  <div className="space-y-2">
                    <Label>Student</Label>
                    <Select value={studentName} onValueChange={setStudentName}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select student" />
                      </SelectTrigger>
                      <SelectContent>
                        {students.map(s => (
                          <SelectItem key={s.id} value={s.name}>
                            {s.name} (₹{s.monthlyFee}/mo)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Fee Month</Label>
                    <Select value={feeMonth} onValueChange={setFeeMonth}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select month" />
                      </SelectTrigger>
                      <SelectContent>
                        {MONTHS.map(m => (
                          <SelectItem key={m} value={m}>{m}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount *</Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-muted-foreground">₹</span>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="text-3xl font-bold h-16 pl-10 text-center"
                required
              />
            </div>
          </div>
          
          {/* Description (for non-tuition) */}
          {!(type === 'income' && category === 'Tuition Fees') && type !== 'transfer' && (
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter description"
              />
            </div>
          )}
          
          {/* Payment Method */}
          <div className="space-y-2">
            <Label>{type === 'transfer' ? 'From Account' : 'Payment Method'}</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACCOUNTS.map(acc => (
                  <SelectItem key={acc} value={acc}>{acc}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Transfer To (for transfers) */}
          {type === 'transfer' && (
            <div className="space-y-2">
              <Label>To Account</Label>
              <Select value={transferTo} onValueChange={setTransferTo}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACCOUNTS.filter(acc => acc !== paymentMethod).map(acc => (
                    <SelectItem key={acc} value={acc}>{acc}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          
          {/* Submit */}
          <Button
            type="submit"
            className={cn(
              'w-full h-14 text-lg font-bold',
              type === 'income' ? 'gradient-income' :
              type === 'expense' ? 'gradient-expense' :
              'bg-warning hover:bg-warning/90'
            )}
          >
            {editingTransaction ? 'Update' : 'Add'} {type === 'income' ? 'Income' : type === 'expense' ? 'Expense' : 'Transfer'}
          </Button>
        </form>
      </div>
    </div>
  );
}
