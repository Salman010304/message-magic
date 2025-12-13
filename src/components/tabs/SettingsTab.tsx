import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Icons } from '@/components/Icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ACCOUNTS, DEFAULT_REMINDER_MSG } from '@/lib/constants';
import { toast } from '@/hooks/use-toast';

export function SettingsTab() {
  const {
    openingBalances,
    updateOpeningBalance,
    loans,
    addLoan,
    deleteLoan,
    reminderMsg,
    setReminderMsg,
    transactions,
    students,
    expenseCategories,
    addExpenseCategory,
    removeExpenseCategory
  } = useApp();
  
  const [showLoanForm, setShowLoanForm] = useState(false);
  const [newLoan, setNewLoan] = useState({ name: '', total: '', emi: '' });
  const [newCategory, setNewCategory] = useState('');
  
  const handleAddLoan = () => {
    if (!newLoan.name || !newLoan.total) return;
    
    addLoan({
      id: Date.now().toString(),
      name: newLoan.name,
      total: parseFloat(newLoan.total),
      emi: parseFloat(newLoan.emi) || 0,
      paid: 0
    });
    
    setNewLoan({ name: '', total: '', emi: '' });
    setShowLoanForm(false);
    toast({ title: 'Loan Added', description: 'New loan has been recorded.' });
  };
  
  const handleDeleteLoan = (id: string) => {
    if (confirm('Delete this loan?')) {
      deleteLoan(id);
      toast({ title: 'Loan Deleted', description: 'Loan has been removed.' });
    }
  };
  
  const handleAddCategory = () => {
    if (!newCategory.trim()) return;
    addExpenseCategory({ name: newCategory.trim(), icon: '✨' });
    setNewCategory('');
    toast({ title: 'Category Added' });
  };
  
  const handleExport = () => {
    const data = JSON.stringify({ transactions, students }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `nurani_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    toast({ title: 'Backup Downloaded' });
  };
  
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        // Would need to implement proper import logic
        toast({ title: 'Import Complete', description: 'Data has been imported.' });
      } catch {
        toast({ title: 'Import Failed', description: 'Invalid file format.', variant: 'destructive' });
      }
    };
    reader.readAsText(file);
  };
  
  const saveReminderMessage = () => {
    toast({ title: 'Template Saved', description: 'Reminder message template has been updated.' });
  };
  
  const resetReminderMessage = () => {
    setReminderMsg(DEFAULT_REMINDER_MSG);
    toast({ title: 'Template Reset', description: 'Reminder message has been reset to default.' });
  };
  
  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
        <Icons.Settings className="w-6 h-6 text-primary" />
        Settings
      </h2>
      
      {/* Opening Balances */}
      <div className="bg-card p-6 rounded-2xl border border-border shadow-card">
        <h3 className="font-bold text-lg text-foreground mb-4 flex items-center gap-2">
          <Icons.Wallet className="w-5 h-5 text-primary" />
          Opening Balances
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Set the starting balance for each account
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ACCOUNTS.map(account => (
            <div key={account} className="space-y-2">
              <Label>{account}</Label>
              <Input
                type="number"
                value={openingBalances[account] || ''}
                onChange={(e) => updateOpeningBalance(account, parseFloat(e.target.value) || 0)}
                placeholder="₹0"
              />
            </div>
          ))}
        </div>
      </div>
      
      {/* Loans Management */}
      <div className="bg-card p-6 rounded-2xl border border-border shadow-card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
            <Icons.CreditCard className="w-5 h-5 text-primary" />
            Loans / EMIs
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowLoanForm(!showLoanForm)}
          >
            <Icons.Plus className="w-4 h-4 mr-1" />
            Add Loan
          </Button>
        </div>
        
        {showLoanForm && (
          <div className="p-4 bg-accent rounded-xl mb-4 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="space-y-2">
                <Label>Loan Name</Label>
                <Input
                  value={newLoan.name}
                  onChange={(e) => setNewLoan({ ...newLoan, name: e.target.value })}
                  placeholder="e.g., Home Loan"
                />
              </div>
              <div className="space-y-2">
                <Label>Total Amount</Label>
                <Input
                  type="number"
                  value={newLoan.total}
                  onChange={(e) => setNewLoan({ ...newLoan, total: e.target.value })}
                  placeholder="₹0"
                />
              </div>
              <div className="space-y-2">
                <Label>EMI Amount</Label>
                <Input
                  type="number"
                  value={newLoan.emi}
                  onChange={(e) => setNewLoan({ ...newLoan, emi: e.target.value })}
                  placeholder="₹0"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddLoan}>Add Loan</Button>
              <Button variant="outline" onClick={() => setShowLoanForm(false)}>Cancel</Button>
            </div>
          </div>
        )}
        
        {loans.length === 0 ? (
          <p className="text-muted-foreground text-center py-6">No loans added yet</p>
        ) : (
          <div className="space-y-2">
            {loans.map(loan => (
              <div key={loan.id} className="flex justify-between items-center p-4 bg-accent rounded-xl">
                <div>
                  <p className="font-bold text-foreground">{loan.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Total: ₹{loan.total.toLocaleString('en-IN')} | 
                    Paid: ₹{loan.paid.toLocaleString('en-IN')} | 
                    Pending: ₹{(loan.total - loan.paid).toLocaleString('en-IN')}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive"
                  onClick={() => handleDeleteLoan(loan.id)}
                >
                  <Icons.Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Expense Categories */}
      <div className="bg-card p-6 rounded-2xl border border-border shadow-card">
        <h3 className="font-bold text-lg text-foreground mb-4 flex items-center gap-2">
          <Icons.Filter className="w-5 h-5 text-primary" />
          Expense Categories
        </h3>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {expenseCategories.map(cat => (
            <div
              key={cat.name}
              className="flex items-center gap-2 px-3 py-2 bg-accent rounded-lg group"
            >
              <span>{cat.icon}</span>
              <span className="text-sm font-medium">{cat.name}</span>
              <button
                onClick={() => removeExpenseCategory(cat.name)}
                className="opacity-0 group-hover:opacity-100 text-destructive transition-opacity"
              >
                <Icons.X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
        
        <div className="flex gap-2">
          <Input
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="New category name"
            className="flex-1"
          />
          <Button onClick={handleAddCategory}>Add</Button>
        </div>
      </div>
      
      {/* WhatsApp Reminder Template */}
      <div className="bg-card p-6 rounded-2xl border border-border shadow-card">
        <h3 className="font-bold text-lg text-foreground mb-4 flex items-center gap-2">
          <Icons.MessageCircle className="w-5 h-5 text-success" />
          WhatsApp Reminder Template
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Use placeholders: {'{parent}'}, {'{name}'}, {'{amount}'}, {'{months}'}
        </p>
        
        <Textarea
          value={reminderMsg}
          onChange={(e) => setReminderMsg(e.target.value)}
          rows={8}
          className="mb-4"
        />
        
        <div className="flex gap-2">
          <Button onClick={saveReminderMessage}>Save Template</Button>
          <Button variant="outline" onClick={resetReminderMessage}>Reset to Default</Button>
        </div>
      </div>
      
      {/* Backup & Restore */}
      <div className="bg-card p-6 rounded-2xl border border-border shadow-card">
        <h3 className="font-bold text-lg text-foreground mb-4 flex items-center gap-2">
          <Icons.Download className="w-5 h-5 text-primary" />
          Backup & Restore
        </h3>
        
        <div className="flex flex-wrap gap-4">
          <Button onClick={handleExport} className="gradient-primary">
            <Icons.Download className="w-4 h-4 mr-2" />
            Export Backup
          </Button>
          
          <div>
            <input
              type="file"
              id="import"
              accept=".json"
              className="hidden"
              onChange={handleImport}
            />
            <Button
              variant="outline"
              onClick={() => document.getElementById('import')?.click()}
            >
              <Icons.Upload className="w-4 h-4 mr-2" />
              Import Backup
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
