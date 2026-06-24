import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../api';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import { SkeletonTable } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { FileText, Search } from 'lucide-react';

const STATUSES = ['', 'pending', 'active', 'under_review', 'completed', 'cancelled', 'disputed'];

const AdminContracts = () => {
  const { toast } = useToast();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await adminAPI.getContracts({ status: status || undefined, search: search || undefined, page });
      setContracts(data.data.contracts || []);
      setPages(data.data.pages || 1);
    } catch { toast({ title: 'Failed to load contracts', type: 'error' }); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [status, page]);

  const handleSearch = (e) => { e.preventDefault(); setPage(1); load(); };

  return (
    <div className="space-y-6">
      <div><h1 className="text-xl font-bold text-gray-900">Contracts</h1><p className="text-sm text-gray-500 mt-0.5">Oversee active and completed engagements</p></div>

      <div className="flex flex-wrap gap-3 items-center">
        <form onSubmit={handleSearch} className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search contract title" className="input pl-9 py-2 text-sm" />
        </form>
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className="input py-2 text-sm w-auto">
          {STATUSES.map(s => <option key={s} value={s}>{s ? s.replace('_', ' ') : 'All statuses'}</option>)}
        </select>
      </div>

      <div className="card overflow-hidden">
        {loading ? <SkeletonTable /> : contracts.length === 0 ? (
          <EmptyState icon={FileText} title="No contracts found" description="Try adjusting your filters" />
        ) : (
          <div className="divide-y divide-gray-100">
            {contracts.map(c => (
              <div key={c._id} className="p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <p className="text-sm font-semibold text-gray-900">{c.title}</p>
                    <Badge status={c.status} />
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1.5"><Avatar src={c.clientId?.avatar} name={c.clientId?.name} size="xs" />{c.clientId?.name}</span>
                    <span>→</span>
                    <span className="flex items-center gap-1.5"><Avatar src={c.freelancerId?.avatar} name={c.freelancerId?.name} size="xs" />{c.freelancerId?.name}</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold text-gray-900">{formatCurrency(c.totalBudget)}</p>
                  <p className="text-xs text-gray-400">{formatDate(c.startDate)} – {formatDate(c.endDate)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button size="sm" variant="secondary" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
          <span className="text-sm text-gray-500">Page {page} of {pages}</span>
          <Button size="sm" variant="secondary" disabled={page >= pages} onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
};

export default AdminContracts;
