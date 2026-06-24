import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../api';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { SkeletonTable } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { Briefcase, Search, XCircle } from 'lucide-react';

const STATUSES = ['', 'open', 'in_progress', 'completed', 'closed'];

const AdminJobs = () => {
  const { toast } = useToast();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await adminAPI.getJobs({ status: status || undefined, search: search || undefined, page });
      setJobs(data.data.jobs || []);
      setPages(data.data.pages || 1);
    } catch { toast({ title: 'Failed to load jobs', type: 'error' }); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [status, page]);

  const handleSearch = (e) => { e.preventDefault(); setPage(1); load(); };

  const closeJob = async (job) => {
    if (!window.confirm(`Close the job "${job.title}"? It will no longer accept proposals.`)) return;
    try {
      await adminAPI.closeJob(job._id);
      toast({ title: 'Job closed', type: 'success' });
      setJobs(prev => prev.map(j => j._id === job._id ? { ...j, status: 'closed' } : j));
    } catch (err) { toast({ title: err.response?.data?.message || 'Failed', type: 'error' }); }
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-xl font-bold text-gray-900">Jobs</h1><p className="text-sm text-gray-500 mt-0.5">Moderate job postings across the platform</p></div>

      <div className="flex flex-wrap gap-3 items-center">
        <form onSubmit={handleSearch} className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search job title" className="input pl-9 py-2 text-sm" />
        </form>
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className="input py-2 text-sm w-auto">
          {STATUSES.map(s => <option key={s} value={s}>{s ? s.replace('_', ' ') : 'All statuses'}</option>)}
        </select>
      </div>

      <div className="card overflow-hidden">
        {loading ? <SkeletonTable /> : jobs.length === 0 ? (
          <EmptyState icon={Briefcase} title="No jobs found" description="Try adjusting your filters" />
        ) : (
          <div className="divide-y divide-gray-100">
            {jobs.map(job => (
              <div key={job._id} className="p-4 flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="text-sm font-semibold text-gray-900">{job.title}</p>
                    <Badge status={job.status} />
                  </div>
                  <p className="text-xs text-gray-400">
                    by {job.clientId?.name} · {formatCurrency(job.budget?.min)}–{formatCurrency(job.budget?.max)} · Posted {formatDate(job.createdAt)}
                  </p>
                </div>
                {job.status !== 'closed' && (
                  <Button size="sm" variant="danger" onClick={() => closeJob(job)} className="flex-shrink-0">
                    <XCircle size={13} /> Close
                  </Button>
                )}
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

export default AdminJobs;
