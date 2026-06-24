import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../api';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/ui/Button';
import { SkeletonTable } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import { formatDate } from '../../utils/helpers';
import { Mail, CheckCircle2 } from 'lucide-react';

const STATUSES = ['', 'new', 'read', 'resolved'];
const STATUS_BADGE = { new: 'badge-blue', read: 'badge-gray', resolved: 'badge-green' };

const AdminContactMessages = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [expanded, setExpanded] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await adminAPI.getContactMessages({ status: status || undefined, page });
      setMessages(data.data.messages || []);
      setPages(data.data.pages || 1);
    } catch { toast({ title: 'Failed to load messages', type: 'error' }); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [status, page]);

  const toggleExpand = async (msg) => {
    const next = expanded === msg._id ? null : msg._id;
    setExpanded(next);
    if (next && msg.status === 'new') {
      try {
        await adminAPI.updateContactMessageStatus(msg._id, 'read');
        setMessages(prev => prev.map(m => m._id === msg._id ? { ...m, status: 'read' } : m));
      } catch {}
    }
  };

  const markResolved = async (msg) => {
    try {
      await adminAPI.updateContactMessageStatus(msg._id, 'resolved');
      toast({ title: 'Marked as resolved', type: 'success' });
      setMessages(prev => prev.map(m => m._id === msg._id ? { ...m, status: 'resolved' } : m));
    } catch (err) { toast({ title: err.response?.data?.message || 'Failed', type: 'error' }); }
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-xl font-bold text-gray-900">Contact Messages</h1><p className="text-sm text-gray-500 mt-0.5">Submissions from the public contact form</p></div>

      <div className="flex flex-wrap gap-3 items-center">
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className="input py-2 text-sm w-auto">
          {STATUSES.map(s => <option key={s} value={s}>{s ? s[0].toUpperCase() + s.slice(1) : 'All statuses'}</option>)}
        </select>
      </div>

      <div className="card overflow-hidden">
        {loading ? <SkeletonTable /> : messages.length === 0 ? (
          <EmptyState icon={Mail} title="No messages found" description="Submissions from the contact form will appear here" />
        ) : (
          <div className="divide-y divide-gray-100">
            {messages.map(m => (
              <div key={m._id} className="p-4">
                <button onClick={() => toggleExpand(m)} className="w-full text-left flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="text-sm font-semibold text-gray-900">{m.name}</p>
                      <span className={`badge ${STATUS_BADGE[m.status]}`}>{m.status}</span>
                    </div>
                    <p className="text-xs text-gray-400">{m.email} · {m.topic} · {formatDate(m.createdAt)}</p>
                  </div>
                </button>
                {expanded === m._id && (
                  <div className="mt-3 pl-0 sm:pl-1">
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{m.message}</p>
                    {m.status !== 'resolved' && (
                      <Button size="sm" variant="success" className="mt-3" onClick={() => markResolved(m)}>
                        <CheckCircle2 size={13} /> Mark resolved
                      </Button>
                    )}
                  </div>
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

export default AdminContactMessages;
