import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationAPI } from '../api';
import { useToast } from '../context/ToastContext';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import { timeAgo, cn } from '../utils/helpers';
import { Bell, Briefcase, Receipt, DollarSign, AlertTriangle, MessageSquare, Star, CheckCheck, X, ExternalLink } from 'lucide-react';

const ICONS = { contract: Briefcase, invoice: Receipt, payment: DollarSign, milestone: AlertTriangle, proposal: Briefcase, job: Briefcase, review: Star, message: MessageSquare, general: Bell };
const COLORS = { contract: 'bg-primary-50 text-primary-600', invoice: 'bg-blue-50 text-blue-600', payment: 'bg-green-50 text-green-600', milestone: 'bg-yellow-50 text-yellow-600', proposal: 'bg-purple-50 text-purple-600', review: 'bg-yellow-50 text-yellow-600', message: 'bg-indigo-50 text-indigo-600', general: 'bg-gray-100 text-gray-500' };
const LABEL = { contract: 'Contract', invoice: 'Invoice', payment: 'Payment', milestone: 'Milestone', proposal: 'Proposal', job: 'Job', review: 'Review', message: 'Message', general: 'General' };

const Notifications = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  const load = async () => {
    try { const { data } = await notificationAPI.getAll(); setNotifications(data.data.notifications || []); }
    catch {} finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const open = async (n) => {
    if (!n.isRead) {
      await notificationAPI.markRead(n._id).catch(() => {});
      setNotifications(p => p.map(x => x._id === n._id ? { ...x, isRead: true } : x));
    }
    setExpanded(n);
  };

  const markAll = async () => {
    await notificationAPI.markAllRead().catch(() => {});
    setNotifications(p => p.map(x => ({ ...x, isRead: true })));
    toast({ title: 'All marked as read', type: 'success' });
  };

  const unread = notifications.filter(n => !n.isRead).length;

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold text-gray-900">Notifications</h1><p className="text-sm text-gray-500 mt-0.5">{unread > 0 ? `${unread} unread` : 'All caught up!'}</p></div>
        {unread > 0 && <Button variant="ghost" size="sm" onClick={markAll}><CheckCheck size={14} /> Mark all read</Button>}
      </div>

      {/* Expanded notification card */}
      {expanded && (
        <div className="card border-2 border-primary-200 p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0', COLORS[expanded.type] || 'bg-gray-100 text-gray-500')}>
                {React.createElement(ICONS[expanded.type] || Bell, { size: 22 })}
              </div>
              <div>
                <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', COLORS[expanded.type] || 'bg-gray-100 text-gray-500')}>
                  {LABEL[expanded.type] || 'General'}
                </span>
                <p className="text-xs text-gray-400 mt-0.5">{timeAgo(expanded.createdAt)}</p>
              </div>
            </div>
            <button onClick={() => setExpanded(null)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors flex-shrink-0">
              <X size={18} />
            </button>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">{expanded.title}</h2>
            <p className="text-gray-600 leading-relaxed">{expanded.message}</p>
          </div>

          {expanded.link && (
            <div className="pt-2 border-t border-gray-100">
              <Button size="sm" onClick={() => { setExpanded(null); navigate(expanded.link); }}>
                <ExternalLink size={14} /> View Details
              </Button>
            </div>
          )}
        </div>
      )}

      <div className="card overflow-hidden">
        {loading ? (
          <div className="divide-y divide-gray-100">{[...Array(5)].map((_, i) => <div key={i} className="p-5 animate-pulse flex gap-3"><div className="w-10 h-10 rounded-full bg-gray-200" /><div className="flex-1 space-y-2"><div className="h-4 bg-gray-200 rounded w-3/4" /><div className="h-3 bg-gray-200 rounded w-full" /></div></div>)}</div>
        ) : notifications.length === 0 ? (
          <EmptyState icon={Bell} title="No notifications" description="You'll be notified about contracts, invoices, payments, and more" />
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map(n => {
              const Icon = ICONS[n.type] || Bell;
              const colorClass = COLORS[n.type] || 'bg-gray-100 text-gray-500';
              const isActive = expanded?._id === n._id;
              return (
                <div key={n._id} className={cn('flex items-start gap-4 p-4 cursor-pointer hover:bg-gray-50 transition-colors', !n.isRead && 'bg-primary-50/30', isActive && 'bg-primary-50')} onClick={() => open(n)}>
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', colorClass)}><Icon size={18} /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn('text-sm font-semibold', !n.isRead ? 'text-gray-900' : 'text-gray-600')}>{n.title}</p>
                      <span className="text-xs text-gray-400 flex-shrink-0">{timeAgo(n.createdAt)}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{n.message}</p>
                  </div>
                  {!n.isRead && <div className="w-2 h-2 rounded-full bg-primary-500 mt-2 flex-shrink-0" />}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
