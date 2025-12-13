import { ExpenseCategory } from "@/types";

export const ACCOUNTS = ['Cash', 'HDFC Bank', 'SBI Bank', 'HDFC Credit', 'AU Credit'];

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const STANDARDS = [
  'Nursery', 'Jr.KG', 'Sr.KG', '1st', '2nd', '3rd', '4th', '5th',
  '6th', '7th', '8th', '9th', '10th', '11th', '12th', 'College', 'Other'
];

export const MEDIUMS = ['English', 'Gujarati'];

export const BOARDS = ['GSEB', 'CBSE', 'ICSE', 'IB', 'Other'];

export const DEFAULT_CATEGORIES: ExpenseCategory[] = [
  { name: 'Rent', icon: '🏠' },
  { name: 'Electricity', icon: '⚡' },
  { name: 'Internet', icon: '🌐' },
  { name: 'Snacks/Tea', icon: '☕' },
  { name: 'Stationery', icon: '✏️' },
  { name: 'Travelling', icon: '🚲' },
  { name: 'Routine Exp', icon: '🔄' },
  { name: 'Family Exp', icon: '👨‍👩‍👧' },
  { name: 'Loan/EMI', icon: '🏦' },
  { name: 'Credit Card', icon: '💳' }
];

export const DEFAULT_REMINDER_MSG = `સલામ/નમસ્તે {parent},

નુરાની કોચિંગ ક્લાસીસ તરફથી રિમાઇન્ડર:

વિદ્યાર્થીનું નામ: {name}
બાકી ફી: ₹{amount}
બાકી મહિના: {months}

કૃપા કરીને ફી જમા કરાવવા વિનંતી.
આભાર.`;
