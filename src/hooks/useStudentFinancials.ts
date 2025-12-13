import { useMemo } from 'react';
import { Student, Transaction, StudentFinancials } from '@/types';
import { MONTHS } from '@/lib/constants';

// Calculate pro-rata fee for first month
function calculateProRataFee(joinDate: Date, monthlyFee: number): number {
  const daysInMonth = new Date(joinDate.getFullYear(), joinDate.getMonth() + 1, 0).getDate();
  const remainingDays = daysInMonth - joinDate.getDate() + 1;
  return Math.round((monthlyFee * remainingDays) / daysInMonth);
}

export function useStudentFinancials(
  student: Student | null,
  transactions: Transaction[]
): StudentFinancials {
  return useMemo(() => {
    return getStudentFinancials(student, transactions);
  }, [student, transactions]);
}

export function getStudentFinancials(
  student: Student | null,
  transactions: Transaction[]
): StudentFinancials {
  if (!student || !student.joinDate) {
    return { paid: 0, pending: 0, missingMonths: [], status: 'New' };
  }

  try {
    const join = new Date(student.joinDate);
    const today = new Date();

    if (isNaN(join.getTime())) {
      return { paid: 0, pending: 0, missingMonths: [], status: 'Invalid Date' };
    }

    let endDate = today;
    if (student.leaveDate) {
      const leave = new Date(student.leaveDate);
      if (!isNaN(leave.getTime()) && leave < today) {
        endDate = leave;
      }
    }

    const expectedMonths: { month: string; year: number; amount: number }[] = [];
    const current = new Date(join);
    let safetyCounter = 0;
    let isFirstMonth = true;

    while (current <= endDate && safetyCounter < 60) {
      let feeAmount = student.monthlyFee || 0;
      
      // Calculate pro-rata for first month if joined mid-month
      if (isFirstMonth && join.getDate() > 1) {
        feeAmount = calculateProRataFee(join, student.monthlyFee || 0);
        isFirstMonth = false;
      }
      
      expectedMonths.push({
        month: MONTHS[current.getMonth()],
        year: current.getFullYear(),
        amount: feeAmount
      });
      
      current.setMonth(current.getMonth() + 1);
      current.setDate(1);
      safetyCounter++;
    }

    const paidTx = transactions.filter(
      t => t.studentName === student.name && t.category === 'Tuition Fees' && t.type === 'income'
    );

    const totalPaid = paidTx.reduce((sum, t) => sum + (t.amount || 0), 0);
    const missingMonths = expectedMonths
      .filter(m => !paidTx.some(t => t.feeMonth === m.month))
      .map(m => m.month);
    
    const totalExpectedAmount = expectedMonths.reduce((sum, m) => sum + m.amount, 0);
    const pendingAmount = totalExpectedAmount - totalPaid;

    let status: StudentFinancials['status'] = 'Paid';

    if (student.leaveDate && pendingAmount <= 0) {
      status = 'Left (Paid)';
    } else if (pendingAmount > (student.monthlyFee || 0)) {
      status = 'Overdue';
    } else if (pendingAmount > 0) {
      status = 'Due';
    } else if (pendingAmount < 0) {
      status = 'Advance';
    }

    return {
      paid: totalPaid,
      pending: pendingAmount > 0 ? pendingAmount : 0,
      advance: pendingAmount < 0 ? Math.abs(pendingAmount) : 0,
      missingMonths,
      status
    };
  } catch (error) {
    console.error('Error calculating student financials:', error);
    return { paid: 0, pending: 0, missingMonths: [], status: 'Error' };
  }
}
