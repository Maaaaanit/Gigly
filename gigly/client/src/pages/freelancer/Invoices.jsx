import React, { useEffect, useState } from 'react';
import { invoiceAPI } from '../../api';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import { SkeletonTable } from '../../components/ui/Skeleton';
import { formatCurrency, formatDate, downloadBlob } from '../../utils/helpers';
import { Download, Receipt } from 'lucide-react';

const FreelancerInvoices = () => {
  const { toast } = useToast();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');

  useEffect(() => {
    setLoading(true);
    invoiceAPI.getAll({ status: status || undefined })
      .then(({ data }) => setInvoices(data.data.invoices || []))
      .catch(() => toast({ title: 'Failed to load invoices', type: 'error' }))
      .finally(() => setLoading(false));
  }, [status]);

  const handleDownload = async (id, number) => {
    try { const { data } = await invoiceAPI.downloadPDF(id); downloadBlob(data, `${number}.pdf`); }
    catch { toast({ title: 'Download failed', type: 'error' }); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold text-gray-900">My Invoices</h1><p className="text-sm text-gray-500">Track your earnings and payment status</p></div>
        <div className="flex gap-2">
          {['', 'sent', 'paid'].map(s => (
            <button key={s} onClick={() => setStatus(s)} className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${status === s ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{s || 'All'}</button>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden">
        {loading ? <SkeletonTable /> : invoices.length === 0 ? (
          <EmptyState icon={Receipt} title="No invoices yet" description="Invoices are auto-generated when milestones get approved" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>{['Invoice #', 'Contract', 'Subtotal', 'GST (18%)', 'Total', 'Status', 'Due Date', ''].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {invoices.map(inv => (
                  <tr key={inv._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono font-semibold text-primary-600">{inv.invoiceNumber}</td>
                    <td className="px-4 py-3 text-gray-600">{inv.contractId?.title || '—'}</td>
                    <td className="px-4 py-3">{formatCurrency(inv.subtotal)}</td>
                    <td className="px-4 py-3 text-gray-500">{formatCurrency(inv.gst)}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{formatCurrency(inv.totalAmount)}</td>
                    <td className="px-4 py-3"><Badge status={inv.status} /></td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(inv.dueDate)}</td>
                    <td className="px-4 py-3"><button onClick={() => handleDownload(inv._id, inv.invoiceNumber)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"><Download size={14} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default FreelancerInvoices;
