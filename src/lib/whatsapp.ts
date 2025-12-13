export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '');
  
  // Add India country code if not present
  if (cleaned.length === 10) {
    cleaned = '91' + cleaned;
  }
  
  return cleaned;
}

export function openWhatsApp(phone: string, message: string): boolean {
  const formattedPhone = formatPhoneNumber(phone);
  
  if (formattedPhone.length < 10) {
    return false;
  }
  
  const encodedMessage = encodeURIComponent(message);
  
  // Use api.whatsapp.com for better compatibility
  const whatsappUrl = `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodedMessage}`;
  
  // Try to open in a new window
  const newWindow = window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  
  // Fallback: create a link and click it
  if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
    const link = document.createElement('a');
    link.href = whatsappUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => document.body.removeChild(link), 100);
  }
  
  return true;
}

export function generateReminderMessage(
  template: string,
  parentName: string,
  studentName: string,
  pendingAmount: number,
  missingMonths: string[]
): string {
  const monthsText = missingMonths.length > 0 ? missingMonths.join(', ') : 'N/A';
  
  return template
    .replace('{parent}', parentName || 'Parent')
    .replace('{name}', studentName)
    .replace('{amount}', pendingAmount.toLocaleString('en-IN'))
    .replace('{months}', monthsText);
}

export function generateReceiptMessage(
  studentName: string,
  parentName: string,
  amount: number,
  feeMonth: string,
  date: string,
  paymentMethod: string
): string {
  return `*Payment Receipt - Nurani Coaching Classes*

Student: ${studentName}
Parent: ${parentName || 'Parent'}
Amount: ₹${amount.toLocaleString('en-IN')}
Month: ${feeMonth || 'N/A'}
Date: ${date}
Method: ${paymentMethod}

Thank you!`;
}
