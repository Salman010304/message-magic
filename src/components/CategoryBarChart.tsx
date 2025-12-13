import React from 'react';
import { cn } from '@/lib/utils';

interface CategoryData {
  name: string;
  value: number;
}

interface CategoryBarChartProps {
  data: CategoryData[];
  variant: 'income' | 'expense';
  onCategoryClick?: (category: string) => void;
  className?: string;
}

export function CategoryBarChart({ data, variant, onCategoryClick, className }: CategoryBarChartProps) {
  if (data.length === 0) {
    return (
      <div className={cn('flex items-center justify-center py-8', className)}>
        <p className="text-muted-foreground text-sm">No data to display</p>
      </div>
    );
  }
  
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <div className={cn('space-y-3 mt-4', className)}>
      {data.map((item, index) => (
        <div
          key={item.name}
          onClick={() => onCategoryClick?.(item.name)}
          className="cursor-pointer group animate-fade-in"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <div className="flex justify-between text-xs mb-1">
            <span className="font-medium text-muted-foreground group-hover:text-foreground transition-colors">
              {item.name}
            </span>
            <span className="font-bold text-foreground">
              ₹{item.value.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2.5 overflow-hidden">
            <div
              className={cn(
                'h-2.5 rounded-full transition-all duration-500 ease-out',
                variant === 'income' ? 'bg-income' : 'bg-expense'
              )}
              style={{ width: `${(item.value / maxValue) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
