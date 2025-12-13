import React from 'react';
import { cn } from '@/lib/utils';

interface DonutChartProps {
  income: number;
  expense: number;
  onSliceClick?: (type: 'income' | 'expense') => void;
  className?: string;
}

export function DonutChart({ income, expense, onSliceClick, className }: DonutChartProps) {
  const total = income + expense;
  
  if (total === 0) {
    return (
      <div className={cn('flex items-center justify-center h-48', className)}>
        <p className="text-muted-foreground text-sm">No data to display</p>
      </div>
    );
  }
  
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const incomePortion = (income / total) * circumference;
  
  return (
    <div className={cn('relative w-48 h-48 mx-auto flex items-center justify-center', className)}>
      <svg width="100%" height="100%" viewBox="0 0 100 100" className="transform -rotate-90">
        {/* Expense Arc (Background) */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="transparent"
          stroke="hsl(var(--expense))"
          strokeWidth="12"
          strokeDasharray={`${circumference} ${circumference}`}
          className="cursor-pointer transition-all duration-300 hover:opacity-80"
          onClick={() => onSliceClick?.('expense')}
        />
        {/* Income Arc (Foreground) */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="transparent"
          stroke="hsl(var(--income))"
          strokeWidth="12"
          strokeDasharray={`${incomePortion} ${circumference}`}
          className="cursor-pointer transition-all duration-300 hover:opacity-80"
          onClick={() => onSliceClick?.('income')}
        />
      </svg>
      <div className="absolute text-center pointer-events-none">
        <p className="text-xs text-muted-foreground">Total Flow</p>
        <p className="font-bold text-foreground text-lg">₹{total.toLocaleString('en-IN')}</p>
      </div>
    </div>
  );
}
