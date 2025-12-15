export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface Service {
  id: string;
  name: string;
  rate: number;
}

export interface InvoiceItem {
  id: string;
  serviceId: string;
  description: string; // Can be service name or custom
  qty: number;
  rate: number;
  total: number;
}

export type InvoiceStatus = 'DRAFT' | 'UNPAID' | 'PAID';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string; // Snapshot in case client is deleted
  clientAddress: string; // Snapshot
  date: string; // ISO date string
  dueDate: string; // ISO date string
  items: InvoiceItem[];
  subtotal: number;
  status: InvoiceStatus;
}
