import React from 'react';
import { Transaction } from '@/types';
import { Icons } from '@/components/Icons';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TransactionItemProps {
  transaction: Transaction;
  onEdit: () => void;
  onDelete: () => void;
  compact?: boolean;
}

export function TransactionItem({ transaction, onEdit, onDelete, compact = false }: TransactionItemProps) {
  const t = transaction;
  
  const getIcon = () => {
    if (t.category === 'Tuition Fees') {
      return <Icons.GraduationCap className="w-4 h-4" />;
    }
    if (t.type === 'income') {
      return <Icons.TrendingUp className="w-4 h-4" />;
    }
    if (t.type === 'transfer') {
      return <Icons.ArrowRight className="w-4 h-4" />;
    }
    return <Icons.TrendingDown className="w-4 h-4" />;
  };
  
  const getIconStyle = () => {
    if (t.category === 'Tuition Fees') {
      return 'bg-primary/10 text-primary';
    }
    if (t.type === 'income') {
      return 'bg-income/10 text-income';
    }
    if (t.type === 'transfer') {
      return 'bg-warning/10 text-warning';
    }
    return 'bg-expense/10 text-expense';
  };
  
  const getAmountStyle = () => {
    if (t.type === 'income') {
      return 'text-income';
    }
    if (t.type === 'transfer') {
      return 'text-warning';
    }
    return 'text-expense';
  };
  
  return (
    <div className={cn(
      'group flex items-center justify-between rounded-xl hover:bg-accent/50 transition-colors animate-fade-in',
      compact ? 'p-2' : 'p-3'
    )}>
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className={cn(
          'flex-shrink-0 rounded-full flex items-center justify-center',
          getIconStyle(),
          compact ? 'p-2' : 'p-2.5'
        )}>
          {getIcon()}
        </div>
        
        <div className="min-w-0 flex-1">
          <p className={cn(
            'font-semibold text-foreground truncate',
            compact ? 'text-xs' : 'text-sm'
          )}>
            {t.studentName || t.description}
          </p>
          <p className={cn(
            'text-muted-foreground',
            compact ? 'text-[10px]' : 'text-xs'
          )}>
            {t.dateStr} • {t.paymentMethod}
            {t.feeMonth && ` • ${t.feeMonth}`}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2 ml-2 flex-shrink-0">
        <p className={cn(
          'font-bold',
          getAmountStyle(),
          compact ? 'text-sm' : 'text-sm'
        )}>
          {t.type === 'income' ? '+' : t.type === 'expense' ? '-' : ''} 
          ₹{t.amount.toLocaleString('en-IN')}
        </p>
        
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-primary hover:text-primary"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
          >
            <Icons.Pencil className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Icons.Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
