import React from 'react';
import { useApp } from '@/context/AppContext';
import { Icons } from '@/components/Icons';
import { cn } from '@/lib/utils';

export function MobileHeader() {
  const { summary, activeTab } = useApp();
  
  const balanceColor = summary.balance >= 0 ? 'text-white' : 'text-red-200';
  
  const getTitle = () => {
    switch (activeTab) {
      case 'students': return 'Students';
      case 'history': return 'History';
      case 'add': return 'Add Entry';
      case 'settings': return 'Settings';
      default: return 'Dashboard';
    }
  };
  
  return (
    <header className="md:hidden bg-card text-foreground pt-10 pb-20 px-6 rounded-b-[2.5rem] shadow-card relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/5 rounded-full translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Icons.GraduationCap className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Nurani Coaching</h1>
            <p className="text-muted-foreground text-xs">{getTitle()}</p>
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider mb-1">
            Total Balance
          </p>
          <h2 className={cn('text-4xl font-extrabold tracking-tight', balanceColor)}>
            ₹{summary.balance.toLocaleString('en-IN')}
          </h2>
        </div>
      </div>
    </header>
  );
}
