import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Package, 
  Plus, 
  Trash2, 
  Printer, 
  Save, 
  ChevronRight,
  Menu,
  X,
  CreditCard,
  CheckCircle,
  Clock,
  Search,
  Filter,
  Eye,
  ArrowLeft,
  LogOut
} from 'lucide-react';
import { Client, Service, Invoice, InvoiceItem, InvoiceStatus } from './types';
import { generateId, formatCurrency, formatDate, generateInvoiceNumber, calculateTotal } from './utils';
import { INITIAL_CLIENTS, INITIAL_SERVICES } from './constants';

// --- Shared Components ---

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' | 'ghost' }> = ({ 
  className = '', 
  variant = 'primary', 
  children, 
  ...props 
}) => {
  const baseStyles = "px-4 py-2 font-medium transition-all duration-200 rounded-sm flex items-center justify-center gap-2 text-sm whitespace-nowrap";
  const variants = {
    primary: "bg-black text-white hover:bg-gray-800 border border-black",
    secondary: "bg-white text-black border border-black hover:bg-gray-50",
    danger: "bg-red-600 text-white border border-red-600 hover:bg-red-700",
    ghost: "bg-transparent text-black hover:bg-gray-100",
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string; containerClassName?: string }> = ({ 
  label, 
  className = '', 
  containerClassName = '', 
  ...props 
}) => (
  <div className={`flex flex-col gap-1 w-full ${containerClassName}`}>
    {label && <label className="text-xs font-semibold uppercase tracking-wider">{label}</label>}
    <input 
      className={`border border-black px-3 py-2 w-full outline-none focus:ring-1 focus:ring-black rounded-sm bg-white ${className}`} 
      {...props} 
    />
  </div>
);

const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string }> = ({ label, className = '', children, ...props }) => (
  <div className="flex flex-col gap-1 w-full">
    {label && <label className="text-xs font-semibold uppercase tracking-wider">{label}</label>}
    <select 
      className={`border border-black px-3 py-2 w-full outline-none focus:ring-1 focus:ring-black rounded-sm bg-white appearance-none ${className}`} 
      {...props} 
    >
      {children}
    </select>
  </div>
);

const Card: React.FC<{ children: React.ReactNode, title?: string, className?: string }> = ({ children, title, className = '' }) => (
  <div className={`border border-black bg-white p-6 rounded-sm ${className}`}>
    {title && <h3 className="font-bold text-lg mb-4 border-b border-black pb-2">{title}</h3>}
    {children}
  </div>
);

