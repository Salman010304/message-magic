import { useMemo } from 'react';
import { Student, Transaction, StudentFinancials } from '@/types';
import { MONTHS } from '@/lib/constants';

export function useStudentFinancials(
  student: Student | null,
  transactions: Transaction[]
): StudentFinancials {
  return useMemo(() => {
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

      const expectedMonths: string[] = [];
      const current = new Date(join);
      current.setDate(1);
      let safetyCounter = 0;

      while (current <= endDate && safetyCounter < 60) {
        expectedMonths.push(MONTHS[current.getMonth()]);
        current.setMonth(current.getMonth() + 1);
        safetyCounter++;
      }

      const paidTx = transactions.filter(
        t => t.studentName === student.name && t.category === 'Tuition Fees' && t.type === 'income'
      );

      const totalPaid = paidTx.reduce((sum, t) => sum + (t.amount || 0), 0);
      const missingMonths = expectedMonths.filter(m => !paidTx.some(t => t.feeMonth === m));
      const totalExpectedAmount = expectedMonths.length * (student.monthlyFee || 0);
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

    const expectedMonths: string[] = [];
    const current = new Date(join);
    current.setDate(1);
    let safetyCounter = 0;

    while (current <= endDate && safetyCounter < 60) {
      expectedMonths.push(MONTHS[current.getMonth()]);
      current.setMonth(current.getMonth() + 1);
      safetyCounter++;
    }

    const paidTx = transactions.filter(
      t => t.studentName === student.name && t.category === 'Tuition Fees' && t.type === 'income'
    );

    const totalPaid = paidTx.reduce((sum, t) => sum + (t.amount || 0), 0);
    const missingMonths = expectedMonths.filter(m => !paidTx.some(t => t.feeMonth === m));
    const totalExpectedAmount = expectedMonths.length * (student.monthlyFee || 0);
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
