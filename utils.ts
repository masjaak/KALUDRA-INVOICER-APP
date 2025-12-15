import { Invoice } from './types';

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * Generates invoice number in format KLD/YY/MM/XXX
 * e.g., KLD/24/11/001
 */
export const generateInvoiceNumber = (existingInvoices: Invoice[]): string => {
  const now = new Date();
  const yearShort = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const prefix = `KLD/${yearShort}/${month}/`;

  // Filter invoices that match the current month/year prefix
  const monthlyInvoices = existingInvoices.filter(inv => 
    inv.invoiceNumber.startsWith(prefix)
  );

  let sequence = 1;
  if (monthlyInvoices.length > 0) {
    // Extract the sequence number from existing invoices
    const sequences = monthlyInvoices.map(inv => {
      const parts = inv.invoiceNumber.split('/');
      return parseInt(parts[3] || '0', 10);
    });
    sequence = Math.max(...sequences) + 1;
  }

  return `${prefix}${sequence.toString().padStart(3, '0')}`;
};

export const calculateTotal = (items: { total: number }[]): number => {
  return items.reduce((sum, item) => sum + item.total, 0);
};
