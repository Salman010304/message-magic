import React from 'react';
import { Student, Transaction } from '@/types';
import { useApp } from '@/context/AppContext';
import { getStudentFinancials } from '@/hooks/useStudentFinancials';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/Icons';
import { generateReminderMessage, generateReceiptMessage } from '@/lib/whatsapp';
import { cn } from '@/lib/utils';
import { MONTHS } from '@/lib/constants';

interface StudentDetailModalProps {
  student: Student | null;
  onClose: () => void;
}

export function StudentDetailModal({ student, onClose }: StudentDetailModalProps) {
  const { 
    transactions, 
    reminderMsg, 
    openMessageModal, 
    setActiveTab,
    setEditingStudent
  } = useApp();
  
  if (!student) return null;
  
  const financials = getStudentFinancials(student, transactions);
  
  const studentTransactions = transactions.filter(
    t => t.studentName === student.name && t.category === 'Tuition Fees'
  );
  
  const handleSendReminder = () => {
    const message = generateReminderMessage(
      reminderMsg,
      student.parentName,
      student.name,
      financials.pending,
      financials.missingMonths
    );
    openMessageModal(message, student.phone);
  };
  
  const handleSendReceipt = (tx: Transaction) => {
    const message = generateReceiptMessage(
      student.name,
      student.parentName,
      tx.amount,
      tx.feeMonth || '',
      tx.dateStr,
      tx.paymentMethod
    );
    openMessageModal(message, student.phone);
  };
  
  const handleEdit = () => {
    setEditingStudent(student);
    setActiveTab('students');
    onClose();
  };
  
  const handleQuickPay = () => {
    // Navigate to add transaction with pre-filled data
    setActiveTab('add');
    onClose();
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
      case 'Advance':
        return 'bg-success/10 text-success border-success/20';
      case 'Due':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'Overdue':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };
  
  return (
    <Dialog open={!!student} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto glass">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-white font-bold text-xl">
              {student.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-lg font-bold">{student.name}</h3>
              <p className="text-sm text-muted-foreground font-normal">
                {student.std} • {student.board} • {student.medium}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 pt-4">
          {/* Status & Quick Actions */}
          <div className="flex flex-wrap gap-3">
            <Badge className={cn('px-4 py-2', getStatusColor(financials.status))}>
              {financials.status}
            </Badge>
            
            <div className="flex gap-2 ml-auto">
              <Button variant="outline" size="sm" onClick={handleEdit}>
                <Icons.Pencil className="w-4 h-4 mr-1" />
                Edit
              </Button>
              {financials.pending > 0 && (
                <Button 
                  size="sm" 
                  className="bg-success hover:bg-success/90"
                  onClick={handleSendReminder}
                >
                  <Icons.MessageCircle className="w-4 h-4 mr-1" />
                  Send Reminder
                </Button>
              )}
            </div>
          </div>
          
          {/* Financial Summary */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-card rounded-xl p-4 border border-border">
              <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Monthly Fee</p>
              <p className="text-2xl font-bold text-foreground">
                ₹{student.monthlyFee.toLocaleString('en-IN')}
              </p>
            </div>
            
            <div className="bg-success/5 rounded-xl p-4 border border-success/20">
              <p className="text-xs text-success uppercase font-bold mb-1">Total Paid</p>
              <p className="text-2xl font-bold text-success">
                ₹{financials.paid.toLocaleString('en-IN')}
              </p>
            </div>
            
            <div className={cn(
              'rounded-xl p-4 border',
              financials.pending > 0 
                ? 'bg-destructive/5 border-destructive/20' 
                : 'bg-card border-border'
            )}>
              <p className={cn(
                'text-xs uppercase font-bold mb-1',
                financials.pending > 0 ? 'text-destructive' : 'text-muted-foreground'
              )}>
                Pending
              </p>
              <p className={cn(
                'text-2xl font-bold',
                financials.pending > 0 ? 'text-destructive' : 'text-foreground'
              )}>
                ₹{financials.pending.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
          
          {/* Missing Months */}
          {financials.missingMonths.length > 0 && (
            <div className="bg-destructive/5 rounded-xl p-4 border border-destructive/20">
              <p className="text-xs text-destructive uppercase font-bold mb-2">
                Pending Months ({financials.missingMonths.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {financials.missingMonths.map(month => (
                  <Badge key={month} variant="outline" className="border-destructive/30 text-destructive">
                    {month}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* Contact Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border">
              <div className="p-2 rounded-lg bg-primary/10">
                <Icons.User className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Parent</p>
                <p className="font-medium">{student.parentName || 'Not specified'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border">
              <div className="p-2 rounded-lg bg-success/10">
                <Icons.Phone className="w-4 h-4 text-success" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">WhatsApp</p>
                <p className="font-medium">{student.phone || 'Not specified'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border col-span-2">
              <div className="p-2 rounded-lg bg-warning/10">
                <Icons.School className="w-4 h-4 text-warning" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">School</p>
                <p className="font-medium">{student.school || 'Not specified'}</p>
              </div>
            </div>
          </div>
          
          {/* Payment History */}
          <div>
            <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
              <Icons.History className="w-4 h-4" />
              Payment History
            </h4>
            
            {studentTransactions.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-6">
                No payments recorded yet
              </p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {studentTransactions.map(tx => (
                  <div 
                    key={tx.id}
                    className="flex items-center justify-between p-3 bg-card rounded-xl border border-border hover:bg-accent/50 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-sm">{tx.feeMonth || 'Fee Payment'}</p>
                      <p className="text-xs text-muted-foreground">{tx.dateStr} • {tx.paymentMethod}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-success">
                        ₹{tx.amount.toLocaleString('en-IN')}
                      </p>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8 text-success hover:text-success"
                        onClick={() => handleSendReceipt(tx)}
                      >
                        <Icons.MessageCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
