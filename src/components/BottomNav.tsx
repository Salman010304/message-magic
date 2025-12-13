import React from 'react';
import { TabType } from '@/types';
import { useApp } from '@/context/AppContext';
import { Icons } from '@/components/Icons';
import { cn } from '@/lib/utils';

const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <Icons.LayoutDashboard className="w-5 h-5" /> },
  { id: 'students', label: 'Students', icon: <Icons.Users className="w-5 h-5" /> },
  { id: 'history', label: 'History', icon: <Icons.History className="w-5 h-5" /> },
  { id: 'add', label: 'Add', icon: <Icons.Plus className="w-5 h-5" /> },
];

export function BottomNav() {
  const { activeTab, setActiveTab } = useApp();
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 md:hidden bg-card/95 backdrop-blur-xl border-t border-border z-50 px-2 pb-safe">
      <div className="flex justify-around items-center h-16">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex flex-col items-center justify-center gap-1 p-2 rounded-xl transition-all duration-200 min-w-[64px]',
              activeTab === tab.id
                ? 'text-primary scale-105'
                : 'text-muted-foreground'
            )}
          >
            <div className={cn(
              'p-1.5 rounded-lg transition-colors',
              activeTab === tab.id && 'bg-primary/10'
            )}>
              {tab.icon}
            </div>
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