const Badge: React.FC<{ status: InvoiceStatus }> = ({ status }) => {
  const styles = {
    PAID: "bg-black text-white border border-black",
    UNPAID: "bg-white text-black border border-black",
    DRAFT: "bg-gray-200 text-gray-600 border border-gray-300",
  };
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wide ${styles[status]}`}>
      {status}
    </span>
  );
};

// --- Login Component ---
const LoginView: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 'masjaak@gmail.com' && password === 'Xavieryzhaka') {
        onLogin();
    } else {
        setError('Invalid credentials. Please check your email and password.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-poppins text-black animate-in fade-in duration-500">
      <div className="w-full max-w-md bg-white border border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="text-center mb-8">
            <img src="https://i.ibb.co.com/pjhHPZzk/Kaludra-Logo.png" alt="Kaludra" className="h-16 mx-auto mb-6 object-contain grayscale" />
            <h1 className="text-2xl font-bold tracking-widest uppercase">Employee Login</h1>
            <p className="text-xs text-gray-500 mt-2 uppercase tracking-wide">Kaludra Invoicer Dashboard</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
            <Input 
                label="Email Address" 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
                placeholder="Enter your email"
            />
            <Input 
                label="Password" 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
                placeholder="Enter your password"
            />
            {error && (
              <div className="bg-red-50 border border-red-500 text-red-600 p-3 text-sm font-medium flex items-center gap-2">
                 <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                 {error}
              </div>
            )}
            <Button type="submit" className="w-full py-3 text-base">Sign In to Dashboard</Button>
        </form>
      </div>
    </div>
  );
}

// --- Reusable Invoice Paper Component ---
const InvoicePaper: React.FC<{ 
  invoice: Partial<Invoice>, 
  client: Partial<Client> | undefined, 
  total: number 
}> = ({ invoice, client, total }) => {
  return (
    <div className="bg-white w-full max-w-[210mm] min-h-[297mm] p-[1.6cm] shadow-xl border border-gray-200 print:shadow-none print:border-none print:m-0 flex flex-col justify-between text-black print:w-full">
      {/* INVOICE CONTENT */}
      <div>
        {/* Header */}
        <div className="flex flex-col items-center justify-center mb-12 text-center border-b-2 border-black pb-6">
          <img 
            src="https://i.ibb.co.com/pjhHPZzk/Kaludra-Logo.png" 
            alt="Company Logo" 
            className="h-16 object-contain grayscale"
          />
        </div>

        {/* Meta & Info */}
        <div className="flex justify-between items-start mb-12">
          <div className="text-sm space-y-1">
            <p className="font-bold text-lg mb-2">FROM:</p>
            <p className="font-semibold">Reza Pahlevi Creative</p>
            <p>Semarang, Indonesia</p>
            <p>rezapahlevi@kaludra.com</p>
          </div>
          <div className="text-right text-sm space-y-1">
            <p className="font-bold text-lg mb-2">INVOICE</p>
            <p><span className="text-gray-500 mr-2">NO:</span> <span className="font-mono font-bold">{invoice.invoiceNumber}</span></p>
            <p><span className="text-gray-500 mr-2">DATE:</span> {invoice.date ? formatDate(invoice.date) : '-'}</p>
            <p><span className="text-gray-500 mr-2">DUE:</span> {invoice.dueDate ? formatDate(invoice.dueDate) : '-'}</p>
          </div>
        </div>

        {/* Bill To */}
        <div className="mb-12">
            <p className="font-bold text-lg mb-2 border-b border-black inline-block pb-1">BILL TO:</p>
            {client ? (
              <div className="mt-2 text-sm">
                <p className="font-bold text-base">{client.name}</p>
                <p className="w-1/2 text-gray-700 mt-1 whitespace-pre-wrap">{client.address}</p>
                <p className="mt-1">{client.email}</p>
              </div>
            ) : (
              <p className="text-gray-400 italic mt-2">Select a client...</p>
            )}
        </div>

        {/* Table */}
        <div className="mb-8">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-black">
                <th className="py-2 text-left w-1/2">DESCRIPTION</th>
                <th className="py-2 text-center">QTY</th>
                <th className="py-2 text-right">RATE</th>
                <th className="py-2 text-right">AMOUNT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {(invoice.items || []).map((item, i) => (
                <tr key={i}>
                  <td className="py-4 pr-4">
                    <p className="font-medium">{item.description || 'Item'}</p>
                  </td>
                  <td className="py-4 text-center">{item.qty}</td>
                  <td className="py-4 text-right font-mono">{formatCurrency(item.rate)}</td>
                  <td className="py-4 text-right font-mono font-bold">{formatCurrency(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Total */}
        <div className="flex justify-end mb-12">
          <div className="w-1/2 border-t-2 border-black pt-4">
            <div className="flex justify-between items-center text-xl font-bold">
              <span>TOTAL</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer / Bank Info */}
      <div className="mt-auto pt-8 border-t border-black print-break-inside">
        <div className="flex flex-col md:flex-row justify-between items-end">
          <div className="text-sm">
            <p className="font-bold mb-2 uppercase">Payment Method</p>
            <p className="font-semibold">Bank Permata</p>
            <p>Acc: <span className="font-mono">4206671993</span></p>
            <p>Holder: Muhammad Reza Pahlevi</p>
          </div>
          <div className="text-right mt-4 md:mt-0">
            <p className="font-dancing text-2xl mb-2 font-bold tracking-wider">KALUDRA CREATIVE.</p>
            <p className="text-xs text-gray-500 uppercase">Thank you for your business</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main App Component ---

const App: React.FC = () => {
  // --- State ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [view, setView] = useState<'dashboard' | 'create-invoice' | 'view-invoice' | 'clients' | 'services'>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  
  // Editor State
  const [activeInvoice, setActiveInvoice] = useState<Partial<Invoice> | null>(null);

  // --- Effects (Data Persistence) ---
  useEffect(() => {
    // Check Auth
    const auth = localStorage.getItem('kaludra_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }

    const storedClients = localStorage.getItem('kaludra_clients');
    const storedServices = localStorage.getItem('kaludra_services');
    const storedInvoices = localStorage.getItem('kaludra_invoices');

    if (storedClients) setClients(JSON.parse(storedClients));
    else {
      setClients(INITIAL_CLIENTS);
      localStorage.setItem('kaludra_clients', JSON.stringify(INITIAL_CLIENTS));
    }

    if (storedServices) setServices(JSON.parse(storedServices));
    else {
      setServices(INITIAL_SERVICES);
      localStorage.setItem('kaludra_services', JSON.stringify(INITIAL_SERVICES));
    }

    if (storedInvoices) setInvoices(JSON.parse(storedInvoices));
  }, []);

  useEffect(() => {
    if (invoices.length > 0) localStorage.setItem('kaludra_invoices', JSON.stringify(invoices));
  }, [invoices]);

  // --- Auth Actions ---

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('kaludra_auth', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('kaludra_auth');
    setView('dashboard'); // Reset view
  };

  // --- Actions ---

  const handleCreateNewInvoice = () => {
    const newNumber = generateInvoiceNumber(invoices);
    setActiveInvoice({
      id: generateId(),
      invoiceNumber: newNumber,
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items: [],
      status: 'DRAFT',
      subtotal: 0
    });
    setView('create-invoice');
  };

  const handleSaveInvoice = () => {
    if (!activeInvoice || !activeInvoice.clientId || !activeInvoice.items?.length) {
      alert("Please select a client and add at least one item.");
      return;
    }

    const client = clients.find(c => c.id === activeInvoice.clientId);
    const invoiceToSave: Invoice = {
      ...activeInvoice as Invoice,
      clientName: client?.name || 'Unknown',
      clientAddress: client?.address || '',
      subtotal: calculateTotal(activeInvoice.items || []),
    };

    const exists = invoices.findIndex(inv => inv.id === invoiceToSave.id);
    if (exists >= 0) {
      const updated = [...invoices];
      updated[exists] = invoiceToSave;
      setInvoices(updated);
    } else {
      setInvoices([...invoices, invoiceToSave]);
    }
    setView('view-invoice'); // Go to view mode after save
  };

  const handleDeleteInvoice = (id: string) => {
    if (confirm('Are you sure you want to delete this invoice?')) {
      const updated = invoices.filter(i => i.id !== id);
      setInvoices(updated);
      if (updated.length === 0) localStorage.setItem('kaludra_invoices', JSON.stringify([]));
      if (activeInvoice?.id === id) setView('dashboard');
    }
  };

  const toggleInvoiceStatus = (invoice: Invoice) => {
    const nextStatus: Record<InvoiceStatus, InvoiceStatus> = {
      'DRAFT': 'UNPAID',
      'UNPAID': 'PAID',
      'PAID': 'UNPAID'
    };
    const updated = invoices.map(inv => 
      inv.id === invoice.id ? { ...inv, status: nextStatus[inv.status] } : inv
    );
    setInvoices(updated);
  };

  // --- Views ---

  const DashboardView = () => {
    const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'ALL'>('ALL');
    const [clientSearch, setClientSearch] = useState('');
    const [dateStart, setDateStart] = useState('');
    const [dateEnd, setDateEnd] = useState('');

    const stats = useMemo(() => {
      const totalRevenue = invoices
        .filter(i => i.status === 'PAID')
        .reduce((sum, i) => sum + i.subtotal, 0);
      const pending = invoices
        .filter(i => i.status === 'UNPAID')
        .reduce((sum, i) => sum + i.subtotal, 0);
      const sentCount = invoices.filter(i => i.status !== 'DRAFT').length;
      return { totalRevenue, pending, sentCount };
    }, [invoices]);

    const filteredInvoices = useMemo(() => {
      return invoices.filter(inv => {
        const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;
        const matchesClient = inv.clientName.toLowerCase().includes(clientSearch.toLowerCase());
        
        let matchesDate = true;
        if (dateStart) matchesDate = matchesDate && inv.date >= dateStart;
        if (dateEnd) matchesDate = matchesDate && inv.date <= dateEnd;

        return matchesStatus && matchesClient && matchesDate;
      }).reverse(); // Most recent first
    }, [invoices, statusFilter, clientSearch, dateStart, dateEnd]);

    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold">Dashboard</h2>
            <p className="text-gray-500">Welcome back, Reza.</p>
          </div>
          <Button onClick={handleCreateNewInvoice}>
            <Plus size={18} /> New Invoice
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-black text-white">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm opacity-70 mb-1">Total Revenue</p>
                <h3 className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</h3>
              </div>
              <CheckCircle className="opacity-50" />
            </div>
          </Card>
          <Card>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 mb-1">Pending Payments</p>
                <h3 className="text-2xl font-bold">{formatCurrency(stats.pending)}</h3>
              </div>
              <Clock className="text-gray-400" />
            </div>
          </Card>
          <Card>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 mb-1">Invoices Sent</p>
                <h3 className="text-2xl font-bold">{stats.sentCount}</h3>
              </div>
              <FileText className="text-gray-400" />
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-2">
            <Filter size={16} />
            <span className="text-sm font-bold uppercase tracking-wider">Filters</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-50 p-4 border border-black rounded-sm">
             <Select 
               value={statusFilter} 
               onChange={(e) => setStatusFilter(e.target.value as any)}
               label="Status"
             >
               <option value="ALL">All Statuses</option>
               <option value="DRAFT">Draft</option>
               <option value="UNPAID">Unpaid</option>
               <option value="PAID">Paid</option>
             </Select>
             <Input 
               placeholder="Search Client..." 
               value={clientSearch} 
               onChange={(e) => setClientSearch(e.target.value)}
               label="Client Name"
             />
             <Input 
               type="date" 
               value={dateStart} 
               onChange={(e) => setDateStart(e.target.value)}
               label="From Date"
             />
             <Input 
               type="date" 
               value={dateEnd} 
               onChange={(e) => setDateEnd(e.target.value)}
               label="To Date"
             />
          </div>
        </div>

        <Card title="Recent Invoices" className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-100 border-b border-black text-xs uppercase font-bold">
                <tr>
                  <th className="px-6 py-3">Invoice #</th>
                  <th className="px-6 py-3">Client</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No invoices found matching criteria.</td>
                  </tr>
                ) : (
                  filteredInvoices.map(inv => (
                    <tr key={inv.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium">{inv.invoiceNumber}</td>
                      <td className="px-6 py-4">{inv.clientName}</td>
                      <td className="px-6 py-4">{formatDate(inv.date)}</td>
                      <td className="px-6 py-4 font-mono">{formatCurrency(inv.subtotal)}</td>
                      <td className="px-6 py-4">
                        <button onClick={() => toggleInvoiceStatus(inv)}>
                          <Badge status={inv.status} />
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                           <button 
                            onClick={() => { setActiveInvoice(inv); setView('view-invoice'); }}
                            className="text-black hover:bg-gray-200 p-1 rounded-sm"
                            title="View Invoice"
                          >
                            <Eye size={16} />
                          </button>
                          <button 
                            onClick={() => { setActiveInvoice(inv); setView('create-invoice'); }}
                            className="text-blue-600 hover:bg-blue-100 p-1 rounded-sm"
                            title="Edit Invoice"
                          >
                            <FileText size={16} />
                          </button>
                          <button 
                             onClick={() => handleDeleteInvoice(inv.id)}
                             className="text-red-600 hover:bg-red-100 p-1 rounded-sm"
                             title="Delete Invoice"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  };

  const EditorView = () => {
    if (!activeInvoice) return null;

    const addItem = () => {
      const newItem: InvoiceItem = {
        id: generateId(),
        serviceId: '',
        description: '',
        qty: 1,
        rate: 0,
        total: 0
      };
      setActiveInvoice({
        ...activeInvoice,
        items: [...(activeInvoice.items || []), newItem]
      });
    };

    const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
      const updatedItems = activeInvoice.items?.map(item => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          
          // Auto-fill details if service changes
          if (field === 'serviceId') {
            const service = services.find(s => s.id === value);
            if (service) {
              updated.description = service.name; // Auto-fill description
              updated.rate = service.rate;       // Auto-fill rate
            }
          }

          // Recalculate total
          if (field === 'qty' || field === 'rate' || field === 'serviceId') {
            updated.total = updated.qty * updated.rate;
          }
          return updated;
        }
        return item;
      });
      setActiveInvoice({ ...activeInvoice, items: updatedItems });
    };

    const removeItem = (id: string) => {
      setActiveInvoice({
        ...activeInvoice,
        items: activeInvoice.items?.filter(i => i.id !== id)
      });
    };

    const selectedClient = clients.find(c => c.id === activeInvoice.clientId);
    const invoiceTotal = calculateTotal(activeInvoice.items || []);

    return (
      <div className="flex flex-col xl:flex-row h-full gap-6 animate-in slide-in-from-right duration-300">
        
        {/* LEFT PANEL - CONTROLS */}
        <div className="w-full xl:w-1/3 flex flex-col gap-6 no-print overflow-y-auto pb-20">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Edit Invoice</h2>
            <Button variant="secondary" onClick={() => setView('dashboard')}>Close</Button>
          </div>

          <Card title="Details">
            <div className="grid grid-cols-1 gap-4">
              <Select 
                label="Client" 
                value={activeInvoice.clientId || ''} 
                onChange={e => setActiveInvoice({...activeInvoice, clientId: e.target.value})}
              >
                <option value="">Select Client...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
              
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  type="date" 
                  label="Invoice Date" 
                  value={activeInvoice.date} 
                  onChange={e => setActiveInvoice({...activeInvoice, date: e.target.value})}
                />
                 <Input 
                  type="date" 
                  label="Due Date" 
                  value={activeInvoice.dueDate} 
                  onChange={e => setActiveInvoice({...activeInvoice, dueDate: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input label="Invoice #" value={activeInvoice.invoiceNumber} disabled className="bg-gray-100 cursor-not-allowed"/>
                <Select 
                  label="Status" 
                  value={activeInvoice.status} 
                  onChange={e => setActiveInvoice({...activeInvoice, status: e.target.value as InvoiceStatus})}
                >
                  <option value="DRAFT">Draft</option>
                  <option value="UNPAID">Unpaid</option>
                  <option value="PAID">Paid</option>
                </Select>
              </div>
            </div>
          </Card>

          <Card title="Items" className="flex-1">
            <div className="space-y-4">
              {activeInvoice.items?.map((item, idx) => (
                <div key={item.id} className="p-4 border border-gray-200 relative group bg-gray-50 rounded-sm shadow-sm">
                   <button 
                    onClick={() => removeItem(item.id)} 
                    className="absolute top-2 right-2 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                  >
                    <X size={16} />
                  </button>

                  <div className="space-y-3">
                    <div className="pb-3 border-b border-gray-200">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1 block">Quick Fill from Service</label>
                      <Select 
                        className="text-sm bg-white"
                        value={item.serviceId} 
                        onChange={e => updateItem(item.id, 'serviceId', e.target.value)}
                      >
                        <option value="">Select a service...</option>
                        {services.map(s => <option key={s.id} value={s.id}>{s.name} ({formatCurrency(s.rate)})</option>)}
                      </Select>
                    </div>

                    <div>
                      <Input 
                        className="text-sm font-medium"
                        placeholder="Description (Custom or Auto-filled)"
                        label="Description"
                        value={item.description} 
                        onChange={e => updateItem(item.id, 'description', e.target.value)}
                      />
                    </div>
                  
                    <div className="grid grid-cols-3 gap-2">
                      <Input 
                        type="number" 
                        label="Qty"
                        className="text-sm"
                        value={item.qty} 
                        onChange={e => updateItem(item.id, 'qty', Number(e.target.value))}
                      />
                      <Input 
                        type="number" 
                        label="Rate"
                        className="text-sm"
                        value={item.rate} 
                        onChange={e => updateItem(item.id, 'rate', Number(e.target.value))}
                      />
                      <div className="flex flex-col gap-1 w-full">
                        <label className="text-xs font-semibold uppercase tracking-wider text-right">Total</label>
                        <div className="h-[42px] flex items-center justify-end text-sm font-bold font-mono bg-gray-100 px-3 border border-transparent">
                          {formatCurrency(item.total)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              <Button onClick={addItem} variant="secondary" className="w-full border-dashed py-3">
                <Plus size={16} /> Add Item
              </Button>
            </div>
          </Card>

          <div className="sticky bottom-0 bg-white pt-4 border-t border-black grid grid-cols-2 gap-4">
             <Button variant="secondary" onClick={() => window.print()}>
               <Printer size={16} /> Print / PDF
             </Button>
             <Button onClick={handleSaveInvoice}>
               <Save size={16} /> Save & View
             </Button>
          </div>
        </div>

        {/* RIGHT PANEL - PREVIEW */}
        <div className="w-full xl:w-2/3 bg-gray-100 p-4 md:p-8 overflow-y-auto no-scrollbar flex justify-center print:p-0 print:bg-white print:w-full print:block print:h-auto print:overflow-visible">
          {/* Reuse Invoice Paper */}
          <InvoicePaper invoice={activeInvoice} client={selectedClient} total={invoiceTotal} />
        </div>
      </div>
    );
  };

  const ViewInvoice = () => {
    if (!activeInvoice) return null;
    const selectedClient = clients.find(c => c.id === activeInvoice.clientId) || { 
      name: activeInvoice.clientName || 'Unknown', 
      address: activeInvoice.clientAddress || '',
      email: ''
    };
    const invoiceTotal = calculateTotal(activeInvoice.items || []);

    return (
      <div className="flex flex-col h-full animate-in fade-in duration-300">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 no-print">
            <div className="flex items-center gap-4 w-full md:w-auto">
                <Button variant="ghost" onClick={() => setView('dashboard')}>
                    <ArrowLeft size={18} /> Back
                </Button>
                <h2 className="text-2xl font-bold">Invoice #{activeInvoice.invoiceNumber}</h2>
                <Badge status={activeInvoice.status || 'DRAFT'} />
            </div>
            <div className="flex gap-2 w-full md:w-auto justify-end">
                <Button variant="secondary" onClick={() => setView('create-invoice')}>
                    <FileText size={16} /> Edit
                </Button>
                <Button onClick={() => window.print()}>
                    <Printer size={16} /> Print / PDF
                </Button>
            </div>
        </div>

        {/* Invoice Paper (Centered) */}
        <div className="flex-1 overflow-auto flex justify-center bg-gray-100 p-8 print:p-0 print:bg-white print:block print:h-auto print:overflow-visible">
             <InvoicePaper invoice={activeInvoice} client={selectedClient} total={invoiceTotal} />
        </div>
      </div>
    );
  }

  const ClientsView = () => {
    const [newClient, setNewClient] = useState<Partial<Client>>({});
    const [isAdding, setIsAdding] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const handleAddClient = () => {
      if(!newClient.name) {
        alert("Please enter a client name.");
        return;
      }
      const client: Client = {
        id: generateId(),
        name: newClient.name,
        email: newClient.email || '',
        phone: newClient.phone || '',
        address: newClient.address || ''
      };
      const updatedClients = [...clients, client];
      setClients(updatedClients);
      localStorage.setItem('kaludra_clients', JSON.stringify(updatedClients));
      setIsAdding(false);
      setNewClient({});
      alert("Client Saved!");
    };

    const handleDeleteClient = (id: string) => {
      if(confirm("Delete client?")) {
        const updated = clients.filter(c => c.id !== id);
        setClients(updated);
        localStorage.setItem('kaludra_clients', JSON.stringify(updated));
      }
    };

    const filteredClients = clients.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.address.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold">Clients</h2>
          <Button onClick={() => setIsAdding(!isAdding)}>{isAdding ? 'Cancel' : 'Add Client'}</Button>
        </div>

        {isAdding && (
          <Card className="bg-gray-50">
            <h4 className="font-bold mb-4">New Client Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Input label="Name" value={newClient.name || ''} onChange={e => setNewClient({...newClient, name: e.target.value})} />
              <Input label="Email" value={newClient.email || ''} onChange={e => setNewClient({...newClient, email: e.target.value})} />
              <Input label="Phone" value={newClient.phone || ''} onChange={e => setNewClient({...newClient, phone: e.target.value})} />
              <Input label="Address" value={newClient.address || ''} onChange={e => setNewClient({...newClient, address: e.target.value})} />
            </div>
            <Button onClick={handleAddClient} className="w-full">Save Client</Button>
          </Card>
        )}

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input 
            className="pl-10" 
            placeholder="Search clients by name, email, or address..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map(client => (
            <Card key={client.id} className="hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg">{client.name}</h3>
                <Users size={16} className="text-gray-400"/>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <p>{client.email || 'No email'}</p>
                <p>{client.phone || 'No phone'}</p>
                <p className="truncate">{client.address || 'No address'}</p>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                <Button 
                  variant="danger"
                  className="px-3 py-1 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClient(client.id);
                  }}
                >
                  <Trash2 size={12} /> DELETE
                </Button>
              </div>
            </Card>
          ))}
          {filteredClients.length === 0 && (
            <div className="col-span-3 text-center py-10 text-gray-500 italic">No clients found.</div>
          )}
        </div>
      </div>
    );
  };

  const ServicesView = () => {
    const [serviceName, setServiceName] = useState('');
    const [serviceRate, setServiceRate] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    
    const handleAddService = () => {
      if(!serviceName.trim() || !serviceRate) {
        alert("Please enter a service name and rate.");
        return;
      }
      
      const newService: Service = {
        id: Date.now().toString(),
        name: serviceName,
        rate: Number(serviceRate)
      };
      
      const updatedServices = [...services, newService];
      setServices(updatedServices);
      localStorage.setItem('kaludra_services', JSON.stringify(updatedServices));
      
      setServiceName('');
      setServiceRate('');
      alert("Service Added!");
    };
    
    const handleDeleteService = (id: string) => {
        const updated = services.filter(s => s.id !== id);
        setServices(updated);
        localStorage.setItem('kaludra_services', JSON.stringify(updated));
    };

    const filteredServices = services.filter(s => 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.rate.toString().includes(searchTerm)
    );

    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <h2 className="text-3xl font-bold">Services</h2>
        
        <Card className="bg-gray-50">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <Input 
                containerClassName="flex-1"
                label="Service Name" 
                value={serviceName} 
                onChange={e => setServiceName(e.target.value)} 
                placeholder="e.g. Web Design"
            />
            <Input 
                containerClassName="w-full md:w-48"
                type="number" 
                label="Rate (IDR)" 
                value={serviceRate} 
                onChange={e => setServiceRate(e.target.value)} 
                placeholder="0"
            />
            <Button onClick={handleAddService} type="button" className="h-[44px]">Add Service</Button>
          </div>
        </Card>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input 
            className="pl-10" 
            placeholder="Search services..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="border border-black rounded-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-black text-white">
              <tr>
                <th className="p-4">Service Name</th>
                <th className="p-4 text-right">Rate</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredServices.map(s => (
                <tr key={s.id} className="bg-white hover:bg-gray-50">
                  <td className="p-4 font-medium">{s.name}</td>
                  <td className="p-4 text-right font-mono">{formatCurrency(s.rate)}</td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => handleDeleteService(s.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredServices.length === 0 && (
                 <tr><td colSpan={3} className="p-8 text-center text-gray-500">No services found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // --- Render Authentication Check ---
  
  if (!isAuthenticated) {
    return <LoginView onLogin={handleLogin} />;
  }

  // --- Layout Render ---

  return (
    <div className="min-h-screen bg-white text-black font-poppins flex flex-col md:flex-row print:block print:h-auto print:overflow-visible">
      
      {/* Mobile Header */}
      <div className="md:hidden flex justify-between items-center p-4 border-b border-black bg-white sticky top-0 z-20 no-print">
        {/* <span className="font-bold text-xl tracking-widest">KALUDRA.</span> */}
        <img src="https://i.ibb.co.com/gLBj7Bwn/Kaludra-Logoo.png" alt="Kaludra" className="h-8 object-contain" />
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-10 w-64 bg-white border-r border-black transform transition-transform duration-200 ease-in-out
        md:relative md:translate-x-0 no-print
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-8 border-b border-black">
          {/* <h1 className="text-2xl font-bold tracking-[0.2em]">KALUDRA</h1> */}
          <img src="https://i.ibb.co.com/gLBj7Bwn/Kaludra-Logoo.png" alt="Kaludra" className="h-10 object-contain mb-2" />
          <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">Invoicer App</p>
        </div>

        <nav className="p-4 space-y-2">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'create-invoice', label: 'New Invoice', icon: Plus }, // Shortcut
            { id: 'clients', label: 'Clients', icon: Users },
            { id: 'services', label: 'Services', icon: Package },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'create-invoice') handleCreateNewInvoice();
                else setView(item.id as any);
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors rounded-sm ${
                view === item.id 
                  ? 'bg-black text-white' 
                  : 'text-gray-600 hover:bg-gray-100 hover:text-black'
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-black bg-gray-50">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white font-bold text-xs">RP</div>
                <div>
                  <p className="text-sm font-bold">Reza Pahlevi</p>
                  <p className="text-xs text-gray-500">Admin</p>
                </div>
            </div>
          </div>
          <Button variant="ghost" onClick={handleLogout} className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700 px-0">
               <LogOut size={16} className="ml-2" /> Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto bg-white relative h-screen print:h-auto print:overflow-visible print:block">
        <div className="p-4 md:p-8 h-full max-w-7xl mx-auto print:p-0 print:h-auto">
          {view === 'dashboard' && <DashboardView />}
          {view === 'create-invoice' && <EditorView />}
          {view === 'view-invoice' && <ViewInvoice />}
          {view === 'clients' && <ClientsView />}
          {view === 'services' && <ServicesView />}
        </div>
      </main>

    </div>
  );
};

export default App;