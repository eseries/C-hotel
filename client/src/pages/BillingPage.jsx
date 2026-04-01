import { useEffect, useState } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  CreditCard,
  DollarSign,
  ArrowUpRight,
  ChevronRight
} from 'lucide-react';
import { createPayment, fetchInvoices, fetchPayments, fetchBillingSummary } from '../api/modulesApi';
import useAuth from '../hooks/useAuth';
import { formatCurrency } from '../utils/currency';
import StatCard from '../components/StatCard';

const BillingPage = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState({ totalReceivables: 0, totalPaid: 0, totalDue: 0 });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [form, setForm] = useState({
    reservationId: '',
    amount: '',
    method: 'CASH'
  });

  const fetchData = async () => {
    if (!user?.hotelId) return;
    try {
      const [invRes, payRes, sumRes] = await Promise.all([
        fetchInvoices(user.hotelId),
        fetchPayments(user.hotelId),
        fetchBillingSummary(user.hotelId)
      ]);
      setInvoices(invRes.data.data || []);
      setPayments(payRes.data.data || []);
      setSummary(sumRes.data.data || { totalReceivables: 0, totalPaid: 0, totalDue: 0 });
    } catch (error) {
      console.error('Error fetching billing data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?.hotelId]);

  const submitPayment = async (event) => {
    event.preventDefault();
    if (!form.reservationId || !form.amount) return;

    try {
      await createPayment({
        hotelId: user.hotelId,
        reservationId: form.reservationId,
        amount: Number(form.amount),
        method: form.method
      });
      setMessage({ type: 'success', text: 'Payment recorded successfully.' });
      setForm({ reservationId: '', amount: '', method: 'CASH' });
      setShowPaymentForm(false);
      await fetchData();
    } catch (error) {
      setMessage({ type: 'error', text: error?.response?.data?.message || 'Unable to record payment.' });
    }
  };

  const filteredInvoices = invoices.filter(inv => 
    inv.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.reservationId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Billing & Payments</h1>
          <p className="text-sm text-slate-500">Manage invoices, track payments, and monitor receivables.</p>
        </div>
        <button 
          onClick={() => setShowPaymentForm(!showPaymentForm)}
          className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 transition-all"
        >
          <Plus className="h-4 w-4" />
          Record Payment
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard 
          title="Total Receivables" 
          value={formatCurrency(summary.totalReceivables)} 
          hint="All time revenue" 
          icon={FileText} 
          color="indigo"
        />
        <StatCard 
          title="Total Paid" 
          value={formatCurrency(summary.totalPaid)} 
          hint="Collected payments" 
          icon={CheckCircle} 
          color="emerald"
        />
        <StatCard 
          title="Outstanding Due" 
          value={formatCurrency(summary.totalDue)} 
          hint="Awaiting collection" 
          icon={Clock} 
          color="rose"
        />
      </div>

      {/* Record Payment Form (Collapsible) */}
      {showPaymentForm && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg animate-in fade-in slide-in-from-top-4 duration-300">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Record New Payment</h2>
          <form onSubmit={submitPayment} className="grid gap-4 md:grid-cols-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase">Reservation</label>
              <select
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition-all"
                value={form.reservationId}
                onChange={(event) => setForm((prev) => ({ ...prev, reservationId: event.target.value }))}
                required
              >
                <option value="">Select Reservation</option>
                {invoices.filter(inv => inv.dueAmount > 0).map((invoice) => (
                  <option key={invoice.reservationId} value={invoice.reservationId}>
                    {invoice.roomNumber} - {invoice.guestName} (Due: {formatCurrency(invoice.dueAmount)})
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase">Amount</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition-all"
                value={form.amount}
                onChange={(event) => setForm((prev) => ({ ...prev, amount: event.target.value }))}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase">Method</label>
              <select
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition-all"
                value={form.method}
                onChange={(event) => setForm((prev) => ({ ...prev, method: event.target.value }))}
              >
                <option value="CASH">Cash</option>
                <option value="CARD">Card</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
              </select>
            </div>
            <div className="flex items-end">
              <button type="submit" className="w-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition-all">
                Save Payment
              </button>
            </div>
          </form>
        </div>
      )}

      {message && (
        <div className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm ${
          message.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700'
        }`}>
          {message.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          {message.text}
          <button onClick={() => setMessage(null)} className="ml-auto opacity-50 hover:opacity-100">✕</button>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Invoices Table */}
        <div className="lg:col-span-2">
          <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-200 bg-slate-50/50 px-6 py-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Invoices</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search guest or room..."
                    className="w-full rounded-full border border-slate-200 bg-white pl-10 pr-4 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 sm:w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400">
                    <th className="px-6 py-4">Guest & Room</th>
                    <th className="px-6 py-4">Total</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Due</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredInvoices.length > 0 ? (
                    filteredInvoices.map((invoice) => (
                      <tr key={invoice.reservationId} className="group hover:bg-slate-50/50 transition-all">
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{invoice.guestName}</p>
                            <p className="text-xs text-slate-500">Room {invoice.roomNumber}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-slate-900">{formatCurrency(invoice.totalAmount)}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            invoice.paymentStatus === 'PAID' ? 'bg-emerald-50 text-emerald-700' :
                            invoice.paymentStatus === 'PARTIAL' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                          }`}>
                            {invoice.paymentStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className={`text-sm font-bold ${invoice.dueAmount > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                            {formatCurrency(invoice.dueAmount)}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-200 rounded-lg">
                            <ChevronRight className="h-4 w-4 text-slate-400" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-slate-400">No invoices found matching your search.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Recent Payment History */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-200 bg-slate-50/50 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900">Recent Payments</h2>
            </div>
            <div className="divide-y divide-slate-50">
              {payments.length > 0 ? (
                payments.slice(0, 10).map((payment) => (
                  <div key={payment.id} className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-all">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {payment.reservation?.guestName || 'Payment'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(payment.paidAt).toLocaleDateString()} via {payment.method}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-emerald-600">+{formatCurrency(payment.amount)}</p>
                      <ArrowUpRight className="ml-auto h-3 w-3 text-slate-300" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-6 py-12 text-center">
                  <DollarSign className="mx-auto h-12 w-12 text-slate-100" />
                  <p className="mt-2 text-sm text-slate-400">No payments yet.</p>
                </div>
              )}
            </div>
            {payments.length > 10 && (
              <div className="border-t border-slate-50 bg-slate-50/30 p-4 text-center">
                <button className="text-sm font-semibold text-slate-600 hover:text-slate-900">View All Transactions</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingPage;
