import React from 'react';
import { useApp } from '@/context/AppContext';
import { TabType } from '@/types';
import { Icons } from '@/components/Icons';
import { cn } from '@/lib/utils';

const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <Icons.LayoutDashboard className="w-5 h-5" /> },
  { id: 'students', label: 'Students', icon: <Icons.Users className="w-5 h-5" /> },
  { id: 'history', label: 'History', icon: <Icons.History className="w-5 h-5" /> },
  { id: 'add', label: 'Add Entry', icon: <Icons.Plus className="w-5 h-5" /> },
  { id: 'settings', label: 'Settings', icon: <Icons.Settings className="w-5 h-5" /> },
];

export function Sidebar() {
  const { activeTab, setActiveTab, summary } = useApp();
  
  const balanceColor = summary.balance >= 0 ? 'text-income' : 'text-expense';
  
  return (
    <aside className="hidden md:flex flex-col w-64 bg-card border-r border-border h-screen sticky top-0">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
            <Icons.GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-foreground">Nurani Coaching</h1>
            <p className="text-xs text-muted-foreground">Manager</p>
          </div>
        </div>
      </div>
      
      {/* Balance Display */}
      <div className="p-4 border-b border-border">
        <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">
          Total Balance
        </p>
        <p className={cn('text-2xl font-extrabold', balanceColor)}>
          ₹{summary.balance.toLocaleString('en-IN')}
        </p>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left',
              activeTab === tab.id
                ? 'bg-primary text-primary-foreground shadow-glow'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            )}
          >
            {tab.icon}
            <span className="font-medium">{tab.label}</span>
          </button>
        ))}
      </nav>
      
      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="bg-income/10 rounded-lg p-2">
            <p className="text-[10px] text-income font-bold uppercase">Income</p>
            <p className="text-sm font-bold text-income">
              ₹{summary.income.toLocaleString('en-IN')}
            </p>
          </div>
          <div className="bg-expense/10 rounded-lg p-2">
            <p className="text-[10px] text-expense font-bold uppercase">Expense</p>
            <p className="text-sm font-bold text-expense">
              ₹{summary.expense.toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
