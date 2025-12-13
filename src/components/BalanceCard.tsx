import React from 'react';
import { cn } from '@/lib/utils';

interface BalanceCardProps {
  title: string;
  amount: number;
  icon: React.ReactNode;
  variant: 'primary' | 'success' | 'warning' | 'default';
  className?: string;
}

const variantStyles = {
  primary: 'gradient-primary text-white',
  success: 'gradient-income text-white',
  warning: 'bg-warning text-white',
  default: 'bg-card border border-border text-card-foreground',
};

const iconBgStyles = {
  primary: 'bg-white/20',
  success: 'bg-white/20',
  warning: 'bg-white/20',
  default: 'bg-primary/10',
};

export function BalanceCard({ title, amount, icon, variant, className }: BalanceCardProps) {
  return (
    <div
      className={cn(
        'p-5 rounded-2xl shadow-card transition-all duration-300 hover:shadow-card-hover hover:scale-[1.02]',
        variantStyles[variant],
        className
      )}
    >
      <div className="flex justify-between items-center">
        <div>
          <p className={cn(
            'text-xs font-bold uppercase tracking-wider mb-1',
            variant === 'default' ? 'text-muted-foreground' : 'opacity-80'
          )}>
            {title}
          </p>
          <p className="text-3xl font-extrabold">
            ₹{amount.toLocaleString('en-IN')}
          </p>
        </div>
        <div className={cn('p-3 rounded-full', iconBgStyles[variant])}>
          {icon}
        </div>
      </div>
    </div>
  );
}
