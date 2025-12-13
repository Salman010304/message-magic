import React from 'react';
import { useApp } from '@/context/AppContext';
import { getStudentFinancials } from '@/hooks/useStudentFinancials';
import { Icons } from '@/components/Icons';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { generateReminderMessage } from '@/lib/whatsapp';
import { MONTHS } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface StudentCardProps {
  student: {
    id: string;
    name: string;
    parentName: string;
    phone: string;
    monthlyFee: number;
    std: string;
    medium: string;
    board: string;
    school: string;
    joinDate: string;
    leaveDate?: string | null;
    active: boolean;
  };
  onView: () => void;
  onQuickPay: () => void;
}

export function StudentCard({ student, onView, onQuickPay }: StudentCardProps) {
  const { transactions, reminderMsg, openMessageModal, deleteStudent, setEditingStudent, setActiveTab } = useApp();
  const financials = getStudentFinancials(student, transactions);
  
  const handleSendReminder = (e: React.MouseEvent) => {
    e.stopPropagation();
    const message = generateReminderMessage(
      reminderMsg,
      student.parentName,
      student.name,
      financials.pending,
      financials.missingMonths
    );
    openMessageModal(message, student.phone);
  };
  
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingStudent(student);
    setActiveTab('students');
  };
  
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Delete student "${student.name}"?`)) {
      deleteStudent(student.id);
    }
  };
  
  const getStatusConfig = () => {
    switch (financials.status) {
      case 'Paid':
        return { color: 'text-success', bg: 'bg-success/10', icon: '✓' };
      case 'Advance':
        return { color: 'text-primary', bg: 'bg-primary/10', icon: '⬆' };
      case 'Due':
        return { color: 'text-warning', bg: 'bg-warning/10', icon: '!' };
      case 'Overdue':
        return { color: 'text-destructive', bg: 'bg-destructive/10', icon: '🔴' };
      default:
        return { color: 'text-muted-foreground', bg: 'bg-muted', icon: '' };
    }
  };
  
  const statusConfig = getStatusConfig();
  
  return (
    <div
      onClick={onView}
      className="group bg-card rounded-2xl border border-border p-4 hover:shadow-card-hover hover:border-primary/30 transition-all duration-300 cursor-pointer animate-fade-in"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white font-bold text-sm shadow-glow">
            {student.name.charAt(0)}
          </div>
          <div>
            <h4 className="font-bold text-foreground text-sm">{student.name}</h4>
            {student.parentName && (
              <p className="text-xs text-muted-foreground">
                Parent: {student.parentName}
              </p>
            )}
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-primary hover:text-primary"
            onClick={handleEdit}
          >
            <Icons.Pencil className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive"
            onClick={handleDelete}
          >
            <Icons.Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>
      
      {/* Status & Info */}
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div>
          {financials.pending > 0 && financials.missingMonths.length > 0 ? (
            <Badge className="bg-destructive/10 text-destructive border-destructive/20">
              🔴 {financials.missingMonths.length} Month{financials.missingMonths.length > 1 ? 's' : ''} Due
            </Badge>
          ) : (
            <Badge className={cn(statusConfig.bg, statusConfig.color, 'border-transparent')}>
              {financials.status}
            </Badge>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            ₹{student.monthlyFee.toLocaleString('en-IN')}/month
          </p>
        </div>
        
        <div className="flex gap-2">
          {financials.pending > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 bg-success/10 text-success hover:bg-success/20 hover:text-success"
              onClick={handleSendReminder}
            >
              <Icons.MessageCircle className="w-4 h-4" />
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="text-xs font-bold"
            onClick={(e) => {
              e.stopPropagation();
              onQuickPay();
            }}
          >
            Pay
          </Button>
        </div>
      </div>
    </div>
  );
}
