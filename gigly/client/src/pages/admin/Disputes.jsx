import React, { useEffect, useState } from 'react';
import { adminAPI, disputeAPI } from '../../api';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import Modal from '../../components/ui/Modal';
import { SkeletonTable } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import { formatDate } from '../../utils/helpers';
import { Shield, Search } from 'lucide-react';

const STATUSES = ['', 'open', 'under_review', 'resolved', 'closed'];

const AdminDisputes = () => {
  const { toast } = useToast();
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [resolveModal, setResolveModal] = useState(null);
  const [resolution, setResolution] = useState('');
  const [resolveStatus, setResolveStatus] = useState('resolved');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await disputeAPI.getAll({ status: status || undefined, page });
      setDisputes(data.data.disputes || []);
      setPages(data.data.pages || 1);
    } catch { toast({ title: 'Failed to load disputes', type: 'error' }); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [status, page]);

  const openResolve = (dispute) => {
    setResolveModal(dispute);
    setResolution('');
    setResolveStatus('resolved');
  };

  const submitResolution = async () => {
    if (resolution.trim().length < 10) { toast({ title: 'Please describe the resolution in more detail', type: 'error' }); return; }
    setSubmitting(true);
    try {
      await disputeAPI.resolve(resolveModal._id, { resolution, status: resolveStatus });
      toast({ title: 'Dispute resolved', type: 'success' });
      setResolveModal(null);
      load();
    } catch (err) { toast({ title: err.response?.data?.message || 'Failed to resolve', type: 'error' }); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-xl font-bold text-gray-900">Disputes</h1><p className="text-sm text-gray-500 mt-0.5">Review and mediate contract disputes</p></div>

      <div className="flex flex-wrap gap-3 items-center">
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className="input py-2 text-sm w-auto">
          {STATUSES.map(s => <option key={s} value={s}>{s ? s.replace('_', ' ') : 'All statuses'}</option>)}
        </select>
      </div>

      <div className="card overflow-hidden">
        {loading ? <SkeletonTable /> : disputes.length === 0 ? (
          <EmptyState icon={Shield} title="No disputes found" description="Disputes raised by clients or freelancers will appear here" />
        ) : (
          <div className="divide-y divide-gray-100">
            {disputes.map(d => (
              <div key={d._id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <p className="text-sm font-semibold text-gray-900">{d.contractId?.title || 'Untitled contract'}</p>
                      <Badge status={d.status} />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                      <Avatar src={d.raisedBy?.avatar} name={d.raisedBy?.name} size="xs" />
                      <span>{d.raisedBy?.name} ({d.raisedBy?.role}) raised against {d.against?.name}</span>
                      <span className="text-gray-300">·</span>
                      <span>{formatDate(d.createdAt)}</span>
                    </div>
                    <p className="text-sm text-gray-600">{d.reason}</p>
                    {d.resolution && <p className="text-xs text-gray-400 mt-2"><strong>Resolution:</strong> {d.resolution}</p>}
                  </div>
                  {['open', 'under_review'].includes(d.status) && (
                    <Button size="sm" onClick={() => openResolve(d)} className="flex-shrink-0">Resolve</Button>
                  )}
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

      <Modal isOpen={!!resolveModal} onClose={() => setResolveModal(null)} title="Resolve Dispute"
        footer={<div className="flex justify-end gap-3"><Button variant="secondary" onClick={() => setResolveModal(null)}>Cancel</Button><Button onClick={submitResolution} loading={submitting}>Submit Resolution</Button></div>}>
        <div className="space-y-4">
          <p className="text-sm text-gray-500">{resolveModal?.reason}</p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Outcome</label>
            <select value={resolveStatus} onChange={e => setResolveStatus(e.target.value)} className="input">
              <option value="resolved">Resolved</option>
              <option value="closed">Closed (no action)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Resolution notes</label>
            <textarea rows={4} value={resolution} onChange={e => setResolution(e.target.value)} className="input" placeholder="Explain the decision and any next steps for both parties." />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminDisputes;
